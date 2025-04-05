import tf from "@tensorflow/tfjs-node";
import { MODEL_PATHS } from "./constants.mjs";

const models = {};

export async function loadModels() {
  console.log("\nLoading Models...");
  const start = Date.now();

  const loadedModels = await Promise.all(
    Object.entries(MODEL_PATHS).map(async ([key, modelPath]) => {
      return { key, model: await tf.loadLayersModel(modelPath) };
    })
  );

  loadedModels.forEach(({ key, model }) => {
    models[key] = model;
  });

  console.log("Models loaded in ", (Date.now() - start) / 1000, "seconds\n");
}

export { models };
