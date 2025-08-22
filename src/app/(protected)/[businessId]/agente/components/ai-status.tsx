import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Zap } from "lucide-react";

export const AiStatus = () => {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <Badge variant="outline" className="text-xs">
        <Zap className="mr-1 h-3 w-3" />
        Gemini 2.5 Pro
      </Badge>
    </div>
  );
};
