import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { ForgotPasswordForm } from "../ForgotPassword/ForgotPasswordForm";
//***********phone */
import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import OtpInput from "otp-input-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast, Toaster } from "react-hot-toast";
//*******end phone */
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../../firebase/firebase";
import "./register.css";
import { UserContext } from "../../UserProvider";

function Register() {
  const [isStudent, setStudent] = useState(true);
  const [isDivVisible, setDivVisible] = useState(false);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { user, login, logout, token, showPopup } = useContext(UserContext);
  //**************phone number functions */
  const [ph, setPh] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  // const [user, setUser] = useState(null);

  // const closeRegister = (void) {
  //   navigate("/");
  // }

  useEffect(() => {
    // Cleanup function to clear reCAPTCHA on unmount
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    try {
      // Clear existing instance if it exists
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      // Create new reCAPTCHA verifier
      window.recaptchaVerifier = new RecaptchaVerifier(
        "sign-in-button", // This will be the ID of our button
        {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA verified");
          },
          "expired-callback": () => {
            toast.error("reCAPTCHA expired. Please try again.");
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = null;
            }
          },
        },
        auth
      );
    } catch (error) {
      console.error("Error setting up reCAPTCHA:", error);
      toast.error("Error setting up verification. Please reload the page.");
    }
  };

  const onSignup = async () => {
    if (!ph) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setLoading(true);
      setupRecaptcha();

      const formatPh = "+" + ph;
      const appVerifier = window.recaptchaVerifier;

      if (!appVerifier) {
        throw new Error("reCAPTCHA not initialized properly");
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formatPh,
        appVerifier
      );

      window.confirmationResult = confirmationResult;
      setShowOTP(true);
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Signup error:", error);

      if (error.code === "auth/invalid-phone-number") {
        toast.error(
          "Invalid phone number format. Please include country code."
        );
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else if (error.code === "auth/captcha-check-failed") {
        toast.error("Verification check failed. Please try again.");
      } else {
        toast.error(error.message || "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const onOTPVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      if (!window.confirmationResult) {
        throw new Error(
          "No verification session found. Please request a new OTP."
        );
      }

      const result = await window.confirmationResult.confirm(otp);
      // setUser(result.user); // hold for now
      toast.success("Phone number verified!");
    } catch (error) {
      console.error("OTP verification error:", error);
      if (error.code === "auth/invalid-verification-code") {
        toast.error("Incorrect OTP. Please try again.");
      } else if (error.code === "auth/code-expired") {
        toast.error("OTP has expired. Please request a new one.");
        setShowOTP(false);
      } else {
        toast.error("Failed to verify OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  //*******************end phone */
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
      const response = await fetch("https://intern-area-backned.onrender.com/api/register", {
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

  const handleManualLogin = async (event) => {
    event.preventDefault();
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

        navigate("/"); // Redirect to home page
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleSignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google Sign In Success:", result);
      toast.success("Login Success");
      navigate("/");
    } catch (err) {
      console.error("Google Sign In Error:", err);
      toast.error("Login Failed");
    }
  };

  // Set up reCAPTCHA verifier
  const setUpRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
          "expired-callback": () => {
            // Response expired
            toast.error("reCAPTCHA expired. Please try again.");
          },
        }
      );
    }
  };

  // Handle phone number sign in
  const handlePhoneSignIn = async (e) => {
    e.preventDefault();

    try {
      setUpRecaptcha();
      const formattedPhoneNumber = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      setShowOtpInput(true);
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Error during phone number sign in:", error);
      toast.error(error.message);
    }
  };

  // Verify OTP
  const verifyOTP = async (e) => {
    e.preventDefault();

    try {
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      console.log("User signed in:", user);
      toast.success("Successfully signed in!");
      navigate("/");
    } catch (error) {
      console.error("Error during OTP verification:", error);
      toast.error("Invalid OTP. Please try again.");
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google Sign In Success:", result.user);
      toast.success("Successfully signed in with Google!");
      navigate("/");
    } catch (error) {
      console.error("Error during Google Sign In:", error);
      toast.error(error.message);
    }
  };

  // Toggle between student and employee views
  const setTrueForStudent = () => setStudent(false);
  const setFalseForStudent = () => setStudent(true);

  // Toggle login modal
  const showLogin = () => setDivVisible(true);
  const closeLogin = () => setDivVisible(false);

  return (
    <div>
      <div className="form">
        <h1 className="text-2xl font-bold text-center mt-4">
          Sign-up and Apply For Free
        </h1>
        <p className="para3 text-lg font-medium text-center text-blue-700 mt-2">
          1,50,000+ companies hiring on Internshala
        </p>

        <div className="py-6">
          <div className="absolute  right-1/3">
            {" "}
            <Link to="/">
              <button id="cross">
                <i className="bi bi-x"></i>
              </button>
            </Link>
          </div>
          <div className="regi">
            <div className="flex bg-white rounded-lg justify-center shadow-2xl overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
              <div className="w-full p-8 lg:w-1/2">
                {/* Google Sign In Button */}

                <div>
                  <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center h-9 justify-center mt-4 text-white rounded-lg shadow-md hover:bg-gray-100 w-full"
                  >
                    <div className="px-4 py-3">
                      <svg class="h-6 w-6" viewBox="0 0 40 40">
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
                    <span className="px-4 py-3 w-5/6 text-center text-gray-600 font-bold">
                      Sign in with Google
                    </span>
                  </button>
                </div>

                {/* Phone Sign In Section */}
                <div>
                  <Toaster toastOptions={{ duration: 4000 }} />
                  {user ? (
                    <h2 className="text-center text-white font-medium text-2xl">
                      👍 Login Success
                    </h2>
                  ) : (
                    <div className="w-100 flex flex-col gap-4 rounded-lg mt-4">
                      {showOTP ? (
                        <>
                          <div className="bg-white text-emerald-500 w-fit mx-auto p-4 rounded-full">
                            <BsFillShieldLockFill size={30} />
                          </div>
                          <label
                            htmlFor="otp"
                            className="font-bold text-xl text-white text-center"
                          >
                            Enter your OTP
                          </label>
                          <OtpInput
                            value={otp}
                            onChange={setOtp}
                            OTPLength={6}
                            otpType="number"
                            disabled={false}
                            autoFocus
                            className="opt-container"
                          />
                          <button
                            onClick={onOTPVerify}
                            className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                          >
                            {loading && (
                              <CgSpinner
                                size={20}
                                className="mt-1 animate-spin"
                              />
                            )}
                            <span>Verify OTP</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <PhoneInput
                            className="mx-8 h-8"
                            country={"in"}
                            value={ph}
                            onChange={setPh}
                            inputProps={{
                              required: true,
                            }}
                          />
                          <button
                            id="sign-in-button"
                            onClick={onSignup}
                            className="bg-blue-400 w-full flex gap-1 items-center py-2  px-4 justify-center text-white rounded"
                          >
                            {loading && (
                              <CgSpinner
                                size={20}
                                className="mt-1 animate-spin"
                              />
                            )}
                            <span>Send code via SMS</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <form onSubmit={handleManualSignUp}>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="border-b w-1/5 lg:w-1/4"></span>
                    <span className="text-xs text-center text-gray-500 uppercase">
                      or
                    </span>
                    <span className="border-b w-1/5 lg:w-1/4"></span>
                  </div>
                  {/* Form Fields Section for sign up */}
                  <div className="mt-4">
                    <label
                      htmlFor="email"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                      placeholder="your@email.com"
                    />
                  </div>
                  {/* email */}
                  <div className="mt-4">
                    <label
                      htmlFor="password"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                      placeholder="Must be at least 6 characters"
                    />
                  </div>{" "}
                  {/* password */}
                  <div className="mt-4 flex justify-between">
                    <div className="w-1/2 mr-2">
                      <label
                        htmlFor="fname"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="fname"
                        value={fname}
                        onChange={(e) => setFname(e.target.value)}
                        className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                        placeholder="First Name"
                      />
                    </div>{" "}
                    {/* fname */}
                    <div className="w-1/2 ml-2">
                      <label
                        htmlFor="lname"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lname"
                        value={lname}
                        onChange={(e) => setLname(e.target.value)}
                        className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                        placeholder="Last Name"
                      />
                    </div>
                    {/* lname */}
                  </div>
                  {/* Form Validation Error Messages */}
                  <div className="mt-2">
                    {email && !/\S+@\S+\.\S+/.test(email) && (
                      <p className="text-red-500 text-xs">
                        Please enter a valid email address
                      </p>
                    )}
                    {password && password.length < 6 && (
                      <p className="text-red-500 text-xs">
                        Password must be at least 6 characters long
                      </p>
                    )}
                  </div>
                  {/* Terms and Conditions */}
                  <div className="mt-4">
                    <small className="text-gray-600">
                      By signing up, you agree to our{" "}
                      <span className="text-blue-400 cursor-pointer">
                        Terms and Conditions
                      </span>
                    </small>
                  </div>
                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    className="bg-blue-500 text-white font-bold py-2 mt-4 px-4 w-full rounded hover:bg-blue-600 disabled:opacity-50"
                    disabled={
                      !email ||
                      !password ||
                      password.length < 6 ||
                      !fname ||
                      !lname
                    }
                  >
                    {loading ? "Signing Up..." : "Sign Up"}
                  </button>
                </form>

                {/* Login Link */}
                <div className="mt-4 text-center">
                  <p className="text-gray-600">
                    Already registered?{" "}
                    <span
                      className="text-blue-400 cursor-pointer"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {isDivVisible && (
        <>
        <div className="py-6">
          <button id="cross" onClick={() => navigate("/login")}>
            <i className="bi bi-x"></i>
          </button>
          <h5 id="state" className="mb-4 justify-center text-center">
            <span
              id="Sign-in"
              style={{ cursor: "pointer" }}
              className={`auth-tab ${isStudent ? "active" : ""}`}
              onClick={setFalseForStudent}
            >
              Student
            </span>
            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
            <span
              id="join-in"
              style={{ cursor: "pointer" }}
              className={`auth-tab ${isStudent ? "active" : ""}`}
              onClick={setTrueForStudent}
            >
              Employee andT&P
            </span>
          </h5>
          {isStudent ? (
            <>
              <form onSubmit={handleManualLogin}>
                <div className="py-6">
                  <div className="flex bg-white rounded-lg justify-center shadow-2xl overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                    <div className="w-full p-8 lg:w-1/2">
                      <p
                        onClick={handleSignin}
                        className="flex
 items-center h-9 justify-center mt-4 text-white bg-slate-100 rounded-lg hover:bg-gray-100"
                      >
                        <div className="px-4 py-3">
                          <svg class="h-6 w-6" viewBox="0 0 40 40">
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
                        <h1 className="text-gray-500 ">Login With Google</h1>
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="border-b- w-1/5 lg:w-1/4"></span>
                        <p className="text-gray-500 text sm font-bold mb-2">
                          {" "}
                          or
                        </p>
                        <span className="border-b- w-1/5 lg:w-1/4"></span>
                      </div>
                      <div class="mt-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">
                          Email{" "}
                        </label>
                        <input
                          class=" text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div class="mt-4">
                        <div class="flex justify-between">
                          <label class="block text-gray-700 text-sm font-bold mb-2">
                            Password
                          </label>

                          <button
                            type="button"
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => navigate("/forgot-password")}
                          >
                            Forgot Password from registerrrrr for stud?
                          </button>
                        </div>
                        <input
                          class=" text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                          placeholder="Must be atleast 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="mt-8">
                        <button
                          type="submit"
                          className="btn3  bg-blue-500 h-9 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600 "
                        >
                          Login
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm">
                          new to internarea? Register(
                          <span
                            className="text-blue-500 cursor-pointer"
                            onClick={closeLogin}
                          >
                            Student
                          </span>
                          /
                          <span
                            className="text-blue-500 cursor-pointer"
                            onClick={closeLogin}
                          >
                            company
                          </span>
                          ){" "}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="flex bg-white rounded-lg justify-center overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                <div className="w-full p-8 lg:w-1/2">
                  <form onSubmit={handleManualLogin}>
                    <div class="mt-4">
                      <label class="block text-gray-700 text-sm font-bold mb-2">
                        Email{" "}
                      </label>
                      <input
                        class=" text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div class="mt-4">
                      <div class="flex justify-between">
                        <label class="block text-gray-700 text-sm font-bold mb-2">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(true);
                            navigate("/forgot-password");
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Forgot Password from registerfddd for emp?
                        </button>
                      </div>
                      <input
                        class=" text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                        placeholder="Must be atleast 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="mt-8">
                      <button
                        type="submit"
                        className="btn3  bg-blue-500 h-9 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600 "
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
                        onClick={closeLogin}
                      >
                        Student
                      </span>
                      /
                      <span
                        className="text-blue-500 cursor-pointer"
                        onClick={closeLogin}
                      >
                        company
                      </span>
                      ){" "}
                    </p>
                  </div>
                </div>
              </div>
              {showForgotPassword && (
                <ForgotPasswordForm
                  onClose={() => setShowForgotPassword(false)}
                />
              )}
            </>
          )}
          </div>
        </>
      )}
    </div>
  );
}

export default Register;
