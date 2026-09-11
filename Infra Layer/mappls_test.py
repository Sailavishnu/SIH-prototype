import os
import requests
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("MAPPLS_ACCESS_TOKEN")

url = "https://search.mappls.com/search/byod/search"

lat = 9.5716
lon = 77.9624

params = {
    "access_token": TOKEN,
    "recordType": "TRAFFIC_SIGN",
    "refLocation": f"{lat},{lon}",
    "radius": 2,
    "sortBy": "dist:asc",
    "page": 1
}

response = requests.get(
    url,
    params=params,
    timeout=30
)

print("Status:", response.status_code)

if response.status_code == 200:

    data = response.json()

    records = data.get("records", [])

    print("Signboards nearby:", len(records))

    for sign in records:
        print("\n----------------------")
        print("ID:", sign.get("recordId"))
        print("Type:", sign.get("recordType"))
        print("Distance:", sign.get("distance"), "m")
        print("Latitude:", sign.get("latitude"))
        print("Longitude:", sign.get("longitude"))
        print("Info:", sign.get("extendedInfo"))

elif response.status_code == 204:

    print("No traffic sign within 2 metres.")

else:

    print("Error:")
    print(response.text)