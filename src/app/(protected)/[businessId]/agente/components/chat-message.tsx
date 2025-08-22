import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BrainCircuit, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

export const ChatMessage = ({ role, content, isLoading }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn("group flex gap-4 px-4 py-6", isUser && "flex-row-reverse")}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "border-0 text-sm",
            isUser
              ? "bg-white/10 text-white"
              : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 text-emerald-600",
          )}
        >
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Image
              src="/bedashicon.svg"
              width={40}
              height={40}
              alt="AI Avatar"
              className="h-8 w-8"
            />
          )}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex-1 space-y-1", isUser && "text-right")}>
        <div className="text-muted-foreground text-xs font-medium">
          {isUser ? "Você" : "Bedash AI"}
        </div>

        <div
          className={cn("prose prose-sm max-w-none", isUser && "prose-invert")}
        >
          {isLoading ? (
            <div className="mt-3 flex items-center gap-3">
              <Bouncy size="32" speed="1.75" color="#7F22FE" />
              <span className="text-muted-foreground text-sm">
                Bedash AI está analisando sua pergunta...
              </span>
            </div>
          ) : (
            <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {content.split("\n").map((line, i) => (
                <div key={i} className={line.trim() === "" ? "h-4" : ""}>
                  {line.includes("**")
                    ? line.split("**").map((part, j) =>
                        j % 2 === 1 ? (
                          <strong
                            key={j}
                            className="text-foreground font-semibold"
                          >
                            {part}
                          </strong>
                        ) : (
                          <span key={j}>{part}</span>
                        ),
                      )
                    : line}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
