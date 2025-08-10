import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./Pages/Home";
import Auth from "./Pages/Auth";
import "./App.css";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear React state
    setUser(null);

    // Delete ALL localStorage data
    localStorage.clear();

    // Delete ALL cookies
    document.cookie.split(";").forEach(cookie => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });

    // Redirect to auth page
    navigate("/auth");
  };


  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">Agent Mira</Link>
      <div className="nav-links">
        {user ? (
          <>
            <span className="nav-user">Hello, {user.name || user.email}</span>
            <button onClick={handleLogout} className="nav-logout-btn">
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="nav-login-btn">Login / Signup</Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Persist user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route
          path="/"
          element={<Home user={user} setUser={setUser} />}
        />
        <Route
          path="/auth"
          element={!user ? <Auth setUser={setUser} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
