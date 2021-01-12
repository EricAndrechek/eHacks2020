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
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import { url } from './global'
import { Button } from 'react-bootstrap'

class Home extends Component {

	componentDidMount(){
		this.getTags()
	}

	getTags = () => {
		fetch(`${url}/tags`).then(res => res.json()).then(tags => {
			console.log(tags)
			this.setState({ tags })
		})
	}

	state = {
		posts: [],
		tags: []
	}

	updateRequests = tag => {
		fetch(`${url}/tag?id=${tag}`).then(res => res.json()).then(res => {
			const done = []
			const unique = []
			for (var i = 0; i < res.length; i++) {
				if (!done.includes(res[i].Description)) {
					done.push(res[i].Description)
					unique.push(res[i])
				}
			}
			this.setState({ posts: unique })
		})
	}

	render(){
		return ( 
			<div className = "App">
				<div className = "landing" >
					 <h1 className="hook">
						 People Need Help.
					 </h1>
					 <p className="description">
						 And we're hardwired to help each other in times of need. <br />
						 Whether it be an earthquake or a rise of a dictator, Disaster Help Index is here to help!
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
				<div className="search">
					<h2 style={{ color: 'white', marginBottom: 10 }}>Find out how you can help!</h2>
					<p style={{ color: 'white', marginBottom: 20, fontSize: 20 }}>Just type in what you can contribute into the search box.</p>
					<Typeahead 
						onChange={selected => this.updateRequests(selected)}
						options={this.state.tags}
						placeholder="Ex: tutor, money, awareness"
						minLength={1}
						style={{ marginBottom: 20 }}
					/>
					{
						this.state.posts.map(req => (
							<div className="request">
							  <p style={{ fontSize: 20 }}><i>Located in</i> <span style={{ color: req.color }} className="locationText">{req.location}</span></p>
							  <h4>{req.Title}</h4>
							  <p style={{ whiteSpace: "pre-line" }}>{req.Description}</p>
							  <div style={{ width: '100%', marginBottom: 15 }}>
								{ req.url && <img src={req.url} style={{ height: 200, maxWidth: '100%' }}/> }
							  </div>
							  <Button variant="success" href={"mailto:" + req.Email}>Help out!</Button>{' '}
							</div>
						  ))
					}
				</div>
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