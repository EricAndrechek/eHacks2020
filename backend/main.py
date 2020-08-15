from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route("/all", methods = ['GET'])
def all_disaster_data():
  data = [
    {
      "id": "312hjhjh12",
      "location": "JPN",
      "color": "blue",
      "damages": 15,
      "highlighted": True
    },
    {
      "id": "djhfg82934h",
      "location": "Okemos, Michigan, USA",
      "color": "orange",
      "damages": 29,
      "highlighted": False
    }
  ]
  return jsonify(data)

@app.route("/get", methods = ["GET"])
def specific_disaster_data():
  data2 = [
    {
      "id": "312hjhjh12",
      "location": "JPN",
      "color": "blue",
      "damages": 15,
      "highlighted": True
    },
    {
      "id": "djhfg82934h",
      "location": "Okemos, Michigan, USA",
      "color": "orange",
      "damages": 29,
      "highlighted": False
    }
  ]
  return jsonify(data2)

@app.route("/add", methods = ["POST"])
def add_disaster_data():
    default_name = "0"
    location = input("Enter Location:")
    damages = input("Enter Damage Costs")
    data3 = request.form.get["POST", default_name]
    return data3


if  __name__ == '__main__':
  app.run(debug=True, host='0.0.0.0')
