import React from 'react';
import './App.css';
import MapContainer from './MapContainer';
import Wave from 'react-wavify';
import Knowledge from './assets/knowledge.png';
import Disaster from './assets/disaster.png';
import Helper from './assets/helper.png';

function App() {
	return ( 
		<div className = "App">
			<div className = "landing" >
				 <h1 className="hook">
					 People Need Help.
				 </h1>
				 <h3 className="description">
					 And we're hardwired to help each other in times of need. <br />
					 Whether it be an earthquake or a rise of a dictator, [App Name] is here to help!
				 </h3>
				 <div className="logo" />
			</div> 
			<div className="info">
				<div className="infoPiece">
					<img src={Knowledge} style={{ width: 100, height: 100 }}/>
					<p style={{ margin: 2, color: 'white' }}>Learn about disasters that skipped your news feed</p>
				</div>
				<div className="infoPiece">
					<img src={Disaster} style={{ width: 100, height: 100 }}/>
					<p style={{ margin: 2, color: 'white' }}>Understand where you can help best</p>
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
					amplitude: 70,
					speed:0.15,
					points: 3
				}}
			/>
			<MapContainer />
		</div>
	);
}

export default App;