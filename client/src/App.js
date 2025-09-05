import "./normal.css";
import "./App.css";
import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([
    { user: "gpt", message: "How can I help you?" },
  ]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    // 1) Optimistically add user's message
    const myMsg = { user: "me", message: trimmed };
    setChatLog((prev) => [...prev, myMsg]);
    setInput("");

    // 2) Send ONLY the latest message to the server
    const res = await fetch("http://localhost:3080/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed }),
    });

    const data = await res.json();

    // 3) Append assistant reply
    const gptMsg = { user: "gpt", message: data.reply || "(no reply)" };
    setChatLog((prev) => [...prev, gptMsg]);
  }

  return (
    <div className="App">
      <aside className="sidemenu">
        <div className="side-menu-button">
          <span>+</span>
          New Chat
        </div>
      </aside>

      <section className="chatbox">
        <div className="chat-log">
          {chatLog.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        </div>

        <div className="chat-input-holder">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-input-textarea"
              placeholder="Type your message here"
            />
          </form>
        </div>
      </section>
    </div>
  );
}

const ChatMessage = ({ message }) => {
  const isGpt = message.user === "gpt";
  return (
    <div className={`chat-message ${isGpt ? "chatgpt" : ""}`}>
      <div className="chat-message-center">
        <div className="avatar-wrapper">
          <img
            className="avatar-img"
            src={isGpt ? "/chatgpt-avatar.svg" : "/user-avatar.svg"}
            alt={isGpt ? "ChatGPT avatar" : "User avatar"}
          />
        </div>
        <div className="message">{message.message}</div>
      </div>
    </div>
  );
};

export default App;
