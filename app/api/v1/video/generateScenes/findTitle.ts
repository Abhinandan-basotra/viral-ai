export async function findTitle(script: string) {
    const basePrompt = `You are an expert content writer.

Generate a clear, engaging, and relevant title based on the following script.

Rules:
- The title must accurately reflect the core idea of the script
- Keep it concise and natural (3-5 words)
- Avoid clickbait unless the tone of the script is promotional
- Use simple, readable language
- Do NOT include quotes or extra text
- Return ONLY the title

Script:
${script}
`
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API}`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: basePrompt }],
                },
            ],
        })
    })

    const data = await res.json();
    const title = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return title.trim();
}