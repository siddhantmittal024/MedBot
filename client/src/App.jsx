import { useState, useEffect } from "react";

import "./App.css";

function App() {
  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const [websckt, setWebsckt] = useState();

  useEffect(() => {
    const url = "ws://localhost:8000/ws";
    const ws = new WebSocket(url);
    setWebsckt(ws);
    //return () => ws.close();
  }, []);

  if (websckt != undefined) {
    websckt.onmessage = async (e) => {
      const message = {
        message: JSON.parse(e.data),
        author: "bot",
      };
      // console.log(message);
      setMessages([...messages, message]);
    };
  }

  console.log("ALL MESSAGES:", messages);

  const sendMessage = async () => {
    //const msg = message;
    const msg = {
      message: message,
      author: "user",
    };

    setMessages([...messages, msg]);

    await websckt.send(message);

    // recieve message every send message
    websckt.onmessage = (event) => {
      const message = {
        message: JSON.parse(event.data),
        author: "bot",
      };
      setMessages([...messages, message]);
    };

    setMessage([]);
  };

  return (
    <div className="container">
      <h1>Chat</h1>
      <div className="chat-container">
        <div className="chat">
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
        <div className="input-chat-container">
          <input
            className="input-chat"
            type="text"
            placeholder="Chat message ..."
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          ></input>

          <button className="submit-chat" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
