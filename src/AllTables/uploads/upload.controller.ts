import { Request, Response } from "express";
import { uploadImageService } from "./upload.service";

const VALID_FOLDERS = ["profile", "venue", "event"] as const;

export const uploadImageController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const folder = VALID_FOLDERS.includes(req.body.folder)
      ? req.body.folder
      : "profile";

    const { url, public_id } = await uploadImageService(req.file.buffer, folder);

    return res.status(201).json({ message: "Image uploaded!!", url, public_id });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};