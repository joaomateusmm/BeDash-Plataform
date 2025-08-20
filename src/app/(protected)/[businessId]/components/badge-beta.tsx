"use client";

import { AlertCircleIcon, BadgeCheckIcon, CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function BadgeBeta() {
  return (
    <div className="w-full">
      <Badge className="text-muted-foreground bg-gray-100">Em Breve</Badge>
    </div>
  );
}
