import os
from flask import Blueprint, request, jsonify
import asyncio
from app.utils import get_desc_figma, get_desc_srs, run_pipeline
from dotenv import load_dotenv


UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

api_blueprint = Blueprint("api", __name__)

@api_blueprint.route("/run_test", methods=["POST"])
def upload_srs():    
    """
    Handles the upload of an SRS (Software Requirements Specification) document.
    """
    print("Reached run_test endpoint")

    file = request.files['file']
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    url = request.form.get('url')
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
    except Exception as e:
        return jsonify({"error": f"Failed to save file: {str(e)}"}), 500


    # Call function to process the SRS document (to be implemented)

    # get_desc_figma(url)
    # get_desc_srs(file_path)
    choice = request.form.get('choice')
    asyncio.run(run_pipeline(url, choice))
    return jsonify({
        "message": "SRS uploaded successfully",    
        })

@api_blueprint.route("/generate_test_cases", methods=["POST"])
def generate_cases():
    data = request.json
    print("Reached Here 2")
    # Call function to generate test cases (to be implemented)
    return jsonify({"test_cases": "Generated test cases go here"})


 

# @api_blueprint.route("/view_report", methods=["GET"])
# def view_report():
#     """
#     Handles the request to view the test report.
#     """
#     print("Reached view_report endpoint")
#     # Call function to retrieve the test report (to be implemented)


#     file_path = "backend/test_report.html"

#     if not os.path.exists(file_path):
#         print("Report file does not exist")
#         return jsonify({"error": "Report file not found"}), 404

#     # direct render html to this endpoint

#     with open(file_path, 'r') as file:




     






    return jsonify({"report": "Test report goes here"})