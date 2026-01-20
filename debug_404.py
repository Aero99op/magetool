import requests
import time

urls = [
    "https://aero99op-magetool-backend-api.hf.space/health/live",
    "https://p01--magetool--c6b4tq5mg4jv.code.run/health/live",
    "https://aero99op-magetool-backend-api.hf.space//health/live", # Test double slash
]

print("Checking URLs...")
for url in urls:
    try:
        print(f"\n--- Checking {url} ---")
        response = requests.get(url, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Content (first 100 chars): {response.text[:100]}")
    except Exception as e:
        print(f"Error: {e}")
