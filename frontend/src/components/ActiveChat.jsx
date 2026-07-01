import { useState, useEffect, useRef } from "react";
import { protectInst } from "./axiosConfig/Instances";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export const ActiveChat = () => {
    const [messages, setmessages] = useState([]);
    const [otherUser, setotherUser] = useState("");
    const [loading, setloading] = useState(true);
    const [msgLoading, setmsgLoading] = useState(false);
    const [text, settext] = useState("");
    const [err, seterr] = useState(null);
    const [msgErr, setmsgErr] = useState(null);
    const [isTyping, setisTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const msgEndDivRef = useRef(null);

    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user, socket, onlineUsers } = useAuth();

    const scrollToButton = () => {
        msgEndDivRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToButton();
    }, [messages]);

    useEffect(() => {
        const getMsg = async () => {
            try {
                setloading(true);
                const response = await protectInst.get(`/messages/${conversationId}`);
                const user2 = response.data.otherUser;
                const recMessages = response.data.messages;

                setotherUser(user2);
                setmessages(recMessages);
                seterr(null);
            }
            catch (error) {
                seterr(error);
            }
            finally {
                setloading(false);
            }
        }

        getMsg();
    }, [conversationId]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            if (newMessage.conversationId === Number(conversationId)) {
                setmessages((prev) => [...prev, newMessage]);
            }
        }

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        }
    }, [socket, conversationId]);

    useEffect(() => {
        if (!socket) return;

        socket.on("userTyping", (info) => {
            if (info.conversationId === Number(conversationId)) {
                setisTyping(true);
            }
        });

        socket.on("userStopTyping", (info) => {
            if (info.conversationId === Number(conversationId)) {
                setisTyping(false);
            }
        });

        return () => {
            socket.off("userTyping");
            socket.off("userStopTyping");
        }
    }, [socket, conversationId]);

    const handleType = async (e) => {
        setmsgErr(null);
        settext(e.target.value);

        socket.emit("typing", { 
            receiverId: otherUser.id,
            conversationId: Number(conversationId), 
        });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", {
                receiverId: otherUser.id,
                conversationId: Number(conversationId),
            });
        }, 2000);
    }

    const handleTextSubmit = async (e) => {
        try {
            e.preventDefault();
            setmsgLoading(true);
            const response = await protectInst.post("/messages", {
                conversationId,
                text,    
            });

            const newMessage = response.data;

            setmessages(() => [...messages, newMessage]);
            settext("");
            clearTimeout(typingTimeoutRef.current);
            socket.emit("stopTyping", {
                receiverId: otherUser.id,
                conversationId: Number(conversationId),
            });
        }
        // eslint-disable-next-line no-unused-vars
        catch (err) {
            setmsgErr("Message delivery failed, please refresh the page");
        }

        finally {
            setmsgLoading(false);
        }
    }

    const isOnline = onlineUsers.includes(otherUser.id);

    const msgDivContent = messages.map(message => {
        const isMe = message.senderId === user.userId;
        return (
            <li key={message.id} className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm text-sm ${
                    isMe 
                    ? 'bg-indigo-600 text-white rounded-br-none dark:bg-indigo-500' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
                }`}>
                    {message.text}
                </div>
            </li>
        );
    });

    if (err) {
        let errMsg = "Error getting messages";
        if (err.response?.status === 404) errMsg = "Conversation doesn't exist";
        else if (err.response?.status === 400) errMsg = "Invalid conversation ID";
        
        return (
            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-950">
                <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-6 py-3 rounded-lg font-medium border border-red-100 dark:border-red-800 shadow-sm">{errMsg}</p>
            </div>
        );
    }

    else if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-950 space-y-4">
                <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-900/50 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Fetching messages...</p>
            </div>
        );
    }

    else {
        return (
            <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 font-sans">
                <div className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4 z-10 flex-shrink-0">
                    <button 
                        onClick={() => navigate('/chats')} 
                        className="md:hidden p-2 -ml-2 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                        aria-label="Back to chats"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-100 dark:border-indigo-800 shadow-sm">
                        {otherUser.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{otherUser.name}</h2>
                        <div className="flex items-center gap-1.5 text-sm mt-0.5">
                            {isOnline ? (
                                <>
                                    <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                                    <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Offline</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    <ul className="flex flex-col">
                        {msgDivContent}
                    </ul>
                    {isTyping && (
                        <div className="flex w-full mb-4 justify-start">
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5 w-fit">
                                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}

                    <div ref={msgEndDivRef} />
                </div>

                
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] dark:shadow-none flex-shrink-0">
                    {msgErr && (
                        <div className="mb-3 text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-800 text-center">
                            {msgErr}
                        </div>
                    )}
                    <form onSubmit={handleTextSubmit} className="flex gap-3">
                        <input 
                            type="text" 
                            value={text} 
                            placeholder="Type your message..." 
                            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner dark:shadow-none disabled:opacity-50 text-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                            onChange={handleType} 
                            disabled={msgLoading}
                        />
                        <button 
                            type="submit" 
                            disabled={msgLoading}
                            className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-full px-8 py-3 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md dark:shadow-none"
                        >
                            {msgLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                "Send"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        )
    }
}