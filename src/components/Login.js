import { signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../lib/firebase";

function Login() {
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response)
      toast.success("User Login Successfully")
      navigate('/Chat');

    } catch (error) {
      toast.error(error.messsage);
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
                for=""
                className="block mt-3 text-xl text-gray-700 text-center font-semibold"
              >
                Login
              </label>
              
              <form method="#" action="#" className="mt-10" onSubmit={handleLogin}>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    className="ps-3 mt-1 block w-full border-none bg-gray-100 h-11 rounded-xl shadow-lg hover:bg-blue-100 focus:bg-blue-100 focus:ring-0"
                  />
                </div>

                <div className="mt-7">
                  <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    className="ps-3 mt-1 block w-full border-none bg-gray-100 h-11 rounded-xl shadow-lg hover:bg-blue-100 focus:bg-blue-100 focus:ring-0"
                  />
                </div>

                

                {/* <Link to="/chat"> */}
                <button
                  
                  className="text-center mt-5 bg-blue-500 w-full py-3 rounded-xl text-white shadow-xl hover:shadow-inner focus:outline-none transition duration-500 ease-in-out  transform hover:-translate-x hover:scale-105"
                >
                  Login
                </button>
                {/* </Link> */}

                

                <div className="mt-7">
                  <div className="flex justify-center items-center">
                    <label className="mr-2">You are new?</label>

                    <Link to="/SignUp" className="underline">
                      Create an account
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

export default Login;
