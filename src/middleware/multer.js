import multer from 'multer';
import path from 'path';
import fs from 'fs';

// To Ensure the uploads folder exists right when the middleware initializes
const dir = './uploads';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

// Storage settings
const storage = multer.diskStorage({
    destination: 'uploads', 
    filename: (req, file, cb) => {
        // To Create a unique name: timestamp + original extension
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Filter to only allow specific formats
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
        return cb(null, true);
    }
    cb(new Error("Error: File type not supported!"));
};

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export default upload;