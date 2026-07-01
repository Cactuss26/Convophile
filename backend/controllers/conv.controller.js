import { prisma } from "../lib/prisma.js";

export const getConversations = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        
        // get conversations where either user1 OR user2 is the current user
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [{ user1Id: userId }, { user2Id: userId}]
            },
            include: {
                user1: {
                    select: { id: true, name: true, email: true}
                },
                user2: {
                    select: { id: true, name: true, email: true}
                }
            },
            orderBy: {
                lastMessageAt: 'desc'
            }
        });

        // remove current user info (bcoz its redundant)
        const convData = conversations.map(conversation => {
            const otherUser = conversation.user1Id === userId? conversation.user2 : conversation.user1;

            return {
                id: conversation.id,
                otherUser: otherUser,
                lastMessageAt: conversation.lastMessageAt,
            };
        });

        return res.json(convData);
    }
    catch (err) {
        return res.status(500).send({ error: "Internal Server Error", details: err.message});
    }
}

export const openChatRequest = async (req, res, next) => {
    try {
        const currentUserId = req.user.userId;
        const otherUserId = Number(req.body.receiverId);
    
        if (isNaN(otherUserId)) {
            return res.status(400).send("Receiver ID must be a positive integer");
        }
    
        if (otherUserId === currentUserId) {
            return res.status(400).send("Cannot start a conversation with yourself");
        }
    
        const otherUser = await prisma.user.findUnique({
            where: {id: otherUserId}
        });

        if (!otherUser) {
            return res.status(400).send("Target User does not exist");
        }

        // single-direction search, userid1 always < userid2 so no duplicate convo are created
        const userId1 = Math.min(currentUserId, otherUserId);
        const userId2 = Math.max(currentUserId, otherUserId);
    
        let conversation = await prisma.conversation.findFirst({
            where: {
                user1Id: userId1,
                user2Id: userId2,
            }
        });
    
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    user1Id: userId1,
                    user2Id: userId2,
                }
            });
        }
    
        return res.json({ conversationId: conversation.id});
    }
    catch (err) {
        return res.status(500).send({ error: "Internal Server Error", details: err.message });
    }
}