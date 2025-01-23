// AuthContext.js
import React, { createContext, useState, useEffect } from "react";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Check for token on app load and set the user
  useEffect(() => {
    if (token) {
      // Here, you can optionally decode the token and fetch user details if needed.
      // For now, we'll assume the token itself is enough to authenticate the user.
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    }
  }, [token]);

  // Login function to store the token and user data
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  // Logout function to remove token and user data
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
