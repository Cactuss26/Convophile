import { matchedData, validationResult } from "express-validator";
import { prisma } from "../lib/prisma.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const userSignup = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array()[0].msg);
    }

    const { username, email, password } = matchedData(req);

    // Email should be unique
    const similarUsers = await prisma.user.findUnique({
        where: { email: email},
    });

    if (similarUsers) {
        return res.status(400).send("Email already in use");
    }

    // hashing password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Storing into DB
    const user = await prisma.user.create({
        data: {
            name: username,
            email: email,
            password: hash,
        },
    });

    // JWT Token - async
    jwt.sign({userId: user.id}, process.env.JWT_SECRET, { expiresIn: "15m" }, (err, token) => {
        if (err) {
            return res.status(500).send("Error generating token");
        }

        res.cookie("authorization", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24   
        });

        res.json({ userId: user.id, name: user.name, email: user.email });
    });
}

export const userLogin = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array()[0].msg);
    }

    const { email, password } = matchedData(req);

    const user = await prisma.user.findUnique({
        where: { email: email }
    });

    if (!user) {
        return res.status(404).send("Email not registered");
    }

    const cmpresult = await bcrypt.compare(password, user.password);

    if (!cmpresult) {
        return res.status(401).send("Invalid Email or Password");
    }

    // login successful
    jwt.sign({userId: user.id}, process.env.JWT_SECRET, { expiresIn: "15m" }, (err, token) => {
        if (err) {
            return res.status(500).send("Error Generating token");
        }

        res.cookie("authorization", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 24  
        });

        res.json({ userId: user.id, name: user.name, email: user.email });
    });
}

export const validateUser = async (req, res, next) => {
    const token = req.cookies.authorization;

    if (!token) {
        return res.status(401).send("Please login/signup to access this page.");
    }

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET)
        
        const user = await prisma.user.findUnique({
            where: {id: data.userId}
        });
        
        return res.json({
            userId: user.id,
            name: user.name,
            email: user.email,
        });
        
    }
    catch (err) {
        return res.status(403).send("Your session expired! Please login again.");
    }
}

export const logoutUser = async (req, res, next) => {
    return res.clearCookie("authorization").send("Logged out successfully");
}