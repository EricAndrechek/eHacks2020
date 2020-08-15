import requests




def pass_address(ip, location):
    url = "https://ipapi.co/{}/json/".format(ip)

    response = requests.request("GET", url).json()
    
    country_code = response["country_code_iso3"]

    city = response["city"].lower()

    region = response["region"].lower()

    if country_code == location or city in location.lower() or region in location.lower():
        return True
    return False

