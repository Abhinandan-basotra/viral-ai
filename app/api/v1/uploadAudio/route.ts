import { cloudinary } from "@/app/lib/cloudinary";

export async function uploadAudioToCloudinary(buffer: Buffer, folder = "audios") : Promise<string> {
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
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
