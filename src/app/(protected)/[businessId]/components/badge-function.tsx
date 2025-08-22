"use client";

import { AlertCircleIcon, BadgeCheckIcon, CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function BadgeNewFunction() {
  return (
    <div className="w-full">
      <Badge className="bg-blue-500/10 dark:bg-blue-500/30 dark:text-gray-300 text-muted-foreground">Nova Função</Badge>
    </div>
  );
}
