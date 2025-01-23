import React, { useEffect, useState } from "react";
import logo from "../../Assets/logo.png";
import "./sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../Feature/Userslice";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        sidebarOpen &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".open-btn")
      ) {
        closeSidebar();
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [sidebarOpen]);
  const logoutFunction = () => {
    signOut(auth);
    navigate("/");
  };
  const user = useSelector(selectUser);
  return (
    <>
      <div className="App2 -mt-2 overflow-hidden">
        <Link to="/">
          <img src={logo} alt="" id="nav2-img" />{" "}
        </Link>
        <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <span className="cursor-pointer close-btn" onClick={closeSidebar}>
            &times;
          </span>
          {user ? (
            <>
              <div className="profile">
                <Link to={"/profile"}>
                  <img
                    className="rounded-full justify-center"
                    src={user.photo}
                    alt=""
                    srcset=""
                  />
                </Link>
                <p className=" text-center">
                  Profile name{" "}
                  <span className="font-bold text-blue-500">{user?.name}</span>
                </p>
              </div>
            </>
          ) : (
            <div className="auth"></div>
          )}
          <Link to="/internship">internships </Link>
          <Link to="/Jobs">Jobs </Link>

          <Link to={"/"} className="small">
            contact Us
          </Link>
          <button
          onClick={() => navigate("/subscription")}
          className="inline-flex items-center h-10 px-1 bg-gradient-to-r from-yellow-500 to-yellow-800 text-white font-medium mx-5 rounded-xl hover:from-yellow-600 hover:to-yellow-900
 transition-all duration-200 shadow-md hover:shadow-lg my-8"
        >
          <span>Premium</span>
          <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
          <hr />
          {user ? (
            <>
              <div className="addmore">
                {user ? (
                  <Link to={"/userapplication"}>
                    <p>My Applications</p>
                  </Link>
                ) : (
                  <Link to={"/register"}>
                    <p>My Applications</p>
                  </Link>
                )}

                <Link>
                  <p>View Resume</p>
                </Link>
                <Link>
                  <p>More</p>
                </Link>
                <button className="bt-log" id="bt" onClick={logoutFunction}>
                  Logout <i class="bi bi-box-arrow-right"></i>
                </button>
                <br />
                <br />
                <button onClick={logoutFunction}>
                  Log Out <i class="bi bi-box-arrow-right"></i>
                </button>
              </div>
            </>
          ) : (
            <div className="addmore">
              <p>Register- As a Student</p>
              <p>Register- As a Employer</p>
              <br />
              <br />
            </div>
          )}
        </div>

        <div className="main">
          <span
            style={{ fontSize: "22px" }}
            className="open-btn"
            onClick={openSidebar}
          >
            &#9776;
          </span>
        </div>

        <div className="search2">
          <i class="bi bi-search"></i>
          <input type="search" placeholder="Search" />
        </div>

        {user ? (
          <></>
        ) : (
          <>
            <div className="reg">
              <Link to="/register">
                {" "}
                <button className="btn4">Register</button>
              </Link>
            </div>
            <div className="admin">
              <Link to={"/adminLog"}>
                <button id="admin"> Admin Login</button>
              </Link>
            </div>
          </>
        )}
        

        <p className="text-red-300">Hire Talent</p>
      </div>
    </>
  );
}

export default Sidebar;
