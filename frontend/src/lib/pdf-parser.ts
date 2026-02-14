/**
 * Simple text extraction from file uploads.
 * Handles TXT files directly; PDF text extraction via unpdf (serverless-ready).
 * unpdf is specifically designed for serverless environments (no workers, no canvas).
 */

export async function extractTextFromFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  if (ext === "txt") {
    return buffer.toString("utf-8");
  }

  if (ext === "pdf") {
    try {
      // Use unpdf - built for serverless, no worker files needed
      const { extractText } = await import("unpdf");
      // Convert Buffer to Uint8Array (unpdf requires Uint8Array)
      const uint8Array = new Uint8Array(buffer);
      const { text } = await extractText(uint8Array);
      // unpdf returns text as string or array of strings
      return Array.isArray(text) ? text.join("\n\n") : text || "";
    } catch (error: any) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  if (ext === "docx") {
    // Extract text from DOCX (ZIP with XML inside)
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  throw new Error(`Unsupported file type: .${ext}`);
}
