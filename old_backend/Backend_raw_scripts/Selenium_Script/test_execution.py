import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def run_ui_tests():
    """Execute Selenium UI tests with visible delays."""
    try:
        with open("test_plan.json", "r") as f:
            test_plan = json.load(f)
    except FileNotFoundError:
        print("❌ test_plan.json not found. Run testcase_generator.py first!")
        return

    try:
        with open("figma_data.json", "r") as f:
            figma_data = json.load(f)
    except FileNotFoundError:
        print("❌ figma_data.json not found. Run figma_parser.py first!")
        return

    if "web_url" not in figma_data:
        print("❌ No web URL found in figma_data.json.")
        return

    web_url = figma_data["web_url"]

    chrome_options = Options()
    chrome_options.add_experimental_option("detach", True)  # Keeps the browser open

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    print(f"🚀 Opening {web_url} for testing...")
    driver.get(web_url)
    time.sleep(5)  # Give time for page load

    for test in test_plan["test_cases"]:
        print(f"\n🔍 Running Test: {test['component']} ({test['type']})")

        if test["type"] in ["Input (text)", "Input (password)"]:
            selector = f"//input[@type='text' or @type='password']"
        elif test["type"] == "Button":
            selector = "//button"
        elif test["type"] == "Link":
            selector = "//a"
        else:
            print(f"⚠️ Skipping unknown component type: {test['type']}")
            continue

        elements = driver.find_elements(By.XPATH, selector)
        
        found = False
        for element in elements:
            if test["component"].lower() in (element.text.lower() or ""):
                found = True
                print(f"✅ {test['component']} found!")

                # Highlight the element for better visibility
                driver.execute_script("arguments[0].style.border='3px solid red'", element)
                
                # Wait for 3 seconds so the user can see it
                time.sleep(3)

                break
        
        if not found:
            print(f"❌ {test['component']} missing!")

        # Small delay before the next test (for visibility)
        time.sleep(2)

    driver.quit()
    print("\n✅ Test Execution Completed!")

if __name__ == "__main__":
    run_ui_tests()
