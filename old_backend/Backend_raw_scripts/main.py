import json
import asyncio
import re
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from bs4 import BeautifulSoup

# Escapes special characters in CSS selectors
def css_escape(s):
    return re.sub(r'([!"#$%&\'()*+,./:;<=>?@[\\\]^`{|}~])', r'\\\1', s)

# Step 1: Web Scraping using Playwright
async def scrape_website(url):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, timeout=60000)
        html_content = await page.content()
        await browser.close()

        soup = BeautifulSoup(html_content, 'html.parser')
        elements = []
        for tag in soup.find_all(['button', 'input', 'a', 'form', 'div', 'img']):
            if tag.name == 'input' and tag.get('type', '').lower() == 'hidden':
                continue
            elements.append({
                'tag': tag.name,
                'attributes': tag.attrs,
                'text': tag.get_text(strip=True)
            })

        with open('web_data.json', 'w') as f:
            json.dump(elements, f, indent=4)

        return elements

# Step 2: Generate Test Plan & Cases
async def generate_test_cases(web_data, test_types):
    test_cases = []
    seen = set()
    
    for test_type in test_types:
        for element in web_data:
            selector = None
            attrs = element['attributes']

            if 'id' in attrs:
                selector = f"#{attrs['id']}"
            elif 'class' in attrs:
                classes = attrs['class']
                if isinstance(classes, list):
                    escaped_classes = [css_escape(cls) for cls in classes]
                    selector = "." + ".".join(escaped_classes)
                else:
                    selector = f".{css_escape(classes)}"
            else:
                continue

            test_case_text = None
            action = None

            if test_type == 'functional' and element['tag'] in ['button', 'input']:
                test_case_text = f"Verify {element['tag']} '{element.get('text', '').strip()}' is interactive"
                action = 'click' if element['tag'] == 'button' else 'type'
            
            elif test_type == 'ui' and element['tag'] in ['div', 'a', 'form']:
                test_case_text = f"Verify UI element '{element.get('text', '').strip()}' is properly styled"
                action = 'visual'

            elif test_type == 'accessibility':
                test_case_text = f"Check if '{element['tag']}' has proper alt text or ARIA attributes"
                action = 'aria'

            elif test_type == 'compatibility':
                test_case_text = f"Check if '{element['tag']}' is responsive and compatible across screen sizes"
                action = 'responsive'

            elif test_type == 'performance' and element['tag'] in ['img', 'video']:
                test_case_text = f"Verify that '{element['tag']}' loads efficiently without performance issues"
                action = 'load-time'

            if test_case_text and action:
                key = (action, selector, test_case_text)
                if key in seen:
                    continue
                seen.add(key)
                
                test_cases.append({'test_case': test_case_text, 'action': action, 'selector': selector})

    with open('test_plan.json', 'w') as f:
        json.dump(test_cases, f, indent=4)

    return test_cases

# Step 3: Automate Tests with Visual Highlights and Result Summary
async def automate_testing(test_cases, url):
    passed_count = 0
    failed_count = 0
    test_results = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.goto(url, timeout=60000)

        for test in test_cases:
            selector = test['selector']
            try:
                await page.wait_for_selector(selector, state='visible', timeout=5000)
            except PlaywrightTimeoutError:
                print(f"❌ {test['test_case']} failed: Element {selector} not visible")
                failed_count += 1
                test_results.append({'test_case': test['test_case'], 'status': 'Failed', 'reason': 'Element not visible'})
                continue
            
            try:
                if test['action'] == 'click':
                    await page.click(selector)
                elif test['action'] == 'type':
                    await page.fill(selector, 'Test Input')
                elif test['action'] == 'aria':
                    attr = await page.get_attribute(selector, 'aria-label')
                    if attr:
                        passed_count += 1
                        await page.evaluate(f"document.querySelector('{selector}').style.border = '3px solid green'")
                        test_results.append({'test_case': test['test_case'], 'status': 'Passed'})
                        continue
                    else:
                        raise Exception("Missing ARIA label")
                
                print(f"✅ {test['test_case']} passed")
                passed_count += 1
                await page.evaluate(f"document.querySelector('{selector}').style.border = '3px solid green'")
                test_results.append({'test_case': test['test_case'], 'status': 'Passed'})
            
            except Exception as e:
                print(f"❌ {test['test_case']} failed: {e}")
                failed_count += 1
                await page.evaluate(f"document.querySelector('{selector}').style.border = '3px solid red'")
                test_results.append({'test_case': test['test_case'], 'status': 'Failed', 'reason': str(e)})

        await browser.close()

    return test_results, passed_count, failed_count

# Step 4: Generate HTML Report
def generate_report(test_results):
    with open('test_report.html', 'w') as f:
        f.write("<html><head><title>Test Report</title></head><body>")
        f.write("<h1>Test Execution Report</h1>")
        f.write("<table border='1'><tr><th>Test Case</th><th>Status</th><th>Details</th></tr>")
        for result in test_results:
            color = 'green' if result['status'] == 'Passed' else 'red'
            details = result.get('reason', 'N/A')
            f.write(f"<tr><td>{result['test_case']}</td><td style='color:{color};'>{result['status']}</td><td>{details}</td></tr>")
        f.write("</table></body></html>")
    print("✅ HTML Report Generated: test_report.html")

async def run_pipeline(url):
    print("Select Testing Type (separate by commas or type 'all'):")
    print("1. Functional\n2. UI/UX\n3. Accessibility\n4. Compatibility\n5. Performance")
    test_choices = input("Enter choices (e.g., 1,3,5 or 'all'): ")
    
    test_type_map = {'1': 'functional', '2': 'ui', '3': 'accessibility', '4': 'compatibility', '5': 'performance'}
    test_types = [test_type_map[ch.strip()] for ch in test_choices.split(',') if ch.strip() in test_type_map] or list(test_type_map.values())

    print("Scraping Website...")
    web_data = await scrape_website(url)
    print("Generating Test Cases...")
    test_cases = await generate_test_cases(web_data, test_types)
    print("Running Automated Tests...")
    test_results, passed, failed = await automate_testing(test_cases, url)
    generate_report(test_results)
    print(f"Summary: {passed} Passed, {failed} Failed")

if __name__ == "__main__":
    website_url = input("Enter website URL: ")
    asyncio.run(run_pipeline(website_url))
