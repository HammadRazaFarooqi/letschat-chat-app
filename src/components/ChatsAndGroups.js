import React, { useState } from "react";
import AddNewUser from "./AddNewUser";
import { useUserStore } from "../lib/userStore";
import upload from "../lib/upload";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "react-toastify";
import Avatar from "./avatar.png";

function ChatsAndGroups() {
  const { currentUser } = useUserStore();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [createGroups, setCeateGroups] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [group, setGroup] = useState(null);
  const [avatar, setAvatar] = useState({
    groupImg: null,
    url: "",
  });

  const toggleAddUser = () => {
    setShowAddUser(!showAddUser);
    if (showGroups) setShowGroups(false);
    if (createGroups) setCeateGroups(false);
  };

  const toggleShowGroups = () => {
    setShowGroups(!showGroups);
    if (showAddUser) setShowAddUser(false);
    if (createGroups) setCeateGroups(false);
  };

  const toggleCreateGroup = () => {
    setCeateGroups(!createGroups);
    if (showAddUser) setShowAddUser(false);
    if (showGroups) setShowGroups(false);
  };

  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    // setCreateGroupLoading(true);
    const formData = new FormData(e.target);
    const groupName = formData.get("groupName");
    try {
      let groupImgUrl = "";
      if (avatar.groupImg) {
        groupImgUrl = await upload(avatar.groupImg);
      }
      const groupRef = collection(db, "groups");
      const newGroupRef = doc(groupRef);

      await setDoc(newGroupRef, {
        createdAt: serverTimestamp(),
        messages: [],
        groupId: newGroupRef.id,
        groupName: groupName,
        avatar: groupImgUrl,
        private: isPrivate,
        lastMessage: "",
        lastMessageSender: "",
        createdBy: currentUser.id,
        members: [currentUser.id],
        updatedAt: Date.now(),
      });

      const currentUserGroupsRef = doc(db, "usergroups", currentUser.id);

      await updateDoc(currentUserGroupsRef, {
        groups: arrayUnion({
          groupId: newGroupRef.id,
          groupName: groupName,
          avatar: groupImgUrl,
          private: isPrivate,
          lastMessage: "",
          lastMessageSender: "",
          createdBy: currentUser.id,
          members: [currentUser.id],
          updatedAt: Date.now(),
        }),
      });

      toast.success("Group created successfully");

      setAvatar({
        groupImg: null,
        url: "",
      });
      e.target.reset(); // Clear form input fields
      //   setCreateGroupLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Error creating group");
    }
  };

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        groupImg: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleJoinGroupSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchedGroupName = formData.get("searchedGroupName");

    try {
      const userGroupsRef = collection(db, "usergroups");
      const userDocs = await getDocs(userGroupsRef);
      const results = [];
      for (const userDoc of userDocs.docs) {
        const userGroupsData = userDoc.data();

        // Check if the groups array contains an object with the matching groupName
        const matchingGroups = userGroupsData.groups.filter(
          (group) => group.groupName === searchedGroupName
        );

        if (matchingGroups.length > 0) {
          results.push({
            matchingGroups: matchingGroups,
          });
        }
      }
      if (results.length === 0) {
        toast.error("Group not found");
        return;
      }
      setGroup(results[0].matchingGroups[0]);
    } catch (err) {
      console.log(err);
      toast.error("Error finding group");
    }
  };

  const handleJoinGroup = async () => {
    try {
      //   setJoinGroupLoading(true);
      if (group.members.includes(currentUser.id)) {
        toast.error("You are already a member of this group");
        // setJoinGroupLoading(false);
        return;
      }
      if (group.private) {
        toast.error("This is a private group, you can't join it");
        // setJoinGroupLoading(false);
        return;
      }

      const userGroupsRef = doc(db, "usergroups", currentUser.id);
      const groupRef = doc(db, "groups", group.groupId);

      await updateDoc(groupRef, {
        members: arrayUnion(currentUser.id),
      });

      await updateDoc(userGroupsRef, {
        groups: arrayUnion({
          groupId: group.groupId,
          groupName: group.groupName,
          avatar: group.avatar,
          private: group.private,
          lastMessage: "",
          lastMessageSender: "",
          createdBy: group.createdBy,
          members: [...group.members, currentUser.id],
          updatedAt: Date.now(),
        }),
      });

      for (const memberId of group.members) {
        const memberRef = doc(db, "usergroups", memberId);
        const memberSnap = await getDoc(memberRef);
        const memberData = memberSnap.data().groups || [];

        const groupIndex = memberData.findIndex(
          (g) => g.groupId === group.groupId
        );

        if (groupIndex !== -1) {
          const updatedGroups = [...memberData];
          updatedGroups[groupIndex] = {
            groupId: group.groupId,
            groupName: group.groupName,
            avatar: group.avatar,
            private: group.private,
            lastMessage: "",
            lastMessageSender: "",
            createdBy: group.createdBy,
            members: [...group.members, currentUser.id],
            updatedAt: Date.now(),
          };

          await updateDoc(memberRef, {
            groups: updatedGroups,
          });
        }
      }

      toast.success("Group joined successfully");
      //   setJoinGroupLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Error joining group");
    }
  };

  return (
    <div>
      <div className="flex justify-center items-center mt-5 bg-gray-100 rounded-md border-gray-100 shadow-md w-auto py-3">
        <div className="flex space-x-2 items-center justify-center">
          <button
            className="text-xs py-1 flex flex-row items-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-2 flex-shrink-0"
            onClick={toggleAddUser}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4 mx-1"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            Add
          </button>
          <button
            className="text-xs py-1  flex flex-row items-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-2 flex-shrink-0"
            onClick={toggleShowGroups}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4 mx-1"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
            Join
          </button>
          <button
            className="text-xs py-1  flex flex-row items-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-2 flex-shrink-0"
            onClick={toggleCreateGroup}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4 mx-1"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
            Create
          </button>
        </div>
      </div>
      {showAddUser && <AddNewUser />}
      {showGroups && (
        <div className="flex flex-col items-center bg-gray-100 border mt-5 pb-4 rounded-lg">
          <span className="mt-2 text-lg font-semibold text-gray-600">
            Find Groups
          </span>
          <form className="w-full px-4" onSubmit={handleJoinGroupSubmit}>
            <div className="flex justify-center mt-5">
              <input
                type="text"
                className="w-full py-1 border rounded-md focus:outline-none focus:border-indigo-300 pl-4"
                placeholder="Group Name"
                name="searchedGroupName"
              />
              <button className="bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-2 flex-shrink-0 ml-2">
                Search
              </button>
            </div>
          </form>
        </div>
      )}
      {group && (
        <div className="flex justify-between items-center bg-white border mt-4 rounded-lg p-4 w-full">
          <div className="h-8 w-8 rounded-full border overflow-hidden">
            <img
              src={group?.avatar || Avatar}
              alt="Avatar"
              className="h-8 w-8"
            />
          </div>
          <div className="text-sm font-semibold">{group.groupName}</div>
          {/* <div className="text-xs text-gray-500">{user.email}</div> */}
          <button
            onClick={handleJoinGroup}
            className="bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-2 flex-shrink-0 ml-2"
          >
            Join
          </button>
        </div>
      )}

      {createGroups && (
        <div className="flex flex-col items-center bg-gray-100 border mt-5 pb-6 rounded-lg shadow-lg">
          <span className="mt-4 text-lg font-semibold text-gray-700">
            Create a New Group
          </span>
          <form className="w-full px-8" onSubmit={handleCreateGroupSubmit}>
            <div className="flex flex-col items-center mt-6">
              <div className="uploadImg flex flex-col items-center">
                <img
                  className="mb-3 h-20 w-20 rounded-full object-cover"
                  src={avatar.url || Avatar}
                  alt="Group Avatar"
                />
                <label
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold py-1 px-4 rounded cursor-pointer"
                  htmlFor="groupImg"
                >
                  Choose Group Image
                </label>
                <input
                  type="file"
                  id="groupImg"
                  style={{ display: "none" }}
                  onChange={handleAvatar}
                  className="cursor-pointer"
                />
              </div>
              <div className="groupDetails mt-6 w-full ">
                <input
                  type="text"
                  className="w-full py-2 border rounded-md focus:outline-none focus:border-indigo-300 px-4 mb-4"
                  placeholder="Group Name"
                  name="groupName"
                />
                <span className="flex justify-center ">
                  <button
                    type="submit"
                    className=" flex justify-center w-20 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-1 rounded-md"
                  >
                    Create
                  </button>
                </span>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatsAndGroups;
