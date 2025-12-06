"use client";

import { useEffect, useRef, useState } from "react";
import { Citation as CitationType, Message } from "../../types/api/messages";

// Process citations in text content and replace with numbered references
export const processCitationsInText = (
  content: string,
  citations: CitationType[] = []
): string => {
  if (!content || !citations || citations.length === 0) return content;

  let processedContent = content;

  // Updated regex pattern to match PMID references with or without parentheses
  const pmidRegex = /(?:\()?PMID:\s*(\d+)?/g;

  // Create a map of PMIDs to their index in the citations array for quick lookup
  const pmidToIndex = new Map();
  citations.forEach((citation, index) => {
    if (citation.pmid) {
      pmidToIndex.set(citation.pmid, index);
    }
  });

  // Replace PMID references with numbered links
  processedContent = processedContent.replace(pmidRegex, (match, pmid) => {
    // Find the index of this citation by PMID
    const index = pmidToIndex.get(pmid);

    // If we found a matching citation, replace with a link
    if (index !== undefined) {
      // Link directly to the citation URL with only the number styled as primary
      return `<a href="${
        citations[index].url
      }" target="_blank" rel="noopener noreferrer" class="hover:underline no-underline font-medium"><span class="text-primary">${
        index + 1
      }</span></a>`;
    }
    // If no match found, keep the original reference
    return match;
  });

  // Also handle any explicit numbered citations [n]
  processedContent = processedContent.replace(/\[(\d+)\]/g, (match, number) => {
    const index = parseInt(number, 10) - 1;
    if (index >= 0 && index < citations.length) {
      // Link directly to the citation URL with only the number styled as primary
      return `<a href="${citations[index].url}" target="_blank" rel="noopener noreferrer" class="hover:underline no-underline font-medium">[<span class="text-primary">${number}</span>]</a>`;
    }
    return match;
  });

  return processedContent;
};

// Convert markdown to HTML
export const markdownToHtml = (
  markdown: string,
  citations: CitationType[] = [],
  replaceReferences: boolean = true
): string => {
  if (!markdown) return "";

  // First, temporarily replace triple backticks to protect code blocks
  let html = markdown.replace(/```([\s\S]*?)```/g, (match) => {
    return "CODE_BLOCK_PLACEHOLDER" + Buffer.from(match).toString("base64");
  });

  // Handle educational content sections with numbered headers (e.g., "1. Title")
  html = html.replace(/^(\d+)\.\s+(.*?)$/gm, (match, number, title) => {
    return `<h3 class="text-lg font-semibold mt-6 mb-2">${number}. ${title}</h3>`;
  });

  // Handle bullet points with "•" character (common in educational content)
  html = html.replace(/^\s*[•]\s+(.*?)$/gm, (match, content) => {
    return `<li class="ml-4 mb-1">${content}</li>`;
  });

  // Handle unordered lists (- and *)
  html = html.replace(/^\s*[\-*]\s+(.*?)$/gm, (match, content) => {
    return `<li class="ml-4 mb-1">${content}</li>`;
  });

  // Group consecutive list items into a single list
  html = html.replace(/(?:<li[\s\S]*?<\/li>)+/g, (match) => {
    if (match.indexOf("<ul>") === -1) {
      return `<ul class="list-disc my-3 space-y-1">${match}</ul>`;
    }
    return match;
  });

  // Handle paragraphs with double line breaks
  html = html.replace(/\n\n(?![\s*\-\d])/g, "</p><p>");

  // Handle bold text
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    "<strong class='font-semibold'>$1</strong>"
  );

  // Handle italic text
  html = html.replace(/\*(.*?)\*/g, "<em class='italic'>$1</em>");

  // Handle inline code
  html = html.replace(
    /`([^`]+)`/g,
    "<code class='bg-muted px-1 py-0.5 rounded text-sm'>$1</code>"
  );

  // Restore code blocks
  html = html.replace(
    /CODE_BLOCK_PLACEHOLDER([A-Za-z0-9+/=]+)/g,
    (match, base64) => {
      const original = Buffer.from(base64, "base64").toString();
      // Extract the code content without the backticks
      const code = original.replace(
        /```(?:(\w+)\n)?([\s\S]*?)```/g,
        (_, lang, content) => {
          return `<pre class="bg-muted p-4 rounded-md my-4 overflow-x-auto"><code>${content.trim()}</code></pre>`;
        }
      );
      return code;
    }
  );

  // Wrap with paragraph if not already wrapped and not a block element
  if (!html.match(/^<(h[1-6]|ul|ol|pre|blockquote)/i)) {
    html = '<p class="my-4">' + html + "</p>";
  }

  // Process citation references if requested
  if (replaceReferences) {
    html = processCitationsInText(html, citations);
  }

  return html;
};

// Component for static content with citations
export const ContentWithCitations = ({
  content,
  citations = [],
}: {
  content: string;
  citations?: CitationType[];
}) => {
  const html = markdownToHtml(content, citations);

  return (
    <div className="max-w-3xl mx-auto">
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {citations && citations != null && citations.length > 0 && (
        <Citations citations={citations} />
      )}
    </div>
  );
};

// Component for streaming content with citations
export const StreamingContentWithCitations: React.FC<{
  message: string;
  citations?: CitationType[];
  speed?: number;
}> = ({ message, citations = [], speed = 15 }) => {
  const [displayedContent, setDisplayedContent] = useState<string>("");
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const currentIndexRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunkSizeRef = useRef<number>(1); // Default chunk size

  useEffect(() => {
    if (!message) return;

    // Calculate the optimal chunk size based on message length
    if (message.length > 1000) {
      chunkSizeRef.current = Math.ceil(message.length / 500); // Process longer messages faster
    } else {
      chunkSizeRef.current = 1; // Default for short messages
    }

    // Reset streaming state when content changes
    setDisplayedContent("");
    currentIndexRef.current = 0;
    setIsComplete(false);

    // Create the streaming interval
    intervalRef.current = setInterval(() => {
      if (currentIndexRef.current < message.length) {
        // Calculate how many characters to add this interval
        const remainingChars = message.length - currentIndexRef.current;
        const charsToAdd = Math.min(chunkSizeRef.current, remainingChars);

        // Add the next chunk of characters
        const nextChunk = message.substring(
          currentIndexRef.current,
          currentIndexRef.current + charsToAdd
        );

        setDisplayedContent((prev) => prev + nextChunk);
        currentIndexRef.current += charsToAdd;
      } else {
        setIsComplete(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [message, speed]);

  // Ensure message is a string to prevent "undefined" from showing
  const safeDisplayedContent =
    typeof displayedContent === "string" ? displayedContent : "";

  // When streaming, don't process citations. Only after streaming is complete,
  // replace PMID references with citation numbers.
  const processedContent = isComplete
    ? markdownToHtml(safeDisplayedContent, citations, true) // Process citations when complete
    : markdownToHtml(safeDisplayedContent, [], false); // Don't process citations during streaming

  return (
    <div className="max-w-3xl mx-auto relative">
      <div dangerouslySetInnerHTML={{ __html: processedContent }} />
      {!isComplete && (
        <span className="absolute bottom-0 right-0 inline-block w-2 h-4 bg-primary animate-pulse"></span>
      )}
      {/* Only show citations after streaming is complete */}
      {isComplete && citations && citations != null && citations.length > 0 && (
        <Citations citations={citations} />
      )}
    </div>
  );
};

// Citation reference component
export const Citation = ({
  citation,
  index,
}: {
  citation: CitationType;
  index: number;
}) => {
  return (
    <div className="flex items-start mb-1" id={`citation-${index}`}>
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm  flex items-center gap-1"
      >
        <span className="text-primary">[{index + 1}]</span>
      </a>
      <span className="ml-1 ">
        {citation.text}, PubMed ID: {citation.pmid}
      </span>
    </div>
  );
};

// Citations list component from the original file
export const Citations = ({ citations }: { citations: CitationType[] }) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-4 border-t border-border pt-2">
      <h4 className="text-sm font-medium mb-1">References:</h4>
      <div className="space-y-1">
        {citations.map((citation, index) => (
          <Citation
            key={`citation-${citation.pmid || index}`}
            citation={citation}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};
