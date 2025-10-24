import { cloudinary } from "@/app/lib/cloudinary";

export async function uploadToCloudinary(file: Blob, folder: string = "default_folder"): Promise<string> {
  if (!file || !(file instanceof Blob)) throw new Error("No file provided");

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error || !result) return reject(error || "Upload failed");
        resolve(result.secure_url);
        return result.secure_url;
      }
    );
    stream.end(buffer);
  });
}
