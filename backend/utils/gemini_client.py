import os
import json
import requests
import fitz  # PyMuPDF for PDF parsing
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment variables!")

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extracts text from a PDF file using PyMuPDF.
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
    Generate structured JSON testcases for the given test_type from an SRS document.
    - If is_pdf=True → srs_source is a PDF path.
    - If is_pdf=False → srs_source is treated as raw SRS text.
    """
    if is_pdf:
        srs_content = extract_text_from_pdf(srs_source)
    else:
        srs_content = srs_source

    # Prompt design
    prompt = f"""
You are a QA assistant. Generate ONLY valid JSON testcases for **{test_type} testing**
based on the following SRS document.

⚠️ STRICT RULES:
- Output ONLY a valid JSON array, no markdown, no explanations.
- Each testcase must include:
  id, name, action, selector, expected, description, srsReference
- Valid "action" values:
  "goto", "click", "type", "assert", "login"
- Ensure JSON is well-formed and parsable by json.loads().

Example schema:
[
  {{
    "id": "test_login_valid",
    "name": "Valid Login",
    "action": "login",
    "selector": "#login_field, #password",
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
        ],
        "generationConfig": {
            "temperature": 0.4,
            "topP": 0.9,
            "maxOutputTokens": 2048
        }
    }

    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(
            f"{API_URL}?key={API_KEY}",
            headers=headers,
            json=body,
            timeout=90
        )

        print("Gemini status:", response.status_code)
        if response.status_code != 200:
            print("Gemini error:", response.text[:500])
            response.raise_for_status()

        data = response.json()

        text = None
        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception:
            text = json.dumps(data, indent=2)
            raise RuntimeError(f"Unexpected Gemini response format:\n{text[:500]}")

        if text.startswith("```"):
            text = text.strip("`")
            if text.lower().startswith("json"):
                text = text[4:].strip()

        
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
