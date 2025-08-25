import json
import requests
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By

FIGMA_API_KEY = ""

def extract_from_figma(figma_url):
    """Extract UI components from Figma design."""
    file_key = figma_url.split("/")[-1]
    url = f"https://figma.com/design/{file_key}"
    headers = {"X-Figma-Token": FIGMA_API_KEY}

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"❌ Error: {response.status_code} - {response.text}")
        return None

    figma_data = response.json()
    
    # Recursive function to extract all UI components
    def extract_components(node, components):
        if "name" in node and "type" in node:
            components.append({
                "name": node["name"],
                "type": node["type"],
                "description": "Figma UI Component"
            })
        if "children" in node:
            for child in node["children"]:
                extract_components(child, components)

    components = []
    extract_components(figma_data.get("document", {}), components)

    return {
        "source": "figma",
        "components": components
    }

def extract_from_web(web_url):
    """Extract UI components from a webpage using Selenium."""
    options = Options()
    options.add_argument("--headless")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    print(f"🚀 Extracting components from: {web_url}")
    driver.get(web_url)
    time.sleep(5)

    components = []
    elements = driver.find_elements(By.XPATH, "//*")

    for element in elements:
        tag_name = element.tag_name
        text = element.text.strip()

        if tag_name in ["input", "button", "a"]:
            component = {
                "name": text if text else f"Unnamed {tag_name.capitalize()}",
                "type": f"Input ({element.get_attribute('type')})" if tag_name == "input" else tag_name.capitalize(),
                "description": f"{tag_name.capitalize()} element"
            }
            components.append(component)

    driver.quit()
    
    return {
        "source": "web",
        "web_url": web_url,
        "components": components
    }

def extract_ui_components(url):
    """Determine whether to parse Figma or a webpage."""
    if "figma.com" in url:
        data = extract_from_figma(url)
    else:
        data = extract_from_web(url)

    if data:
        with open("figma_data.json", "w") as f:
            json.dump(data, f, indent=4)
        print("✅ Figma/Web Data Extracted Successfully!")

if __name__ == "__main__":
    url = input("Enter Figma design URL or Webpage URL: ")
    extract_ui_components(url)
