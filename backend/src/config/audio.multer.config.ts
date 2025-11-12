import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024
    },
    fileFilter(req, file, callback) {
        if (file.mimetype.startsWith('audio/')) {
            callback(null, true)
        }
        else callback(new Error('Only audio files are allowed'))
    },
})