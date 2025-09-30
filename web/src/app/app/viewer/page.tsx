"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getPublicPublications, type Publication } from "@/lib/publication";
import { getPublicAchievements, type Achievement } from "@/lib/achievement";

function renderAuthors(a: any): string {
  if (Array.isArray(a)) return a.join(", ");
  if (typeof a === "string") {
    try {
      const parsed = JSON.parse(a);
      if (Array.isArray(parsed)) return parsed.join(", ");
      if (parsed && typeof parsed === "object") return Object.values(parsed).map(String).join(", ");
      return a;
    } catch {
      return a;
    }
  }
  if (a && typeof a === "object") return Object.values(a).map(String).join(", ");
  return "";
}

function isImage(url?: string) {
  return !!url && /(\.(png|jpe?g|gif|webp|bmp|svg))($|\?)/i.test(url);
}
function isPdf(url?: string) {
  return !!url && /(\.pdf)($|\?)/i.test(url);
}
function isDoc(url?: string) {
  return !!url && /(\.(docx?|pptx?|xlsx?))($|\?)/i.test(url);
}

function FileViewer({ fileUrl }: { fileUrl?: string }) {
  if (!fileUrl) {
    return (
      <div className="text-muted-foreground">No file available for this item.</div>
    );
  }

  if (isImage(fileUrl)) {
    return (
      <div className="w-full h-[calc(100vh-8rem)] overflow-auto flex items-start justify-center bg-secondary/50 rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fileUrl} alt="file" className="max-w-full h-auto" />
      </div>
    );
  }

  if (isPdf(fileUrl)) {
    return (
      <iframe
        title="pdf-viewer"
        src={fileUrl}
        className="w-full h-[calc(100vh-8rem)] rounded-md border"
      />
    );
  }

  if (isDoc(fileUrl)) {
    const officeViewer = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
      fileUrl,
    )}`;
    return (
      <iframe
        title="doc-viewer"
        src={officeViewer}
        className="w-full h-[calc(100vh-8rem)] rounded-md border"
      />
    );
  }

  return (
    <iframe
      title="file-viewer"
      src={fileUrl}
      className="w-full h-[calc(100vh-8rem)] rounded-md border"
    />
  );
}

function ChatPanel({
  fileUrl,
  title,
}: {
  fileUrl?: string;
  title?: string;
}) {
  const [messages, setMessages] = React.useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = React.useState("");
  const [includeFile, setIncludeFile] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const ask = async () => {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", content: q }, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          fileUrl,
          title,
          includeFile,
        }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to get answer");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        const chunk = value ? decoder.decode(value) : "";
        if (chunk) {
          setMessages((m) => {
            const copy = [...m];
            // Append to the last assistant message
            const idx = copy.findIndex((x) => x.role === "assistant" && x.content === "");
            const lastIdx = idx === -1 ? copy.length - 1 : idx;
            if (copy[lastIdx]?.role === "assistant") {
              copy[lastIdx] = { role: "assistant", content: (copy[lastIdx].content || "") + chunk } as any;
            } else {
              copy.push({ role: "assistant", content: chunk });
            }
            return copy;
          });
        }
      }
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Error: ${e?.message || "Unknown"}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <div className="border-b p-3">
        <div className="text-sm font-semibold">Ask about this file</div>
        <div className="text-xs text-muted-foreground">
          The assistant can only answer questions about the currently open file.
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Start by asking a question about the file's content.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <Card className={`inline-block max-w-[90%] whitespace-pre-wrap p-3 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>
              {m.content}
            </Card>
          </div>
        ))}
      </div>
      <div className="border-t p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ask about this file..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask();
              }
            }}
          />
          <Button onClick={ask} disabled={loading}>{loading ? "Thinking..." : "Send"}</Button>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground select-none">
          <input
            type="checkbox"
            checked={includeFile}
            onChange={(e) => setIncludeFile(e.target.checked)}
          />
          Include file data for deeper analysis (may increase latency)
        </label>
      </div>
    </div>
  );
}

export default function ViewerPage() {
  const params = useSearchParams();
  const router = useRouter();

  const type = (params.get("type") || undefined) as "publication" | "achievement" | undefined;
  const id = params.get("id") || undefined;
  const titleParam = params.get("title") || undefined;
  const fileUrlParam = params.get("fileUrl") || undefined;

  // Fetch collections to resolve full details when possible
  const { data: publications } = useQuery({
    queryKey: ["publicPublications"],
    queryFn: getPublicPublications,
    enabled: type === "publication",
  });
  const { data: achievements } = useQuery({
    queryKey: ["publicAchievements"],
    queryFn: getPublicAchievements,
    enabled: type === "achievement",
  });

  const pub = React.useMemo(() => {
    return type === "publication" && id ? publications?.find((p) => p.id === id) : undefined;
  }, [type, id, publications]);

  const ach = React.useMemo(() => {
    return type === "achievement" && id ? achievements?.find((a) => a.id === id) : undefined;
  }, [type, id, achievements]);

  const effectiveTitle = pub?.title || ach?.title || titleParam;
  const effectiveFileUrl = pub?.fileUrl || ach?.fileUrl || fileUrlParam;

  React.useEffect(() => {
    if (!effectiveFileUrl) {
      // If we don't have a fileUrl, there isn't much to show; go back.
      router.replace("/app/explore");
    }
  }, [effectiveFileUrl, router]);

  // Header details for publication
  const PublicationDetails = ({ p }: { p: Publication }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge>Publication</Badge>
        {p.doi && (
          <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer" className="text-xs underline">
            DOI: {p.doi}
          </a>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        <span className="font-medium">Authors:</span> {renderAuthors(p.authors as any)}
      </div>
      <div className="text-sm text-muted-foreground">
        <span className="font-medium">Venue:</span> {p.journalConference} · <span className="font-medium">Year:</span> {p.publicationYear}
      </div>
      {p.abstract && (
        <div className="text-sm">
          <span className="font-medium">Abstract:</span> {p.abstract}
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        Published: {new Date(p.publishedAt).toLocaleDateString()} · Visibility: {p.visibility}
      </div>
    </div>
  );

  // Header details for achievement
  const AchievementDetails = ({ a }: { a: Achievement }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge>Achievement</Badge>
        <span className="text-xs text-muted-foreground">Category: {a.category}</span>
      </div>
      {a.description && (
        <div className="text-sm">
          <span className="font-medium">Description:</span> {a.description}
        </div>
      )}
      <div className="text-xs text-muted-foreground">Date: {new Date(a.date).toLocaleDateString()} · Visibility: {a.visibility}</div>
    </div>
  );

  return (
    <div className="px-4 py-4">
      <div className="mb-4 space-y-2">
        <div className="text-sm text-muted-foreground">{type} · {id}</div>
        <h1 className="text-2xl font-semibold leading-tight break-words">{effectiveTitle || "Viewer"}</h1>
        <div className="grid gap-2">
          {pub && <PublicationDetails p={pub} />}
          {ach && <AchievementDetails a={ach} />}
          {!pub && !ach && (
            <div className="text-sm text-muted-foreground">Limited details available. Opened via link parameters.</div>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <FileViewer fileUrl={effectiveFileUrl} />
          {effectiveFileUrl && (
            <div className="mt-2 text-xs text-muted-foreground">
              <a href={effectiveFileUrl} target="_blank" rel="noreferrer" className="underline">Open original</a>
            </div>
          )}
        </div>
        <div className="w-full md:w-96 border-l pl-4">
          <ChatPanel fileUrl={effectiveFileUrl} title={effectiveTitle || undefined} />
        </div>
      </div>
    </div>
  );
}
