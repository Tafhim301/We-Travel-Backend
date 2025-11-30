import multer from "multer";

export const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max, adjust as needed
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("application/pdf")) {
      return cb(null, false);
    }
    cb(null, true);
  },
});
