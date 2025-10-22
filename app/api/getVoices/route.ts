import { NextResponse } from "next/server";

export async function GET() {
    const api_key = process.env.VOICE_GENERATION_KEY_2 as string;
    try {
        const res = await fetch("https://api.elevenlabs.io/v1/voices?page_size=4", {
            method: "GET",
            headers: {
                "xi-api-key": api_key,
            },
        });
        const data = await res.json();
        return NextResponse.json({ message: "Voices fetched successfully", success: true, voices: data.voices }, { status: 200 });
    } catch (error) {
        console.error("Error fetching voices:", error);
        return NextResponse.json({ message: "Failed to fetch voices", success: false }, { status: 500 });
    }
}