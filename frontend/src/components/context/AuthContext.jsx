import { createContext, useContext, useEffect, useState } from "react";
import { authInst, protectInst } from "../axiosConfig/Instances";
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [loading, setloading] = useState(true);
    const [user, setuser] = useState(null);
    const [socket, setsocket] = useState(null);
    const [onlineUsers, setonlineUsers] = useState([]);
    const navigate = useNavigate();
    
    // callback function to updateAuthentication
    const setUser = (user) => {
        setuser(user);
    }

    // checkAuth on startup
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await authInst.get("/validate");
                const receivedUser = response.data;
                setuser(receivedUser);
            }
            catch(error) {
                console.log(error.message);
            }
            finally {
                setloading(false);
            }
        }

        const protectInterceptor = protectInst.interceptors.response.use(
            (response) => {
                return response;
            },

            (error) => {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    // no cookie (token) found, redirect to login
                    setuser(null);
                    navigate("/login");
                }
                return Promise.reject(error);
            }
        )

        checkAuth();

        return (() => {
            protectInst.interceptors.response.eject(protectInterceptor);
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // for sockets
    useEffect(() => {
        let newSocket;

        const connectSocket = async () => {
            if (user) {
                newSocket = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true });
    
                await newSocket.on("connect");
                setsocket(newSocket);

                newSocket.on("getOnlineUsers", (arr) => {
                    setonlineUsers(arr);
                });

                newSocket.on("connect_error", (err) => {
                    console.log("Server connection failed: ", err.message);
                    setsocket(null);
                    setuser(null);
                    navigate("/login");
                })
            }
            
            else {
                setsocket(null);
            }

            return () => {
                if (newSocket) newSocket.close();
                console.log("closed socket");
            }
        }

        connectSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const isAuthenticated = user? true : false;

    return (
        <AuthContext value={{
            user,
            isAuthenticated,
            loading,
            setUser,
            socket,
            onlineUsers,
        }}>
            {children}
        </AuthContext>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext);
}