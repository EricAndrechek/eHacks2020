from flask import Flask, jsonify, request, redirect
from flask_cors import CORS, cross_origin
from db import get_all, get_id, add_incident, add_request, get_coords, get_near, get_tags, get_tag, nlp
from countryCode import to_code, to_name
from ipchecker import pass_address
import sys
import math
from secrets import get_maps
from threading import Thread
from twilio.twiml.messaging_response import MessagingResponse
from db import datab, get_near
import json

app = Flask(__name__)
cors = CORS(app)

@app.route('/')
def home():
    return redirect('https://dhi.vercel.app')

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
        passed = 'ok'
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
        if ip or ip == "76.112.42.21" or ip == "192.168.86.1" or ip == "192.168.86.41" or ip == "192.168.1.80": # allow localhost and my IP to bypass IP verification
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
    body = request.values.get('Body', None)
    pn = str(request.values.get('From', None))
    response = MessagingResponse()
    sms_logs = json.loads(json.dumps(datab().get().val()))['sms']
    if body.upper().strip() == "RESTART":
        datab().child('sms').child(pn).remove()
        response.message("Your chat logs have been reset. Reply to this message to start a new request.")
    else:
        if pn in sms_logs:
            step = int(sms_logs[pn]['step'])
            if step == 0:
                nearby = get_near(body)
                if len(nearby) > 0:
                    resp = ""
                    data = {}
                    last_num = 0
                    for location in nearby:
                        opt = location['location'] + ": " + location['description']
                        resp = resp + "{}. {}\n".format(last_num + 1, opt)
                        data[str(last_num + 1)] = location['id']
                        last_num += 1
                    response.message("Please choose a location from the following by typing the number:\n" + resp)
                    datab().child('sms').child(pn).update({'step': '1'})
                    datab().child('sms').child(pn).child('options').update(data)
                else:
                    response.message('No disaster could be found near that location. Please text RESTART to start over, or add a disaster on the website.')
            elif step == 1:
                try:
                    print(sms_logs[pn]['options'])
                    print(body)
                    req_loc = sms_logs[pn]['options'][body]
                except KeyError:
                    response.message('Unable to find an option matching that number. Please try again.')
                    return str(response)
                datab().child('sms').child(pn).update({'req_loc': req_loc, 'step': '2'})
                response.message('Great, what would you like to title your request?')
            elif step == 2:
                datab().child('sms').child(pn).update({'title': body, 'step': '3'})
                response.message('Done, now I need your email.')
            elif step == 3:
                datab().child('sms').child(pn).update({'email': body, 'step': '4'})
                response.message('Fantastic! Please enter the description of everything and anything you need.')
            elif step == 4:
                datab().child('sms').child(pn).update({'needs': body, 'step': '5'})
                response.message('Thanks! Your request is being processed and should show up on DHI\'s map shortly. To submit another request, reply RESTART')

                # put this data into request database:
                ud = json.loads(json.dumps(datab().get().val()))['sms'][pn]
                uuid = ud['req_loc']
                category = ud['title']
                item = ud['needs']
                email = ud['email']
                image = False
                request_id = add_request(uuid, category, item, email, image)
                thread = Thread(target=nlp, kwargs={ 'name': item, 'category': category, 'id': uuid, 'request_id': request_id })
                thread.start()
            else:
                response.message('An error occurred, please try again. If the issue persists, contact DHI.')
        else:
            data  =  {'step': '0'}
            datab().child('sms').child(pn).set(data)
            response.message('Hi there and welcome to the Disaster Help Index Chat Bot! \
            To get things started, please tell me your current address.')

    return str(response)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
