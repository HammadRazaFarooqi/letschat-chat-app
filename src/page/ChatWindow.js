import React, { useState } from "react";
import Chat from "../components/Chat";
// import ChatMedia from "../components/ChatMedia";
import SideBar from "../components/SideBar";
import { useChatStore } from "../lib/chatStore";
import { useGroupData } from "../lib/groupData";
import Groups from "../components/Groups";

function ChatWindow() {
  const [showChat, setShowChat] = useState(true);
  const [chatDisplay,setChatDisplay] = useState(false);
  const [groupDisplay,setGroupDisplay] = useState(false);
  const { chatId } = useChatStore();
  const { groupId } = useGroupData();


  const toggleComponents = () => {
    setShowChat(!showChat);
  };

  const handleOpenChatMedia = () => {
    setShowChat(false);
  };

  return (
    <div>
    <div className="flex h-screen antialiased text-gray-800">
      <div className="flex flex-row h-full w-full overflow-hidden">
        <SideBar />
        {chatId && <Chat openChatMedia={handleOpenChatMedia} />}
        {groupId && <Groups />}
        {/* {!chatId && !groupId && (
          <div className="flex font-bold text-2xl">Let's Chat</div>
        )} */}
      </div>
    </div>
  </div>
  );
}

export default ChatWindow;
