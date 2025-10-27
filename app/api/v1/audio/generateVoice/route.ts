import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { uploadAudioToCloudinary } from "../../uploadAudio/route";

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const voice = data.voice
        const audioId = data.audioId;
        const audioText = data.audioText

        const apikey = process.env.VOICE_GENERATION_KEY;
        if (!apikey) return NextResponse.json({ message: "api key is not present", success: false }, { status: 404 })

        const text = audioText;

        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
            method: 'POST',
            headers: {
                "Accept": 'audio/mpeg',
                "Content-Type": 'application/json',
                "xi-api-key": apikey,
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_v3",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    use_speaker_boost: true
                }
            })
        })

        if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ ElevenLabs API error:", errorText);
        }

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const cloudUrl = await uploadAudioToCloudinary(buffer, "elevenlabs_audios");
        await prisma.audio.update({
            where: { id: audioId },
            data: {
                url: cloudUrl.url,
                duration: cloudUrl.duration
            },
        });

        return NextResponse.json({ mesaage: "Audio stored Successfully", success: true, audio: cloudUrl.url });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
    }
}