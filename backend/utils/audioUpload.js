import multer from "multer";
import path from "path";
import fs from "fs";

const tempDir = "temp/audio/";
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, tempDir),
    filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname) || ".webm"}`)
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) cb(null, true);
    else cb(new Error("Only audio files are allowed"), false);
};

const audioUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 }//25 MB
});

export default audioUpload;