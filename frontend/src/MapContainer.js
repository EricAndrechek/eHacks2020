import React, { Component } from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import { mapsKey } from '../src/secrets'
import './App.css'
import Popup from 'reactjs-popup';
import { Form, Button } from 'react-bootstrap'
import ReactDOM from 'react-dom';

const geoUrl = 'https://raw.githubusercontent.com/AshKyd/geojson-regions/master/countries/50m/'

class MapContainer extends Component {

    colorDisaster = {
        green: "Deforestation/Wildfire",
        blue: "Hurricane/Tsunami",
        orange: "Pandemic",
        brown: 'Earthquake',
        gray: 'Pollution',
        red: 'Human Rights Violation',
        pink: 'Terrorist Attack/Explosion'
    }

    disasterColor = {
        "Deforestation/Wildfire": "green",
        "Hurricane/Tsunami": "blue",
        "Pandemic": "orange",
        'Earthquake': 'brown',
        'Pollution': 'gray',
        'Human Rights Violation': 'red',
        'Terrorist Attack/Explosion': 'pink'
    }

    state = {
        ready: false,
        showingInfoWindow: false,
        activeMarker: {},
        selectedPlace: {},
        clickedAddress: "Hover on a marker",
        loc: "",
        descrip: "",
        data: [
            {
                "id": "312hjhjh12",
                "location": "BLR", // could also be like "Okemos, Michigan, USA" if local
                "color": "red", // color name in lowercase, but if a color hex code is easier I can do that
                "damages": 15, // integer of damages in millions
                "description": "A dictator has established control in Belarus. People claim that the elections were completely faked.",
                "highlighted": true
            },
            {
                "id": "djhfg82934h",
                "location": "Beirut, Lebanon",
                "color": "pink",
                "damages": 29,
                "description": "A massive explosion rocked Beirut. Several hundreds have died. Till now, no one knows the cause of the accident!" ,
                "highlighted": false
            },
            {
                "id": "djhfg82934h",
                "location": "Delhi, India",
                "description": "Pollution fogs the beautiful city of Delhi as school starts getting cancelled because people literally can't breathe" ,
                "color": "gray",
                "damages": 29,
                "highlighted": false
            }
        ]
    }

