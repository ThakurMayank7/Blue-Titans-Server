import stream from "stream";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegStatic);

export const checkAudioType = async (fileBuffer, fileExtension) => {
  if (fileExtension === "mp3") {
    return await convertMP3ToWAV(fileBuffer);
  } else if (fileExtension === "wav") {
    return fileBuffer;
  } else {
    throw new Error("Unsupported audio format. Only MP3 and WAV are allowed.");
  }
};

export const convertMP3ToWAV = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const inputStream = new stream.PassThrough();
    inputStream.end(fileBuffer);

    const outputStream = new stream.PassThrough();
    const convertedChunks = [];

    outputStream.on("data", (chunk) => convertedChunks.push(chunk));

    outputStream.on("error", (err) => {
      console.error("Error in output stream:", err);
      reject(new Error("Failed to process the MP3 file."));
    });

    ffmpeg(inputStream)
      .inputFormat("mp3")
      .outputFormat("wav")
      .audioCodec("pcm_s16le")
      .on("start", (cmd) => {})
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        reject(new Error(`FFmpeg conversion failed: ${err.message}`));
      })
      .on("end", () => {
        resolve(Buffer.concat(convertedChunks));
      })
      .pipe(outputStream, { end: true });

    outputStream.on("finish", () => {});
  });
};
