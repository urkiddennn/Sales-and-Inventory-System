import multer from 'multer';

// Configure where to store uploaded files (optional)
const storage = multer.memoryStorage(); // Store in memory (for Cloudinary)
// OR: Save to disk (if you want to store locally first)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });

// Configure allowed file types (optional)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

// Initialize multer
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
});

// Export middleware for single file upload (field name: 'image')
export const uploadSingle = upload.single('image');
