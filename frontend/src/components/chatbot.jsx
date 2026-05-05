import React, { useState, useEffect, useRef } from "react";

// --- Gemini API Integration (as provided) ---

/**
 * Calls the Gemini API with exponential backoff.
 * @param {string} userQuery - The user's query.
 * @param {string} systemPrompt - The system instruction for the model.
 * @returns {Promise<string>} - The bot's response text.
 */
const callGeminiAPI = async (userQuery, systemPrompt) => {
  // API key is left as an empty string and will be provided by the environment
  const apiKey = "AIzaSyBkxgZ6e-tup5PBs2O7GEEOLfpR6f_nq_A";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [{ text: userQuery }],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
  };
  

  // Exponential backoff parameters
  let delay = 1000; // Start with a 1-second delay
  const maxRetries = 5;

  for (let i = 0; i < maxRetries; i++) {
    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        return (
          result?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No response text."
        );
      } else if (response.status === 429 || response.status >= 500) {
        // ... existing backoff logic ...
        if (i === maxRetries - 1) {
          throw new Error(`HTTP error! status: ${response.status} after ${maxRetries} retries.`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; 
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
       console.error("Gemini API error:", error.message);
       if (i === maxRetries - 1) {
         return "Sorry, something went wrong.";
       }
       await new Promise((resolve) => setTimeout(resolve, delay));
       delay *= 2;
    }
  }
  return "Sorry, something went wrong after multiple attempts.";
};

// --- Mock API Functions ---

/**
 * Simulates fetching a fare estimate.
 * @param {string} from - Starting location.
 * @param {string} to - Destination.
 * @returns {Promise<string>} - A formatted fare string.
 */
const mockGetFare = (from, to) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a plausible random fare for India
      const baseFare = 120;
      const randomFactor = Math.random() * 200;
      const fare = Math.round((baseFare + randomFactor) / 10) * 10;
      resolve(`₹${fare} - ₹${fare + 50}`);
    }, 1200); // Simulate network delay
  });
};

/**
 * Simulates booking a ride.
 * @param {string} from - Starting location.
 * @param {string} to - Destination.
 * @returns {Promise<object>} - A mock ride confirmation object.
 */
const mockBookRide = (from, to) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        driver: "Ramesh Kumar",
        car: "White Maruti Swift",
        plate: "DL 3C AB 1234",
        eta: "5 minutes",
      });
    }, 1500);
  });
};

/**
 * Renders message text, converting URLs to clickable links.
 */
