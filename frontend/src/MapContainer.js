import React, { Component } from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import { mapsKey } from '../src/secrets'
import './App.css'
import Popup from 'reactjs-popup';
import { Form, Button, Spinner } from 'react-bootstrap'
import ReactDOM from 'react-dom';
import { url } from './global'

const geoUrl = 'https://raw.githubusercontent.com/AshKyd/geojson-regions/master/countries/50m/'

class MapContainer extends Component {

    coords = []

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

    componentDidMount(){
        this.pullData()
    }

    state = {
        preDone: false,
        ready: false,
        showingInfoWindow: false,
        selectedPlace: {},
        clickedAddress: "Hover on a marker",
        loc: "",
        descrip: "",
        data: {}
    }

    onMarkerClick = (props, marker, e) => {
        if (props !== this.state.selectedPlace) {
            this.marker = marker
            console.log("Updating...")
            setTimeout(() => this.setState({
                selectedPlace: props,
                showingInfoWindow: true
            }), 500)
        }
    }

    onMapClicked = (props) => {
        if (this.state.showingInfoWindow) {
          this.setState({
            showingInfoWindow: false,
          })
        }
    };

    pullData = () => {
        fetch(`${url}/all`).then(res => res.json()).then(res => this.setState({ data: res }, () => this.setState({ preDone: true })))
    }

    onMapReady = ({ google }, map) => {

        Object.keys(this.state.data).map(i => {
            const disaster = this.state.data[i]
            this.setState({ i })
            if (disaster.highlighted) {
                map.data.loadGeoJson(geoUrl + disaster.location + '.geojson')
                this.coords.push(null)
            } 
        })

        map.data.setStyle((feature) => {
            for (let x = 0; x < Object.keys(this.state.data).length; x++) {
                const i = Object.keys(this.state.data)[x]
                if (feature.getProperty('adm0_a3') === this.state.data[i].location) {
                    return {
                        fillColor: this.state.data[i].color,
                        strokeWeight: 0.05
                    }
                }
            }
        })

        map.data.addListener("mouseover", event => {
            Object.keys(this.state.data).map(i => {
                if (event.feature.getProperty('adm0_a3') === this.state.data[i].location) {
                    const temp = this.state.data[i]
                    this.setState({
                        selectedPlace: { color: temp.color, name: temp.location, description: temp.description, id: i }
                    })
                }
            })
        })

        map.data.addListener("click", event => {
            console.log("I was actually called :o")
            this.navigate()
        })
        this.setState({ ready: true })
    }

    sendDisaster = () => {
        const type = ReactDOM.findDOMNode(this.select).value
        const form = new FormData()
        form.append("location", this.loc.value)
        form.append("stat", this.stat.value)
        form.append("description", this.descrip.value)
        form.append("color", this.disasterColor[type])
        fetch(`${url}/add`, {
            method: 'POST',
            body: form,
            redirect: 'follow'
        }).then(res => console.log(res))

        console.log(this.loc.value, this.disasterColor[type], this.descrip.value, this.stat.value)
    }

    navigate = (e) => {
        this.props.history.push({
            pathname: "/disaster",
            state: {
                id: this.state.selectedPlace.id
            }
        })

        try {
            e.preventDefault()
        } catch(error) {

        }
    }


    render() { 
        return (
            <div className="mapContainer">
                {
                    this.state.preDone ? (
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
                                this.state.ready ? Object.keys(this.state.data).map(key => this.state.data[key].highlighted ? null : (
                                    <Marker
                                        name={this.state.data[key].location}
                                        color={this.state.data[key].color}
                                        stat={this.state.data[key].stat}
                                        description={this.state.data[key].description}
                                        id={key}
                                        onMouseover={this.onMarkerClick}
                                        onClick={e => this.navigate(e)}
                                        icon={require(`./assets/markers/${this.state.data[key].color}-dot.png`)}
                                        position={{ lat: this.state.data[key].lat, lng: this.state.data[key].lng }}>
                                    </Marker>
                                )) : null
                            }
                        </Map>
                    ) : (
                        <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Spinner animation="border" variant="primary" />
                        </div>
                    )
                }
                <div className="legendContainer">
                    <h3>Disasters all over the World</h3>
                    <p>Discover tragedies you've never heard about by clicking on them and learn what you can do to help!</p>
                    <div className="hovering">
                        <h4 style={{ textAlign: 'center', margin: 1 }}>{this.state.selectedPlace.name}</h4>
                        <p style={{ color: this.state.selectedPlace.color, margin: 5 }}><i>{this.colorDisaster[this.state.selectedPlace.color]}</i></p>
                        <p>{this.state.selectedPlace.stat}</p>
                        <p>{this.state.selectedPlace.description}</p>
                        <button onClick={this.navigate} className="b" style={{ marginBottom: 10, borderRadius: 5, backgroundColor: 'blue', color: 'white' }}>Learn More</button>
                    </div>
                    <div className="legend">
                        <h2 style={{ margin: 0, marginBottom: 10, color: 'black' }}>Legend</h2>
                        <div className="keys">
                            {
                                Object.keys(this.colorDisaster).map((key) => (
                                    <p style={{ color: key, marginTop: 3, marginBottom: 3, fontSize: 14 }}>{this.colorDisaster[key]}</p>
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