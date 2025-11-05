import { NextFunction, Request, Response } from "express";
import userService from "../services/user.service";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const registerUser = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const {name, email, password, role} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await userService.createUser({name, email, password: hashedPassword, role});
        res.status(201).json({message: "User registered successfully", user: createdUser});
    } catch (error) {
        next(error)
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const {email, password} = req.body;
        const user = await userService.getUserByEmail(email);
        if(!user) throw new Error("User not found");
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Invalid Credentials");
        const token = jwt.sign({userId: user._id}, 'secret-key', {expiresIn: '1d'});
        res.status(200).json({message:"Login success", user, token})
    } catch (error) {
        next(error)
    }
}