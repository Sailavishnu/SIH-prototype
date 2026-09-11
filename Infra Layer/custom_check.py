import os
import requests
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("MAPPLS_ACCESS_TOKEN")

print("Token loaded:", bool(TOKEN))

if not TOKEN:
    print("MAPPLS_ACCESS_TOKEN not found")
    exit()

url = "https://search.mappls.com/search/byod/schema"

params = {
    "access_token": TOKEN
}

response = requests.get(url, params=params, timeout=30)

print("Status:", response.status_code)
print("Response:")
print(response.text)
