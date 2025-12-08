import multer from "multer";

export const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("application/pdf")) {
      return cb(null, false);
    }
    cb(null, true);
  },
});
