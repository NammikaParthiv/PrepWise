/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import axios from "../utils/axios.js";  

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("/api/user/profile");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (error) {
        console.log(error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const syncAuthFromStorage = () => {
      if (!localStorage.getItem("token")) {
        localStorage.removeItem("user");
        setUser(null);
      }
    };

    window.addEventListener("pageshow", syncAuthFromStorage);
    window.addEventListener("storage", syncAuthFromStorage);
    return () => {
      window.removeEventListener("pageshow", syncAuthFromStorage);
      window.removeEventListener("storage", syncAuthFromStorage);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {/* !loading -> wait until authentication is complete before rendering */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
