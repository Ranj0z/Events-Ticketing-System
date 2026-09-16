import { Request, Response } from "express";
import {
  addEventImageService,
  getEventImagesService,
  deleteEventImageService,
} from "./event-images.service";

// Add a carousel image to an event. Owner (Host) or Admin only — enforced in the
// route via requireOwnerOrAdmin. Client uploads via /uploads/image first and
// passes the resulting { url, public_id } here.
export const addEventImageController = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const { url, public_id } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ message: "url is required" });
    }
    if (!public_id || typeof public_id !== "string") {
      return res.status(400).json({ message: "public_id is required" });
    }

    const created = await addEventImageService(eventId, url, public_id);
    return res.status(201).json({ message: "Event image added", image: created });
  } catch (error: any) {
    if (error.message?.startsWith("Maximum of")) {
      return res.status(400).json({ message: error.message });
    }
    console.error("addEventImageController error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// All carousel images for an event, in display order. Public.
export const getEventImagesController = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const images = await getEventImagesService(eventId);
    return res.status(200).json({ data: images });
  } catch (error: any) {
    console.error("getEventImagesController error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Delete a carousel image. Owner (Host) or Admin only — enforced in the route via
// requireOwnerOrAdmin.
export const deleteEventImageController = async (req: Request, res: Response) => {
  try {
    const imageId = parseInt(req.params.id);
    if (isNaN(imageId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const deleted = await deleteEventImageService(imageId);
    return res.status(200).json({ message: "Event image deleted", image: deleted });
  } catch (error: any) {
    if (error.message === "Event image not found") {
      return res.status(404).json({ message: error.message });
    }
    console.error("deleteEventImageController error:", error);
    return res.status(500).json({ error: error.message });
  }
};
