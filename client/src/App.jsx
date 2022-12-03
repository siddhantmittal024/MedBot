import { useState, useEffect } from "react";
import { AiOutlineSend } from "react-icons/ai";

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
      <div className="header-container">
      <h1>MedBot</h1>
      <div className="paragraphs">
      <p>Medical ChatBot is an AI-driven chatbot that will help you answer your
        basic medical queries. The chatbot can respond to your medical queries
        only to the best of its knowledge graph base.</p>
        <p> We have built a knowledge graph database of selected diseases, their
        symptoms and description. These relationships are stored in a Neo4j
        database, from where the results can be fetched.</p>
        <p>
        To understand user query, we make use of string matching algorithm, to
        identify the patterns of type of question asked and fetch suitable
        results.
      </p>
      </div>
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
            <AiOutlineSend/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;