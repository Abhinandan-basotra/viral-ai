import fs from 'fs';
export async function convert_speech_to_text(audioPath: string) {
    const formData = new FormData();

    const audioBuffer = fs.readFileSync(audioPath);
    const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });

    formData.append("file", audioBlob, "audio.mp3");
    formData.append("model_id", "scribe_v2");
    formData.append("language_code", "en");
    formData.append("timestamp_granularity", "word")
    formData.append(
        "additional_formats",
        JSON.stringify([
            {
                format: "srt",
                include_timestamps: true,
                max_characters_per_lines: 42
            }
        ])
    )
    formData.append("diarize", "true")

    const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "xi-api-key": process.env.VOICE_GENERATION_KEY || "",
        },
        body: formData
    })

    const data = await res.json();
    const srtFormat = data.additional_formats?.find(
        (f: any) => f.requested_format === "srt"
    );

    if (!srtFormat) {
        throw new Error("SRT not found in additional_formats");
    }

    const srtPath = `${audioPath}.srt`;
    fs.writeFileSync(srtPath, srtFormat.content, "utf-8");
    return srtPath;
}