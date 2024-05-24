import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useState } from "react";
import { db } from "../lib/firebase";
import { useUserStore } from "../lib/userStore";
import Avatar from "./avatar.png";


function AddNewUser() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!username) {
      setError("Please enter a username");
      return;
    }

    try {
      const useRef = collection(db, "users");
      const q = query(useRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
        setError(null);
      } else {
        setUser(null);
        setError("No user found with that username");
      }
    } catch (error) {
      setError("Error searching for user");
    }
  };
  
  const handleAdd = async () => {
    if (!user || !currentUser) {
      setError("User not found or not logged in");
      return;
    }
    try {
      const chatRef = collection(db, 'chats');
      const newChatRef = doc(chatRef); 
      
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
      
      const userChatsRef = doc(db, 'userchats', user?.id); 
      const currentUserChatsRef = doc(db, 'userchats', currentUser?.id); 
      
      await updateDoc(userChatsRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          ownUserId: user.id,
          updatedAt: Date.now()
        })
      });
      
      await updateDoc(currentUserChatsRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          ownUserId: currentUser.id,
          updatedAt: Date.now()
        })
      });
      setUser(null);
      setUsername('')
    } catch (err) {
    }
  }
  
  return (
    <div>
      <div className="flex flex-col items-center bg-gray-100 border mt-5 pb-4 rounded-lg">
        <span className="mt-2 text-lg font-semibold text-gray-600">
          Find New Friends
        </span>
        <form onSubmit={handleSearch} className="w-full px-4">
          <div className="flex justify-center mt-5">
            <input
              type="text"
              className="w-full py-1 border rounded-md focus:outline-none focus:border-indigo-300 pl-4"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button className="bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-2 flex-shrink-0 ml-2">
              Search
            </button>
          </div>
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
        </form>
        {user && (
          <div className="flex justify-between items-center bg-white border mt-4 rounded-lg p-4 w-full">
            <div className="h-8 w-8 rounded-full border overflow-hidden">
                      <img
                        src={user?.avatar || Avatar}
                        alt="Avatar"
                        className="h-8 w-8"
                      />
                    </div>
            <div className="text-sm font-semibold">{user.username}</div>
            {/* <div className="text-xs text-gray-500">{user.email}</div> */}
            <button
              onClick={handleAdd}
              className="bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-2 flex-shrink-0 ml-2"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddNewUser;
