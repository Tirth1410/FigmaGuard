import os
import uuid
import asyncio
import subprocess
import shutil
import json
import time
import threading
from datetime import datetime, timezone
from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS# type: ignore
from utils.supabase_client import supabase
from utils.llm_client import generate_code_with_llm # Import the new LLM client
from github import Github # Import PyGithub # type: ignore
import requests # For Vercel API
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Vercel API Base URL
VERCEL_API_BASE_URL = "https://api.vercel.com"

def verify_user_token(auth_header):
    """Verify JWT token and return user info"""
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.replace('Bearer ', '')
    try:
        response = supabase.auth.get_user(token)
        return response.user if response.user else None
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None

# --- GitHub and Vercel API Integrations ---

def create_github_repo_and_push_code(repo_name: str, code_content: str, github_token: str) -> str:
    try:
        g = Github(github_token)
        user = g.get_user()
        
        print(f"GitHub: Creating repository '{repo_name}' for user '{user.login}'...")
        repo = user.create_repo(
            repo_name,
            description="AI-generated website by FigmaGuard",
            private=False,
            auto_init=True
        )
        
        repo.create_file(
            "index.html",
            "Initial commit with generated website",
            code_content,
            branch="main"
        )
        print(f"GitHub: Code pushed to {repo.html_url}")
        return repo.html_url
    except Exception as e:
        print(f"GitHub API Error: {e}")
        raise Exception(f"Failed to create GitHub repository or push code: {e}")

def deploy_to_vercel(repo_url: str, vercel_token: str, github_token: str) -> str:
    headers = {
        "Authorization": f"Bearer {vercel_token}",
        "Content-Type": "application/json"
    }
    
    parts = repo_url.split('/')
    repo_owner = parts[-2]
    repo_name = parts[-1]

    try:
        g = Github(github_token)
        github_repo = g.get_user().get_repo(repo_name)
        github_repo_id = github_repo.id
        print(f"GitHub: Retrieved repository ID: {github_repo_id}")
    except Exception as e:
        print(f"GitHub API Error (getting repo ID): {e}")
        raise Exception(f"Failed to retrieve GitHub repository ID: {e}")

    deploy_payload = {
        "name": repo_name,
        "gitSource": {
            "type": "github",
            "repo": f"{repo_owner}/{repo_name}",
            "repoId": str(github_repo_id),
            "ref": "main"
        },
        "projectSettings": {
            "framework": None,
            "installCommand": None,
            "buildCommand": None,
            "outputDirectory": "."
        }
    }

    print(f"Vercel: Initiating deployment for {repo_owner}/{repo_name}...")
    try:
        response = requests.post(
            f"{VERCEL_API_BASE_URL}/v13/deployments",
            headers=headers,
            json=deploy_payload
        )
        response.raise_for_status()
        deployment_data = response.json()
        
        deployment_id = deployment_data.get("id")
        deployment_url = deployment_data.get("url")
        
        if not deployment_id:
            raise Exception("Vercel deployment ID not found in response.")

        print(f"Vercel: Deployment initiated. ID: {deployment_id}, URL: {deployment_url}")

        status = "BUILDING"
        max_retries = 20
        retries = 0
        while status not in ["READY", "ERROR", "CANCELED"] and retries < max_retries:
            time.sleep(10)
            status_response = requests.get(
                f"{VERCEL_API_BASE_URL}/v13/deployments/{deployment_id}",
                headers=headers
            )
            status_response.raise_for_status()
            status_data = status_response.json()
            status = status_data.get("readyState")
            print(f"Vercel: Deployment status: {status}")
            retries += 1

        if status == "READY":
            print(f"Vercel: Deployment successful! Live URL: https://{deployment_url}")
            return f"https://{deployment_url}"
        else:
            raise Exception(f"Vercel deployment failed or timed out. Final status: {status}")

    except requests.exceptions.RequestException as e:
        print(f"Vercel API Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Vercel API Response: {e.response.text}")
        raise Exception(f"Failed to deploy to Vercel: {e}")
    except Exception as e:
        print(f"Vercel Deployment Error: {e}")
        raise Exception(f"Failed to deploy to Vercel: {e}")

