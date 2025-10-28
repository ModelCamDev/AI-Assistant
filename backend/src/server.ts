import express, { NextFunction, Request, Response } from "express";
import cors from 'cors';
import chatRouter from './routes/chat.route';
import leadRouter from './routes/lead.route';
const app = express();
// Implement cors
app.use(cors());
app.use(express.json());

// Default request
app.get('/',(req: Request, res: Response)=>{
    res.send('Server is running just fine')
})

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/lead', leadRouter);

// 404 route handler middleware
app.use((req: Request, res: Response, next: NextFunction)=>{
    res.status(404).send("Route not found");
});

// Global error handler middleware
app.use((err:any, req: Request, res: Response, next: NextFunction)=>{
    console.log("Error caught in error hanf=dler middleware", err);
    
    return res.status(500).send("Something went wrong!")
})
export default app;