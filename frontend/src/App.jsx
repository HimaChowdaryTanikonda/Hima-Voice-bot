import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./App.css";
import himaImage from "./assets/hima.jpeg";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const askAI = async (msg) => {
    if (!msg.trim()) return;

    const userMessage = {
      role: "user",
      text: msg,
    };

    setMessages((prev) => [...prev, userMessage]);

    setQuestion("");

    try {
      setLoading(true);

      const response = await axios.post(
        "https://hima-voice-bot.onrender.com/chat",
        {
          message: msg,
        }
      );

      const aiReply = response.data.answer
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/#/g, "")
        .replace(/`/g, "")
        .replace(/—/g, ", ")
        .replace(/--/g, ", ")
        .trim();

      const aiMessage = {
        role: "assistant",
        text: aiReply,
      };

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);

      window.speechSynthesis.cancel();

      const speech =
        new SpeechSynthesisUtterance(
          aiReply
        );

      speech.rate = 1;
      speech.pitch = 1;
      speech.volume = 1;

      window.speechSynthesis.speak(
        speech
      );

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.error ||
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech Recognition is not supported in this browser."
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";

    setIsListening(true);

    recognition.start();

    recognition.onresult = (
      event
    ) => {
      const transcript =
        event.results[0][0].transcript;

      askAI(transcript);
    };

    recognition.onerror = (
      event
    ) => {
      console.error(event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  return (
    <div className="app">

      <div className="hero">

        <img
          src={himaImage}
          alt="Hima Chowdary"
          className="profile-image"
        />

        <h1>
  Hima AI
</h1>

<p>
  Talk to an AI version of me.
  Ask about my journey, projects,
  strengths, ambitions and goals.
</p>

      </div>

      <div className="chat-box">

        {messages.map(
          (msg, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
              }}
              className={
                msg.role === "user"
                  ? "user-message"
                  : "ai-message"
              }
            >
              {msg.text}
            </motion.div>
          )
        )}

        {loading && (
          <div className="typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      <div className="input-area">

        <textarea
          placeholder="Ask me anything..."
          value={question}
          onChange={(e) =>
            setQuestion(
              e.target.value
            )
          }
        />

        <div className="buttons">

  <button
    className="icon-btn send-btn"
    onClick={() =>
      askAI(question)
    }
  >
    ➤
  </button>

  <button
    className={`icon-btn mic-btn ${
      isListening
        ? "listening"
        : ""
    }`}
    onClick={startListening}
  >
    🎤
  </button>

  <button
    className="icon-btn stop-btn"
    onClick={stopSpeaking}
  >
    ⏹
  </button>

</div>

      </div>

      <div className="footer">
  Built with AI • Designed by Hima Chowdary Tanikonda
</div>

    </div>
  );
}

export default App;
