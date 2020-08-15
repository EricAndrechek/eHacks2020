import pyrebase
import json
import uuid

def datab():
    config = open('ehacks-firebase.json', 'r').read()
    firebase = pyrebase.initialize_app(json.loads(config))
    return firebase.database()

def get_db():
    return json.loads(json.dumps(datab().get().val()))

def get_all():
    return get_db()['all']

def get_id(id):
    try:
        requests = get_db()['requests']
    except KeyError:
        return False
    try:
        new_requests = []
        for item in requests[id]:
            item_data = requests[id][item].split(', ')
            new_item_data = []
            for thing in item_data:
                new_item_data.append(thing.replace('\'', ''))
            new_requests.append({item: new_item_data})
        return new_requests
    except KeyError:
        return False

def add_incident(location, damages, color, highlighted):
    id = uuid.uuid4().hex
    data = {
        "color": color,
        "damages": damages,
        "location": location,
        "highlighted": highlighted
    }
    datab().child('all').child(id).set(data)
    return 'Added'

def add_request(id, category, name):
    items = get_id(id)
    if items:
        for item in items:
            for key in item:
                if key == category:
                    cat = []
                    for thing in item[key]:
                        cat.append(thing)
                    cat.append(name)
                    data = ', '.join(cat)
                    datab().child('requests').child(id).update({key: data})
                    return 'Added'
        datab().child('requests').child(id).update({category: name})
        return 'Added'
    else:
        datab().child('requests').child(id).update({category: name})
        return 'Added'


# Here is how all these functions will work:

# add_incident('USA', 15, 'blue', True)
# add_request('0db5a17b2a7c49bfbf7718051f17949a', 'items', 'n95 masks')
# get_id('0db5a17b2a7c49bfbf7718051f17949a')
# get_all()