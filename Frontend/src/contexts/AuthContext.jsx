import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: "http://localhost:8000/api/v1/users", // Fixed baseURL
});

export const AuthProvider = ({ children }) => {
    const [userdata, setUserData] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (name, userName, password) => {
        try {
            const response = await client.post("/register", { 
                name,
                userName,
                password,
            });
            if (response.status === 201) {
                navigate("/login");console.log("Registering user:", { name, userName, password });console.log("Registering user:", { name, userName, password });console.log("Registering user:", { name, userName, password });console.log("Registering user:", { name, userName, password });console.log("Registering user:", { name, userName, password });console.log("Registering user:", { name, userName, password });console.log("Registering user:", { name, userName, password });console.log("Registering user:", { name, userName, password });console.log("Registering user:", { name, userName, password });
                return response.data.message || "Registration successful!";
            }
        } catch (err) {
            const message = err.response?.data?.message || "user already exists";
            throw new Error(message);
        }
    };

    const handleLogin = async (userName, password) => {
        try {
            const response = await client.post("/login", {
                userName,
                password,
            });
            if (response.status === 200) {
                localStorage.setItem("token", response.data.token);
                setUserData(response.data.user);
                navigate("/dashboard");
            }
        } catch (err) {
            const message = err.response?.data?.message || "Login failed";
            throw new Error(message);
        }
    };

    const data = { userdata, setUserData, handleRegister, handleLogin };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};
