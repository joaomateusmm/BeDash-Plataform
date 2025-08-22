"use client";

import { AlertCircleIcon, BadgeCheckIcon, CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function BadgeBeta() {
  return (
    <div className="w-full">
      <Badge className="bg-muted/50 text-muted-foreground">Em Breve</Badge>
    </div>
  );
}
