const MAX_FILE_BYTES = 10 * 1024 * 1024;
const PDFJS_VERSION = "4.10.38";
const PDFJS_BASE = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build`;

type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (opts: { data: Uint8Array }) => {
    promise: Promise<{
      numPages: number;
      getPage: (n: number) => Promise<{
        getTextContent: () => Promise<{
          items: Array<{ str?: string; hasEOL?: boolean }>;
        }>;
      }>;
    }>;
  };
};

let pdfjsLoader: Promise<PdfJsModule> | null = null;

function loadPdfJs(): Promise<PdfJsModule> {
  if (!pdfjsLoader) {
    const importUrl = new Function(
      "u",
      "return import(u)"
    ) as (url: string) => Promise<PdfJsModule>;
    pdfjsLoader = importUrl(`${PDFJS_BASE}/pdf.min.mjs`).then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.mjs`;
      return pdfjs;
    });
  }
  return pdfjsLoader;
}

function isTxt(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".txt") || file.type === "text/plain";
}

function isPdf(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || file.type === "application/pdf";
}

function normalizeExtracted(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => {
        if (!item.str) return "";
        return `${item.str}${item.hasEOL ? "\n" : " "}`;
      })
      .join("");
    pages.push(line);
  }

  return normalizeExtracted(pages.join("\n\n"));
}

export async function extractKnowledgeNoteText(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("File is larger than 10 MB.");
  }

  if (isTxt(file)) {
    const raw = (await file.text()).replace(/^\uFEFF/, "");
    const text = normalizeExtracted(raw);
    if (!text) throw new Error("The text file is empty.");
    return text;
  }

  if (isPdf(file)) {
    try {
      const text = await extractPdfText(file);
      if (!text) {
        throw new Error(
          "No text found in this PDF. It may be a scanned image."
        );
      }
      return text;
    } catch (err) {
      if (err instanceof Error && /No text found/.test(err.message)) {
        throw err;
      }
      throw new Error(
        err instanceof Error
          ? `Could not read PDF: ${err.message}`
          : "Could not read this PDF."
      );
    }
  }

  throw new Error("Please upload a .txt or .pdf file.");
}
