import tf from "@tensorflow/tfjs-node";
import pkg from "wavefile";
import Meyda from "meyda";
import { BUFFER_SIZE } from "../config/constants.mjs";

const { WaveFile } = pkg;

export function processAudio(audioBuffer) {
  try {
    const wav = new WaveFile(audioBuffer);
    wav.toBitDepth("32f");

    const samples = new Float32Array(wav.getSamples()[0]);
    const sampleRate = wav.fmt.sampleRate;

    let mfccFrames = [];
    for (let i = 0; i < samples.length; i += BUFFER_SIZE) {
      let chunk = samples.slice(i, i + BUFFER_SIZE);
      if (chunk.length < BUFFER_SIZE) {
        let paddedChunk = new Float32Array(BUFFER_SIZE);
        paddedChunk.set(chunk);
        chunk = paddedChunk;
      }

      const mfcc = Meyda.extract("mfcc", chunk, {
        sampleRate,
        bufferSize: BUFFER_SIZE,
        numCoefficients: 13,
      });

      if (mfcc) mfccFrames.push(mfcc);
    }

    const averagedMFCCs = mfccFrames[0].map(
      (_, i) =>
        mfccFrames.reduce((sum, frame) => sum + frame[i], 0) / mfccFrames.length
    );

    return tf.tensor2d([averagedMFCCs]);
  } catch (error) {
    throw new Error(`Audio processing failed: ${error.message}`);
  }
}
