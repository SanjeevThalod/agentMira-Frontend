import React, { useState } from "react";
import register from "../assets/register.svg";
import logo from "../assets/logo.svg";
import "./Styles/Auth.css";

const Auth = ({setUser}) => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // Form state
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ name: "", email: "", password: "" });

  // Handle change for inputs
  const handleChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === "signin") {
      setSignInData((prev) => ({ ...prev, [name]: value }));
    } else {
      setSignUpData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Simple email validation regex
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle sign in submit
  const handleSignIn = async (e) => {
    e.preventDefault();

    // Validation
    if (!signInData.email || !signInData.password) {
      alert("Please fill in both email and password.");
      return;
    }
    if (!isValidEmail(signInData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signInData.email.trim(),
          password: signInData.password
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Handle sign up submit
  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validation
    if (!signUpData.name || !signUpData.email || !signUpData.password) {
      alert("Please fill in all fields.");
      return;
    }
    if (!isValidEmail(signUpData.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (signUpData.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signUpData.name.trim(),
          email: signUpData.email.trim(),
          password: signUpData.password
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user); // Now automatically saved in localStorage
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };


  // Placeholder Google Sign In
  const handleGoogleAuth = () => {
    console.log("Google Auth will be implemented here");
    // Future: integrate react-oauth/google or Firebase
  };

  return (
    <div className={`container ${isSignUpMode ? "sign-up-mode" : ""}`}>
      <div className="forms-container">
        <div className="signin-signup">
          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="sign-in-form">
            <h2 className="title">Sign in</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={signInData.username}
                onChange={(e) => handleChange(e, "signin")}
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={signInData.password}
                onChange={(e) => handleChange(e, "signin")}
              />
            </div>
            <input type="submit" value="Login" className="btn solid" />

            <p className="social-text">Or Continue With Google</p>
            <div className="social-media">
              <button type="button" className="social-icon" onClick={handleGoogleAuth}>
                <i className="fab fa-google"></i>
              </button>
            </div>
          </form>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="sign-up-form">
            <h2 className="title">Sign up</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input
                type="text"
                name="Name"
                placeholder="Name"
                value={signUpData.username}
                onChange={(e) => handleChange(e, "signup")}
              />
            </div>
            <div className="input-field">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={signUpData.email}
                onChange={(e) => handleChange(e, "signup")}
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={signUpData.password}
                onChange={(e) => handleChange(e, "signup")}
              />
            </div>
            <input type="submit" className="btn" value="Sign up" />

            <p className="social-text">Or Continue With Google</p>
            <div className="social-media">
              <button type="button" className="social-icon" onClick={handleGoogleAuth}>
                <i className="fab fa-google"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Panels */}
      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>New here?</h3>
            <p>View your preferences and matched properties</p>
            <button className="btn transparent" onClick={() => setIsSignUpMode(true)}>
              Sign up
            </button>
          </div>
          <img src={logo} className="image" alt="Sign In" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>One of us?</h3>
            <p>Save your preferences and properties</p>
            <button className="btn transparent" onClick={() => setIsSignUpMode(false)}>
              Sign in
            </button>
          </div>
          <img src={register} className="image" alt="Sign Up" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
