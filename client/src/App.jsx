import "regenerator-runtime/runtime";
import { useState, useEffect, useRef } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { MdMic } from "react-icons/md";
import { createSpeechlySpeechRecognition } from "@speechly/speech-recognition-polyfill";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import "./App.css";

function App() {
  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const websckt = useRef(null);
  const bottomRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const startListening = () => SpeechRecognition.startListening();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

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
    if (message !== "") {
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
            MedBot is an AI-driven chatbot that will help you answer your basic
            medical queries. The chatbot can respond to your medical queries
            only to the best of its knowledge graph base.
          </p>
          <h2 style={{ "margin-top": "1em" }}>Working</h2>
          <p style={{ "margin-top": "0.5em" }}>
            It builds up a conversation by asking you follow-up questions
            regarding the symptoms you are facing and then will return the final
            predicted disease and precautions along with the description.
          </p>
          <h2 style={{ "margin-top": "1em" }}>How to Use MedBot?</h2>
          <p style={{ "margin-top": "0.5em" }}>
            Users can simply input a symptom they face initially either by typing or by using the speech-to-text feature by 
            simply speaking out the symptom name. Then the bot will ask further questions for which the user should answer accordingly.
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
          <MdMic
            style={{
              color: isActive ? "red" : "black",
              margin: "auto",
              height: "35px",
              width: "32px",
              cursor: "pointer",
            }}
            onTouchStart={() => {
              startListening();
              setIsActive(true);
              setMessage("");
            }}
            onMouseDown={() => {
              setIsActive(true);
              startListening();
              setMessage("");
            }}
            onTouchEnd={() => {
              SpeechRecognition.stopListening;
              setIsActive(false);
              setMessage(transcript);
            }}
            onMouseUp={() => {
              SpeechRecognition.stopListening;
              setIsActive(false);
              setMessage(transcript);
            }}
          />
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
