import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { toast } from "react-toastify";
import { doc, setDoc } from "firebase/firestore";
import upload from "../lib/upload";
import Avatar from "./avatar.png"

function SignUp() {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
    });
    const handleAvatar = (e) => {
    if (e.target.files[0]) {
    setAvatar({
    file: e.target.files[0],
    url: URL.createObjectURL(e.target.files[0]),
    });
    }
    };
  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const imgUrl=await upload(avatar.file)
      await setDoc(doc(db, "users", response.user.uid), {
        username,
        email,
        avatar:imgUrl,
        id: response.user.uid,
      });
      await setDoc(doc(db, "userchats", response.user.uid), {
        chats: [],
      });
      await setDoc(doc(db, "usergroups", response.user.uid), {
        groups: [],
      });
      navigate("/");
      toast.success("User Registered Succesfully ");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div className="font-sans">
        <div className="relative min-h-screen flex flex-col sm:justify-center items-center bg-gray-100 ">
          <div className="relative sm:max-w-sm w-full">
            <div className="card bg-gray-200 shadow-lg  w-full h-full rounded-3xl absolute  transform -rotate-6"></div>
            <div className="card bg-indigo-300 shadow-lg  w-full h-full rounded-3xl absolute  transform rotate-6"></div>
            <div className="relative w-full rounded-3xl  px-6 py-4 bg-gray-100 shadow-md">
              <label
                htmlFor=""
                className="block mt-3 text-xl text-gray-700 text-center font-semibold"
              >
                SignUp
              </label>
              <form
                method="#"
                action="#"
                className="mt-10"
                onSubmit={handleRegister}
              >
                <div className="flex items-center space-x-2 ms-16 my-8">
                  <label
                    htmlFor="file"
                    className="cursor-pointer flex items-center space-x-2"
                  >
                    <img className="h-20 w-20" src={avatar.url||Avatar} alt=""/>
                    <span className="text-gray-700 underline underline-offset-1 ...">Choose Profile Photo</span>
                  </label>
                  <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Username"
                    name="username"
                    className="ps-3 mt-1 block w-full border-none bg-gray-100 h-11 rounded-xl shadow-lg hover:bg-blue-100 focus:bg-blue-100 focus:ring-0"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    className="ps-3 mt-5 block w-full border-none bg-gray-100 h-11 rounded-xl shadow-lg hover:bg-blue-100 focus:bg-blue-100 focus:ring-0"
                  />
                </div>

                <div className="mt-5">
                  <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    className="ps-3 mt-1 block w-full border-none bg-gray-100 h-11 rounded-xl shadow-lg hover:bg-blue-100 focus:bg-blue-100 focus:ring-0"
                  />
                </div>

                <div className="mt-5">
                  <button className="text-center bg-blue-500 w-full py-3 rounded-xl text-white shadow-xl hover:shadow-inner focus:outline-none transition duration-500 ease-in-out  transform hover:-translate-x hover:scale-105">
                    SignUp
                  </button>
                </div>

                <div className="mt-7">
                  <div className="flex justify-center items-center">
                    <label className="mr-2">Already have an account?</label>

                    <Link to="/" className="underline">
                      Login
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
