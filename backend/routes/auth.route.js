import { Router } from "express";
import { check } from 'express-validator';
import { userSignup, userLogin, validateUser, logoutUser } from "../controllers/auth.controller.js";

const router = Router();

const validationsRegister = [
    check("username").notEmpty().withMessage("Please provide a name"),
    check("email").notEmpty().withMessage("Please provide an email")
    .trim()
    .isEmail().withMessage("Please provide a valid email"),
    check("password").notEmpty().withMessage("Please provide a password"),
]

const validationsLogin = [
    check("email").notEmpty().withMessage("Please provide an email")
    .trim()
    .isEmail().withMessage("Please provide a valid email"),
    check("password").notEmpty().withMessage("Please provide a password"),
]

router.post("/signup", validationsRegister, userSignup);
router.post("/login", validationsLogin, userLogin);
router.get("/validate", validateUser);
router.post("/logout", logoutUser);


export default router;