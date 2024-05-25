import React, { useState, useEffect } from "react";
import Chat from "../components/Chat";
import SideBar from "../components/SideBar";
import { useChatStore } from "../lib/chatStore";
import { useGroupData } from "../lib/groupData";
import Groups from "../components/Groups";

function ChatWindow() {
  const [showChat, setShowChat] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { chatId } = useChatStore();
  const { groupId } = useGroupData();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpenChat = () => {
    setShowChat(true);
  };

  const handleBackToSidebar = () => {
    setShowChat(false);
  };

  const handleBackButtonClick = () => {
    setShowChat(false);
  };

  const isMobile = windowWidth <= 550;
  const isMediumScreen = windowWidth > 550 && windowWidth <= 1150;

  return (
    <div className="flex h-screen antialiased text-gray-800">
      <div className="flex flex-row h-full w-full overflow-hidden">
        {/* Sidebar */}
        {(!isMobile || !showChat) && (
          <div className={`w-full ${isMediumScreen ? "md:w-2/5" : "md:w-1/5"}`}>
            <SideBar onChatClick={handleOpenChat} />
          </div>
        )}
        {/* Chat Window */}
        {(!isMobile || showChat) && (
          <div className={`w-full ${isMediumScreen ? "md:w-3/5" : "md:w-4/5"}`}>
            {chatId && <Chat openChatMedia={handleBackToSidebar} />}
            {groupId && <Groups />}
            {!chatId && !groupId && (
              <>
                <div className="flex items-center justify-center h-full font-bold text-2xl ">
                  <div className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10 mx-3">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      ></path>
                    </svg>
                  </div>
                  Let's Chat
                </div>
              </>
            )}
            {/* Render back button if on mobile and showChat is true */}
            {isMobile && showChat && (
              <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="h-10 fixed -top-1 -left-3 px-4 py-2 rounded-md"
              onClick={handleBackButtonClick}
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          //   <button
          //   className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white px-4 py-2 rounded-md"
          //   onClick={handleBackButtonClick}
          // >
          //   Back to Sidebar
          // </button>
          
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatWindow;
