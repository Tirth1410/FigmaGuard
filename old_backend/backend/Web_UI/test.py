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
figma_desc :{figma_desc}

srs_desc :{srs_desc}

You are an AI Expert specializing in software and UI/UX requirements. Your task is to merge the Figma description and the SRS description into a single, That gives the project name and pages in that which will used in prompt .
Donot use any images
Important Notes: You have to only give me the pages and their one line description. only
Eg : 
# creaet a website for hotel booking and hotel mangement 

# page : landing page 
# page : we should be able to add room details 
# page : list of all the rooms avilable 
# page : and we should be able to book  aroom a
# page : you should be able to search hotel rooms based on amenities 
"""


merged_desc = client.models.generate_content(
    model="gemini-2.0-flash",
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