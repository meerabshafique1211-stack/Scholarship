// Uploaded CVs/transcripts are validated, parsed IN MEMORY and never written to disk,
// a database or object storage. Only extracted text is used, only for this request.

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type ParsedDocument = { ok: true; text: string; kind: "pdf" | "docx" | "txt" } | { ok: false; error: string };

function sniff(buf: Uint8Array): "pdf" | "docx" | "txt" | null {
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return "pdf"; // %PDF
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) return "docx"; // PK zip
  const sample = buf.slice(0, 2000);
  let printable = 0;
  for (const b of sample) if (b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127) || b >= 128) printable++;
  return sample.length && printable / sample.length > 0.95 ? "txt" : null;
}

export async function parseUpload(file: File | null): Promise<ParsedDocument> {
  if (!file || file.size === 0) return { ok: false, error: "Please choose a file." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "The file is larger than 5 MB." };
  const buf = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(buf);
  if (!kind) return { ok: false, error: "Unsupported file. Upload a PDF, DOCX or plain-text file." };
  try {
    let text = "";
    if (kind === "pdf") {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(buf);
      const out = await extractText(pdf, { mergePages: true });
      text = Array.isArray(out.text) ? out.text.join("\n") : out.text;
    } else if (kind === "docx") {
      // @ts-ignore -- mammoth's bundled typings vary between versions
      const mammoth = await import("mammoth");
      const m = (mammoth as unknown as { default?: unknown }).default ?? mammoth;
      const r = await (m as { extractRawText(i: { buffer: Buffer }): Promise<{ value: string }> }).extractRawText({ buffer: Buffer.from(buf) });
      text = r.value;
    } else {
      text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    }
    text = text.replace(/\u0000/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    if (text.length < 40) {
      return { ok: false, error: "We couldn't read text from this file. If it is a scanned image, upload a text-based PDF or DOCX instead." };
    }
    return { ok: true, text: text.slice(0, 60_000), kind };
  } catch (e) {
    console.warn("[documents] parse failed:", (e as Error).message);
    return { ok: false, error: "We couldn't read this file. Try saving it again as PDF or DOCX." };
  }
}
