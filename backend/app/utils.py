from requests.auth import HTTPBasicAuth
import requests
import json
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
from langchain_community.document_loaders import PyMuPDFLoader
from google import genai
from dotenv import load_dotenv
import os
import re
load_dotenv()

def extract_figma_design_id(url: str) -> str:
    """Extracts the Figma design ID from a given URL."""
    match = re.search(r'figma\.com/design/([^/]+)', url)
    return match.group(1) if match else None

def get_desc_figma(url: str):
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY_2"))
    figma_url = "https://api.figma.com/v1/files/" + extract_figma_design_id(url)
    headers = {'X-Figma-Token': os.getenv("FIGMA_TOKEN")}
    print("Fetching Figma design...")
    print(figma_url)
    req = requests.get(figma_url, headers=headers)
    if req.status_code != 200:
        print(f"Error fetching Figma file: {req.status_code} - {req.text}")
        return None

    print("Figma design fetched successfully.")
    print("Generating structured description for Figma design...")
    Figma_desc = client.models.generate_content(
        model="gemini-2.0-flash",
        # contents=f"{req.content} \n\n Generate relevant Test cases which has steps(for how to do it) \n\n Note : Write all of the testcases inside <cases></cases> and each test case in between <test></test> where the steps for that test case us in between <steps><steps>. If there are multiple steps then they are written in between <step></step> each. Also add expected result in between <expected></expected>"
        contents=f"""
        {req.content}

        You are an expert in **UI/UX analysis and software testing**, specializing in extracting structured design descriptions to facilitate test case generation. Your task is to analyze the **Figma design JSON data** provided above and generate a **highly detailed, structured, and comprehensive description** that captures every relevant detail necessary for software testing.
        ---

        ### **Instructions:**

        #### **1. Extract Every Essential Detail from the Figma Design**
        - **Component Breakdown**: List and describe **all UI components** present in the design, including buttons, input fields, checkboxes, dropdowns, modals, and other interactive elements.
        - **Visual & Styling Properties**: Capture colors, fonts, typography, spacing, borders, shadows, responsiveness, and theme consistency.
        - **Layout & Positioning**: Describe the structural hierarchy of the UI elements, their relative positioning, and how they are arranged across the page.
        - **Interactive Behavior**: Include details on hover states, click interactions, animations, transitions, modals, and state-based UI changes.
        - **Conditional Visibility & Dynamic Elements**: Identify UI elements that appear based on certain conditions or user interactions.
        - **Navigation Flow**: Explain how pages/screens are linked, user journey pathways, and any logical redirections.

        #### **2. Structure the Description for Future Test Case Generation**
        Ensure the extracted description provides enough details for generating test cases across multiple categories:
        - **Functional Test Cases**: Validate form submissions, button interactions, dynamic UI updates, and modal behavior.
        - **UI/UX Test Cases**: Verify design consistency, spacing, alignment, font legibility, contrast, and overall aesthetics.
        - **Navigation & Flow Test Cases**: Ensure all links, buttons, and redirections function correctly per design intent.
        - **Accessibility Test Cases**: Identify design elements that impact accessibility, including contrast issues, keyboard navigation, and ARIA attributes.
        - **Edge Case Test Scenarios**: Highlight potential failure cases such as incorrect input validation, missing UI states, or unexpected behavior.
        - **Performance & Load Testing Scenarios**: Identify areas that may cause lag, slow rendering, or excessive API calls due to UI complexity.

        #### **3. Ensure Precision While Avoiding Redundancy**
        - **Extract only unique and valuable information** while removing redundant metadata.
        - **Format the output logically and categorically** to ensure easy reference for future AI models.

        ---

        ### **Expected Output Format:**
        - **Organized Sections:** Clearly structured breakdown of components, styling, interactions, and navigation flow.  
        - **Hierarchical Representation:** Maintain parent-child relationships of UI elements to reflect design structure.  
        - **Concise but Complete Details:** Retain all necessary information while avoiding irrelevant data.  

        ---

        ### **Important Considerations:**
        - This extracted description will be merged with the **Software Requirements Specification (SRS)** document to generate a **comprehensive test plan**.  
        - The description should complement **functional specifications** and **enable precise mapping of test cases and scenarios**.  
        - Focus on **accuracy and completeness** since this process will be executed only **once** for each design.  

        Now, generate the **detailed and structured** Report of the **Figma design JSON** based on the instructions above.

        The output should be in the format of text not any JSON like structure
        """
    )

    if Figma_desc == None:
        print(f"Error generating Figma description: {Figma_desc.error}")
        return None

    print("Figma description generated successfully.")


    #save location text file
    file_path = "data/figma_desc.txt"

    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "w") as file:
        file.write(Figma_desc.text)
        print(f"Figma description saved to {file_path}")


    # return Figma_desc.text



def get_desc_srs(pdf_path: str):
    """
    Extracts text from an SRS PDF and generates a structured description
    focusing on test scenario generation.
    """
    # Load SRS document
    loader = PyMuPDFLoader(pdf_path)
    documents = loader.load()
    
    print("Extracting text from SRS document...")
    # Combine extracted text
    srs_content = "\n".join([doc.page_content for doc in documents])

    # Initialize Gemini client
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY_2"))

    print("Generating structured description for SRS...")

    # Generate structured description using Gemini
    SRS_desc = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"""
        {srs_content}

        You are an expert in **software testing and requirements analysis**. Your task is to analyze the **Software Requirements Specification (SRS) document** provided above and generate a **highly detailed, structured, and comprehensive report** that captures all relevant details necessary for test scenario generation.
        ---

        ### **Instructions:**

        #### **1. Extract and Structure the Key Requirements**
        - Identify **functional and non-functional requirements**.
        - List down all **system capabilities and expected behaviors**.
        - Describe **user roles and system interactions**.
        - Capture **business rules, constraints, and dependencies**.

        #### **2. Generate Test Scenarios from the SRS**
        - **Functional Test Scenarios:** Derive test scenarios based on the system features, input validation, and expected outputs.
        - **Integration Test Scenarios:** Identify interactions between different system components.
        - **Edge Case Scenarios:** Highlight possible failures, boundary conditions, and error handling.
        - **Performance Test Scenarios:** Identify scenarios that impact system speed, responsiveness, and scalability.
        - **Security & Compliance Scenarios:** Generate cases to test authentication, authorization, and data protection.

        #### **3. Ensure Completeness and Clarity**
        - Extract **only unique and valuable information** while removing redundancy.
        - Organize the content **logically and categorically** for easy future reference.

        ---

        ### **Expected Output Format:**
        - **Organized Sections:** Breakdown of system requirements, constraints, and test scenarios.
        - **Hierarchical Representation:** Categorized test scenarios mapped to their corresponding system features.
        - **Concise yet Comprehensive:** Covers all aspects necessary for thorough software testing.

        ---

        ### **Important Considerations:**
        - The extracted description will be **merged with the Figma design description** to generate a **complete test plan**.
        - Ensure the description complements **UI-based test cases** from the Figma analysis.
        - The output must be in plain text format, **not JSON or bullet points**.

        Now, generate a **detailed structured report** of the **SRS document** based on the provided instructions.
        """
    )

    # Check for errors in the response
    if SRS_desc == None:
        print(f"Error generating SRS description: {SRS_desc.error}")
        return None

    print("SRS description generated successfully.")


    # Save the generated description to a text file

    file_path = "data/srs_desc.txt"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open (file_path, "w") as file:
        file.write(SRS_desc.text)
        print(f"SRS description saved to {file_path}")
    # return SRS_desc.text
