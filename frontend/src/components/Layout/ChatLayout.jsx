import { useState, useEffect } from "react";
import { authInst, protectInst } from "../axiosConfig/Instances";
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { NewConvoDialog } from "../NewConvoDialog";
import { useTheme } from "../ThemeContext";

export const ChatLayout = () => {
    const [conversations, setconversations] = useState([]);
    const [dialogOpen, setdialogOpen] = useState(false);
    const [err, seterr] = useState(null);
    const { theme, toggleTheme } = useTheme();

    const navigate = useNavigate();
    const { conversationId } = useParams();

    const getConvos = async () => {
        try {
            const response = await protectInst.get("/conversations");
            const convos = response.data;
            setconversations(() => convos);   
        }
        catch (error) {
            seterr(() => error.response?.data);
        }
    }
    
    useEffect(() => {
        getConvos();
    }, []);

    const handleLogout = async () => {
        await authInst.post("/logout", {});

        // hard browser reset - I found this is the best way after 2 hrs of meddling with react router :(
        window.location.href = "/login";
    }

    let sidebarDivContent;
    if (err) {
        sidebarDivContent = (
            <div className="flex items-center justify-center p-6">
                <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg text-sm font-medium border border-red-100 dark:border-red-800">
                    Error displaying chats
                </p>
            </div>
        );
    }
    else if (!conversations.length) {
        sidebarDivContent = (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4 shadow-inner dark:shadow-none">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No previous chats</p>
            </div>
        );
    }
    else {
        sidebarDivContent = conversations.map(conversation => {
            return (
                <li key={conversation.id}>
                    <button type="button" className="w-full text-left px-5 py-4 hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 focus:outline-none border-b border-gray-100 dark:border-gray-800 group"
                    onClick={() => navigate(`/chats/${conversation.id}`)}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 transition-colors border border-indigo-100 dark:border-indigo-800 shadow-sm">
                                {conversation.otherUser.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-800 dark:text-gray-200 truncate text-base">
                                    {conversation.otherUser.name}
                                </div>
                            </div>
                        </div>
                    </button>
                </li>
            );
        });
    }

    return (
        <div>
            <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
                <div className={`w-80 md:w-96 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/80 backdrop-blur-sm h-full flex-shrink-0 shadow-sm dark:shadow-none z-10 ${conversationId ? 'mobile-hide' : 'mobile-full'}`}>
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md flex justify-between items-center gap-2">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mr-auto">Messages</h2>
                        
                        <button onClick={toggleTheme} className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-shrink-0" title="Toggle theme">
                            {theme === 'Dark' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>

                        <button 
                            onClick={() => setdialogOpen(p => !p)}
                            className="flex items-center justify-center w-10 h-10 flex-shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95"
                            aria-label="Start new conversation"
                            title="New Chat"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                            </svg>
                        </button>
                    </div>
                    <ul className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {sidebarDivContent}
                    </ul>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-auto">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 border border-red-100 dark:border-red-800 shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Log Out
                        </button>
                    </div>
                </div>
                
                <div className={`flex-1 h-full bg-white dark:bg-gray-950 relative shadow-inner dark:shadow-none overflow-hidden ${conversationId ? '' : 'mobile-hide'}`}>
                    <Outlet />
                </div>
            </div>

            <NewConvoDialog isOpen={dialogOpen} onFinish={() => setdialogOpen(s => !s)} 
            onNewConvoId={(id) => {
                getConvos();
                navigate(`/chats/${id}`);
            }}/>
        </div>
    )
}