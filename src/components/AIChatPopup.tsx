import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X, Sparkles, Bot } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  image?: string;
  timestamp: Date;
  isTyping?: boolean;
}

// ── Typewriter hook ──────────────────────────────────────────────────────────
const useTypewriter = (text: string, speed = 18, active = false) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!active) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, active]);

  return displayed;
};

// ── Markdown Parser for Chatbot Responses ────────────────────────────────────
const parseInlineMarkdown = (text: string, appendCursor = false) => {
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);

  const renderedParts = parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      if (boldText.endsWith(":")) {
        return (
          <span key={i} className="font-semibold text-gold block mt-2 mb-0.5">
            {boldText}
          </span>
        );
      }
      return (
        <strong key={i} className="font-semibold text-gold">
          {boldText}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-surface border border-surface-border text-gold font-mono text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });

  if (appendCursor) {
    renderedParts.push(
      <span key="cursor" className="inline-block w-1.5 h-3.5 bg-gold ml-0.5 align-middle animate-pulse" />
    );
  }

  return renderedParts;
};

const renderMarkdown = (text: string, isTyping = false) => {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const isLastLine = index === lines.length - 1;
        const trimmed = line.trim();
        if (!trimmed) {
          return (
            <div key={index} className={isLastLine ? "inline-block" : "h-2"}>
              {isLastLine && isTyping && (
                <span className="inline-block w-1.5 h-3.5 bg-gold ml-0.5 align-middle animate-pulse" />
              )}
            </div>
          );
        }

        // Check for headers
        let isHeader = false;
        let headerText = "";
        if (trimmed.startsWith("### ")) {
          isHeader = true;
          headerText = trimmed.replace("### ", "");
        } else if (trimmed.startsWith("## ")) {
          isHeader = true;
          headerText = trimmed.replace("## ", "");
        } else if (trimmed.startsWith("# ")) {
          isHeader = true;
          headerText = trimmed.replace("# ", "");
        }

        if (isHeader) {
          return (
            <h4 key={index} className="font-display font-semibold text-gold text-sm mt-3 mb-1">
              {parseInlineMarkdown(headerText, isLastLine && isTyping)}
            </h4>
          );
        }

        // Check for bullet list item
        const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ");
        if (isBullet) {
          const bulletText = trimmed.replace(/^[\*\-\•]\s+/, "");
          return (
            <div key={index} className="flex items-start gap-2 pl-1">
              <span className="text-gold mt-2 flex-shrink-0 w-1 h-1 rounded-full bg-gold/80" />
              <p className="flex-1 text-sm leading-relaxed text-cream">
                {parseInlineMarkdown(bulletText, isLastLine && isTyping)}
              </p>
            </div>
          );
        }

        // Check for numbered list item
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const numText = numMatch[2];
          return (
            <div key={index} className="flex items-start gap-1.5 pl-1">
              <span className="text-gold font-medium text-xs mt-0.5 flex-shrink-0 w-4">{num}.</span>
              <p className="flex-1 text-sm leading-relaxed text-cream">
                {parseInlineMarkdown(numText, isLastLine && isTyping)}
              </p>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={index} className="text-sm leading-relaxed text-cream">
            {parseInlineMarkdown(line, isLastLine && isTyping)}
          </p>
        );
      })}
    </div>
  );
};

// ── AI Message bubble with typewriter ────────────────────────────────────────
const AIMessageBubble = ({
  content,
  isNew,
}: {
  content: string;
  isNew: boolean;
}) => {
  const displayed = useTypewriter(content, 10, isNew);
  const isTyping = isNew && displayed.length < content.length;
  
  return (
    <div className="w-full">
      {renderMarkdown(displayed, isTyping)}
    </div>
  );
};

