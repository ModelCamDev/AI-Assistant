import { NextFunction, Request, Response } from "express";
import { deleteBySource, indexDocument } from "../services/rag.service";

export const uploadAndIndexDocument = async (req: Request, res: Response, next: NextFunction) =>{
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }
        // TODO: Implement RAG
        const results = await Promise.all(files.map(async (file)=>{
            console.log('Indexing file:', file.filename);
            const result = await indexDocument(file.path);
            return {
                originalName: file.originalname,
                storedName: file.filename,
                ...result
            }
        }))
        res.status(201).json({
            message: 'Files uploaded successfully',
            files: results
        });
    } catch (error: any) {
        next(error);
    }
}

export const deleteIndexedDocument = async (req: Request, res: Response, next: NextFunction) =>{
    try {
        const { fileName } = req.params;
        if (!fileName) return res.status(400).json({ message: "File name is required." });
        const result = await deleteBySource(fileName);
        if (!result) return res.status(404).json({ message: "File not found." });
        res.status(200).json({
            message: 'File deleted successfully',
            fileName
        });
    } catch (error: any) {
        next(error);
    }
}
