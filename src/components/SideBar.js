import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useChatStore } from "../lib/chatStore";
import { db } from "../lib/firebase";
import { useGroupData } from "../lib/groupData";
import { useUserStore } from "../lib/userStore";
import ChatsAndGroups from "./ChatsAndGroups";
import Avatar from "./avatar.png";

function SideBar() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showChatsAndGroups, setShowChatsAndGroups] = useState(false);
  const [chats, setChats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Chats");

  const { currentUser } = useUserStore();
  const { changeChat, resetChat } = useChatStore();
  const { changeGroup, resetGroup } = useGroupData();
  const toggleAddUser = () => {
    setShowAddUser(!showAddUser);
  };

  const toggleChatsAndGroups = () => {
    setShowChatsAndGroups(!showChatsAndGroups);
  };

  useEffect(() => {
    if (currentUser?.id) {
      const unSubChats = onSnapshot(
        doc(db, "userchats", currentUser.id),
        async (res) => {
          if (res.exists()) {
            const items = res.data().chats || [];
            const promises = items.map(async (item) => {
              const userDocSnap = await getDoc(
                doc(db, "users", item.receiverId)
              );
              const user = userDocSnap.data();
              return { ...item, user };
            });
            const chatData = await Promise.all(promises);
            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
          }
        }
      );

      const unSubGroups = onSnapshot(
        doc(db, "usergroups", currentUser.id),
        (res) => {
          if (res.exists()) {
            const items = res.data().groups || [];
            setGroups(items.sort((a, b) => b.createdAt - a.createdAt));
          }
        }
      );

      return () => {
        unSubChats();
        unSubGroups();
      };
    }
  }, [currentUser?.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });
    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;
    const userChatsRef = doc(db, "userchats", currentUser?.id);

    try {
      await updateDoc(userChatsRef, { chats: userChats });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGroupSelect = async (group) => {
    resetChat();
    const userGroups = groups.map((item) => item);
    const groupIndex = userGroups.findIndex((g) => g.groupId === group.groupId);
    userGroups[groupIndex].isSeen = true;
    const userGroupsRef = doc(db, "usergroups", currentUser?.id);

    try {
      await updateDoc(userGroupsRef, { groups: userGroups });
      changeGroup(group.groupId, group.groupName, group.avatar);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.user?.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.groupName.toLowerCase().includes(search.toLowerCase())
  );

  function setSelectedTab(screenType) {
    setActiveTab(screenType);
    resetChat();
    resetGroup();
  }

  return (
    <div className="border-r-4">
      <div className="flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0 h-4/6">
        <div className="flex flex-row items-start justify-start h-12 w-full mb-18 -mt-4">
          <div className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10">
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
          <div className="ml-2 font-bold text-2xl ">Let's Chat</div>
        </div>

        {showChatsAndGroups && <ChatsAndGroups />}

        <div className="flex justify-between items-center mt-3 bg-gray-100 rounded-md border-1 shadow-md w-auto py-3">
          <input
            type="text"
            className="flex w-full border rounded-xl border-slate-950 focus:outline-none focus:border-indigo-300 pl-4 h-10 me-5"
            placeholder="Search ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="flex justify-between bg-gray-200 h-7 mt-2 mx-auto w-8 rounded-full hover:bg-gray-300 cursor-pointer"
            onClick={toggleChatsAndGroups}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>

        <div className="flex flex-col mb-10 h-96">
          <div className="flex justify-around items-center mt-3 bg-gray-100 rounded-md border-1 shadow-md w-auto py-3">
            <button
              className={`text-xs py-1  flex flex-row items-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-2 flex-shrink-0 ${
                activeTab === "Chats" ? "active" : ""
              }`}
              onClick={() => setSelectedTab("Chats")}
            >
              Chats
            </button>
            <button
              className={`text-xs py-1  flex flex-row items-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-2 flex-shrink-0 ${
                activeTab === "Groups" ? "active" : ""
              }`}
              onClick={() => setSelectedTab("Groups")}
            >
              Groups
            </button>
          </div>

          <div className="flex mt-2 flex-row items-center justify-between text-xs border-b-2 mb-1">
            <span className="font-bold">Active Conversations</span>
            <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">
              {chats.length}
            </span>
          </div>

          <div className="flex flex-col space-y-1 mt-4 h-screen overflow-y-auto bg-gray-100 rounded-md border-1 shadow-md w-auto py-3">
            {activeTab === "Chats" &&
              filteredChats.map(
                (chat) =>
                  chat.user && (
                    <div key={chat.chatId}>
                      <button
                        onClick={() => handleSelect(chat)}
                        className={`flex flex-row items-center rounded-xl p-2 w-full border-y-2 ${
                          chat.isSeen
                            ? "hover:bg-gray-100 bg-transparent text-inherit"
                            : "bg-indigo-700 text-white"
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full border overflow-hidden">
                          <img
                            src={chat.user?.avatar || Avatar}
                            alt="Avatar"
                            className="h-8 w-8"
                          />
                        </div>
                        <div className="ml-2 text-sm font-semibold">
                          {chat.user?.username}
                        </div>
                      </button>
                    </div>
                  )
              )}

            {activeTab === "Groups" &&
              filteredGroups.map((group) => (
                <div key={group.groupId}>
                  <button
                    onClick={() => handleGroupSelect(group)}
                    className={`flex flex-row items-center rounded-xl p-2 w-full ${
                      group.isSeen
                        ? "hover:bg-gray-100 bg-transparent text-inherit"
                        : "bg-indigo-700 text-white"
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full border overflow-hidden">
                      <img
                        src={group.avatar || Avatar}
                        alt="Avatar"
                        className="h-8 w-8"
                      />
                    </div>
                    <div className="ml-2 text-sm font-semibold">
                      {group.groupName}
                    </div>
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
