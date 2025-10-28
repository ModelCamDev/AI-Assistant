import { NextFunction, Request, Response } from "express";

export const uploadController = (req: Request, res: Response, next: NextFunction) =>{
    try {
        const files = req.files;
        // TODO: Implement RAG
        res.status(201).json({
            message: 'Files uploaded successfully',
            files: (Array.isArray(files) ? files : []).map((file: Express.Multer.File) => file.originalname)
        });
    } catch (error: any) {
        next(error);
    }
}