// ── AIChatPopup ───────────────────────────────────────────────────────────────
const AIChatPopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        "Hello! I'm your AI Artwork Assistant.\n\nUpload an image of your artwork and I'll help you craft a compelling description and suggest a market value. You can also ask me anything about art techniques, pricing strategies, or the marketplace.",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newestMsgId, setNewestMsgId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async () => {
    if (!inputText.trim() && !imageFile) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputText.trim(),
      image: selectedImage || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setSelectedImage(null);
    setImageFile(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", userMsg.content);
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.post("/api/ai/ai-chatbox", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const reply = res.data?.reply || "I'm having trouble generating a response. Please try again.";
      const replyId = Date.now().toString() + "-res";

      setMessages((prev) => [
        ...prev,
        {
          id: replyId,
          type: "assistant",
          content: reply,
          timestamp: new Date(),
        },
      ]);
      setNewestMsgId(replyId);
    } catch (err) {
      console.error("AI error:", err);
      toast.error("Failed to get AI response. Is the AI service running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ── Floating Trigger ─────────────────────────────── */}
      <DialogTrigger asChild>
        <motion.button
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.15, rotate: 8 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-gold to-ochre text-canvas flex items-center justify-center shadow-2xl animate-pulse-gold float-artwork cursor-pointer"
          aria-label="Open AI Artwork Assistant"
          title="AI Art Assistant"
        >
          <Sparkles className="w-6 h-6" />
        </motion.button>
      </DialogTrigger>

      {/* ── Dialog ───────────────────────────────────────── */}
      <DialogContent className="w-[92vw] max-w-lg h-[88vh] flex flex-col bg-surface border-surface-border p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-surface-border flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-ochre flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-canvas" />
            </div>
            <div>
              <p className="font-display text-cream text-base">AI Artwork Assistant</p>
              <p className="text-cream-subtle text-xs font-normal">
                Powered by Gemini · Descriptions & Market Value
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* ── Messages ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.type === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold to-ochre flex items-center justify-center flex-shrink-0 mt-1 mr-2">
                    <Bot className="w-4 h-4 text-canvas" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 text-sm shadow-md ${
                    msg.type === "user"
                      ? "bg-terra/80 text-cream rounded-tr-sm"
                      : "bg-surface-raised border border-surface-border rounded-tl-sm"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Uploaded"
                      className="mb-2 max-h-36 rounded-lg object-cover w-full"
                    />
                  )}
                  {msg.type === "assistant" ? (
                    <AIMessageBubble
                      content={msg.content}
                      isNew={msg.id === newestMsgId}
                    />
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <p
                    className={`text-[10px] mt-1.5 ${
                      msg.type === "user" ? "text-terra-muted/70" : "text-cream-subtle"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold to-ochre flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-canvas" />
              </div>
              <div className="bg-surface-raised border border-surface-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ───────────────────────────────────── */}
        <div className="px-4 py-4 border-t border-surface-border flex-shrink-0 bg-surface-raised/50">
          {/* Image preview */}
          {selectedImage && (
            <div className="mb-3 relative inline-block">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-16 h-16 object-cover rounded-lg border border-gold/40"
              />
              <button
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-terra rounded-full flex items-center justify-center"
                onClick={removeImage}
              >
                <X className="w-3 h-3 text-cream" />
              </button>
            </div>
          )}

          <div className="flex gap-2 items-end">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your artwork or ask a question..."
              className="min-h-[44px] max-h-28 resize-none bg-surface border-surface-border text-cream placeholder:text-cream-subtle focus:border-gold/50 text-sm"
              rows={1}
            />
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-lg bg-surface border border-surface-border text-cream-muted hover:text-gold hover:border-gold/40 transition-colors"
                title="Attach image"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={sendMessage}
                disabled={(!inputText.trim() && !selectedImage) || isLoading}
                className="p-2.5 rounded-lg bg-gradient-to-br from-gold to-ochre text-canvas hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-cream-subtle text-[11px] mt-2">
            Enter to send · Shift+Enter for new line
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatPopup;
