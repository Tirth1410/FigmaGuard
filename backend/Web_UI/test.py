from google import genai
from dotenv import load_dotenv
import os
from web_ui import Website

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY_2"))
figma_path = "data/figma_desc.txt"
srs_path = "data/srs_desc.txt"


with open (figma_path, "r") as file:
    figma_desc = file.read()


with open (srs_path, "r") as file:
    srs_desc = file.read()


system_prompt = f"""
You are an AI Expert specializing in software and UI/UX requirements. Your task is to merge the Figma description and the SRS description into a single, cohesive document that accurately represents the combined information. 

### Guidelines for Merging:
1. **Extract Key Information**: Identify the most relevant details from both descriptions while removing redundant or conflicting information.
2. **Maintain Clarity**: Ensure the merged description is structured, well-organized, and easy to understand.
3. **Prioritize Functional and UX Details**: Figma provides UI/UX insights, while the SRS contains functional and system requirements. Combine these effectively to present a complete picture.
4. **Ensure Logical Flow**: The merged description should follow a structured format, including:
   - Overall purpose and scope.
   - Key elements and their functionalities.
   - User interactions and workflows.
   - Design considerations and usability aspects.

Just Give me pages with their one line detail such as 
page : description
page : description

using below data

figma_desc :{figma_desc}

srs_desc :{srs_desc}

Donot use any images
Important Notes: Keep it very short and very accurate and precise
"""


merged_desc = client.models.generate_content(
    model="gemini-1.5-pro",
    contents=system_prompt,
)

print(merged_desc.text)









# prompt = """
# creaet a website for hotel booking and hotel mangement 

# page : landing page 
# page : we should be able to add room details 
# page : list of all the rooms avilable 
# page : and we should be able to book  aroom a
# page : you should be able to search hotel rooms based on amenities 

# """
website = Website(merged_desc.text)


# if __name__ == "__main__":

    # Run the website generation process
    # website.generate_website()