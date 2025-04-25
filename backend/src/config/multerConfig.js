import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the uploads directory path
const uploadDir = path.join(process.cwd(), 'uploads');

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Use absolute path
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(16).slice(2)}${path.extname(file.originalname)}`;
        cb(null, uniqueName); // Generate a unique filename
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed'));
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export default upload;
