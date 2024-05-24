import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import "./index.css";
import ChatWindow from "./page/ChatWindow";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import Avatar from "./components/avatar.png";
import { collection, doc, getDoc, getDocs, onSnapshot } from "firebase/firestore";
// import { useNavigate } from 'react-router-dom';

function App() {
  // const navigate = useNavigate();
  // const { currentUser } = useUserData();
  const [lastMessage, setLastMessage] = useState();
  const { currentUser, fetchUserInfo } = useUserStore();
  const [details, setDetails] = useState(false);
  const [groupDetails, setGroupDetails] = useState(false);
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);
  useEffect(() => {
    if (currentUser) {
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications");
        return;
      }
      
      const permission = Notification.permission;
      if (permission !== "granted") {
        Notification.requestPermission();
      }

      if (permission === "granted") {
        const fetchChats = async () => {
          const chatArray = [];
          const querySnapshot = await getDocs(collection(db, "chats"));
          querySnapshot.forEach((doc) => {
            const chatData = doc.data();
            const newChatId = doc.id;
            chatData.chatId = newChatId;
            chatArray.push(chatData);
          });

          chatArray.forEach(async (chat) => {
            const newChatId = chat.chatId;
            const lastMsg = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : "";
            setLastMessage(lastMsg);
            const senderId = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].senderId : "";
          
            if (senderId) {
              // Ensure senderId is defined before proceeding
              const userChatsDoc = await getDoc(doc(db, "userchats", senderId));
              if (userChatsDoc.exists()) {
                const userChatsData = userChatsDoc.data();
                const chats = userChatsData.chats;
          
                const userDoc = await getDoc(doc(db, "users", senderId));
                if (userDoc.exists()) {
                  const usersData = userDoc.data();
                  
                  chats.forEach(async (userChat) => {
                    if (userChat.chatId === newChatId) {
                      if (senderId !== currentUser?.id) {
                        const chat = { user: usersData, ...userChat };
          
                        const checkDoc = await getDoc(doc(db, "userchats", userChat.receiverId));
                        if (checkDoc.exists()) {
                          const receiverChatsData = checkDoc.data();
                          const receiverChats = receiverChatsData.chats;
          
                          const receiverChat = receiverChats.find((receiverChat) => receiverChat.chatId === newChatId);
                          if (receiverChat) {
                            const isSeen = receiverChat.isSeen;          
                            if (userChat.ownUserId === currentUser?.id || userChat.receiverId === currentUser?.id) {
                              let displayedMessage = "";
                              if (isSeen === false && displayedMessage !== lastMsg) {
                                displayedMessage = lastMsg;
                                const tag = `${newChatId}-${lastMsg}`;
                                new Notification(
                                  `New Message from ${chat.user.username || "Unknown"}`,
                                  {
                                    body: lastMsg || "New Message",
                                    icon: chat.user?.avatar || Avatar,
                                    tag: tag,
                                  }
                                );
                              }
                            }
                          }
                        }
                      }
                    }
                  });
                }
              }
            }
          });
        };

        fetchChats();

        // Subscribe to new messages
        const unsubscribe = onSnapshot(collection(db, "chats"), () => {
          fetchChats();
        });

        return () => {
          unsubscribe();
        };
      }
    }
  }, [lastMessage, currentUser]);
  

  return (
    <div className="App">
      {/* <MyContext.Provider value={{ text, setText }}> */}
      <Router>
        <Routes>
          {/* {currentUser? */}
           <Route path="/Chat" element={<ChatWindow />} />
          {/* : */}
          <Route path="/" element={<Login />} />
          {/* } */}
          <Route path="/SignUp" element={<SignUp />} />
        </Routes>
      </Router>
      {/* </MyContext.Provider> */}

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
