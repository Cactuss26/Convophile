import { prisma } from "../lib/prisma.js";

export const getUsers = async (req, res, next) => {
    try {
        const userId = req.user.userId;
    
        if (!userId) {
            return res.status(400).send("Provide a userId to proceed");
        }
    
        const usersInfo = await prisma.user.findMany({
            select: { 
                id: true,
                name: true,
                email: true
            },
            where: { NOT: { id: userId }}
        });
    
        if (!usersInfo.length) {
            return res.status(404).send("No users to contact");
        }
    
        return res.json(usersInfo);
    }
    catch (err) {
        return res.status(500).send({ error: "Internal Server Error", details: err.message});
    }
}