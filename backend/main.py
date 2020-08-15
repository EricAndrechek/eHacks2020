from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/all", methods = ['GET'])
def all_disaster_data():
  data = {
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
  }
  return jsonify(data)

# why is there an unexpected indent what
# can u git push i want to try this on mine yeah

if  __name__ == '__main__':
  app.run(debug=True, host='0.0.0.0')