import sys
import os
import json
import asyncio
import re
from contextlib import redirect_stdout
from io import StringIO
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from bs4 import BeautifulSoup

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from utils.gemini_client import generate_testcases, extract_text_from_pdf

# Escape special chars
def css_escape(s):
    return re.sub(r'([!"#$%&\'()*+,./:;<=>?@[\\]^`{|}~])', r'\\\1', s)

# Scrape DOM
async def scrape_dom(url, browser_type="chromium"):
    async with async_playwright() as p:
        browser = await getattr(p, browser_type).launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, timeout=60000)
        html = await page.content()
        await browser.close()

    soup = BeautifulSoup(html, "html.parser")
    elements = {}
    for tag in soup.find_all(["input", "button", "a", "form", "div", "img", "meta", "label", "textarea", "select"]):
        if tag.get("id"):
            elements[f"#{tag['id']}"] = tag
        elif tag.get("class"):
            classes = tag.get("class")
            if isinstance(classes, list):
                escaped = [css_escape(c) for c in classes]
                elements["." + ".".join(escaped)] = tag
            else:
                elements[f".{css_escape(classes)}"] = tag
        elif tag.get("name"):
            elements[f"[name='{tag['name']}']"] = tag
    
    return elements

# Normalize selectors
def normalize_selector(selector, dom_map):
    if not selector:
        return selector
    selectors = [s.strip() for s in selector.split(",")]
    mapped = []
    for sel in selectors:
        if sel in dom_map:
            mapped.append(sel)
        else:
            mapped.append(sel)
    return ", ".join(mapped)

# Execute testcase
async def execute_test(page, testcase, dom_map, test_type):
    result = {
        "id": testcase.get("id", "unknown"),
        "name": testcase.get("name", "Unnamed Test"),
        "status": "fail",
        "type": test_type,
        "description": testcase.get("description", ""),
        "details": "",
        "srsReference": testcase.get("srsReference", "N/A"),
    }

    selector = normalize_selector(testcase.get("selector"), dom_map)
    action = testcase.get("action")
    expected = testcase.get("expected")

    try:
        if action == "goto":
            await page.goto(selector if selector.startswith("http") else page.url)
            result["status"] = "pass"
            result["details"] = "Navigation success"

        elif action == "click":
            await page.wait_for_selector(selector, timeout=5000)
            await page.click(selector)
            result["status"] = "pass"
            result["details"] = "Click success"

        elif action == "type":
            await page.wait_for_selector(selector, timeout=5000)
            await page.fill(selector, expected or "Sample Input")
            result["status"] = "pass"
            result["details"] = "Typing success"

        elif action == "assert":
            try:
                await page.wait_for_selector(selector, timeout=5000)
                text = await page.inner_text(selector)
                if expected in text or expected == "true":
                    result["status"] = "pass"
                    result["details"] = "Assertion success"
                else:
                    result["details"] = f"Assertion failed: expected {expected}, got {text}"
            except PlaywrightTimeoutError:
                result["details"] = f"Assertion failed: element {selector} not found"

        elif action == "login":
            fields = selector.split(",")
            if len(fields) >= 2:
                await page.fill(fields[0].strip(), "dummyuser")
                await page.fill(fields[1].strip(), "dummypass")
                await page.keyboard.press("Enter")
                result["status"] = "pass"
                result["details"] = "Login simulated"
            else:
                result["details"] = "Invalid login selector format"

    except Exception as e:
        result["details"] = f"Error: {e}"

    return result

# Runner
async def run_tests(url, test_run_id, srs_pdf_path, test_type):
    try:
        print(f"[DEBUG] Starting {test_type} tests for URL: {url}", file=sys.stderr)
        srs_content = extract_text_from_pdf(srs_pdf_path)

        captured_output = StringIO()
        with redirect_stdout(captured_output):
            testcases = generate_testcases(test_type, srs_content, is_pdf=False)
            print("[DEBUG] Generated testcases:", json.dumps(testcases, indent=2)[:800], file=sys.stderr)


        dom_map = await scrape_dom(url)
        results = []

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, timeout=60000)

            for i, tc in enumerate(testcases):
                try:
                    res = await execute_test(page, tc, dom_map, test_type)
                    results.append(res)
                except Exception as e:
                    error_result = {
                        "id": tc.get("id", f"test_{i+1}"),
                        "name": tc.get("name", f"Test {i+1}"),
                        "status": "error",
                        "type": test_type,
                        "description": tc.get("description", "Test execution failed"),
                        "details": f"Test execution error: {str(e)}",
                        "srsReference": tc.get("srsReference", "N/A")
                    }
                    results.append(error_result)

            await browser.close()

        print(json.dumps(results, indent=2))
        return results

    except Exception as e:
        error_result = [{
            "id": f"{test_type}-error",
            "name": f"{test_type.capitalize()} Test Runner Error",
            "status": "error",
            "type": test_type,
            "description": "Execution pipeline failed",
            "details": str(e),
            "srsReference": "N/A"
        }]
        print(json.dumps(error_result, indent=2))
        return error_result
