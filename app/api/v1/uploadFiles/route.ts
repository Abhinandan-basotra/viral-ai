import { cloudinary } from "@/app/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const { imageUrl, folder } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    // Upload image using URL
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: folder || "default_folder",
    });

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
