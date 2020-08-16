import React, { Component } from "react";
import "./AskPage.css";

export default class AskPage extends Component {
  constructor(props) {
    super(props);
    const requests = [
      { name: "Advik", lives: "trash bag", needs: "food" },
      { name: "Unch", lives: "dumpster", needs: "Money, Guns, and Drugs" },
    ];
    this.state = { name: " ", address: " ", needs: " ", requests };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    console.log(this.state.name);
    console.log(this.state.address);
    console.log(this.state.needs);
    console.log(this.requests.name);
    event.preventDefault();
  }

  render() {
    return (
      <div className="entirePage">
        <div className="requestForm">
          <h1 className="requestHeader">Request Items Here:</h1>
          <form onSubmit={this.handleSubmit}>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={this.state.name}
                onChange={(event) =>
                  this.setState({ name: event.target.value })
                }
              />
              Address:
              <input
                type="text"
                name="address"
                value={this.state.address}
                onChange={(event) =>
                  this.setState({ address: event.target.value })
                }
              />
              Items Needed:
              <input
                type="text"
                name="items"
                value={this.state.needs}
                onChange={(event) =>
                  this.setState({ needs: event.target.value })
                }
              />
            </label>
            <input type="submit" value="Submit" />
          </form>
        </div>
        <div className="currentRequests">
          <h1 className="currentHeader">Current Requests:</h1>
          {this.state.requests.map((request, index) => (
            <p className="actualText" key={index}>
              {request.name} from {request.lives} needs {request.needs}.
              <button className="helpButton">Donate</button>
            </p>
          ))}
        </div>
      </div>
    );
  }
}
