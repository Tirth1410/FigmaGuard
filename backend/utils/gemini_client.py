import os
import json
import requests
import fitz  # PyMuPDF for PDF parsing
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"

if not API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY is not set in environment variables!")

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract all text from a PDF file using PyMuPDF (fitz).
    """
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n"
        doc.close()
        if not text.strip():
            raise ValueError("No text could be extracted from the PDF")
        return text
    except Exception as e:
        raise RuntimeError(f"Error extracting text from PDF: {e}")

def generate_testcases(test_type: str, srs_source: str, is_pdf: bool = True):
    """
    Generate structured JSON testcases from Gemini based on test_type + SRS.
    - If is_pdf=True, srs_source is treated as a path to a PDF file.
    - If is_pdf=False, srs_source is treated as raw SRS text.
    """
    if is_pdf:
        srs_content = extract_text_from_pdf(srs_source)
    else:
        srs_content = srs_source

    prompt = f"""
    You are a QA assistant. Generate ONLY valid JSON testcases for **{test_type} testing**
    based on the following SRS document.

    ⚠️ IMPORTANT:
    - Output ONLY a JSON array, no explanations.
    - Every testcase MUST include these fields:
      id, name, action, selector, expected, description, srsReference
    - Valid "action" values:
      "goto", "click", "type", "assert", "login"
    - Do not include markdown fences like ```json

    Example schema:
    [
      {{
        "id": "test_login_valid",
        "name": "Valid Login",
        "action": "login",
        "selector": "#username, #password",
        "expected": "dashboard",
        "description": "Verify successful login with valid credentials",
        "srsReference": "REQ-1.2"
      }}
    ]

    SRS Document:
    {srs_content}
    """

    body = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ]
    }

    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(
            f"{API_URL}?key={API_KEY}",
            headers=headers,
            json=body,
            timeout=60
        )

        print("Gemini status:", response.status_code)
        print("Gemini raw:", response.text[:400])  # Debug: first 400 chars

        response.raise_for_status()
        text = response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()

        # Strip accidental markdown fences
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[len("json"):].strip()

        return json.loads(text)

    except Exception as e:
        print(f"Gemini generation failed: {e}")
        return [{
            "id": f"{test_type}-error",
            "name": "Gemini generation failed",
            "status": "error",
            "type": test_type,
            "description": "Could not generate testcases",
            "details": str(e),
            "srsReference": "N/A"
        }]
