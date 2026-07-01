import { prisma } from "../lib/prisma.js";
import { io, userMap } from '../server.js';

export const getMessages = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const convId = Number(req.params.conversationId);

        if (isNaN(convId)) { 
            return res.status(400).send("Conversation id should be a positive integer");
        }

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: convId,
                OR: [ { user1Id: userId }, { user2Id: userId }]
            },
            include: {
                user1: {
                    select: { id: true, name: true, email: true}
                },
                user2: {
                    select: { id: true, name: true, email: true}
                },
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!conversation) {
            return res.status(404).send("Conversation not found");
        }

        const otherUser = conversation.user1Id === userId? conversation.user2 : conversation.user1;

        return res.json({
            otherUser,
            messages: conversation.messages
        });
    }
    catch(err) {
        return res.status(500).send({ error: "Internal Server Error", details: err.message });
    }
}

export const sendMessage = async (req, res, next) => {
    try {
        const currentUser = req.user.userId;
        const conversationId = Number(req.body.conversationId);
        const text = req.body.text;
    
        if (isNaN(conversationId) || !text) {
            return res.status(400).send("Conversation Id and text should be valid");
        }
    
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { user1Id: currentUser },
                    { user2Id: currentUser },
                ]
            }
        });
    
        if (!conversation) {
            return res.status(404).send("Conversation not found!");
        }
    
        const [ newMessage, updatedConvo ] = await prisma.$transaction([
            prisma.message.create({
                data: {
                    text: text,
                    senderId: currentUser,
                    conversationId: conversationId
                }
            }),
            
            prisma.conversation.update({
                where: {
                    id: conversationId
                },
                data: {
                    lastMessageAt: new Date()
                }
            })
        ]);
        
        const receiverId = conversation.user1Id === currentUser? conversation.user2Id : conversation.user1Id;
        const receiverSocketId = userMap.get(receiverId);

        // exists if online (connected to io)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.json(newMessage);
    }
    catch (err) {
        return res.status(500).send({ error: "Internal Server Error", details: err.message });
    }
}