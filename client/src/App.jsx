import { useState, useEffect, useRef } from "react";
import { AiOutlineSend } from "react-icons/ai";

import "./App.css";

function App() {
  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const websckt = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const url = "ws://localhost:8000/ws";
    const ws = new WebSocket(url);
    ws.onmessage = (e) => {
      const message = {
        message: JSON.parse(e.data),
        author: "bot",
      };
      setMessages((m) => [...m, message]);
    };
    websckt.current = ws;
    return () => ws.close();
  }, []);

  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    //const msg = message;
    if (message != "") {
      websckt.current.send(message);

      const msg = {
        message: message,
        author: "user",
      };

      setMessages((m) => [...m, msg]);
      setMessage("");
    } else {
      alert("Message cannot be empty!");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="container">
      <div className="header-container">
        <h1 style={{ "letter-spacing": "1px" }}>
          MedBot
          <span class="underlines">
            <span className="underline" style={{ "margin-left": "0%" }}></span>
            <span className="underline" style={{ "margin-left": "25%" }}></span>
            <span className="underline" style={{ "margin-left": "50%" }}></span>
            <span className="underline" style={{ "margin-left": "75%" }}></span>
          </span>
        </h1>
        <div className="paragraphs">
          <h2 style={{ "margin-top": "1em" }}>About</h2>
          <p style={{ "margin-top": "0.5em" }}>
            Medical ChatBot is an AI-driven chatbot that will help you answer
            your basic medical queries. The chatbot can respond to your medical
            queries only to the best of its knowledge graph base.
          </p>
          <h2 style={{ "margin-top": "1em" }}>Working</h2>
          <p style={{ "margin-top": "0.5em" }}>
            We have built a knowledge graph database of selected diseases, their
            symptoms and description. These relationships are stored in a Neo4j
            database, from where the results can be fetched.
          </p>
          <p style={{ "margin-top": "0.5em" }}>
            To understand user query, we make use of string matching algorithm,
            to identify the patterns of type of question asked and fetch
            suitable results.
          </p>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-title">MedBot</div>
        </div>
        <div className="chat">
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
            <div ref={bottomRef} />
          </div>
        </div>
        <div className="input-chat-container">
          <input
            className="input-chat"
            type="text"
            placeholder="Message"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            value={message}
          ></input>

          <div className="submit-chat" onClick={sendMessage}>
            <AiOutlineSend style={{ marginTop: "4px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