# --- Test Execution Logic ---

async def run_all_tests(url: str, test_run_id: str, selected_test_types: list, temp_srs_path: str = None):
    print(f"Starting comprehensive testing for URL: {url} with types: {selected_test_types}")
    
    supabase.table('test_reports').update({
        'status': 'running',
        'started_at': datetime.now(timezone.utc).isoformat()
    }).eq('id', test_run_id).execute()

    all_results = {}
    test_scripts = {
        "functional": "functional_testing.py",
        "uiux": "uiux_testing.py",
        "accessibility": "accessibility_testing.py",
        "compatibility": "compatibility_testing.py",
        "performance": "performance_testing.py"
    }

    scripts_to_run = {k: v for k, v in test_scripts.items() if k in selected_test_types}

    if not scripts_to_run:
        print("No test types selected. Skipping test execution.")
        supabase.table('test_reports').update({
            'status': 'completed',
            'completed_at': datetime.now(timezone.utc).isoformat(),
            'report_data': {'all': []},
            'summary': {'total': 0, 'passed': 0, 'failed': 0, 'warnings': 0, 'errors': 0, 'success_rate': 100}
        }).eq('id', test_run_id).execute()
        return

    if temp_srs_path and os.path.exists(temp_srs_path):
        srs_local_path = temp_srs_path
        print(f" Using existing temp SRS file: {srs_local_path}")
    else:
        try:
            test_report = supabase.table("test_reports") \
                .select("request_id") \
                .eq("id", test_run_id).single().execute()
            request_id = test_report.data.get("request_id")
        except Exception as e:
            print(f" Could not fetch request_id for test_run {test_run_id}: {e}")
            request_id = None

        srs_url = None
        if request_id:
            try:
                test_request = supabase.table("test_requests") \
                    .select("srs_document_url") \
                    .eq("id", request_id).single().execute()
                srs_url = test_request.data.get("srs_document_url")
            except Exception as e:
                print(f" Could not fetch SRS URL for request {request_id}: {e}")

        srs_local_path = f"temp/srs_{test_run_id}.pdf"
        os.makedirs("temp", exist_ok=True)

        try:
            if srs_url:
                pdf_data = requests.get(srs_url).content
                with open(srs_local_path, "wb") as f:
                    f.write(pdf_data)
                print(f" SRS PDF downloaded to temp folder: {srs_local_path}")
            else:
                with open(srs_local_path, "wb") as f:
                    f.write(b"")
                print(f" Created empty SRS file: {srs_local_path}")
        except Exception as e:
            print(f" Failed to download SRS PDF for test_run {test_run_id}: {e}")
            with open(srs_local_path, "wb") as f:
                f.write(b"")

    # Run each test type
    for test_type, script_name in scripts_to_run.items():
        script_path = os.path.join(os.path.dirname(__file__), "scripts", script_name)
        try:
            print(f" Running {test_type} tests...")
            print(f" Script: {script_path}")
            print(f" Arguments: URL={url}, test_run_id={test_run_id}, SRS_PDF={srs_local_path}")

            process = await asyncio.create_subprocess_exec(
                "python", script_path, url, test_run_id, os.path.abspath(srs_local_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=os.path.dirname(__file__)  # Set working directory
            )
            stdout, stderr = await process.communicate()

            stdout_text = stdout.decode('utf-8', errors='replace').strip()
            stderr_text = stderr.decode('utf-8', errors='replace').strip()
            
            print(f" {test_type} process return code: {process.returncode}")
            if stderr_text:
                print(f" {test_type} stderr: {stderr_text[:500]}...")
            
            if stdout_text:
                print(f" {test_type} script output length: {len(stdout_text)} chars")
                
                json_start = stdout_text.find('[')
                json_end = stdout_text.rfind(']') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_content = stdout_text[json_start:json_end]
                    try:
                        test_results = json.loads(json_content)
                        all_results[test_type] = test_results
                        print(f" {test_type} tests completed: {len(test_results)} tests")
                        
                        passed = len([t for t in test_results if t['status'] == 'pass'])
                        failed = len([t for t in test_results if t['status'] == 'fail'])
                        errors = len([t for t in test_results if t['status'] == 'error'])
                        print(f" {test_type} results: {passed} passed, {failed} failed, {errors} errors")
                        
                    except json.JSONDecodeError as e:
                        print(f" JSON decode error for {test_type}: {e}")
                        print(f" Extracted JSON content: {json_content[:500]}...")
                        all_results[test_type] = [{
                            "id": f"{test_type}-json-error",
                            "name": f"{test_type.title()} JSON Parse Error",
                            "status": "error",
                            "type": test_type,
                            "description": "Failed to parse test results as JSON",
                            "details": f"JSON decode error: {str(e)[:200]}. Content: {json_content[:300]}",
                            "srsReference": "N/A"
                        }]
                else:
                    print(f" No valid JSON found in {test_type} output")
                    all_results[test_type] = [{
                        "id": f"{test_type}-no-json",
                        "name": f"{test_type.title()} No JSON Output",
                        "status": "error",
                        "type": test_type,
                        "description": "No valid JSON output found",
                        "details": f"Raw output: {stdout_text[:500]}",
                        "srsReference": "N/A"
                    }]
            else:
                error_details = stderr_text if stderr_text else "No output received"
                print(f" {test_type} tests failed - no stdout output")
                all_results[test_type] = [{
                    "id": f"{test_type}-no-output",
                    "name": f"{test_type.title()} No Output",
                    "status": "error",
                    "type": test_type,
                    "description": f"Test process produced no output (return code: {process.returncode})",
                    "details": error_details[:500],
                    "srsReference": "N/A"
                }]
                
        except Exception as e:
            print(f" Exception in {test_type} tests: {str(e)}")
            all_results[test_type] = [{
                "id": f"{test_type}-exception",
                "name": f"{test_type.title()} Test Exception",
                "status": "error",
                "type": test_type,
                "description": "Test execution exception",
                "details": str(e)[:500],
                "srsReference": "N/A"
            }]

    all_tests = []
    for test_type, results in all_results.items():
        all_tests.extend(results)
    
    all_results['all'] = all_tests

    total_tests = len(all_tests)
    passed_tests = len([t for t in all_tests if t['status'] == 'pass'])
    failed_tests = len([t for t in all_tests if t['status'] == 'fail'])
    warning_tests = len([t for t in all_tests if t['status'] == 'warning'])
    error_tests = len([t for t in all_tests if t['status'] == 'error'])

    summary = {
        'total': total_tests,
        'passed': passed_tests,
        'failed': failed_tests,
        'warnings': warning_tests,
        'errors': error_tests,
        'success_rate': round((passed_tests / total_tests * 100) if total_tests > 0 else 0, 2)
    }

    final_status = 'completed'

    supabase.table('test_reports').update({
        'status': final_status,
        'completed_at': datetime.now(timezone.utc).isoformat(),
        'report_data': all_results,
        'summary': summary
    }).eq('id', test_run_id).execute()

    #  Cleanup only Supabase-downloaded PDFs, not uploaded ones
    try:
        if not temp_srs_path and os.path.exists(srs_local_path):
            os.remove(srs_local_path)
            print(f" Cleaned up downloaded temp SRS file: {srs_local_path}")
        else:
            print(f" Keeping uploaded temp SRS file: {temp_srs_path}")
    except Exception as e:
        print(f" Warning: Could not clean up temp file: {e}")

    print(f" Testing completed! Status: {final_status}")
    print(f" Summary: {passed_tests}/{total_tests} passed, {failed_tests} failed, {warning_tests} warnings, {error_tests} errors")
    
    return all_results

# Wrapper
def start_test_task(url, test_run_id, selected_test_types, temp_srs_path=None):
    try:
        print(f" Starting test task thread for URL: {url}")
        asyncio.run(run_all_tests(url, test_run_id, selected_test_types, temp_srs_path))
    except Exception as e:
        print(f" Error running test task in thread: {e}")
        #  Don't delete uploaded temp files on crash
        supabase.table('test_reports').update({
            'status': 'failed',
            'completed_at': datetime.now(timezone.utc).isoformat(),
            'error_message': f"Test thread crashed: {str(e)}"
        }).eq('id', test_run_id).execute()

@app.route('/api/test', methods=['POST'])
def handle_test_request():
    try:
        auth_header = request.headers.get('Authorization')
        user = verify_user_token(auth_header)
        
        if not user:
            return jsonify({"success": False, "message": "Authentication required"}), 401

        srs_file = request.files.get('srs_document')
        target_url = request.form.get('target_url')
        selected_test_types = request.form.getlist('test_types[]')
        
        if not srs_file or not target_url or not selected_test_types:
            return jsonify({"success": False, "message": "Missing SRS document, target URL, or test types"}), 400

        user_id = user.id
        print(f" Processing test request for user: {user_id}")

        temp_filename = f"temp_{uuid.uuid4().hex}_{srs_file.filename}"
        temp_path = os.path.join("temp", temp_filename)
        os.makedirs("temp", exist_ok=True)
        
        # Save to temp folder
        srs_file.save(temp_path)
        print(f" SRS document saved to temp folder: {temp_path}")
        
        # Upload from temp folder to Supabase
        srs_path = f"{user_id}/{uuid.uuid4().hex}_{srs_file.filename}"
        try:
            with open(temp_path, 'rb') as f:
                supabase.storage.from_('srs-documents').upload(
                    srs_path,
                    f.read(),
                    {'content-type': srs_file.content_type}
                )
            srs_document_url = supabase.storage.from_('srs-documents').get_public_url(srs_path)
            print(f" SRS document uploaded to Supabase storage: {srs_document_url}")
        except Exception as e:
            # Clean up temp file on upload failure
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return jsonify({"success": False, "message": f"Failed to upload SRS: {str(e)}"}), 500

        test_request_data = {
            "user_id": user_id,
            "srs_document_url": srs_document_url,
            "srs_document_name": srs_file.filename,
            "target_url": target_url,
            "test_types": selected_test_types
        }
        
        response = supabase.table('test_requests').insert(test_request_data).execute()
        if not response.data:
            # Clean up temp file on database failure
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return jsonify({"success": False, "message": "Failed to create test request"}), 500
        
        request_id = response.data[0]['id']

        report_data = {
            "request_id": request_id,
            "status": "pending"
        }
        
        report_response = supabase.table('test_reports').insert(report_data).execute()
        if not report_response.data:
            # Clean up temp file on database failure
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return jsonify({"success": False, "message": "Failed to create test report"}), 500
        
        test_run_id = report_response.data[0]['id']

        thread = threading.Thread(target=start_test_task, args=(target_url, test_run_id, selected_test_types, temp_path))
        thread.start()

        return jsonify({
            "success": True,
            "message": "Test initiated successfully",
            "test_run_id": test_run_id,
            "request_id": request_id,
            "url": target_url
        }), 200

    except Exception as e:
        print(f" Error in test request: {str(e)}")
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500

@app.route('/api/generate-and-test', methods=['POST'])
def handle_generate_and_test():
  """Handle website generation and testing"""
  try:
      # Verify authentication
      auth_header = request.headers.get('Authorization')
      user = verify_user_token(auth_header)
      
      if not user:
          return jsonify({"success": False, "message": "Authentication required"}), 401

      srs_file = request.files.get('srs_document')
      user_arguments = request.form.get('user_arguments')
      github_token = request.form.get('github_token')
      vercel_token = request.form.get('vercel_token')
      selected_test_types = request.form.getlist('test_types[]')
      
      if not all([srs_file, user_arguments, github_token, vercel_token, selected_test_types]):
          return jsonify({"success": False, "message": "Missing required fields"}), 400

      user_id = user.id

      temp_filename = f"temp_{uuid.uuid4().hex}_{srs_file.filename}"
      temp_path = os.path.join("temp", temp_filename)
      os.makedirs("temp", exist_ok=True)
      
      # Save to temp folder and read content
      srs_file.save(temp_path)
      print(f" SRS document saved to temp folder: {temp_path}")
      
      with open(temp_path, 'rb') as f:
          srs_content = f.read().decode('utf-8', errors='ignore')
      
      # Upload SRS document to Supabase
      srs_path = f"{user_id}/{uuid.uuid4().hex}_{srs_file.filename}"
      try:
          with open(temp_path, 'rb') as f:
              supabase.storage.from_('srs-documents').upload(
                  srs_path, 
                  f.read(), 
                  {'content-type': srs_file.content_type}
              )
          srs_document_url = supabase.storage.from_('srs-documents').get_public_url(srs_path)
          print(f" SRS document uploaded to Supabase storage: {srs_document_url}")
      except Exception as e:
          if os.path.exists(temp_path):
              os.remove(temp_path)
          return jsonify({"success": False, "message": f"Failed to upload SRS: {str(e)}"}), 500

      # Generate website code using LLM
      generated_code = generate_code_with_llm(srs_content, user_arguments)
      
      # Create GitHub repository and push code
      repo_name = f"figmaguard-site-{uuid.uuid4().hex[:8]}"
      github_repo_url = create_github_repo_and_push_code(repo_name, generated_code, github_token)
      
      # Deploy to Vercel
      vercel_deployment_url = deploy_to_vercel(github_repo_url, vercel_token, github_token)

      # Create test request record
      test_request_data = {
          "user_id": user_id,
          "srs_document_url": srs_document_url,
          "srs_document_name": srs_file.filename,
          "generated_website_url": vercel_deployment_url,
          "github_repo_url": github_repo_url,
          "vercel_deployment_url": vercel_deployment_url,
          "user_arguments": user_arguments,
          "test_types": selected_test_types
      }
      
      response = supabase.table('test_requests').insert(test_request_data).execute()
      if not response.data:
          if os.path.exists(temp_path):
              os.remove(temp_path)
          return jsonify({"success": False, "message": "Failed to create test request"}), 500
      
      request_id = response.data[0]['id']

      # Create test report record
      report_data = {
          "request_id": request_id,
          "status": "pending"
      }
      
      report_response = supabase.table('test_reports').insert(report_data).execute()
      if not report_response.data:
          if os.path.exists(temp_path):
              os.remove(temp_path)
          return jsonify({"success": False, "message": "Failed to create test report"}), 500
      
      test_run_id = report_response.data[0]['id']

      thread = threading.Thread(target=start_test_task, args=(vercel_deployment_url, test_run_id, selected_test_types, temp_path))
      thread.start()

      return jsonify({
          "success": True,
          "message": "Website generated, deployed, and testing initiated",
          "test_run_id": test_run_id,
          "request_id": request_id,
          "deployed_url": vercel_deployment_url,
          "github_repo_url": github_repo_url
      }), 200

  except Exception as e:
      print(f"Error in generate and test: {str(e)}")
      return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500

@app.route('/api/test-results/<test_run_id>', methods=['GET'])
def get_test_results(test_run_id):
    """Get test results by test run ID"""
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        user = verify_user_token(auth_header)
        
        if not user:
            return jsonify({"success": False, "message": "Authentication required"}), 401

        response = supabase.table('test_reports').select('*').eq('id', test_run_id).single().execute()
        
        if response.data:
            return jsonify({
                "success": True,
                "data": response.data
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Test results not found"
            }), 404
            
    except Exception as e:
        print(f"Error fetching test results: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500

@app.route('/api/user/test-requests', methods=['GET'])
def get_user_test_requests():
    """Get all test requests for a user"""
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        user = verify_user_token(auth_header)
        
        if not user:
            return jsonify({"success": False, "message": "Authentication required"}), 401

        response = supabase.table('test_requests').select("""
            *,
            test_reports (*)
        """).eq('user_id', user.id).order('created_at', desc=True).execute()
        
        return jsonify({
            "success": True,
            "data": response.data or []
        }), 200
        
    except Exception as e:
        print(f"Error fetching user test requests: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment monitoring"""
    return jsonify({
        "status": "healthy",
        "service": "figmaguard-backend",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), 200

if __name__ == '__main__':
    try:
        subprocess.run(["playwright", "install"], check=True)
        print(" Playwright browsers installed")
    except subprocess.CalledProcessError as e:
        print(f" Error installing Playwright browsers: {e}")
        print("Please run: pip install playwright && playwright install")

    print("  Starting FigmaGuard backend server...")
    print(" Server handles: OAuth authentication + Script execution")
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, port=port, host='0.0.0.0')
