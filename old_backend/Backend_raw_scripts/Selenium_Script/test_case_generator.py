import json

def generate_test_plan():
    """Generate test cases from figma_data.json"""
    try:
        with open("figma_data.json", "r") as f:
            figma_data = json.load(f)
    except FileNotFoundError:
        print("❌ figma_data.json not found. Run figma_parser.py first!")
        return
    
    test_plan = {"test_cases": []}

    for component in figma_data.get("components", []):
        test_plan["test_cases"].append({
            "component": component["name"],
            "type": component["type"],
            "description": component["description"],
            "expected_result": f"{component['name']} should function correctly."
        })

    with open("test_plan.json", "w") as f:
        json.dump(test_plan, f, indent=4)

    print("✅ Test Plan Generated Successfully!")

if __name__ == "__main__":
    generate_test_plan()
