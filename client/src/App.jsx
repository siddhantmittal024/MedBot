import { useState, useEffect } from "react";
import {AiOutlineSend} from "react-icons/ai";

import "./App.css";

function App() {
  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const [websckt, setWebsckt] = useState();

  useEffect(() => {
    const url = "ws://localhost:8000/ws";
    const ws = new WebSocket(url);
    // ws.onmessage = (e) => {
    //   const message = {
    //     message: JSON.parse(e.data),
    //     author: "bot",
    //   };
    //   // console.log(message);
    //   setMessages([...messages, message]);
    // };
    setWebsckt(ws);
    //return () => ws.close();
  }, []);

  if (websckt != undefined) {
    websckt.onmessage = (e) => {
      const message = {
        message: JSON.parse(e.data),
        author: "bot",
      };
      // console.log(message);
      setMessages([...messages, message]);
    };
  }

  console.log("ALL MESSAGES:", messages);
  const sendMessage = () => {
    //const msg = message;

    websckt.send(message);

    const msg = {
      message: message,
      author: "user",
    };

    setMessages([...messages, msg]);
    console.log("ALL MESSAGES:", messages);

    // recieve message every send message
    websckt.onmessage = (event) => {
      const msg = {
        message: JSON.parse(event.data),
        author: "bot",
      };
      //console.log("recieved msg: ",  msg);
      setMessages([...messages, msg]);
    };

    console.log("MESSAGE:", msg);

    setMessage([]);
  };

  return (
    <div className="container">
      <div className="header-container">
        <h1>MedBot</h1>
      </div>
      <div className="chat-container">
        <div className="chat">
          <div className="chat-header">
            <div className="chat-title">MedBot</div>
          </div>
          <div className="chat-content">
            {messages.map((value, index) => {
              if (value.author === "user") {
                return (
                  <div key={index} className="my-message-container">
                    <div className="my-message">
                      {/* <p className="client">client id : {clientId}</p> */}
                      <p className="message">{value.message}</p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={index} className="another-message-container">
                    <div className="another-message">
                      {/* <p className="client">client id : {clientId}</p> */}
                      <p className="message">{value.message}</p>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
        <div className="input-chat-container">
          <input
            className="input-chat"
            type="text"
            placeholder="Chat message ..."
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          ></input>

          <button className="submit-chat" onClick={sendMessage}>
            <AiOutlineSend />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
