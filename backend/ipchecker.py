import requests
import sys

def pass_address(ip, location):
    url = "https://ipapi.co/{}/json/".format(ip)

    response = requests.request("GET", url).json()
    
    try:
        country_code = response["country_code_iso3"]

        city = response["city"].lower()

        region = response["region"].lower()
        
        print(city, flush=True)
        print(region, flush=True)

        if country_code == location or city in location.lower() or region in location.lower():
            return "ok"
        return str(city)
    except KeyError:
        return "bru"

