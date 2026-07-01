import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authInst } from "../axiosConfig/Instances";
import { useLocation, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";

export const Login = () => {
    const location = useLocation();
    const redirectLoc = location.state?.from || "/chats";

    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const [err, seterr] = useState(location.state?.message || null);

    const navigate = useNavigate();
    
    const { isAuthenticated, setUser } = useAuth();

    if (isAuthenticated) {
        return <Navigate to={redirectLoc} replace />
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await authInst.post("/login", {
                email: email,
                password: password
            });

            const userId = response.data.userId;
            const name = response.data.name;

            const user = {
                userId: userId,
                name: name,
                email: email,
            };

            setUser(user);
            navigate(redirectLoc);
        }
        catch (error) {
            seterr(error.response?.data || "Error connecting to server, please try again later");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 space-y-6 border border-gray-100 dark:border-gray-800">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Please sign in to your account
                    </p>
                </div>

                {err && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded-md shadow-sm" role="alert">
                        <p className="text-sm">{err}</p>
                    </div>
                )}
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                required 
                                value={email}
                                onChange={(e) => {
                                    setemail(e.target.value)
                                    seterr(null);
                                }}
                                className="mt-1 appearance-none block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <input 
                                type="password" 
                                name="password" 
                                id="password" 
                                required 
                                value={password}
                                onChange={(e) => {
                                    setpassword(e.target.value)
                                    seterr(null);
                                }}
                                className="mt-1 appearance-none block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button 
                            type="submit"
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}