import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  Plus,
  Upload,
  Send,
  LogOut,
  MessagesSquare,
  Loader2,
  FileVideo,
  Menu,
  X,
  Trash2,
  CircleQuestionMark,
  Ghost,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { getDashboard, askLLM, uploadFile, uploadYouTubeUrl, isYouTubeUrl } from "@/lib/api";
import {
  getConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  getConversation,
} from "@/lib/conversations";
import { getMessages } from "@/lib/messages";
import { chat } from "@/lib/chat";



export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Loomly" }] }),
  component: DashboardPage,
});

type Session = { name: string; email: string };
type Msg = { id?: number; role: "user" | "assistant"; content: string; created_at?: string };
type Conversation = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  messages: Msg[];
  fileName?: string;
  transcript?: string;
  videoUrl?: string;
};
type ApiConversation = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
};
type ApiMessage = {
  id: number;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  created_at: string;
};

function toConversation(conversation: ApiConversation, messages: Msg[] = []): Conversation {
  return {
    ...conversation,
    messages,
  };
}

function toMessage(message: ApiMessage): Msg {
  return {
    id: message.id,
    role: message.role === "USER" ? "user" : "assistant",
    content: message.content,
    created_at: message.created_at,
  };
}

function getYouTubeEmbedUrl(url: string, startSeconds?: number): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    let embedUrl: string | null = null;

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      embedUrl = id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host.endsWith(".youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;

      const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shortsMatch?.[1]) embedUrl = `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }

    if (!embedUrl) return null;

    const urlObj = new URL(embedUrl);
    if (typeof startSeconds === "number" && Number.isFinite(startSeconds)) {
      urlObj.searchParams.set("start", String(Math.max(0, Math.floor(startSeconds))));
    }

    return urlObj.toString();
  } catch {
    return null;
  }
}

function parseTranscriptTimeline(transcript?: string) {
  if (!transcript) return [];

  const lines = transcript.split(/\r?\n/);

  return lines
    .map((line) => {
      const match = line.match(/\[(\d{1,2}):(\d{2}):(\d{2})\]/);
      if (!match) return null;

      const [, hour, minute, second] = match;
      const seconds = Number(hour) * 3600 + Number(minute) * 60 + Number(second);
      const text = line.replace(/\[\d{1,2}:\d{2}:\d{2}\]\s*/, "").trim();

      if (!text) return null;

      return {
        seconds,
        text,
        label: `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:${String(
          Math.floor((seconds % 3600) / 60),
        ).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`,
      };
    })
    .filter(Boolean) as Array<{ seconds: number; text: string; label: string }>;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [session, setSess] = useState<Session | null>(null);
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const [timelineQuery, setTimelineQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboard();
        setSess({
          name: data.user.full_name,
          email: data.user.email,
        });

        const conversations = await getConversations();
        const loadedConversations = await Promise.all(
          conversations.map(async (conversation: ApiConversation) => {
            try {
              const messages = await getMessages(conversation.id);
              return toConversation(conversation, messages.map(toMessage));
            } catch {
              return toConversation(conversation);
            }
          }),
        );

        setConvos(loadedConversations);
        if (loadedConversations.length > 0) {
          setActiveId((prev) => prev ?? loadedConversations[0].id);
        }
      } catch {
        navigate({ to: "/login" });
      }
    };

    void loadDashboard();
  }, [navigate]);

  const activeConversation = useMemo(
    () => convos.find((c) => c.id === activeId) ?? convos[0] ?? null,
    [convos, activeId],
  );

  useEffect(() => {
    if (!activeConversation) return;
    const loadMessages = async () => {
      if (activeConversation.messages.length > 0) return;

      try {
        const messages = await getMessages(activeConversation.id);
        setConvos((current) =>
          current.map((conversation) =>
            conversation.id === activeConversation.id
              ? {
                  ...conversation,
                  messages: messages.map(toMessage),
                }
              : conversation,
          ),
        );
      } catch {
        toast.error("Unable to load messages");
      }
    };

    void loadMessages();
  }, [activeConversation?.id, activeConversation?.messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [activeConversation?.messages.length]);

  useEffect(() => {
    setPlayingVideoUrl(null);
    setTimelineQuery("");
  }, [activeConversation?.id]);

  const timelineMatches = useMemo(() => {
    const q = timelineQuery.trim();
    if (!q || !activeConversation?.transcript) return [];

    const pattern = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    return parseTranscriptTimeline(activeConversation.transcript).filter((segment) => pattern.test(segment.text));
  }, [activeConversation?.transcript, timelineQuery]);

  const timelineMaxSeconds = useMemo(() => {
    const transcriptEntries = parseTranscriptTimeline(activeConversation?.transcript);
    if (!transcriptEntries.length) return 0;
    return Math.max(...transcriptEntries.map((entry) => entry.seconds));
  }, [activeConversation?.transcript]);

  if (!session) return null;

  const updateActive = (patch: Partial<Conversation>) => {
    if (!activeConversation) return;
    setConvos((current) =>
      current.map((conversation) =>
        conversation.id === activeConversation.id ? { ...conversation, ...patch } : conversation,
      ),
    );
  };

  const onNewChat = async () => {
    try {
      const created = await createConversation("New chat");
      const conversation = toConversation(created);
      setConvos((current) => [conversation, ...current]);
      setActiveId(conversation.id);
      setSidebarOpen(false);
    } catch {
      toast.error("Unable to create a conversation");
    }
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate({ to: "/login" });
  };

  const onContact =()=> {
    navigate({to:"/contact"})
  }

  const onPickFile = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      let conversationId = activeConversation?.id;
      if (!conversationId) {
        const created = await createConversation(
          file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "New chat",
        );
        const conversation = toConversation(created);
        setConvos((current) => [conversation, ...current]);
        setActiveId(conversation.id);
        conversationId = conversation.id;
      }

      const title = file.name.replace(/\.[^.]+$/, "").slice(0, 40) || "New chat";
      await updateConversation(conversationId, title);

      const uploadResult = await uploadFile(file);
      const uploadedConversationId = uploadResult.conversation_id ?? conversationId;

      setConvos((current) =>
        current.map((conversation) =>
          conversation.id === uploadedConversationId
            ? {
                ...conversation,
                title: uploadResult.title || title,
                fileName: file.name,
                transcript: uploadResult.transcript || "",
                messages: [
                  ...conversation.messages,
                  {
                    role: "assistant",
                    content: `I've processed ${file.name} and it's ready. Ask me anything about the recording.`,
                  },
                ],
              }
            : conversation,
        ),
      );
      setActiveId(uploadedConversationId);
      toast.success("File ready to chat");
    } catch {
      toast.error("Unable to process the recording");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onSelectConversation = async (conversationId: number) => {
    setActiveId(conversationId);
    setSidebarOpen(false);

    try {
      const conversation = await getConversation(conversationId);
      setConvos((current) =>
        current.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                title: conversation.title,
                updated_at: conversation.updated_at,
                last_message_at: conversation.last_message_at,
              }
            : item,
        ),
      );
    } catch {
      toast.error("Unable to load conversation");
    }
  };

  const onDeleteConversation = async (conversationId: number) => {
    if (!window.confirm("Delete this conversation?")) return;

    try {
      await deleteConversation(conversationId);
      setConvos((current) => current.filter((conversation) => conversation.id !== conversationId));
      if (activeConversation?.id === conversationId) {
        setActiveId(null);
      }
      toast.success("Conversation deleted");
    } catch {
      toast.error("Unable to delete conversation");
    }
  };

  const onSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const isYoutubeLink = isYouTubeUrl(text);

    let conversationId = activeConversation?.id;
    if (!conversationId) {
      try {
        const created = await createConversation("New chat");
        const conversation = toConversation(created);
        setConvos((current) => [conversation, ...current]);
        setActiveId(conversation.id);
        conversationId = conversation.id;
      } catch {
        toast.error("Unable to create a conversation");
        return;
      }
    }

    const baseMessages: Msg[] = activeConversation?.messages ?? [];
    const nextMsgs: Msg[] = [...baseMessages, { role: "user", content: text }];

    if (isYoutubeLink) {
      const processingMessages: Msg[] = [
        { role: "assistant", content: "Detected a YouTube link. Downloading the video and fetching the transcript..." },
        { role: "assistant", content: "Processing transcript, indexing it into memory, and preparing chat context..." },
      ];

      setInput("");
      setSending(true);
      setConvos((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [...nextMsgs, ...processingMessages],
              }
            : conversation,
        ),
      );

      try {
        const result = await uploadYouTubeUrl(text, conversationId);
        const summary = result?.summary ? String(result.summary).trim() : "";
        const title = result?.title ? String(result.title).trim() : "YouTube video";

        setConvos((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  title: title || conversation.title,
                  fileName: text,
                  videoUrl: text,
                  transcript: result?.transcript || conversation.transcript || "",
                  messages: [
                    ...nextMsgs,
                    {
                      role: "assistant",
                      content: summary
                        ? `YouTube video processed successfully. Summary: ${summary}`
                        : `YouTube video processed successfully and added to memory for chat.`,
                    },
                  ],
                }
              : conversation,
          ),
        );

        toast.success("YouTube video processed");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to process the YouTube URL";
        setConvos((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  messages: [
                    ...nextMsgs,
                    {
                      role: "assistant",
                      content: `I couldn’t process this YouTube link: ${message}`,
                    },
                  ],
                }
              : conversation,
          ),
        );
        toast.error("Unable to process the YouTube URL");
      } finally {
        setSending(false);
      }

      return;
    }

    setInput("");
    setSending(true);
    setConvos((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: nextMsgs,
            }
          : conversation,
      ),
    );

    try {
      const response = await chat(conversationId, text);

      setConvos((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [
                  ...nextMsgs,
                  {
                    role: "assistant",
                    content: response.answer || "I couldn’t generate a response.",
                  },
                ],
              }
            : conversation,
        ),
      );
    } catch {
      toast.error("Unable to send your message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-muted/30 transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-3">
          <Link to="/" className="flex items-center gap-2 px-2 font-semibold">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            Loomly
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-3">
          <Button onClick={() => void onNewChat()} variant="outline" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" /> New chat
          </Button>
        </div>

        <ScrollArea className="mt-3 flex-1 px-2">
          <div className="space-y-0.5">
            {convos.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex items-center gap-1 rounded-md ${
                  conversation.id === activeConversation?.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => void onSelectConversation(conversation.id)}
                  className="flex flex-1 items-center gap-2 truncate rounded-md px-2 py-2 text-left text-sm transition-colors"
                >
                  <MessagesSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{conversation.title}</span>
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => void onDeleteConversation(conversation.id)}
                  title="Delete conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-md px-2 py-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background text-xs font-medium">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{session.name}</div>
              <div className="truncate text-xs text-muted-foreground">{session.email}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={onLogout} title="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b border-border px-4">
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-2 truncate text-sm font-medium">
             {activeConversation?.title ?? "New chat"}
          </div>
          {activeConversation?.fileName && (
            <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground sm:flex">
              <FileVideo className="h-3.5 w-3.5" />
              <span className="max-w-[200px] truncate">{activeConversation.fileName}</span>
            </div>
          )}
          <Button size="icon" variant='ghost' onClick={onContact} title="Contact">
              <CircleQuestionMark className="h-4 w-4"/>
            </Button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {activeConversation?.videoUrl && (
              <div className="mb-6 rounded-2xl border border-border bg-card p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileVideo className="h-4 w-4" />
                    YouTube video
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setPlayingVideoUrl((current) =>
                        current === activeConversation.videoUrl ? null : activeConversation.videoUrl ?? null,
                      )
                    }
                  >
                    {playingVideoUrl === activeConversation.videoUrl ? "Hide video" : "Play video"}
                  </Button>
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={timelineQuery}
                    onChange={(e) => setTimelineQuery(e.target.value)}
                    placeholder="Search transcript timeline..."
                    className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground"
                  />
                  {timelineMatches.length > 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const firstMatch = timelineMatches[0];
                        if (!firstMatch) return;
                        setPlayingVideoUrl(activeConversation.videoUrl ?? null);
                        const embedUrl = getYouTubeEmbedUrl(activeConversation.videoUrl ?? "", firstMatch.seconds);
                        if (embedUrl) {
                          setPlayingVideoUrl(embedUrl);
                        }
                      }}
                    >
                      Jump to match
                    </Button>
                  )}
                </div>

                {timelineMatches.length > 0 && (
                  <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
                    <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                      <span>Timeline matches</span>
                      <span>{timelineMatches.length} result{timelineMatches.length > 1 ? "s" : ""}</span>
                    </div>

                    <div className="relative mb-3 h-2 overflow-hidden rounded-full bg-border">
                      <div className="absolute inset-y-0 left-0 bg-foreground/20" style={{ width: `${timelineMaxSeconds ? "100%" : "0%"}` }} />
                      {timelineMatches.map((match, index) => {
                        const left = timelineMaxSeconds > 0 ? (match.seconds / timelineMaxSeconds) * 100 : 0;
                        return (
                          <button
                            key={`${match.seconds}-${index}`}
                            type="button"
                            onClick={() => {
                              const embedUrl = getYouTubeEmbedUrl(activeConversation.videoUrl ?? "", match.seconds);
                              if (embedUrl) setPlayingVideoUrl(embedUrl);
                            }}
                            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-background bg-amber-400 shadow-sm transition-transform hover:scale-110"
                            style={{ left: `calc(${left}% - 8px)` }}
                            title={`${match.label} • ${match.text}`}
                            aria-label={`Jump to ${match.label}`}
                          />
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      {timelineMatches.slice(0, 5).map((match, index) => (
                        <button
                          key={`${match.seconds}-${index}`}
                          type="button"
                          onClick={() => {
                            const embedUrl = getYouTubeEmbedUrl(activeConversation.videoUrl ?? "", match.seconds);
                            if (embedUrl) setPlayingVideoUrl(embedUrl);
                          }}
                          className="block w-full rounded-lg border border-border bg-background/60 p-2 text-left transition-colors hover:bg-background"
                        >
                          <div className="mb-1 text-[11px] font-medium text-muted-foreground">{match.label}</div>
                          <div className="text-sm text-foreground">
                            {match.text.length > 140 ? `${match.text.slice(0, 140)}...` : match.text}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {playingVideoUrl === activeConversation.videoUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-border">
                    <iframe
                      src={getYouTubeEmbedUrl(activeConversation.videoUrl) ?? activeConversation.videoUrl}
                      title="YouTube video"
                      className="aspect-video w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}

                {typeof playingVideoUrl === "string" && playingVideoUrl !== activeConversation.videoUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-border">
                    <iframe
                      src={playingVideoUrl}
                      title="YouTube video timeline match"
                      className="aspect-video w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}

            {(!activeConversation || activeConversation.messages.length === 0) ? (
              <EmptyState onUpload={onPickFile} uploading={uploading} />
            ) : (
              <div className="space-y-6">
                {activeConversation.messages.map((message, index) => (
                  <MessageBubble key={`${message.id ?? index}-${message.content}`} msg={message} name={session.name} />
                ))}
                {sending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-background">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <div className="rounded-2xl border border-border bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring/40">
              <div className="flex items-end gap-2 p-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onPickFile}
                  disabled={uploading}
                  className="h-10 w-10 shrink-0 rounded-xl"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>

                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void onSend();
                    }
                  }}
                  placeholder={
                    activeConversation?.fileName
                      ? "Ask anything about the recording..."
                      : "Upload a file first, then ask a question"
                  }
                  rows={1}
                  className="min-h-[38px] max-h-30 flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 pt-2"
                />

                <Button
                  size="icon"
                  onClick={() => void onSend()}
                  disabled={!input.trim() || sending}
                  className="h-10 w-10 shrink-0 rounded-xl"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="video/*,audio/*"
                className="hidden"
                onChange={onFile}
              />
            </div>

            <p className="mt-2 text-center text-xs text-muted-foreground">
              Loomly can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyState({ onUpload, uploading }: { onUpload: () => void; uploading: boolean }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-foreground text-background">
        <Sparkles className="h-6 w-6" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight">What do you want to explore?</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Upload a video or audio recording to get a transcript, summary, and a chat you can ask anything.
      </p>
      <Button onClick={onUpload} className="mt-6 gap-2" size="lg" disabled={uploading}>
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {uploading ? "Processing…" : "Upload a recording"}
      </Button>
      <div className="mt-10 grid w-full max-w-xl gap-2 text-left sm:grid-cols-2">
        {[
          "Summarize this meeting in bullet points",
          "List all action items with owners",
          "What questions were raised but not answered?",
          "Give me the key decisions made",
        ].map((suggestion) => (
          <div
            key={suggestion}
            className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground"
          >
            {suggestion}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ msg, name }: { msg: Msg; name: string }) {
  const isUser = msg.role === "user";

  return (
    <div className="flex gap-3">
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-medium ${
          isUser ? "bg-muted text-foreground" : "bg-foreground text-background"
        }`}
      >
        {isUser ? name.charAt(0).toUpperCase() : <Sparkles className="h-3.5 w-3.5" />}
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          {isUser ? "You" : "Loomly"}
        </div>

        {isUser ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{msg.content}</div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-pre:my-3 prose-code:before:content-none prose-code:after:content-none text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
