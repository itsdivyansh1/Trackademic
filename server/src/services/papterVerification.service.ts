import fetch from "node-fetch";
import pdfParse from "pdf-parse";

// Regex patterns for extracting identifiers
const DOI_REGEX = /\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+\b/i;
const ISSN_REGEX = /\bISSN\s?\d{4}-\d{3}[\dxX]\b/i;
const ISBN_REGEX = /\b97[89][-\s]?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?\d\b/;

interface VerificationResult {
  valid: boolean;
  type?: string;
  message?: string;
  details?: any;
}

// Main verification function
export async function verifyPaperFromBuffer(
  pdfBuffer: Buffer
): Promise<VerificationResult> {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    console.log("Starting verfication with buffer");

    // Try DOI first (most reliable)
    const doiMatch = text.match(DOI_REGEX);
    if (doiMatch) {
      const doi = doiMatch[0];
      console.log("Found DOI:", doi);
      return await verifyDOI(doi);
    }

    // Try ISSN
    const issnMatch = text.match(ISSN_REGEX);
    if (issnMatch) {
      const issn = issnMatch[0].replace(/ISSN\s?/i, "").trim();
      console.log("Found ISSN:", issn);
      return await verifyISSN(issn);
    }

    // Try ISBN
    const isbnMatch = text.match(ISBN_REGEX);
    if (isbnMatch) {
      const isbn = isbnMatch[0].replace(/[-\s]/g, "");
      console.log("Found ISBN:", isbn);
      return await verifyISBN(isbn);
    }

    return {
      valid: false,
      message: "No DOI, ISSN, or ISBN found in the document",
    };
  } catch (error) {
    console.error("Verification error:", error);
    return {
      valid: false,
      message: `Verification failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// DOI verification via CrossRef API
async function verifyDOI(doi: string): Promise<VerificationResult> {
  try {
    const url = `https://api.crossref.org/works/${doi}`;
    const response = await fetch(url);

    if (!response.ok) {
      return { valid: false, message: "DOI not found in CrossRef database" };
    }

    const data: any = await response.json();
    return {
      valid: true,
      type: "DOI",
      message: "Paper verified via DOI",
      details: {
        title: data.message.title?.[0],
        authors:
          data.message.author
            ?.map((a: any) => `${a.given || ""} ${a.family || ""}`)
            .filter(Boolean) || [],
        publisher: data.message.publisher,
        journal: data.message["container-title"]?.[0] || null,
        doi,
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: `DOI verification failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// ISSN verification via ISSN Portal
async function verifyISSN(issn: string): Promise<VerificationResult> {
  try {
    const url = `https://portal.issn.org/resource/ISSN/${issn}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      return { valid: false, message: "ISSN not found in ISSN Portal" };
    }

    const html = await response.text();
    const match: any = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
    );

    if (!match) {
      return { valid: false, message: "ISSN found but metadata unavailable" };
    }

    const jsonLd = JSON.parse(match[1]);
    return {
      valid: true,
      type: "ISSN",
      message: "Paper verified via ISSN",
      details: {
        issn,
        title: jsonLd.name,
        publisher: jsonLd.mainEntityOfPage?.sourceOrganization?.name,
        country: jsonLd.publication?.location?.name,
        medium: jsonLd.material,
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: `ISSN verification failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// ISBN verification via Open Library
async function verifyISBN(isbn: string): Promise<VerificationResult> {
  try {
    const url = `https://openlibrary.org/isbn/${isbn}.json`;
    const response = await fetch(url);

    if (!response.ok) {
      return { valid: false, message: "ISBN not found in Open Library" };
    }

    const data: any = await response.json();
    return {
      valid: true,
      type: "ISBN",
      message: "Publication verified via ISBN",
      details: {
        isbn,
        title: data.title,
        publishers: data.publishers,
        publish_date: data.publish_date,
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: `ISBN verification failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
