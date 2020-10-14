import pyrebase
import json
import uuid
import requests
from countryCode import to_name
from secrets import get_maps
import boto3
import math

s3 = boto3.resource('s3')
bucket = s3.Bucket('cong-dhi')

def datab():
    config = open('ehacks-firebase.json', 'r').read()
    firebase = pyrebase.initialize_app(json.loads(config))
    return firebase.database()

def get_db():
    return json.loads(json.dumps(datab().get().val()))

def get_all():
    return get_db()['all']

def get_id(id):
    details = get_db()['all'][id]
    try:
        requests = get_db()['requests2']
        if details["highlighted"]:
            details["location"] = to_name(details["location"])
        return { "requests": list(requests[id].values()), "details": details }
    except KeyError:
        return { "details": details, "requests": [] }
    # try:
    #     new_requests = []
    #     for category in requests[id]:
    #         new_requests.append({category: list(requests[id][category].values())})
    #     return new_requests
    # except KeyError:
    #     return False
    
def get_coords(loc):
    try: 
        URL = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + loc + "&key=" + get_maps() + "&sensor=false"
        r = requests.get(url=URL).json()
        return r['results'][0]['geometry']['location'], r['results'][0]['formatted_address']
    except KeyError:
        pass
    
def get_viewport(loc):
    try: 
        URL = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + loc + "&key=" + get_maps() + "&sensor=false"
        r = requests.get(url=URL).json()
        return r['results'][0]['geometry']['viewport']
    except KeyError:
        pass
    
def get_near(address):
    location, formatted = get_coords(address)
    disasters = get_all()
    disaster_id = list(disasters.keys())
    near = []
    for id in disaster_id:
        disaster = disasters[id]
        if disaster['highlighted']:
            viewport = disaster['viewport']
            lat1 = viewport['northeast']['lat']
            lng1 = viewport['northeast']['lng']
            lat2 = viewport['southwest']['lat']
            lng2 = viewport['southwest']['lng']
            included = (lat1 <= location['lat'] <= lat2 or lat2 <= location['lat'] <= lat1) and (lng1 <= location['lng'] <= lng2 or lng2 <= location['lng'] <= lng1)
        else:
            RADIUS = 50
            lat1 = disaster['lat'] / 57.2958
            lng1 = disaster['lng'] / 57.2958
            lat2 = location['lat'] / 57.2958
            lng2 = location['lng'] / 57.2958
            distance = 3963.0 * math.acos(math.sin(lat1) * math.sin(lat2) + math.cos(lat1) * math.cos(lat2) * math.cos(lng2 - lng1)) < RADIUS
            viewport = disaster['viewport']
            lat1 = viewport['northeast']['lat']
            lng1 = viewport['northeast']['lng']
            lat2 = viewport['southwest']['lat']
            lng2 = viewport['southwest']['lng']
            within = (lat1 <= location['lat'] <= lat2 or lat2 <= location['lat'] <= lat1) and (lng1 <= location['lng'] <= lng2 or lng2 <= location['lng'] <= lng1)
            included = distance or within
            print(distance, disaster['location'])
        if included:
            near.append(disaster)
    return near

def add_incident(location, stat, description, color, highlighted):
    id = uuid.uuid4().hex
    data = {
        "color": color,
        "stat": stat,
        "description": description,
        "location": location,
        "highlighted": highlighted,
    }
    if not highlighted:
        r = get_coords(location)
        data['lat'] = r[0]['lat']
        data['lng'] = r[0]['lng']
    datab().child('all').child(id).set(data)
    return 'Added'

def add_request(id, category, name, email, image):
    if image:
        filename = uuid.uuid4().hex + "." + image.filename.split(".")[-1]
        bucket.upload_fileobj(image, filename, ExtraArgs={'ACL': 'public-read'})
        url = "https://cong-dhi.s3.us-east-2.amazonaws.com/" + filename  
        print(url)
    else: 
        url = False
    datab().child('requests2').child(id).push({ "Title": category, "Description": name, "Email": email, "url": url })
    return 'Added'        
    # if items:
    #     for item in items:
    #         for key in item:
    #             if key == category:
    #                 cat = []
    #                 for thing in item[key]:
    #                     cat.append(thing)
    #                 cat.append(name)
    #                 data = ', '.join(cat)
    #                 datab().child('requests').child(id).update({key: data})
    #                 return 'Added'
    #     datab().child('requests').child(id).update({category: name})
    #     return 'Added'
    # else:
    #     datab().child('requests').child(id).update({category: name})
    #     return 'Added'


# Here is how all these functions will work:

# add_incident('Phoenix, Arizona, USA', 'statistic', 'description', 'green', False)
# add_request('b38ec649600b4c83bbe18801d0ccb45c', 'services', 'food distribution')
# get_id('0db5a17b2a7c49bfbf7718051f17949a')
# get_all()