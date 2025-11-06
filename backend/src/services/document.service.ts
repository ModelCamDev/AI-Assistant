import Document from './../models/document.model';
class DocumentService{
    async createDocument(userId: string, file: Express.Multer.File){
        try {
            const documentExists = await Document.findOne({originalName: file.originalname});
            if (documentExists) {
                throw new Error("File already Exists");
            }
            const document = new Document({userId, filename: file.filename, originalName: file.originalname, filePath: file.path, size: file.size, mimeType: file.mimetype});
            await document.save();
            return document
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error('Error while creating Document')
        }
    }
    async getAllDocuments(){
        try {
            const documents = await Document.find().sort({createdAt: -1});
            return documents;
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error('Error while fetching all Documents')
        }
    }
    async deleteDocumentByName(name: string){
        try {
            const document = await Document.deleteOne({filename: name});
            if (document) {
                return document;
            }
            throw new Error("Document not found");
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error('Error while deleteing a Document')
        }
    }
}

export default new DocumentService();