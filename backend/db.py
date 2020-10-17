import pyrebase
import json
import uuid
import requests
from countryCode import to_name
from secrets import get_maps
import boto3
import math
from rake_nltk import Rake, Metric
import spacy
from timestamp import PushID

s3 = boto3.resource('s3')
bucket = s3.Bucket('cong-dhi')
sp = spacy.load('en_core_web_sm')
r = Rake(ranking_metric=Metric.WORD_DEGREE)
r2 = Rake(ranking_metric=Metric.WORD_DEGREE)
push = PushID()

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
    return near, location['lat'], location['lng']

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
    request_id = push.next_id()
    if image:
        filename = uuid.uuid4().hex + "." + image.filename.split(".")[-1]
        bucket.upload_fileobj(image, filename, ExtraArgs={'ACL': 'public-read'})
        url = "https://cong-dhi.s3.us-east-2.amazonaws.com/" + filename  
        print(url)
    else: 
        url = False
    datab().child('requests2').child(id).child(request_id).set({ "Title": category, "Description": name, "Email": email, "url": url })
    return request_id

def nlp(name, category, id, request_id):
    r.extract_keywords_from_text(name)
    r2.extract_keywords_from_text(category)
    phrases = r.get_ranked_phrases()
    phrases.extend(r2.get_ranked_phrases())
    print(phrases)
    phrases = list(dict.fromkeys(phrases))
    tags = sp(" ".join(phrases))
    for tag in tags:
        if tag.lemma_ != "-PRON-":
            print(tag.lemma_)
            datab().child('tags').child(tag.lemma_).push({ "disaster": id, "request": request_id }) 

def get_tags():
    try:
        return list(get_db()['tags'].keys())
    except KeyError:
        return []

def get_tag(tag):
    try:
        db = get_db()
        info = db['tags'][tag].values()
        posts = []
        for tag in info:
            post = db['requests2'][tag['disaster']][tag['request']]
            post['location'] = db['all'][tag['disaster']]['location']
            post['color'] = db['all'][tag['disaster']]['color']
            posts.append(post)
        return posts
    except KeyError:
        return []