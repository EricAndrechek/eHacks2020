from flask import Flask, jsonify, request
from db import get_all, get_id, add_incident, add_request

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


if    __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
