import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, "..", "..", "uploads");

function makeStorage(subfolder: "posts" | "avatars" | "stories" | "messages") {
  const dest = path.join(uploadsRoot, subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });
}

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = /jpeg|jpg|png|webp|mp4|mov|webm/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = /image|video/.test(file.mimetype);
  if (extOk && mimeOk) cb(null, true);
  else cb(new Error("Faqat rasm (jpg, png, webp) yoki video (mp4, mov, webm) fayllarga ruxsat berilgan"));
};

export const uploadPostMedia = multer({
  storage: makeStorage("posts"),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export const uploadAvatar = multer({
  storage: makeStorage("avatars"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadStoryMedia = multer({
  storage: makeStorage("stories"),
  fileFilter,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
});

export const uploadMessageMedia = multer({
  storage: makeStorage("messages"),
  fileFilter,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
});
