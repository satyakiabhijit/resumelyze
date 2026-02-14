/**
 * Simple text extraction from file uploads.
 * Handles TXT files directly; PDF text extraction via pdfjs-dist (serverless-compatible).
 * For PDF, uses pdfjs-dist which works in Node.js serverless environments.
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
      // Use pdfjs-dist (serverless-compatible, no DOM dependencies)
      const pdfjsLib = await import("pdfjs-dist");
      
      // Load PDF from buffer
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
      });
      
      const pdf = await loadingTask.promise;
      const textParts: string[] = [];
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        textParts.push(pageText);
      }
      
      return textParts.join("\n\n");
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
