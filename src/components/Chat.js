import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { db } from "../lib/firebase";
import { useChatStore } from "../lib/chatStore";
import { useUserStore } from "../lib/userStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Avatar from "./avatar.png";
import upload from "../lib/upload";
function Chat() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileEdit, setProfileEdit] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  const navigate = useNavigate();

  const { chatId, user } = useChatStore();
  const { currentUser } = useUserStore();
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(currentUser?.username);
  const [newAvatar, setNewAvatar] = useState(currentUser?.avatar);
  const endRef = useRef(null);

  
  const handleLogout = () => {
    navigate("/");
    toast.success("Logout Successfully");
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    if (chatId) {
      console.log("chatId", chatId);
      const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
        setChat(res.data());
      });
      if (currentUser) {
        setNewAvatar(currentUser.avatar);
        setNewUsername(currentUser.username);
      }
      return () => {
        unSub();
      };
    }
  }, [chatId, currentUser]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (text === "") return;

    try {
      if (isEditing) {
        // Update the message
        const updatedMessages = chat.messages.map((message) =>
          message.id === editMessageId ? { ...message, text } : message
        );
        await updateDoc(doc(db, "chats", chatId), {
          messages: updatedMessages,
        });
        setIsEditing(false);
        setEditMessageId(null);
      } else {
        // Add a new message
        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion({
            id: new Date().getTime(), // Add a unique id to each message
            senderId: currentUser?.id,
            text,
            createdAt: new Date(),
          }),
        });
      }

      // Update userChats only after adding or editing a message
      const userIDs = [currentUser?.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );
          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser?.id;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });

      setText("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (message) => {
    setText(message.text);
    setIsEditing(true);
    setEditMessageId(message.id);
  };
  const handleDelete = async (message) => {
    try {
      const updatedMessages = chat.messages.map((msg) =>
        msg.id === message.id
          ? { ...msg, text: "This message was deleted" }
          : msg
      );
      await updateDoc(doc(db, "chats", chatId), {
        messages: updatedMessages,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditClick = () => {
    setEditing(true);
    setProfileEdit(true);
    setNewUsername(currentUser?.username);
  };

  const handleSaveClick = async () => {
    try {
      // Update user data in the database
      await updateDoc(doc(db, "users", currentUser?.id), {
        username: newUsername,
        avatar: newAvatar,
      });
      setEditing(false);
      setProfileEdit(false);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    try {
      const url = await upload(file);
      setNewAvatar(url);
    } catch (error) {
      console.error("Error uploading avatar image:", error);
    }
  };

  // const formatDateLabel = (date) => {
  //   const today = new Date();
  //   const messageDate = date.toDate();
  //   if (today.toDateString() === messageDate.toDateString()) {
  //     return "Today";
  //   } else if (today.getDate() - 1 === messageDate.getDate()) {
  //     return "Yesterday";
  //   } else {
  //     return messageDate.toLocaleDateString();
  //   }
  // };

  return (
    <div className="flex flex-col flex-auto h-full p-6">
      <div className="flex justify-between relative">
        <span>
          <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
            {user && (
              <div className="h-8 w-8 rounded-full border overflow-hidden">
                <img src={user?.avatar || Avatar} alt="" className="h-8 w-8" />
              </div>
            )}
            <div className="ml-2 text-sm font-semibold">
              {user ? user.username : ""}
            </div>
          </button>
        </span>
        <span className="relative">
          <button
            className="flex items-center justify-center hover:bg-gray-100 rounded-xl py-4 relative"
            onClick={() => setShowUserInfo(!showUserInfo)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="-mt-4 w-8 h-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </button>
          {showUserInfo && (
            <div className="absolute flex flex-col items-center bg-indigo-100 border border-gray-200 mt-2 w-56 py-6 px-4 rounded-lg -ml-48 z-40">{editing ? (
                <>
                  <div className="h-20 w-20 rounded-full border overflow-hidden">
                    <img
                      src={newAvatar || currentUser?.avatar || Avatar}
                      alt="Avatar"
                      className="h-full w-full"
                    />
                  </div>
                  <button className="flex items-center justify-center mt-2 text-black hover:text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="mt-2 ms-1 w-4 h-4 cursor-pointer"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 13.5v6.75A1.125 1.125 0 0 1 16.875 21H4.875A1.125 1.125 0 0 1 3.75 19.875V7.875A1.125 1.125 0 0 1 4.875 6.75H11.25"
                      />
                    </svg>
                    <input
                      type="file"
                      className="absolute opacity-0 cursor-pointer"
                      onChange={handleAvatarChange}
                    />
                  </button>
                  <div className="text-sm font-semibold mt-2">
                    <input
                      type="text"
                      value={profileEdit ? newUsername : currentUser?.username}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="text-xs px-2 py-1 rounded border"
                    />
                  </div>
                  <button
                    className="flex items-center justify-center mt-2 text-black hover:text-gray-600"
                    onClick={handleSaveClick}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="mt-2 me-1 w-4 h-4 cursor-pointer"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 13.5v6.75A1.125 1.125 0 0 1 16.875 21H4.875A1.125 1.125 0 0 1 3.75 19.875V7.875A1.125 1.125 0 0 1 4.875 6.75H11.25"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="h-20 w-20 rounded-full border overflow-hidden">
                    <img
                      src={newAvatar || currentUser?.avatar || Avatar}
                      alt="Avatar"
                      className="h-full w-full"
                    />
                  </div>
                  <div className="text-sm font-semibold mt-2">
                    {newUsername || currentUser?.username}
                  </div>
                  <div className="flex flex-row items-center mt-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="mt-2 ms-1 w-4 h-4 cursor-pointer"
                      onClick={handleEditClick}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 13.5v6.75A1.125 1.125 0 0 1 16.875 21H4.875A1.125 1.125 0 0 1 3.75 19.875V7.875A1.125 1.125 0 0 1 4.875 6.75H11.25"
                      />
                    </svg>
                  </div>
                </>
              )}
              {editing && (
                <button
                  className="flex items-center justify-center text-xs bg-green-500 hover:bg-green-600 rounded-xl text-white px-4 py-1 mt-3"
                  onClick={handleSaveClick}
                >
                  Save
                </button>
              )}
              <div className="flex flex-row items-center mt-3">
                <button
                  className="flex items-center justify-center text-xs bg-red-500 hover:bg-red-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </span>
      </div>

      {
      <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-5/6 p-4">
      <div className="flex flex-col h-full overflow-x-auto mb-4">
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-12 gap-y-2">
                {chat?.messages?.length ? (
                  chat.messages.map((message, index, messages) => {
                    // const currentDateLabel = formatDateLabel(message.createdAt);
                    // const previousMessage = messages[index - 1];
                    // const previousDateLabel = previousMessage
                    //   ? formatDateLabel(previousMessage.createdAt)
                    //   : null;
                    // const showDateLabel = currentDateLabel !== previousDateLabel;
                    return (
                      <>
                        <div
                          key={index}
                          className={`col-span-12 p-3 rounded-lg ${
                            message.senderId === currentUser?.id
                              ? "flex justify-end"
                              : "flex justify-start"
                          }`}
                        >
                          {/* {showDateLabel && (
                <div className="mr-80 -mt4">{currentDateLabel}</div>
              )} */}
                          {message.senderId === currentUser?.id &&
                            message.text !== "This message was deleted" && (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className=" mt-2 me-1 w-4 h-4 cursor-pointer"
                                  onClick={() => handleEdit(message)}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 13.5v6.75A1.125 1.125 0 0 1 16.875 21H4.875A1.125 1.125 0 0 1 3.75 19.875V7.875A1.125 1.125 0 0 1 4.875 6.75H11.25"
                                  />
                                </svg>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke-width="1.5"
                                  stroke="currentColor"
                                  className=" mt-2 me-1 w-4 h-4 cursor-pointer"
                                  onClick={() => handleDelete(message)}
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                  />
                                </svg>
                              </>
                            )}
                          <div>
                            <div
                              className={`relative  ${
                                message.senderId === currentUser?.id
                                  ? "bg-indigo-100"
                                  : "bg-white"
                              } py-2 px-4 shadow rounded-xl`}
                            >
                              <p className="text-sm ">{message.text}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-end">
                              {message.createdAt?.toDate().toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </>
                    );
                  })
                ) : (
                  <div className="flex justify-between items-center h-full text-gray-500 ml-96 mt-28">
                    <div className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10 mx-5">
                      <svg
                        className="w-10 h-10"
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
                    <div className="flex font-bold text-2xl">Let's Chat</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
            <div>
              <button className="flex items-center justify-center text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  ></path>
                </svg>
                <input
                  type="file"
                  className="absolute opacity-0 cursor-pointer"
                />
              </button>
            </div>
            <div className="flex-grow ml-4">
              <div className="relative w-full">
                <input
                  type="text"
                  className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                  placeholder="Message"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button
                  className="absolute flex items-center justify-center h-full right-0 top-0 text-gray-400 hover:text-gray-600"
                  onClick={() => setOpen((prev) => !prev)}
                >
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
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <EmojiPicker
                    className="mb-96 h-56"
                    open={open}
                    onEmojiClick={handleEmoji}
                  />
                </button>
              </div>
            </div>
            <div className="ml-4">
              <button
                onClick={handleSend}
                className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
              >
                <span>Send</span>
                <span className="ml-2">
                  <svg
                    className="w-4 h-4 transform rotate-45 -mt-px"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    ></path>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

export default Chat;
