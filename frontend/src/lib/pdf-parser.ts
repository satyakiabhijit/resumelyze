/**
 * Simple text extraction from file uploads.
 * Handles TXT files directly; PDF text extraction via a lightweight approach.
 * For PDF, uses pdf-parse (server-side only).
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
      // pdf-parse exports PDFParse class that needs data in constructor
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      return textResult.text || "";
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
