import React, { Component } from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';

class MapContainer extends Component {

    state = {
        data: [
            { name: "USA", color: 'yellow' },
            { name: "BLR", color: 'blue' }
        ]
    }

    onMapReady = ({ google }, map) => {


        this.loadGeoJson(map);
    }

    loadGeoJson = async (map) => {
        console.log("Hi")
        for (var i= 0; i < this.state.data.length; i++) {
            map.data.loadGeoJson('https://raw.githubusercontent.com/AshKyd/geojson-regions/master/countries/50m/' + this.state.data[i].name + '.geojson')
        }

        map.data.setStyle((feature) => {
            for (var i= 0; i < this.state.data.length; i++) {
                if (feature.getProperty('adm0_a3') === this.state.data[i].name) {
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
    }

    render() {
        return (
            <div>
                <Map
                    google={this.props.google} 
                    onReady={this.onMapReady}
                    style={{ marginTop: 20 }}
                    zoom={3}>
                </Map>
            </div>
        );
    }
}
 
export default GoogleApiWrapper({
  apiKey: "AIzaSyC6QIlMY1wTom5Zoa9h-S4xyBCjK4BjaVI"
})(MapContainer)