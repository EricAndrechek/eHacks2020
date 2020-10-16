from flask import Flask, jsonify, request, redirect
from flask_cors import CORS, cross_origin
from db import get_all, get_id, add_incident, add_request, get_coords, get_near, get_tags, get_tag, nlp
from countryCode import to_code, to_name
from ipchecker import pass_address
import sys
import math
from secrets import get_maps
from threading import Thread

app = Flask(__name__)
cors = CORS(app)

@app.route('/')
def home():
    return redirect('https://e-hacks2020.vercel.app')

@app.route("/all", methods = ['GET'])
def all_disaster_data():
    return jsonify(get_all())

@app.route("/get", methods = ["GET"])
def specific_disaster_data():
    id = request.args.get('id')
    data = get_id(id)
    if data == False:
        data = { "requests": [] }
    #print(data["details"]["location"])
    return jsonify(data)

@app.route('/add', methods = ["POST"])
def add_disaster():
    location = request.form.get('location', False)
    description = request.form.get('description', False)
    stat = request.form.get('stat', False)
    color = request.form.get('color', False)
    ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
    print(ip)
    if color and stat and description and location:
        highlighted, location = to_code(location)
        passed = pass_address(ip, location)
        print(passed, flush=True)
        if passed == "ok" or ip == "76.112.42.21" or ip == "192.168.86.1" or ip == "192.168.86.41" or ip == "192.168.1.80": # allow localhost and my IP to bypass IP verification
            return add_incident(location, stat, description, color, highlighted)
        else:
            print('Error: IP address does not appear to be from the location of the disaster, please ensure you are not using a VPN')
            return 'Error: IP address does not appear to be from the location of the disaster, please ensure you are not using a VPN'

    else:
        print('not all data was received')
        return "Error: not all data was received"

@app.route('/request', methods = ["POST"])
def request_things():
    uuid = request.form.get('uuid', False)
    category = request.form.get('category', False)
    item = request.form.get('item', False)
    email = request.form.get('email', False)
    try:
        image = request.files["image"]
    except KeyError:
        image = False
    ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
    print(ip)
    if uuid and category and item and email:
        location = None
        try:
            location = get_all()[uuid]['location']
        except KeyError:
            return "Error: disaster must be created before you can request things for it"
        if pass_address(ip, location) or ip == "76.112.42.21" or ip == "192.168.86.1" or ip == "192.168.86.41" or ip == "192.168.1.80": # allow localhost and my IP to bypass IP verification
            request_id = add_request(uuid, category, item, email, image)
            thread = Thread(target=nlp, kwargs={ 'name': item, 'category': category, 'id': uuid, 'request_id': request_id })
            thread.start()
            return 'Added'
        else:
            return 'Error: IP address does not appear to be from the location of the disaster, please ensure you are not using a VPN', 527

    else:
        return "Error: not all data was received"

@app.route('/near', methods=['POST'])
def near():
    return jsonify(get_near(request.form.get('address', False)))

@app.route('/tags', methods=['GET'])
def all_tags():
    return jsonify(get_tags())

@app.route('/tag', methods=['GET'])
def specific_tag():
    return jsonify(get_tag(request.args.get('id')))
    
    
@app.route('/sms', methods=['POST', 'GET'])
def sms():
    return { "say": "MANGYAT MOMEEEEEEEEEENT" }
    
if __name__ == '__main__':
    app.run(debug=True, port=5000)
