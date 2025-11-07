import express, { NextFunction, Request, Response } from "express";
import cors from 'cors';
import chatRouter from './routes/chat.route';
import leadRouter from './routes/lead.route';
import uploadRouter from './routes/upload.route';
import session from 'express-session';

// Cron Job
import './cron/followupCron';
import userRouter from "./routes/user.route";
import cookieParser from "cookie-parser";

const app = express();
// Implement cors
app.use(cors({origin:'http://localhost:5173',credentials:true}));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Implement Session
app.use(
    session({
        secret: 'secret_key',
        resave: false,
        saveUninitialized: true,
        cookie:{
            httpOnly: true,
            secure: false
        }
    })
)

// Default request
app.get('/',(req: Request, res: Response)=>{
    res.send('Server is running just fine')
})

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/lead', leadRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/user', userRouter);

// 404 route handler middleware
app.use((req: Request, res: Response, next: NextFunction)=>{
    res.status(404).json({success: false ,message:"Route not found"});
});

// Global error handler middleware
app.use((err:any, req: Request, res: Response, next: NextFunction)=>{
    console.log("Error caught in error hanf=dler middleware", err);
    
    return res.status(500).json({ success: false, message: err.message || "Something went wrong" })
})
export default app;