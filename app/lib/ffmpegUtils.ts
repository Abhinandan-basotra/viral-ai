import { spawn } from "child_process";
import fs from 'fs';

// Use system ffprobe in Docker, fallback to ffprobe-static for local development
const ffprobePath = process.env.NODE_ENV === 'production' ? "ffprobe" : "ffprobe";

export function getDuration(filePath: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    // First check if file exists
    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`));
      return;
    }

    const process = spawn(ffprobePath, [
      "-v", "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath
    ]);

    let output = "";
    let errorOutput = "";

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        const duration = parseFloat(output.trim());
        if (isNaN(duration)) {
          reject(new Error(`Invalid duration output: ${output}`));
        } else {
          resolve(duration);
        }
      } else {
        reject(new Error(`FFprobe failed with code ${code}: ${errorOutput}`));
      }
    });

    process.on("error", (err) => {
      reject(new Error(`FFprobe spawn error: ${err.message}`));
    });
  });
}
