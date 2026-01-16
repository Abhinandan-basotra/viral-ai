import fs from 'fs';
const SPEED_FACTOR = 1.25;
export async function convert_speech_to_text(videoPath: string) {
    const formData = new FormData();

    const videoBuffer = fs.readFileSync(videoPath);
    const blob = new Blob([videoBuffer], { type: "video/mp4" });

    formData.append("file", blob, "video.mp4");
    formData.append("model_id", "scribe_v2");
    formData.append("language_code", "en");
    formData.append("timestamp_granularity", "word")
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
    console.log(data);
    const subtitleFilePath = 'subtitle_temp.ass';
    await create_ass_content(data.words, subtitleFilePath);
    return subtitleFilePath;
}


async function create_ass_content(words: any[], subtitleFilePath: string) {
  const spoken = words.filter(w => w.type === "word");
  const lines = groupWords(spoken, 3);

  let ass = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Outline, Shadow, Alignment, MarginV
Style: Default,Arial,56,&H00FFFFFF,&H0000FFFF,&H00000000,&H80000000,-1,3,1,2,65

[Events]
Format: Layer, Start, End, Style, Text
`;

  for (const line of lines) {
    const start = line[0].start;
    const end = line[line.length - 1].end;

    ass += `Dialogue: 0,${fmt(start)},${fmt(end)},Default,${karaoke(line)}\n`;
  }

  fs.writeFileSync(subtitleFilePath, ass);
}


function fmt(t: number) {
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = Math.floor(t % 60)
  const cs = Math.floor((t % 1) * 100)
  return `${h}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}.${cs.toString().padStart(2, "0")}`
}

function groupWords(
  words: any[],
  maxWordsPerLine = 4,
  maxGap = 0.6 
) {
  const lines: any[] = [];
  let current: any[] = [];

  for (const w of words) {
    if (w.type !== "word") continue;

    if (
      current.length >= maxWordsPerLine ||
      (current.length &&
        w.start - current[current.length - 1].end > maxGap)
    ) {
      lines.push(current);
      current = [];
    }

    current.push(w);
  }

  if (current.length) lines.push(current);
  return lines;
}



function escapeASS(text: string) {
  return text.replace(/[{}]/g, "");
}


function karaoke(words: any[]) {
  let out = "";

  for (const w of words) {
    const dur = Math.max(
      1,
      Math.round((w.end - w.start) * 100 * SPEED_FACTOR)
    );

    out += `{\\k${dur}}${escapeASS(w.text)} `;
  }

  return out.trim();
}

