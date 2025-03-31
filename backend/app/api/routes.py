import os
from flask import Blueprint, request, jsonify
from app.utils import get_desc_figma, get_desc_srs
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

    get_desc_figma(url)
    get_desc_srs(file_path)

    


    

  

    return jsonify({
        "message": "SRS uploaded successfully",
        
        })

@api_blueprint.route("/generate_test_cases", methods=["POST"])
def generate_cases():
    data = request.json
    print("Reached Here 2")
    # Call function to generate test cases (to be implemented)
    return jsonify({"test_cases": "Generated test cases go here"})
