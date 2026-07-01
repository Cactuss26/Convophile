import { Route, Routes, Navigate } from "react-router-dom";
import { RouteProtect } from "./auth/RouteProtect";
import { Login } from "./auth/Login";
import { Register } from "./auth/Register";
import { ChatLayout } from "./Layout/ChatLayout";
import { ActiveChat } from "./ActiveChat";

export const routes = (
    <Routes >
        <Route path="/login" element={<Login />} /> 
        <Route path="/register" element={<Register />} />

        <Route path="/chats" element={
            <RouteProtect>
                <ChatLayout />
            </RouteProtect>
        }>

            <Route index element={
                <div className="flex h-full items-center justify-center text-gray-500 text-lg">
                    Select a chat to start messaging
                </div>
            } />

            <Route path=":conversationId" element={<ActiveChat />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
);