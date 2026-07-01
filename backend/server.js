import express from 'express';
import authRouter from './routes/auth.route.js';
import chatRouter from './routes/chat.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const app = express();

const ALLOWED_ORIGINS = [
    process.env.FRONTEND_URL
];

app.use(cookieParser());
app.use(express.json());

app.use(cors({
    origin: (origin, callback) => {
        // non browser requests (mobile, postman, cross-server)
        if (!origin) return callback(null, true)

        if (ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Request denied by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-type', 'Authorization'],
}));


app.use("/api/auth", authRouter);
app.use("/api", chatRouter);

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        credentials: true,
        methods: ["GET", "POST"]
    }
});

export const userMap = new Map();

// get userid of user for authentication
io.use((socket, next) => {
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) {
        return next(new Error("Authentication failed - No cookies"));
    }
    const tokenItem = cookieHeader.split(";  ").find(key => key.startsWith("authorization="));
    const token = tokenItem ? tokenItem.split("=")[1] : null;

    if (!token) return next(new Error("Authentication failed - No Token"));

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) next(new Error("Authentication failed - Invalid token"));

        socket.userId = user.userId;
        next();
    });
});


io.on("connection", (socket) => {
    console.log(`New socket connection: ${socket.id}`);
    userMap.set(socket.userId, socket.id);

    // online users
    io.emit("getOnlineUsers", Array.from(userMap.keys()));

    socket.on("typing", ({ receiverId, conversationId }) => {
        const receiverSocket = userMap.get(receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit("userTyping", { conversationId });
        }
    });

    socket.on("stopTyping", ({ receiverId, conversationId}) => {
        const receiverSocket = userMap.get(receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit("userStopTyping", { conversationId });
        }
    });

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);

        for (let [user, socketId] of userMap.entries()) {
            if (socketId === socket.id) {
                userMap.delete(user);
                break;
            }
        }

        io.emit("getOnlineUsers", Array.from(userMap.keys()));
    });
});


const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, (err) => {
    if (err) throw err;

    console.log(`Server running on PORT ${PORT}`);
})