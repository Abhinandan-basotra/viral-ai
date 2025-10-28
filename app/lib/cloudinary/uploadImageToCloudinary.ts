import { cloudinary } from "./cloudinary";

export async function uploadImageToCloudinary(file: Blob, folder: string = "default_folder"): Promise<string> {
  if (!file || !(file instanceof Blob)) throw new Error("No file provided");

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!buffer || buffer.length === 0) {
    throw new Error("Empty file buffer provided to Cloudinary upload");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error || "Upload failed");
        resolve(result.secure_url);
        return result.secure_url;
      }
    );
    stream.end(buffer);
  });
}