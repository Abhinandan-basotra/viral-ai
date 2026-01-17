export async function getVoices() {
    const api_key = process.env.VOICE_GENERATION_KEY as string;
    try {
        const res = await fetch("https://api.elevenlabs.io/v1/voices?page_size=4", {
            method: "GET",
            headers: {
                "xi-api-key": api_key,
            },
        });
        const data = await res.json();
        return data.voices ;
    } catch (error) {
        console.error("Error fetching voices:", error);
        return null;
    }
}