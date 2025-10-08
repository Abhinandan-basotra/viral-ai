import axios from "axios";
import fs from "fs";

/**
 * Downloads a file from a URL and saves it locally.
 * @param url - The file URL
 * @param outputPath - The local path to save the file
 */
export async function downloadFile(url: string, outputPath: string): Promise<void> {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer",
    });

    fs.writeFileSync(outputPath, response.data);
    console.log(`✅ Downloaded: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to download ${url}:`, error);
    throw error;
  }
}
