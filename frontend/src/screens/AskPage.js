import React, { Component } from "react";
import "./AskPage.css";
import { Form, Button } from 'react-bootstrap'
import Wave from 'react-wavify';

export default class AskPage extends Component {

  state = {
    data: [],
    loaded: false
  }

  componentDidMount() {
    this.id = this.props.location.state.id;
    this.getData()
  }

  getData = () => {
    fetch('https://dhi.andrechek.com/get?id=' + this.props.location.state.id)
    .then(res => res.json())
    .then(res => this.setState({ data: res[0], loaded: true }))
  }

  request = (e) => {
    var form = new FormData();
    form.append('uuid', this.props.location.state.id)
    form.append("category", this.categ.value)
    form.append('item', this.descrip.value)

    fetch("https://dhi.andrechek.com/request", {
      method: 'POST',
      body: form
    })

    this.getData()

    e.preventDefault()
  }

  render() {
    return (
      <div className="entirePage">
        <div className="waveContainer">
          <div className="requestForm">
            <h2 className="requestHeader">Request Items Here:</h2>
            <Form>
              <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                      placeholder="Services, Goods, Money, Awareness..."
                      ref={loc => { this.categ = loc }} />
              </Form.Group>
              <Form.Group controlId="exampleForm.ControlTextarea1">
                  <Form.Label>Description</Form.Label>
                  <Form.Control 
                      ref={descrip => { this.descrip = descrip }}
                      placeholder="A list of items you need and why you need them"
                      as="textarea" rows="5" />
              </Form.Group>
              <Button variant="primary" type="submit" onClick={e => this.request(e)}>
                  Submit
              </Button>
            </Form>
          </div>
          <Wave 
            fill="red"
            paused={false}
            className="waveAsk"
            options={{
              height: 60,
              amplitude: 70,
              speed:0.15,
              points: 3
            }}
          />
        </div>
        {
          this.state.loaded ? (
            <div className="currentRequests">
              <h1 className="currentHeader">Provide Help to Others</h1>
              {
                Object.keys(this.state.data).map(categ => (
                  <div>
                    <h3>{categ}</h3>
                    <ul>
                      {
                        this.state.data[categ].map(req => <li>{req}</li>)
                      }
                    </ul>
                  </div>
                ))
              }
            </div>
          ) : null
        }
      </div>
    );
  }
}
