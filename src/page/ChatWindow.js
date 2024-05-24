import React from "react";
import Chat from "../components/Chat";
// import ChatMedia from "../components/ChatMedia";
import Groups from "../components/Groups";
import SideBar from "../components/SideBar";
import { useChatStore } from "../lib/chatStore";
import { useGroupData } from "../lib/groupData";

function ChatWindow() {
  const { chatId } = useChatStore();
  const { groupId } = useGroupData();

  return (
    <div>
      <div className="flex h-screen antialiased text-gray-800">
        <div className="flex flex-row h-full w-full overflow-hidden">
          <SideBar />
          {chatId && <Chat />}
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
