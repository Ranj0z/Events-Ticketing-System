import { Express } from "express";
import { uploadImageController } from "./upload.controller";
import { uploadImage } from "./upload.middleware";
import { allRoleAuth } from "../../middleware/tokensAuth";

/**
 * uploads routes
 *
 *   POST /uploads/image  – multipart/form-data, field "image", optional
 *                           body field "folder" (profile|venue|event)
 *                           → { url } to save into image_url/Vimage_url/Eimage_url
 */
const UploadRoutes = (app: Express) => {
  app.route("/uploads/image").post(
    allRoleAuth,
    uploadImage,
    async (req, res, next) => {
      try {
        await uploadImageController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );
};

export default UploadRoutes;
