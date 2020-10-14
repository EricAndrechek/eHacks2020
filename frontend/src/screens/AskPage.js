import React, { Component } from "react";
import "./AskPage.css";
import { Form, Button, Container } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import Wave from 'react-wavify';
import { url } from '../global'

export default class AskPage extends Component {

  state = {
    data: [{ "Categ": ["example"] }],
    loaded: false,
    error: ""
  }

  componentDidMount() {
    this.id = this.props.location.state.id;
    window.scrollTo(0, 0);
    this.getData()
  }

  getData = () => {
    fetch(`${url}/get?id=` + this.props.location.state.id)
    .then(res => res.json())
    .then(res => this.setState({ data: res.requests && res.requests.reverse(), details: res.details, loaded: true }))
  }

  request = (e) => {
    var form = new FormData();
    form.append('uuid', this.props.location.state.id)
    form.append("category", this.categ.value)
    form.append('item', this.descrip.value)
    form.append('email', this.email.value)
    this.state.file ? form.append('image', this.state.file, this.state.file.name) : form.append('image', false)
    fetch(`${url}/request`, {
      method: 'POST',
      body: form
    }).then(async(res) => {
      if (res.status === 527) {
        const error = await res.text()  
        this.setState({ error })
      }
    }).then(req => this.getData())

    try {
      e.preventDefault()
    } catch (e) {

    }
  }

  process = acceptedFiles => {
    this.setState({ file: acceptedFiles[0], selected: acceptedFiles[0].name });
  }

  render() {
    console.log(this.state.data)
    return (
      <div className="entirePage">
        <Wave 
            fill="limegreen"
            paused={false}
            className="waveAsk"
            options={{
              height: 60,
              amplitude: 70,
              speed:0.15,
              points: 3
            }}
          />
        <div className="waveContainer">
          <div className="requestForm">
            <h2 className="requestHeader">Request Items Here:</h2>
            <Form>
              <Form.Group>
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                      placeholder="Services, Goods, Money, Awareness..."
                      ref={loc => { this.categ = loc }} />
              </Form.Group>
              <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                      placeholder="Let donors contact you!"
                      ref={loc => { this.email = loc }} />
              </Form.Group>
              <Form.Group controlId="exampleForm.ControlTextarea1">
                  <Form.Label>Description</Form.Label>
                  <Form.Control 
                      ref={descrip => { this.descrip = descrip }}
                      placeholder="A list of items you need and why you need them"
                      as="textarea" rows="8" />
              </Form.Group>
              <Dropzone onDrop={acceptedFiles => this.process(acceptedFiles)}>
                {({getRootProps, getInputProps}) => (
                  <section className="dropzone">
                    <Container {...getRootProps()} className="drop-inside">
                      <input {...getInputProps()} />
                      <p style={{ fontSize: 20, width: '90%', color: 'gray' }}>
                        Drag and Drop your image in here! <br />
                        <i>Selected File: {this.state.selected}</i>
                      </p>
                    </Container>
                  </section>
                )}
              </Dropzone>
            </Form>
            <Button variant="primary" type="submit" onClick={e => this.request(e)}>
                Submit
            </Button>
            <p style={{ marginTop: 5 }}>{this.state.error}</p>
          </div>
        </div>
        {
          this.state.loaded && (
            <div className="currentRequests">
              <h1 className="currentHeader">Provide Help to Others in <span style={{ color: this.state.details.color }}>{this.state.details.location}</span></h1> 
              {
                this.state.data.length > 0 ? this.state.data.map(req => (
                  <div className="request">
                    <h4>{req.Title}</h4>
                    <p style={{ whiteSpace: "pre-line" }}>{req.Description}</p>
                    <div style={{ width: '100%', marginBottom: 15 }}>
                      { req.url && <img src={req.url} style={{ height: 200, maxWidth: '100%' }}/> }
                    </div>
                    <Button variant="success" href={"mailto:" + req.Email}>Help out!</Button>{' '}
                  </div>
                )) : <h4 style={{ color: "red", margin: 30 }}>There are no requests for this disaster yet!</h4>
              }
            </div>)
        }
      </div>
    );
  }
}