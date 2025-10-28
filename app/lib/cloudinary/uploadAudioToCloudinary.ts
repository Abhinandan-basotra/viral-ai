import { cloudinary } from "./cloudinary";

interface UploadResult {
  url: string;
  duration: number;
}

export async function uploadAudioToCloudinary(buffer: Buffer, folder = "audios") : Promise<UploadResult> {
  if (!buffer || !(buffer instanceof Buffer)) throw new Error("No buffer provided");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "video", // required for audio
        format: "mp3",
      },
      (error, result) => {
        if (error || !result) return reject(error || "Upload failed");
        resolve({
          url: result.secure_url,
          duration: result.duration
        
        });
        
      }
    );
    stream.end(buffer);
  });
}
