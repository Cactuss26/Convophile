import { useState, useEffect } from "react"
import { protectInst } from "./axiosConfig/Instances"

export const NewConvoDialog = ({ isOpen, onFinish, onNewConvoId }) => {
    const [users, setusers] = useState([]);
    const [loading, setloading] = useState(true);
    const [err, seterr] = useState(null);

    useEffect(() => {
        if (!isOpen) return;
        const fetchUsers = async () => {
            setloading(true);
            try {
                const response = await protectInst.get("/users");
                const receivedUsers = response.data;
                
                setusers(receivedUsers);
            }
            catch (error) {
                seterr(error);
            }
            finally {
                setloading(false);
            }
        }

        fetchUsers();
    }, [isOpen]);


    const handleSelection = async (id) => {
        try {
            const receiverId = id;
            
            const response = await protectInst.post("/conversations", {
                receiverId
            });

            onNewConvoId(response.data.conversationId);
            onFinish();
        }
        catch (error) {
            seterr(error);
        }
    }

    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl text-gray-600 dark:text-gray-300">
                    Fetching users...
                </div>
            </div>
        );
    }

    const divContent = users.map(user => {
        return (
            <li key={user.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                <button 
                    onClick={() => handleSelection(user.id)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-800 dark:text-gray-200 font-medium"
                >
                    {user.name}
                </button>
            </li>
        );
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onFinish}>
            <div 
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Start a Conversation</h2>
                    <button onClick={onFinish} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xl leading-none">
                        &times;
                    </button>
                </div>
                
                <div className="overflow-y-auto p-2">
                    {err && <div className="m-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">A server error occured</div>}
                    <ul className="flex flex-col">
                        {divContent}
                    </ul>
                </div>
            </div>
        </div>
    )
}