const MessageContent = ({ text }) => {
  // Regex to find URLs (http, https, www)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  // Find all matches and build an array of strings and <a> elements
  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add the link
    const url = match[0];
    const href = url.startsWith('www.') ? `https://` + url : url;
    parts.push(<a key={lastIndex} href={href} target="_blank" rel="noopener noreferrer" className="chat-link">{url}</a>);
    lastIndex = match.index + url.length;
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // Return as a fragment
  return <>{parts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</>;
};


// --- Chat Support Component ---
const ChatSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // State for managing conversation flow
  const [conversationState, setConversationState] = useState('IDLE');
  const [bookingDetails, setBookingDetails] = useState({ from: null, to: null });

  const initialMessage = {
    text: "Hello! I'm your SAARTHI assistant. How can I help you today?",
    sender: "bot",
    quickReplies: ["Book a Ride", "Get Fare Estimate", "Help and Support", "Other Questions"],
  };

  // Set initial message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([initialMessage]);
    }
  }, [isOpen]); // Only depends on isOpen

  // Auto-scroll to new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleInputChange = (e) => setInputValue(e.target.value);

  /**
   * Handles sending a text message from the input field.
   */
  const handleSendTextMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === "" || isLoading) return;
    
    const currentInput = inputValue;
    addMessage(currentInput, "user");
    setInputValue("");
    setIsLoading(true);
    await getBotResponse(currentInput);
  };

  /**
   * Handles a click on a quick reply button.
   */
  const handleQuickReply = async (text) => {
    if (isLoading) return;
    
    addMessage(text, "user");
    setIsLoading(true);
    await getBotResponse(text);
  };

  /**
   * Adds a new message to the state.
   */
  const addMessage = (text, sender, quickReplies = []) => {
    setMessages((prev) => [...prev, { text, sender, quickReplies }]);
  };

  /**
   * Main logic hub for determining the bot's response.
   */
  const getBotResponse = async (userInput) => {
    let text = "";
    let quickReplies = [];
    const input = userInput.toLowerCase();

    switch (conversationState) {
      case 'IDLE':
        if (input.includes('book')) {
          setConversationState('BOOKING_FROM');
          text = "Sure, I can help with that. Where are you starting from?";
        } else if (input.includes('fare')) {
          setConversationState('ESTIMATE_FROM');
          text = "I can get you an estimate. Where would the ride start from?";
        } else if (input.includes('help')) {
          setConversationState('IDLE'); // Stays idle
          text = "For more detailed assistance, please visit our Help & Support page: https://saarthi-rides.com/help. What else can I assist you with?";
          quickReplies = ["Book a Ride", "Get Fare Estimate", "Other Questions"];
        } else if (input.includes('other')) {
          setConversationState('QA');
          text = "No problem, what's your question?";
        } else {
          // General Q&A
          const systemPrompt = `You are a helpful and friendly chat support assistant for a carpooling website in India called 'SAARTHI'. Your goal is to answer user questions concisely and accurately. Keep your answers to 2-3 sentences. Available services are: City Rides, Outstation Travel. The company offers 25% off on the first ride. The current time is ${new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}.`;
          text = await callGeminiAPI(userInput, systemPrompt);
          quickReplies = ["Book a Ride", "Get Fare Estimate", "Help and Support", "Other Questions"];
        }
        break;

      case 'QA':
        // Handle follow-up questions
        const systemPrompt = `You are a helpful and friendly chat support assistant for a carpooling website in India called 'SAARTHI'. Your goal is to answer user questions concisely and accurately. Keep your answers to 2-3 sentences. Available services are: City Rides, Outstation Travel. The company offers 25% off on the first ride. The current time is ${new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}.`;
        text = await callGeminiAPI(userInput, systemPrompt);
        setConversationState('IDLE'); // Reset to IDLE
        quickReplies = ["Book a Ride", "Get Fare Estimate", "Help and Support", "Other Questions"];
        break;

      case 'BOOKING_FROM':
        setBookingDetails({ ...bookingDetails, from: userInput });
        setConversationState('BOOKING_TO');
        text = `Got it. And where are you going to?`;
        break;
      
      case 'ESTIMATE_FROM':
        setBookingDetails({ ...bookingDetails, from: userInput });
        setConversationState('ESTIMATE_TO');
        text = `Okay. And what's the destination?`;
        break;

      case 'BOOKING_TO':
      case 'ESTIMATE_TO':
        const from = bookingDetails.from;
        const to = userInput;
        setBookingDetails({ from, to });
        
        const fare = await mockGetFare(from, to);
        
        if (conversationState === 'BOOKING_TO') {
          setConversationState('BOOKING_CONFIRM');
          text = `Great. A ride from ${from} to ${to} will cost approximately ${fare}. Shall I book this for you?`;
          quickReplies = ["Yes, book it", "No, cancel"];
        } else {
          setConversationState('IDLE');
          text = `The estimated fare from ${from} to ${to} is ${fare}.`;
          quickReplies = ["Book a Ride", "Get Fare Estimate", "Help and Support", "Other Questions"];
        }
        break;

      case 'BOOKING_CONFIRM':
        if (input.includes('yes')) {
          const confirmation = await mockBookRide(bookingDetails.from, bookingDetails.to);
          text = `Your ride is confirmed! Your driver, ${confirmation.driver}, will be there in ${confirmation.eta} in a ${confirmation.car} (${confirmation.plate}).`;
        } else {
          text = "Okay, the booking has been cancelled.";
        }
        setConversationState('IDLE');
        setBookingDetails({ from: null, to: null });
        quickReplies = ["Book a New Ride", "Get Fare Estimate", "Help and Support", "Other Questions"];
        break;
        
      default:
        setConversationState('IDLE');
        text = "I'm not sure how to help with that. Can we try something else?";
        quickReplies = ["Book a Ride", "Get Fare Estimate", "Help and Support", "Other Questions"];
    }

    addMessage(text, "bot", quickReplies);
    setIsLoading(false);
  };

  const lastMessage = messages[messages.length - 1];

  return (
    <div>
      <style>{`
        :root {
          --primary-color: #007AFF;
          --primary-color-dark: #005bb5;
          --secondary-color: #f0f4f8;
          --text-color: #1c1c1e;
          --text-color-light: #555;
          --border-radius: 16px;
          --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        body {
          font-family: var(--font-family);
        }

        .chat-bubble { 
          position: fixed; bottom: 30px; right: 30px; 
          width: 60px; height: 60px; 
          background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark)); 
          border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          cursor: pointer; 
          box-shadow: 0 5px 15px rgba(0, 122, 255, 0.3); 
          z-index: 1000; 
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .chat-bubble:hover { 
          transform: scale(1.1); 
          box-shadow: 0 8px 25px rgba(0, 122, 255, 0.4);
        }
        
        .chat-popup { 
          position: fixed; 
          bottom: 100px; 
          right: 30px; 
          width: 370px; 
          max-width: 90vw; 
          height: 600px; 
          max-height: 80vh;
          background-color: #ffffff; 
          border-radius: var(--border-radius); 
          box-shadow: 0 10px 40px rgba(0,0,0,0.1); 
          display: flex; 
          flex-direction: column; 
          overflow: hidden; 
          z-index: 999; 
          opacity: 0; 
          transform: translateY(20px); 
          visibility: hidden; 
          transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s; 
        }
        .chat-popup.open { 
          opacity: 1; 
          transform: translateY(0); 
          visibility: visible; 
        }
        
        .chat-header { 
          background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
          color: white; 
          padding: 20px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          border-bottom: 1px solid #eee;
        }
        .chat-header h3 { 
          margin: 0; 
          font-size: 1.25em; 
          font-weight: 600;
        }
        .chat-header .close-btn { 
          background: none; 
          border: none; 
          color: white; 
          font-size: 28px; 
          cursor: pointer; 
          line-height: 1; 
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .chat-header .close-btn:hover {
          opacity: 1;
        }
        
        .chat-messages { 
          flex-grow: 1; 
          padding: 20px; 
          overflow-y: auto; 
          display: flex; 
          flex-direction: column; 
          gap: 14px; 
          background-color: var(--secondary-color); 
        }
        
        .message { 
          padding: 12px 18px; 
          border-radius: 20px; 
          max-width: 85%; 
          word-wrap: break-word; 
          line-height: 1.5;
          font-size: 0.95em;
        }
        .message.user { 
          background-color: var(--primary-color); 
          color: white; 
          align-self: flex-end; 
          border-bottom-right-radius: 6px; 
        }
        .message.bot { 
          background-color: #e5e5ea; 
          color: var(--text-color); 
          align-self: flex-start; 
          border-bottom-left-radius: 6px; 
        }
        
        .message.bot .chat-link {
          color: var(--primary-color);
          text-decoration: underline;
        }
        
        .message.user .chat-link {
          color: #ffffff;
          text-decoration: underline;
          font-weight: 600;
        }

        .quick-replies {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 10px 20px 0 20px;
          background-color: var(--secondary-color);
        }
        
        .quick-reply-btn {
          background-color: #ffffff;
          color: var(--primary-color);
          border: 1px solid var(--primary-color);
          border-radius: 20px;
          padding: 8px 15px;
          font-size: 0.9em;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .quick-reply-btn:hover {
          background-color: var(--primary-color);
          color: white;
        }
        
        .message.typing { 
          padding: 15px 18px; 
          display: flex; 
          gap: 6px; 
          align-items: center; 
        }
        .message.typing span { 
          width: 9px; 
          height: 9px; 
          background-color: #b0b0b0; 
          border-radius: 50%; 
          animation: typing-blink 1.4s infinite both; 
        }
        .message.typing span:nth-child(2) { animation-delay: 0.2s; }
        .message.typing span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing-blink { 
          0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } 
        }
        
        .chat-input-form { 
          display: flex; 
          border-top: 1px solid #e0e0e0; 
          padding: 12px;
          background-color: #fff;
        }
        .chat-input-form input { 
          flex-grow: 1; 
          border: none; 
          padding: 12px; 
          font-size: 1em; 
          outline: none; 
          background-color: #f0f0f0;
          border-radius: 20px;
          margin-right: 10px;
          font-family: var(--font-family);
        }
        .chat-input-form button { 
          background-color: var(--primary-color); 
          color: white; 
          border: none; 
          width: 44px;
          height: 44px;
          border-radius: 50%; 
          cursor: pointer; 
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s; 
        }
        .chat-input-form button:hover { 
          background-color: var(--primary-color-dark); 
        }
        .chat-input-form button:disabled { 
          background-color: #ccc; 
          cursor: not-allowed; 
        }
      `}</style>

      {/* Chat Bubble Icon */}
      <div className="chat-bubble" onClick={toggleChat}>
        {isOpen ? (
          // Close Icon (X)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          // Plain Message Icon (no dots)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 256 256"
            fill="white"
          >
            <path d="M216 48H40a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h40v32a8 8 0 0 0 13.66 5.66L144 192h72a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16Z" />
          </svg>
        )}
      </div>

      {/* Chat Popup Window */}
      <div className={`chat-popup ${isOpen ? "open" : ""}`}>
        <div className="chat-header">
          <h3>SAARTHI Support</h3>
          <button className="close-btn" onClick={toggleChat}>
            &times;
          </button>
        </div>
        
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <MessageContent text={msg.text} />
            </div>
          ))}
          
          {isLoading && (
            <div className="message bot typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Replies */}
        {lastMessage && lastMessage.sender === 'bot' && lastMessage.quickReplies && lastMessage.quickReplies.length > 0 && !isLoading && (
          <div className="quick-replies">
            {lastMessage.quickReplies.map((reply, index) => (
              <button key={index} onClick={() => handleQuickReply(reply)} className="quick-reply-btn">
                {reply}
              </button>
            ))}
          </div>
        )}

        <form className="chat-input-form" onSubmit={handleSendTextMessage}>
          <input
            type="text"
            placeholder={
              conversationState.includes('BOOKING') || conversationState.includes('ESTIMATE')
                ? "Type your location..."
                : "Ask a question..."
            }
            value={inputValue}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {/* Send Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSupport;