    onMarkerClick = (props, marker, e) =>
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });

    onMapClicked = (props) => {
        if (this.state.showingInfoWindow) {
          this.setState({
            showingInfoWindow: false,
            activeMarker: null
          })
        }
      };

    onMapReady = ({ google }, map) => {
        for (var i= 0; i < this.state.data.length; i++) {
            const disaster = this.state.data[i]
            this.setState({ i })
            if (disaster.highlighted) {
                map.data.loadGeoJson(geoUrl + disaster.location + '.geojson')
            } else {
                fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${disaster.location}&key=${mapsKey}&sensor=false`)
                .then(res => res.json())
                .then(res => {
                    const coords = res.results[0].geometry.location;
                    let data = [...this.state.data]
                    data[this.state.i].coords = coords
                    this.setState({ data })
                })
            }
        }

        map.data.setStyle((feature) => {
            for (var i= 0; i < this.state.data.length; i++) {
                if (feature.getProperty('adm0_a3') === this.state.data[i].location) {
                    return {
                        fillColor: this.state.data[i].color,
                        strokeWeight: 0.05
                    }
                }
            }
            return {
                fillColor: 'red',
                strokeWeight: 0.5
            }
        })

        map.data.addListener("mouseover", event => {
            for (var i= 0; i < this.state.data.length; i++) {
                if (event.feature.getProperty('adm0_a3') === this.state.data[i].location) {
                    const temp = this.state.data[i]
                    this.setState({
                        selectedPlace: { color: temp.color, name: temp.location, description: temp.description }
                    })
                }
            }
        })
        // setTimeout(() => this.applyHeatmaps(map), 1000)
        this.setState({ ready: true })
    }

    sendDisaster = () => {
        const type = ReactDOM.findDOMNode(this.select).value
        const form = new FormData()
        form.append("location", this.loc.value)
        form.append("stat", this.stat.value)
        form.append("description", this.descrip.value)
        form.append("color", this.disasterColor[type])
        fetch('url', {
            method: 'POST',
            body: form,
            redirect: 'follow'
        })

        console.log(this.loc.value, this.disasterColor[type], this.descrip.value, this.stat.value)
    }


    render() {
        return (
            <div className="mapContainer">
                <Map
                    google={this.props.google} 
                    onReady={this.onMapReady}
                    style={{ margin: 60 }}
                    className="map"
                    initialCenter={{  lat: 39.399, lng: -8.224454 }}
                    containerStyle={{ background: "#333232", width: '70%', float: 'left' }}
                    onClick={this.onMapClicked}
                    zoom={2.4}>
                    {
                        this.state.ready ? this.state.data.map(location => location.highlighted ? null : (
                            <Marker
                                name={location.location}
                                color={location.color}
                                description={location.description}
                                onMouseover={this.onMarkerClick}
                                icon={require(`./assets/markers/${location.color}-dot.png`)}
                                position={location.coords}>
                            </Marker>
                        )) : null
                    }
                </Map>
                <div className="legendContainer">
                    <h1>Disasters all over the World</h1>
                    <p>Discover tragedies you've never heard about by clicking on them and learn what you can do to help!</p>
                    <div className="hovering">
                        <h4 style={{ textAlign: 'center', margin: 1 }}>{this.state.selectedPlace.name}</h4>
                        <p style={{ color: this.state.selectedPlace.color, margin: 5 }}><i>{this.colorDisaster[this.state.selectedPlace.color]}</i></p>
                        <p>{this.state.selectedPlace.description}</p>
                        <button className="b" style={{ marginBottom: 10, borderRadius: 5, backgroundColor: 'blue', color: 'white' }}>Learn More</button>
                    </div>
                    <div className="legend">
                        <h2 style={{ margin: 0, marginBottom: 10, color: 'white' }}>Legend</h2>
                        <div className="keys">
                            {
                                Object.keys(this.colorDisaster).map((key) => (
                                    <p style={{ color: key, marginTop: 3, marginBottom: 3 }}>{this.colorDisaster[key]}</p>
                                ))
                            }
                        </div>
                    </div>
                    <Popup modal trigger={<button className="submit b">Submit a New Disaster</button>} position="center center">
                        <div className="popupContainer">
                            <h1 style={{ margin: 0, marginBottom: 10, textAlign: 'center' }}>Submit a Disaster</h1>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Disaster Location</Form.Label>
                                    <Form.Control
                                        placeholder="Enter the Country / City"
                                        ref={loc => { this.loc = loc }} />
                                </Form.Group>
                                <Form.Group controlId="exampleForm.ControlSelect1">
                                    <Form.Label>Select type</Form.Label>
                                    <Form.Control ref={select => { this.select = select }} as="select">
                                        <option>Deforestation/Wildfire</option>
                                        <option>Hurricane/Tsunami</option>
                                        <option>Pandemic</option>
                                        <option>Earthquake</option>
                                        <option>Pollution</option>
                                        <option>Human Rights Violation</option>
                                        <option>Terrorist Attack/Explosion</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="exampleForm.ControlTextarea1">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control 
                                        ref={descrip => { this.descrip = descrip }}
                                        placeholder="Write a 1-2 sentence blurb about what happened"
                                        as="textarea" rows="3" />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Name an eye-catching statistic</Form.Label>
                                    <Form.Control 
                                        ref={stat => { this.stat = stat }}
                                        placeholder="Ex: $25M in damages were done..." />
                                </Form.Group>
                                <Button variant="primary" type="submit" onClick={this.sendDisaster}>
                                    Submit
                                </Button>
                            </Form>
                        </div>
                    </Popup>
                </div>
            </div>
        );
    }
}
 
export default GoogleApiWrapper({
  apiKey: mapsKey,
  libraries: ['visualization']
})(MapContainer)