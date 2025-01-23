import React, { useContext, useState } from "react";
import logo from "../../Assets/logo.png";
import { Link } from "react-router-dom";
import "./navbar.css";
import Sidebar from "./Sidebar";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../../firebase/firebase";
import { useSelector } from "react-redux";
import { selectUser } from "../../Feature/Userslice";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordForm } from "../ForgotPassword/ForgotPasswordForm";
import { UserContext } from "../../UserProvider";
import { toast } from "react-toastify"; //react-hot-toast
import { useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

function Navbar() {
  const { user, token, logout, login } = useContext(UserContext);
  const navigate = useNavigate();
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const isLoginRoute = useLocation().pathname === "/login";

  // const user = useSelector(selectUser);  go back
  const [isDivVisibleForintern, setDivVisibleForintern] = useState(false);
  const [isDivVisibleForJob, setDivVisibleFroJob] = useState(false);
  // const [isDivVisibleForlogin, setDivVisibleFrologin] = useState(false);
  const [isDivVisibleForProfile, setDivVisibleProfile] = useState(false);
  const [isStudent, setStudent] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // const manualLogout = () => {
  //   logout(); // Calls the logout function from UserContext
  // };
  const handleManualSignUp = async (event) => {
    event.preventDefault(); // Prevent default form submission
    console.log("Form submitted");
    try {
      // Basic validation
      if (!email || !password || !fname || !lname) {
        toast.error("Please fill in all fields");
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      setLoading(true);

      // Send registration data to the backend
      const response = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          fname,
          lname,
        }),
      });

      if (!response.ok) {
        throw new Error("User already Exists");
      }

      const data = await response.json();
      toast.success("Account created successfully!");
      login(data.token, { email, fname, lname });
      // setUser(data.user); // Set the user state
      // // alert("Account created successfully!");
      // // Save the JWT token in localStorage
      // localStorage.setItem("token", data.token);
      navigate("/");
    } catch (error) {
      console.error("Error during sign up:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (firebaseToken) => {
    try {
      // Early return if no token is provided
      if (!firebaseToken) {
        toast.error("Something went wrong! Please try again.");
        return;
      }

      // Call the API to check if the user is existing or new
      const response = await fetch("https://intern-area-backned.onrender.com/api/google-signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseToken,
        }),
      });

      // Log the response status and data for debugging purposes
      console.log("Response Status:", response.status);

      const data = await response.json();
      console.log("Response Data:", data);

      // Check if the response is OK (status code 200-299)
      if (response.ok) {
        localStorage.setItem("userId", data.userId);
        // Use the login method from context to set the token and user data
        login(data.token, {
          email: data.email,
          fname: data.fname,
          lname: data.lname,
        });
        closeLogin();
        navigate("/subscription"); // Redirect to home page
      } else {
        // Handle non-OK responses and show an error message
        const errorMessage = data.message || `Error: ${response.statusText}`;
        console.error("Login failed:", errorMessage);
        toast.error(errorMessage, {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error in handleGoogleSignIn:", error);

      toast.error("Something went wrong. Please try again later.");
    }
  };

  const handleManualLogin = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      // alert("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const response = await fetch("https://intern-area-backned.onrender.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Use the login method from context to set the token and user data
        login(data.token, {
          email: data.email,
          fname: data.fname,
          lname: data.lname,
        });
        closeLogin();
        navigate("/subscription"); // Redirect to home page
      } else {
        toast.error(data.message || "Login failed", {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const loginFunction = async () => {
    try {
      // Sign in with Google
      const res = await signInWithPopup(auth, provider);
      const user = res.user; // Extract user from response
      console.log("Firebase user:", user);
      if (user) {
        // Retrieve the Firebase ID Token
        const firebaseToken = await user.getIdToken();
        console.log("Firebase Token:", firebaseToken); // Log the token to debug
        // Get the Firebase ID token from the result

        // Now call your backend API with the Firebase token
        await handleGoogleSignIn(firebaseToken); // Passing the token to the backend function
        // setDivVisibleFrologin(false); // Hide the login form or any UI change
      }
    } catch (err) {
      // Log any error that occurs during sign-in
      console.error("Firebase login error:", err);
      toast.error("Login failed, please try again.");
    }
  };

  const closeRegister = () => {
    // You may want to add functionality to show the registration form again, if needed
    // setDivVisibleFrologin(true);
  };

  const showLogin = () => {
    // setDivVisibleFrologin(true);
  };
  const closeLogin = () => {
    // navigate("/");
    // setDivVisibleFrologin(false);
  };

  const closeLoginNavigateHome = () => {
    navigate("/");
    closeLogin();
  };
  const setTrueForStudent = () => {
    setStudent(false);
  };
  const setFalseForStudent = () => {
    setStudent(true);
  };
  //  for showing profile dropdown
  const showtheProfile = () => {
    setDivVisibleProfile(true);
    document.getElementById("ico3").className = "bi bi-caret-up-fill";
  };
  const hidetheProfile = () => {
    document.getElementById("ico3").className = "bi bi-caret-down-fill";
    setDivVisibleProfile(false);
  };

  const showInternShips = () => {
    document.getElementById("ico").className = "bi bi-caret-up-fill";
    setDivVisibleForintern(true);
  };
  const hideInternShips = () => {
    document.getElementById("ico").className = "bi bi-caret-down-fill";
    setDivVisibleForintern(false);
  };
  const showJobs = () => {
    document.getElementById("ico2").className = "bi bi-caret-up-fill";
    setDivVisibleFroJob(true);
  };
  const hideJobs = () => {
    document.getElementById("ico2").className = "bi bi-caret-down-fill";
    setDivVisibleFroJob(false);
  };

  const logoutFunction = () => {
    signOut(auth);
    navigate("/");
  };

  return (
    <div>
      <nav className="nav1">
        <ul>
          {/* Logo */}
          <div className="img">
            <Link to="/">
              <img src={logo} alt="Logo" />
            </Link>
          </div>

          {/* Internships and Jobs Navigation */}
          <div className="elem ">
            <Link to="/Internship">
              <p id="int" onMouseEnter={showInternShips}>
                Internships{" "}
                <i
                  id="ico"
                  className="bi bi-caret-down-fill"
                  onClick={hideInternShips}
                ></i>
              </p>
            </Link>
            <Link to="/Jobs">
              <p onMouseEnter={showJobs}>
                Jobs{" "}
                <i
                  id="ico2"
                  className="bi bi-caret-down-fill"
                  onClick={hideJobs}
                ></i>
              </p>
            </Link>
            <button
              onClick={() => navigate("/subscription")}
              className="inline-flex items-center h-10 px-1 bg-gradient-to-r from-yellow-500 to-yellow-800 text-white font-medium mx-5 rounded-xl hover:from-yellow-600 hover:to-yellow-900
 transition-all duration-200 shadow-md hover:shadow-lg my-8"
            >
              <span>Premium</span>
              <svg
                className="w-4 h-4 ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="search">
            <i className="bi bi-search"></i>
            <input type="text" placeholder="Search" />
          </div>

          {/* User Profile or Auth Buttons */}
          {user ? (
            <>
              <div className="Profile ml-20">
                <Link to="/profile">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt="Profile"
                      className="rounded-full w-12 h-12"
                      id="picpro"
                      onMouseEnter={showtheProfile}
                    />
                  ) : (
                    <div
                      className="flex justify-center items-center rounded-full bg-gray-300 w-12 h-12"
                      id="picpro"
                      onMouseEnter={showtheProfile}
                    >
                      <FaUserCircle className="text-gray-500 text-3xl" />
                    </div>
                  )}

                  <i
                    id="ico3"
                    className="bi bi-caret-up-fill"
                    onClick={hidetheProfile}
                  ></i>
                </Link>
              </div>
              <button className=" bt-log" id="bt" onClick={logout}>
                Logout <i className="bi bi-box-arrow-right"></i>
              </button>
            </>
          ) : (
            <>
              <div className="auth">
                <button
                  className="btn1"
                  onClick={() => {
                    closeRegister();
                    navigate("/login");
                  }}
                >
                  <span className="px-2">Login</span>
                </button>
                <button className="btn2" onClick={closeLogin}>
                  <Link to="/register">Register </Link>
                </button>
              </div>
              <div className="flex mt-7 hire">Hire Talent</div>
              <div className="admin">
                <Link to="/adminLogin">
                  <button>Admin</button>
                </Link>
              </div>
            </>
          )}
        </ul>
      </nav>

      {isDivVisibleForintern && (
        <div className="profile-dropdown-2">
          <div className="left-section">
            <p>Top Locations</p>
            <p>Profile</p>
            <p>Top Category</p>
            <p>Explore More Internships</p>
          </div>
          <div className="line flex bg-slate-400"></div>
          <div className="right-section">
            <p>Intern at India</p>
            <p>Intern at India</p>
            <p>Intern at India</p>
            <p>Intern at India</p>
            <p>Intern at India</p>
          </div>
        </div>
      )}
      {isDivVisibleForJob && (
        <div className="profile-dropdown-1">
          <div className="left-section">
            <p>Top Locations</p>
            <p>Profile</p>
            <p>Top Category</p>
            <p>Explore More Internships</p>
          </div>
          <div className="line flex bg-slate-400"></div>
          <div className="right-section">
            <p>Intern at India</p>
            <p>Intern at India</p>
            <p>Intern at India</p>
            <p>Intern at India</p>
            <p>Intern at India</p>
          </div>
        </div>
      )}
      <div className="relative">
        {/* Background overlay and blur effect */}
        {isLoginRoute && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-10"
            onClick={closeLoginNavigateHome}
          />
        )}

        {/* Login Form Popup */}
        {isLoginRoute && (
          <div className="fixed inset-0 z-20 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-xl w-full">
              <button
                id="cross"
                onClick={closeLoginNavigateHome}
                className="absolute top-4 right-4 text-2xl text-gray-600"
              >
                <i className="bi bi-x"></i>
              </button>

              {/* Type select: Student or Employee */}
              <h5 id="state" className="mb-4 text-center">
                <span
                  id="Sign-in"
                  // style={{ cursor: "pointer" }}
                  className={`auth-tab ${isStudent ? "active" : ""}`}
                  onClick={setFalseForStudent}
                >
                  Student /  Employee andT&P
                </span>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                {/* <span
                  id="join-in"
                  style={{ cursor: "pointer" }}
                  className={`auth-tab ${!isStudent ? "active" : ""}`}
                  onClick={setTrueForStudent}
                >
                  Employee andT&P
                </span> */}
              </h5>

              {/* Form for Student */}
              {isStudent ? (
                <div className="py-6">
                  <div className="flex flex-col bg-white rounded-lg justify-center mx-auto max-w-sm lg:max-w-4xl">
                    <div className="w-full p-8 lg:w-6/7">
                      <p
                        onClick={loginFunction}
                        className="flex items-center h-15 justify-center mt-4 text-white bg-slate-100 rounded-lg hover:bg-gray-100"
                      >
                        <div className="px-4 py-3">
                          <svg class="h-8 w-8" viewBox="0 0 40 40">
                            <path
                              d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                              fill="#FFC107"
                            />
                            <path
                              d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z"
                              fill="#FF3D00"
                            />
                            <path
                              d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z"
                              fill="#4CAF50"
                            />
                            <path
                              d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                              fill="#1976D2"
                            />
                          </svg>
                        </div>
                        <h4 className="text-gray-500 text-2xl cursor-pointer ">
                          Login With Google
                        </h4>
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="border-b- w-1/5 lg:w-1/4"></span>
                        <p className="text-gray-500 text-sm font-bold mb-2">
                          or
                        </p>
                        <span className="border-b- w-1/5 lg:w-1/4"></span>
                      </div>
                      <form onSubmit={handleManualLogin}>
                        <div className="mt-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Email
                          </label>
                          <input
                            className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={() => navigate("/forgot-password")}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <input
                            className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full"
                            placeholder="Must be at least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        <div className="mt-8">
                          <button
                            type="submit"
                            className="bg-blue-500 h-9 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600"
                          >
                            Login
                          </button>
                        </div>
                      </form>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm">
                          new to internarea? Register(
                          <span
                            className="text-blue-500 cursor-pointer"
                            onClick={() => navigate("/register")}
                          >
                            Student
                          </span>
                          /
                          <span
                            className="text-blue-500 cursor-pointer"
                            onClick={() => navigate("/register")}
                          >
                            company
                          </span>
                          )
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // <div>hello</div>
                /* Form for Employee and T&P */
                <div className="flex bg-white rounded-lg justify-center overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                  <div className="w-full p-8 lg:w-6/7">
                    <form /* onSubmit={handleManualLogin} */>
                      <div className="mt-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Email
                        </label>
                        <input
                          className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between">
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <input
                          className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full"
                          placeholder="Must be at least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="mt-8">
                        <button
                          type="submit"
                          className="bg-blue-500 h-9 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600"
                        >
                          Login
                        </button>
                      </div>
                    </form>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm">
                        new to internarea? Register(
                        <span
                          className="text-blue-500 cursor-pointer"
                          onClick={() => navigate("/register")}
                        >
                          Student
                        </span>
                        /
                        <span
                          className="text-blue-500 cursor-pointer"
                          onClick={() => navigate("/register")}
                        >
                          company
                        </span>
                        )
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Sidebar />
    </div>
  );
}

export default Navbar;
