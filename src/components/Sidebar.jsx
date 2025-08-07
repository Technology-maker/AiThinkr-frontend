import React, { useEffect, useState } from 'react';
import { RxCross2 } from "react-icons/rx";
import { IoIosLogOut } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import Profile_logo from '/profile_logo.png';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ setPrompt }) => {
  const [, setAuthUse] = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [promptHistory, setPromptHistory] = useState([]);

  // ✅ Load user and prompt history once
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const storedPrompt = localStorage.getItem(`promptHistory_${parsedUser._id}`);
      if (storedPrompt) {
        setPromptHistory(JSON.parse(storedPrompt));
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const { data } = await axios.get("https://ai-thinkr.vercel.app/api/v1/user/logout", {
        withCredentials: true
      });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      alert(data.message);
      setAuthUse(null);
      navigate("/login");
    } catch (error) {
      alert(error?.response?.data?.error || "Logout Failed!");
    }
  };

  const handleHistoryClick = (promptItem) => {
    if (setPrompt) {
      setPrompt([promptItem]); // or setPrompt(promptItem.fullHistory)
    }
  };

  const handleNewChat = () => {
    if (setPrompt) {
      setPrompt([]);
    }
  };

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <RxCross2 size={24} /> : <GiHamburgerMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-40 h-full bg-gray-900 text-white shadow-lg transform transition-transform duration-300 w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}>
        <div className="flex flex-col h-full w-64">
          
          {/* Header */}
          <div className="flex items-center justify-center px-6 py-4 border-b border-gray-800">
            <div className="text-xl font-bold tracking-wide text-center">AiThinkr</div>
          </div>

          {/* History Section */}
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            <button
              onClick={handleNewChat} 
              className="w-full mb-4 py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition"
            >
              + New Chat
            </button>

            {promptHistory.length > 0 ? (
              <div className="space-y-2">
                {promptHistory.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    className="cursor-pointer p-2 bg-gray-800 hover:bg-gray-700 rounded text-sm"
                  >
                    {item.content?.slice(0, 40)}...
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm text-center mt-8">
                No chat History Yet
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-800">
            <div className="flex items-center mb-4">
              <img
                className="w-12 h-12 rounded-full border object-cover"
                src={Profile_logo}
                alt="profile img"
              />
              <span className="ml-3 font-medium truncate">
                {user?.firstname || "My Profile"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full py-2 px-3 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-semibold transition"
            >
              <IoIosLogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
