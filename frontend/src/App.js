import React, { Component } from 'react';
import './App.css';
import MapContainer from './MapContainer';
import Wave from 'react-wavify';
import Knowledge from './assets/knowledge.png';
import Disaster from './assets/disaster.png';
import Helper from './assets/helper.png';
import Logo from './assets/logo.png'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Switch, Route, Router } from 'react-router-dom';
import AskPage from './screens/AskPage';
import history from './history';

class Home extends Component {
	render(){
		return ( 
			<div className = "App">
				<div className = "landing" >
					 <h1 className="hook">
						 People Need Help.
					 </h1>
					 <p className="description">
						 And we're hardwired to help each other in times of need. <br />
						 Whether it be an earthquake or a rise of a dictator, [App Name] is here to help!
					 </p>
					 <img src={Logo} className="logo" />
				</div> 
				<div className="info">
					<div className="infoPiece">
						<img src={Knowledge} style={{ width: 100, height: 100 }}/>
						<p style={{ margin: 2, color: 'white' }}>Learn about disasters that skipped your news feed</p>
					</div>
					<div className="infoPiece">
						<img src={Disaster} style={{ width: 100, height: 100 }}/>
						<p style={{ margin: 2, color: 'white' }}>Understand how your resources are best used</p>
					</div>
					<div className="infoPiece">
						<img src={Helper} style={{ width: 100, height: 100 }}/>
						<p style={{ margin: 2, color: 'white' }}>Skip the media and personally extend a helping hand to those in need</p>
					</div>
				</div>
				<Wave 
					fill="#333232"
					paused={false}
					className="wave"
					options={{
						height: 60,
						amplitude: 60,
						speed:0.15,
						points: 3
					}}
				/>
				<MapContainer history={this.props.history}/>
			</div>
		);
	}
}

export default function App(){
	return (
		<Router history={history}>
			<Switch>
				<Route path="/" exact component={Home} />
				<Route path="/disaster" component={AskPage} />
			</Switch>
		</Router>
	)
}