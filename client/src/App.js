import React, { Component } from "react";
import * as io from "socket.io-client";
import './App.css';
import { Prompt, Redirect, BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Card, CardFooter, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';

const socket = io.connect("http://localhost:5000");

class App extends Component {
  constructor() {
    super();
    this.state = {
      sep: " : ",
      msg: "",
      chat: [],
      nickname: "",
      oldnick: "",
      servermsg: "",
      users: [],
      room: "loby",
      rooms: [],
      cmd: ""
    };
    this.myRef = React.createRef()
  }

  componentDidMount() {
    this.myRef.current.scrollTo(0, 0);

    var nickname = prompt("nickname ?");
    socket.emit("chat message", { room: this.state.room, servermsg: nickname + " join" });
    socket.emit("userlist", nickname);
    this.setState({ nickname: nickname })
    this.setState({ oldnick: nickname });

    socket.on("chat message", ({ room, nickname, msg, servermsg, sep }) => {
      this.setState({
        chat: [...this.state.chat, { room, nickname, msg, servermsg, sep }]
      });
    });
    socket.on("userlist", (users) => {
      this.setState({
        users: users
      });
    });
    socket.on("roomlist", (rooms) => {
      this.setState({
        rooms: rooms
      });
    });
  }

  scrollToBottom = () => {
    this.messagesEnd.current.scrollIntoView({ behavior: 'smooth' })
  }

  onTextChange = e => {
    this.setState({ [e.target.name]: e.target.value });
    if (e.target.value.substring(0, 1) === "/") {
      var submsg = e.target.value + " ";
      var submsg2 = submsg.indexOf(" ");
      var submsg3 = e.target.value.substring(1, submsg2);
      switch (submsg3) {

        case 'nick':
          this.setState({ servermsg: this.state.oldnick + ' change nickname to ' + e.target.value.substring(6) });
          this.setState({ nickname: e.target.value.substring(6) })

          break;
        case 'list':
          console.log("list");
          break;
        case 'create':
          var newroom = e.target.value.substring(8);
          var room = this.state.room;
          socket.emit("createroom", newroom, room);
          this.setState({ servermsg: this.state.nickname + ' create channel ' + e.target.value.substring(8) });
          this.setState({ room: newroom })
          break;
        case 'join':
          var newroom = e.target.value.substring(6);
          var room = this.state.room;
          socket.emit("createroom", newroom, room);
          this.setState({ servermsg: this.state.nickname + ' joined channel ' + e.target.value.substring(6) });
          this.setState({ room: newroom })

          break;
        case 'part':
          var room = this.state.room;
          socket.emit("partroom", room);
          this.setState({ servermsg: this.state.nickname + ' left channel ' + room });
          this.setState({ room: 'loby' });
          break;
        case 'users':
          var lol = "";
          var namelist = this.state.users.map(function (name) {
            return lol = lol + name + ", "
          })
          this.setState({ servermsg: "userlist : " + lol });
          lol = "";

          break;
        case 'msg':

          console.log("haha ça fonctione")
          console.log('probleme');
      }

    }
  };

  createroom = e => {
    e.preventDefault(); // prevents page reloading
    var newroom = prompt("create room ?");
    var room = this.state.room;
    socket.emit("createroom", newroom, room);
    this.setState({ room: newroom })
  }
  joinroom = e => {
    e.preventDefault(); // prevents page reloading
    var newroom = prompt("join room ?");
    var room = this.state.room;
    socket.emit("createroom", newroom, room);
    this.setState({ room: newroom })
  }

  deleteroom = e => {
    e.preventDefault(); // prevents page reloading
    var room = prompt("delete room ?");
    socket.emit("deleteroom", room);
  }
  partroom = e => {
    e.preventDefault(); // prevents page reloading
    var room = this.state.room;
    socket.emit("partroom", room);
    this.setState({ room: 'loby' });
  }

  onMessageSubmit = e => {
    e.preventDefault(); // prevents page reloading
    const { cmd, room, nickname, msg, servermsg, sep } = this.state;
    if (servermsg) {
      console.log(servermsg);
      socket.emit("chat message", { room, servermsg });
      this.setState({ msg: "" });
      this.setState({ servermsg: "" });
    }
    else {
      socket.emit("chat message", { room, nickname, msg, sep });
      this.setState({ room: room });
      this.setState({ msg: "" });
      this.setState({ servermsg: "" });
    }
  };

  renderChat() {
    console.log(this.state.rooms);
    console.log(this.state.chat);
    console.log(this.state.room);
    const { chat } = this.state;
    return chat.map(({ nickname, msg, servermsg, sep }, idx) => (
      <div key={idx}>
        <span style={{ color: "green" }}>{nickname}</span>
        <span style={{ color: "green" }}>{sep}</span>

        <span >{msg}</span>
        <div><span style={{ fontStyle: "italic"}}>{servermsg}</span></div>

      </div>
    ));
  }

  renderChan() {
    return this.state.rooms.map(function (name) {
      return <div>{name}</div>
    })
  }

  render() {
    return (
      <Router>
        <div id="cont">
          <div id="chanbox">
            <div id='buttonschan'>
              <button onClick={e => this.createroom(e)}>createchan</button>
              <button onClick={e => this.deleteroom(e)}>deletechan</button>
              <button onClick={e => this.joinroom(e)}>joinchan</button>
              <button onClick={e => this.partroom(e)}>partchan</button>
            </div>
            <div  id ='chanlist'>{this.renderChan()}</div>
          </div>
          <div id="chatbox">
            <div id='room'>
              <div>{this.state.room}</div>
            </div>
            <div id="chat"  >

              <div ref={this.myRef} id="render">{this.renderChat()}</div>
            </div>
            <div id="textbox">
              <form id='msg' action="">
                <div id='text'>
                  <input
                    name="msg"
                    onChange={e => this.onTextChange(e)}
                    value={this.state.msg}
                  />
                </div>
                <div id='send'>
                  <button onClick={e => this.onMessageSubmit(e)}>Send</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Router>
      /*<Container>
          <Row className="justify-content-center">
            <Col md="9" lg="7" xl="6">
        <div>{this.renderChat()}</div>
        <span>Nickname</span>
        <input
          name="nickname"
          onChange={e => this.onTextChange(e)}
          value={this.state.nickname}
        />
        <span>Message</span>
        <input
          name="msg"
          onChange={e => this.onTextChange(e)}
          value={this.state.msg}
        />
        <button onClick={this.onMessageSubmit}>Send</button>
        </Col>
          </Row>
      </Container>*/
    );
  }
}

export default App;


