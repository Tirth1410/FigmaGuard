import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY must be set in environment variables for AI code generation.")

groq_client = Groq(api_key=GROQ_API_KEY)

def generate_code_with_llm(srs_content: str, user_arguments: str) -> str:
    """
    Generates HTML/CSS/JS code based on SRS content and user arguments using an LLM.
    """
    prompt = f"""
    You are an expert web developer AI. Your task is to generate a single HTML file (including CSS and JavaScript within <style> and <script> tags) for a simple website based on the provided Software Requirements Specification (SRS) content and additional user arguments.

    The generated website should be:
    - A single HTML file.
    - Include all CSS within a <style> tag in the <head>.
    - Include all JavaScript within a <script> tag at the end of the <body>.
    - Responsive and modern in design.
    - Fulfill the core requirements from the SRS and user arguments.
    - Use placeholder content where specific data is not provided.

    SRS Content (first 500 characters):
    ---
    {srs_content[:500]}
    ---

    User Arguments: "{user_arguments}"

    Based on the above, generate the complete HTML file. Do NOT include any markdown backticks or language specifiers (e.g., ```html). Just output the raw HTML content.
    """

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert web developer AI that generates complete HTML files.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            temperature=0.7,
            max_tokens=4000,
        )
        generated_code = chat_completion.choices[0].message.content
        print("AI Code Generation successful.")
        return generated_code
    except Exception as e:
        print(f"Error generating code with LLM: {e}")
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Site (Fallback)</title>
    <style>
        body {{ font-family: sans-serif; text-align: center; padding: 50px; background-color: #f0f0f0; }}
        h1 {{ color: #333; }}
        p {{ color: #666; }}
    </style>
</head>
<body>
    <h1>Hello from your AI-Generated Site!</h1>
    <p>This is a fallback page because AI generation encountered an issue.</p>
    <p>SRS Content provided: {srs_content[:100]}...</p>
    <p>User Arguments: {user_arguments}</p>
</body>
</html>
        """
