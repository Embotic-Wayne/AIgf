import "./normal.css";
import "./App.css";
import { useState, useRef, useEffect } from "react";

function App() {

  // Anime characters with their backgrounds and personalities
  const animeCharacters = [
    {
      id: 'nezuko',
      name: 'Nezuko',
      avatar: '/anime_avatar/Nezuko_Avatar.jpg',
      background: 'url(/anime_avatar/Nezuko_Background.jpg) center/cover, linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
      personality: 'Sweet and protective, loves her family and is very caring'
    },
    {
      id: 'nathan',
      name: 'Nathan',
      avatar: '/anime_avatar/Nathan.png',
      background: 'url(/anime_avatar/Nathan.png) center, linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
      personality: 'Toxic and rude, acts like a masculine womanizer'
    },
    {
      id: 'joe',
      name: 'Joe',
      avatar: '/anime_avatar/Joe_Avatar.jpg',
      background: 'url(/anime_avatar/Joe_Background.jpeg) center/cover, linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
      personality: 'Old and forgetful, can\'t remember what he will do next'
    },
  ];

  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentCharacter, setCurrentCharacter] = useState(() => {
    // Select a random character at startup
    const randomCharacter = animeCharacters[Math.floor(Math.random() * animeCharacters.length)];
    return randomCharacter;
  });
  const chatLogRef = useRef(null);



  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Generate initial welcome message when component mounts
  useEffect(() => {
    if (currentCharacter && chatLog.length === 0) {
      let welcomeMessages;
      if (currentCharacter.id === 'nathan') {
        welcomeMessages = [
          `Ugh, another one? *rolls eyes* I'm Nathan. What do you want? Don't waste my time.`,
          `*scoffs* Great, another person trying to get my attention. I'm Nathan. Make it quick.`,
          `*looks unimpressed* Oh, it's you. I'm Nathan. I hope you're not like all the other boring people I've talked to.`,
          `*sighs dramatically* Fine, I'm Nathan. I guess I can spare a few minutes for you. Don't expect much.`,
          `*checks you out dismissively* I'm Nathan. I'm used to people falling for me, so don't get any ideas.`
        ];
      } else if (currentCharacter.id === 'joe') {
        welcomeMessages = [
          `*rubs temples* Oh... hello there. I'm Joe... I think. What was I supposed to do again?`,
          `*looks confused* Hmm, I'm Joe... or was it John? *shakes head* I can't remember what I was doing.`,
          `*squints* Oh, it's you! I'm Joe... I think. My memory isn't what it used to be. What were we talking about?`,
          `*adjusts glasses* Hello... I'm Joe. I was going to do something... but I can't quite remember what it was.`,
          `*strokes beard thoughtfully* I'm Joe... I believe. I had something important to do today, but it's slipped my mind.`
        ];
      } else {
        welcomeMessages = [
          `Hiiii~ I'm ${currentCharacter.name}! *waves excitedly* Nice to meet you! How are you doing today?`,
          `Hey there! I'm ${currentCharacter.name}! *smiles warmly* I'm excited to chat with you! What's on your mind?`,
          `Yo! I'm ${currentCharacter.name}! *gives a friendly wave* Great to see you! What would you like to talk about?`,
          `Hello! I'm ${currentCharacter.name}! *does a cheerful pose* I'm here to chat and have fun! What's up?`,
          `Hey! I'm ${currentCharacter.name}! *waves enthusiastically* Ready for some awesome conversation? Let's chat!`
        ];
      }
      
      const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      setChatLog([{ user: "gpt", message: randomMessage, timestamp: new Date() }]);
    }
  }, [currentCharacter, chatLog.length]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatLog]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // 1) Optimistically add user's message
    const myMsg = { user: "me", message: trimmed, timestamp: new Date() };
    const updatedChatLog = [...chatLog, myMsg];
    setChatLog(updatedChatLog);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // 2) Send message to the server
      const res = await fetch("http://localhost:3080/api/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: trimmed,
          character: currentCharacter ? {
            name: currentCharacter.name,
            personality: currentCharacter.personality
          } : null
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // 3) Append assistant reply
      const gptMsg = { 
        user: "gpt", 
        message: data.reply || "I'm sorry, I couldn't process that request. Please try again.", 
        timestamp: new Date() 
      };
      const finalChatLog = [...updatedChatLog, gptMsg];
      setChatLog(finalChatLog);

      // 4) Save to chat history if this is a new chat or update existing
      if (!currentChatId) {
        const newChatId = Date.now().toString();
        const newChat = {
          id: newChatId,
          title: trimmed.length > 30 ? trimmed.substring(0, 30) + "..." : trimmed,
          messages: finalChatLog,
          character: currentCharacter,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setChatHistory(prev => [newChat, ...prev]);
        setCurrentChatId(newChatId);
      } else {
        // Update existing chat
        setChatHistory(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: finalChatLog, updatedAt: new Date() }
            : chat
        ));
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Sorry, there was an error processing your message. Please try again.");
      const errorMsg = { 
        user: "gpt", 
        message: "I'm sorry, I'm having trouble connecting right now. Please check your connection and try again.", 
        timestamp: new Date() 
      };
      const finalChatLog = [...updatedChatLog, errorMsg];
      setChatLog(finalChatLog);
    } finally {
      setIsLoading(false);
    }
  }

  function handleNewChat() {
    // Select a random anime character
    const randomCharacter = animeCharacters[Math.floor(Math.random() * animeCharacters.length)];
    setCurrentCharacter(randomCharacter);
    
    let welcomeMessages;
    if (randomCharacter.id === 'nathan') {
      welcomeMessages = [
        `Ugh, another one? *rolls eyes* I'm Nathan. What do you want? Don't waste my time.`,
        `*scoffs* Great, another person trying to get my attention. I'm Nathan. Make it quick.`,
        `*looks unimpressed* Oh, it's you. I'm Nathan. I hope you're not like all the other boring people I've talked to.`,
        `*sighs dramatically* Fine, I'm Nathan. I guess I can spare a few minutes for you. Don't expect much.`,
        `*checks you out dismissively* I'm Nathan. I'm used to people falling for me, so don't get any ideas.`
      ];
    } else if (randomCharacter.id === 'joe') {
      welcomeMessages = [
        `*rubs temples* Oh... hello there. I'm Joe... I think. What was I supposed to do again?`,
        `*looks confused* Hmm, I'm Joe... or was it John? *shakes head* I can't remember what I was doing.`,
        `*squints* Oh, it's you! I'm Joe... I think. My memory isn't what it used to be. What were we talking about?`,
        `*adjusts glasses* Hello... I'm Joe. I was going to do something... but I can't quite remember what it was.`,
        `*strokes beard thoughtfully* I'm Joe... I believe. I had something important to do today, but it's slipped my mind.`
      ];
    } else {
      welcomeMessages = [
        `Hiiii~ I'm ${randomCharacter.name}! *waves excitedly* Nice to meet you! How are you doing today?`,
        `Hey there! I'm ${randomCharacter.name}! *smiles warmly* I'm excited to chat with you! What's on your mind?`,
        `Yo! I'm ${randomCharacter.name}! *gives a friendly wave* Great to see you! What would you like to talk about?`,
        `Hello! I'm ${randomCharacter.name}! *does a cheerful pose* I'm here to chat and have fun! What's up?`,
        `Hey! I'm ${randomCharacter.name}! *waves enthusiastically* Ready for some awesome conversation? Let's chat!`
      ];
    }
    
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    setChatLog([
      { user: "gpt", message: randomMessage, timestamp: new Date() }
    ]);
    setError(null);
    setCurrentChatId(null);
  }

  function handleCharacterSelect(character) {
    setCurrentCharacter(character);
    
    let welcomeMessages;
    if (character.id === 'nathan') {
      welcomeMessages = [
        `Ugh, another one? *rolls eyes* I'm Nathan. What do you want? Don't waste my time.`,
        `*scoffs* Great, another person trying to get my attention. I'm Nathan. Make it quick.`,
        `*looks unimpressed* Oh, it's you. I'm Nathan. I hope you're not like all the other boring people I've talked to.`,
        `*sighs dramatically* Fine, I'm Nathan. I guess I can spare a few minutes for you. Don't expect much.`,
        `*checks you out dismissively* I'm Nathan. I'm used to people falling for me, so don't get any ideas.`
      ];
    } else if (character.id === 'joe') {
      welcomeMessages = [
        `*rubs temples* Oh... hello there. I'm Joe... I think. What was I supposed to do again?`,
        `*looks confused* Hmm, I'm Joe... or was it John? *shakes head* I can't remember what I was doing.`,
        `*squints* Oh, it's you! I'm Joe... I think. My memory isn't what it used to be. What were we talking about?`,
        `*adjusts glasses* Hello... I'm Joe. I was going to do something... but I can't quite remember what it was.`,
        `*strokes beard thoughtfully* I'm Joe... I believe. I had something important to do today, but it's slipped my mind.`
      ];
    } else {
      welcomeMessages = [
        `Hiiii~ I'm ${character.name}! *waves excitedly* Nice to meet you! How are you doing today?`,
        `Hey there! I'm ${character.name}! *smiles warmly* I'm excited to chat with you! What's on your mind?`,
        `Yo! I'm ${character.name}! *gives a friendly wave* Great to see you! What would you like to talk about?`,
        `Hello! I'm ${character.name}! *does a cheerful pose* I'm here to chat and have fun! What's up?`,
        `Hey! I'm ${character.name}! *waves enthusiastically* Ready for some awesome conversation? Let's chat!`
      ];
    }
    
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    setChatLog([
      { user: "gpt", message: randomMessage, timestamp: new Date() }
    ]);
    setError(null);
    setCurrentChatId(null);
  }

  function handleLoadChat(chatId) {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setChatLog(chat.messages);
      setCurrentChatId(chatId);
      setCurrentCharacter(chat.character || animeCharacters[0]);
      setError(null);
    }
  }

  function handleDeleteChat(chatId, e) {
    e.stopPropagation();
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      handleNewChat();
    }
  }

  function formatChatTitle(title) {
    return title.length > 25 ? title.substring(0, 25) + "..." : title;
  }

  function formatChatDate(date) {
    const now = new Date();
    const chatDate = new Date(date);
    const diffInHours = (now - chatDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return chatDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return chatDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return chatDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  return (
    <div className="App">
              <header className="header-bar">
          <div className="header-content">
            <h1 
              className="app-title" 
              onClick={() => window.location.reload()}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && window.location.reload()}
              aria-label="Refresh page"
            >
              AIRIzZ
            </h1>
          </div>
        </header>
      
      <div className="main-content">
        <aside className="sidemenu" role="navigation" aria-label="Main navigation">
        <div 
          className="side-menu-button new-chat-button" 
          onClick={handleNewChat}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNewChat()}
          aria-label="Start a new chat"
        >
          <span aria-hidden="true">+</span>
          New Chat
        </div>
        
        <div className="character-selector-sidebar">
          <h3 className="character-selector-title">Characters</h3>
          <div className="character-options">
            {animeCharacters.map((character) => (
              <div
                key={character.id}
                className={`character-option-sidebar ${currentCharacter?.id === character.id ? 'active' : ''}`}
                onClick={() => handleCharacterSelect(character)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCharacterSelect(character)}
                aria-label={`Select ${character.name}`}
                title={character.personality}
              >
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="character-avatar-sidebar"
                />
                <span className="character-name-sidebar">{character.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {chatHistory.length > 0 && (
          <div className="chat-history-section">
            <h3 className="chat-history-title">Recent Chats</h3>
            <div className="chat-history-list">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-history-item ${currentChatId === chat.id ? 'active' : ''}`}
                  onClick={() => handleLoadChat(chat.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadChat(chat.id)}
                  aria-label={`Load chat: ${chat.title}`}
                >
                  <div className="chat-item-content">
                    <div className="chat-item-title">{formatChatTitle(chat.title)}</div>
                    <div className="chat-item-date">{formatChatDate(chat.updatedAt)}</div>
                  </div>
                  <button
                    className="chat-delete-button"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    aria-label={`Delete chat: ${chat.title}`}
                    title="Delete chat"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </aside>

      <main 
        className="chatbox" 
        role="main"
        style={{
          background: currentCharacter ? currentCharacter.background : 'rgba(15, 15, 35, 0.8)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div 
          className="chat-log" 
          ref={chatLogRef}
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {chatLog.map((message, index) => (
            <ChatMessage key={index} message={message} currentCharacter={currentCharacter} />
          ))}
          {isLoading && (
            <div className="chat-message chatgpt" role="status" aria-label="AI is thinking">
              <div className="chat-message-center">
                <div className="avatar-container">
                  <div className="avatar-wrapper">
                    <img
                      className="avatar-img"
                      src={currentCharacter?.avatar || "/chatgpt-avatar.svg"}
                      alt={currentCharacter?.name || "Waifu"}
                    />
                  </div>
                  {currentCharacter && (
                    <div className="character-name">
                      {currentCharacter.name}
                    </div>
                  )}
                </div>
                <div className="message-content">
                  <div className="message loading-dots" aria-live="polite">Thinking...</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div className="chat-input-holder">
          <form onSubmit={handleSubmit} role="form" aria-label="Send a message">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-input-textarea"
              placeholder="Chat with your anime character..."
              disabled={isLoading}
              aria-label="Type your message"
              aria-describedby={error ? "error-message" : undefined}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={isLoading || !input.trim()}
              aria-label={isLoading ? "Sending message" : "Send message"}
            >
              <span aria-hidden="true">➤</span>
            </button>
          </form>
        </div>
      </main>
      </div>
    </div>
  );
}

const ChatMessage = ({ message, currentCharacter }) => {
  const isGpt = message.user === "gpt";
  
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-message ${isGpt ? "chatgpt" : ""}`}>
      <div className="chat-message-center">
        <div className="avatar-container">
          <div className="avatar-wrapper">
            <img
              className="avatar-img"
              src={isGpt ? (currentCharacter?.avatar || "/chatgpt-avatar.svg") : "/anime_avatar/Profile.jpg"}
              alt={isGpt ? (currentCharacter?.name || "Waifu") + " avatar" : "User avatar"}
            />
          </div>
          {isGpt && currentCharacter && (
            <div className="character-name">
              {currentCharacter.name}
            </div>
          )}
          {!isGpt && (
            <div className="character-name">
              You
            </div>
          )}
        </div>
        <div className="message-content">
          <div className="message">{message.message}</div>
          {message.timestamp && (
            <div className="message-time">
              {formatTime(message.timestamp)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
