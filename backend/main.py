from flask import Flask, jsonify, request
from db import get_all, get_id, add_incident, add_request
from countryCode import to_code
from ipchecker import pass_address

app = Flask(__name__)

@app.route("/all", methods = ['GET'])
def all_disaster_data():
    return jsonify(get_all())

@app.route("/get", methods = ["GET"])
def specific_disaster_data():
    id = request.args.get('id')
    data = get_id(id)
    if data == False:
            data = {"error": "not a valid id"}
    return jsonify(data)

@app.route('/add', methods = ["POST"])
def add_disaster():
    location = request.form.get('location', False)
    description = request.form.get('description', False)
    try:
        damages = int(request.form.get('damages', False))
    except ValueError:
        return "Error: damages must be a number"
    color = request.form.get('color', False)
    ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
    print(ip)
    if color and damages and description and location:
        highlighted, location = to_code(location)
        if pass_address(ip, location) or ip == "76.112.42.21" or ip == "127.0.0.1": # allow localhost and my IP to bypass IP verification
            return add_incident(location, damages, description, color, highlighted)
        else:
            return 'Error: IP address does not appear to be from the location of the disaster, please ensure you are not using a VPN'

    else:
        return "Error: not all data was received"

@app.route('/request', methods = ["POST"])
def request_things():
    uuid = request.form.get('uuid', False)
    category = request.form.get('category', False)
    item = request.form.get('item', False)
    ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
    print(ip)
    if uuid and category and item:
        location = None
        try:
            get_all()[uuid]
        except KeyError:
            return "Error: disaster must be created before you can request things for it"
        if pass_address(ip, location) or ip == "76.112.42.21" or ip == "127.0.0.1": # allow localhost and my IP to bypass IP verification
            return add_request(uuid, category, item)
        else:
            return 'Error: IP address does not appear to be from the location of the disaster, please ensure you are not using a VPN'

    else:
        return "Error: not all data was received"
    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
