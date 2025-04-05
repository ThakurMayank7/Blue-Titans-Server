import express from "express";
import upload from "../middleware/uploadMiddleware.mjs";
import { checkAudioType } from "../utils/fileHelper.mjs";
import { processAudio } from "../services/audioService.mjs";
import { predictAudioFeatures } from "../services/modelService.mjs";
import { db } from "../firebase/config.mjs";
import authMiddleware from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.post(
  "/analyze",
  authMiddleware,
  upload.single("audio"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    if (req.file.size > 100 * 1024 * 1024) {
      return res.status(400).json({ error: "File size exceeds 100MB" });
    }

    if (req.file.size < 1 * 1024) {
      return res.status(400).json({ error: "File size is too small" });
    }

    
    
    const start = Date.now();
    
    try {
      const user = req.user;
      if (!user) {
        throw new Error("User not authenticated.");
      }
      const userId = user.uid;

      console.log("Analysis Started for user: ", userId);
      
      await db.collection("audio").add({
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
      });

      const fileBuffer = await checkAudioType(
        req.file.buffer,
        req.file.originalname.split(".").pop().toLowerCase()
      );

      if (!fileBuffer) {
        throw new Error("Failed to process audio file.");
      }

      const audioTensor = processAudio(fileBuffer);

      if (!audioTensor) {
        throw new Error("Failed to process audio file.");
      }

      let results;
      try {
        results = await predictAudioFeatures(audioTensor);
      } finally {
        audioTensor.dispose();
      }

      audioTensor.dispose();

      console.log(
        "Analysis Completed in ",
        (Date.now() - start) / 1000,
        " seconds\n"
      );

      res.json({ message: "Audio analyzed successfully", results });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
