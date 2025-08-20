"use client";

import { AlertCircleIcon, BadgeCheckIcon, CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function BadgeNew() {
  return (
    <div className="w-full">
      <Badge className="bg-indigo-400">Novo</Badge>
    </div>
  );
}
