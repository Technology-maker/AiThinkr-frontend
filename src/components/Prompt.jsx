import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaRobot } from "react-icons/fa6";
import { IoIosGlobe } from "react-icons/io";
import { FaPaperclip, FaArrowAltCircleUp } from "react-icons/fa";
import axios from 'axios';

const Prompt = ({ prompt, setPrompt }) => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const promptEndRef = useRef();


  // saving date in localstorage user wise  18 to 30 lines
  useEffect(() => {
    const User = JSON.parse(localStorage.getItem("user"));
    const storedPrompt = localStorage.getItem(`promptHistory_${User._id}`)
    if (storedPrompt) {
      setPrompt(JSON.parse(storedPrompt))
    }
  }, [])


  useEffect(() => {
    const User = JSON.parse(localStorage.getItem("user"));
    localStorage.setItem(`promptHistory_${User._id}`, JSON.stringify(prompt))
    window.dispatchEvent(new Event("promptHistoryUpdated"));
  }, [prompt])


  useEffect(() => {
    if (!loading) {
      promptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [prompt, loading]);

  const handlerSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setInputValue("");

    setPrompt((prev) => [
      ...prev,
      { role: "user", content: trimmed },
    ]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "https://ai-thinkr.vercel.app/api/v1/deepseekai/prompt",
        { content: trimmed },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      setPrompt((prev) => [
        ...prev,
        { role: "assistant", content: data.reply }
      ]);
    } catch (Error) {
      setPrompt((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong with AI response." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handlerSend();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white flex flex-col items-center justify-start px-4 py-7 sm:py-10">

      {/* Greeting */}
      <div className="text-center mb-6 sm:mb-10">
        <div className="flex items-center justify-center gap-3 mb-2 h-10 rounded-full shadow-lg ">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hi, I'm <span className="text-blue-500">AiThinkr</span><span className="text-white">.</span>
          </h1>
        </div>
        <p className="text-gray-400 text-base sm:text-lg">💭 How can I help you today?</p>
      </div>

      {/* Message Display */}
      <div className="w-full max-w-4xl flex-1 overflow-y-auto mb-4 max-h-[52vh] px-1 sm:px-4 space-y-3 sm:space-y-4">
        {prompt.length === 0 && (
          <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
        )}
        {prompt.map((msg, index) => (
          <div
            key={index}
            className={`w-full flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[70%] px-4 py-2 rounded-xl text-sm whitespace-pre-wrap
                ${msg.role === "user"
                  ? "bg-blue-700 text-white rounded-br-none"
                  : "bg-gray-700 text-white rounded-bl-none"
                }`}
            >
              <ReactMarkdown
                children={msg.content}
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        children={String(children).replace(/\n$/, "")}
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      />
                    ) : (
                      <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              />
            </div>
          </div>
        ))}

        <div ref={promptEndRef}></div>

        {loading && (
          <div className='flex justify-start w-full'>
            <div className='bg-[#18181b] text-white px-4 py-2 rounded-xl text-sm animate-pulse'>Loading...</div>
          </div>
        )}

      </div>

      {/* Input Box */}
      <div className="w-full max-w-2xl bg-[#18181b] rounded-3xl p-2 sm:p-3 border border-gray-800 text-white mt-3 pt-3">
        <div className="flex flex-row gap-4 w-full">
          {/* Input Field */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="💬 Message AiThinkr"
            className="bg-[#18181b] w-full px-4 py-3 text-white placeholder-gray-400 focus:outline-none border-none rounded-xl"
            disabled={loading}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-4">
            <div className="flex gap-2">
              
              <button
                onClick={handlerSend}
                className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full text-xl transition"
                disabled={loading || !inputValue.trim()}
              >
                <FaArrowAltCircleUp />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prompt;
