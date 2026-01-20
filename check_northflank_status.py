import requests
import time

url = "https://p01--magetool--c6b4tq5mg4jv.code.run/health/live"
print(f"Checking {url}...")

try:
    start = time.time()
    response = requests.get(url, timeout=15)
    elapsed = time.time() - start
    
    print(f"Status Code: {response.status_code}")
    print(f"Time: {elapsed:.2f}s")
    print("Response:", response.text)
except Exception as e:
    print(f"Error: {e}")
