import sys, asyncio
from test_runner import run_tests

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python performance_testing.py <url> <test_run_id> <srs_pdf_path>")
        sys.exit(1)
    url, test_run_id, srs_pdf_path = sys.argv[1], sys.argv[2], sys.argv[3]
    asyncio.run(run_tests(url, test_run_id, srs_pdf_path, "performance"))
