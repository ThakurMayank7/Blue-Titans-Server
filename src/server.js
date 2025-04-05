import express from "express";
import cors from "cors";

import { loadModels } from "./config/models.mjs";

import audioRoutes from "./routes/audioRoutes.mjs";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cors());

app.use("/api/audio", audioRoutes);

loadModels()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server ready at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to load models:", error);
  });
