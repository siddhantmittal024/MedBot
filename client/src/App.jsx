import { useState, useEffect } from "react";

import "./App.css";

function App() {
  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const [websckt, setWebsckt] = useState();
  const [clientId, setClienId] = useState(
    Math.floor(new Date().getTime() / 1000)
  );

  useEffect(() => {
    const url = "ws://localhost:8000/ws/" + clientId;
    const ws = new WebSocket(url);

    // ws.onopen = (event) => {
    //   ws.send("Connect");
    // };

    ws.onmessage = (e) => {
      const message = (e.data);
      // console.log(message);
      setMessages([...messages, message]);
    };

    setWebsckt(ws);
    // return () => ws.close();
  }, []);

  console.log(messages);

  const sendMessage = (e) => {
    const msg = message;
    websckt.send(msg);
    // recieve message every send message
    //websckt.onmessage = (e) => {
      //const message = (e.data);
      setMessages([...messages, msg]);
    //};
    // setMessages([...messages, msg]);

    e.target.value = "";
    e.preventDefault();
    setMessage([]);
  };

  return (
    <div className="container">
      <h1>Chat</h1>
      <div className="chat-container">
        <div className="chat">
          {messages.map((value, index) => {
            return (
              <div key={index} className="my-message-container">
                <div className="my-message">
                  <p className="message">{value}</p>
                </div>
              </div>
            );
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