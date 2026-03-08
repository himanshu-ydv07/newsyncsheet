import React from "react";
import { SyncState } from "@/hooks/useSpreadsheet";
import { Check, Loader2, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

const SyncIndicator: React.FC<{ state: SyncState }> = ({ state }) => {
  const config = {
    editing: { icon: Edit3, label: "Editing", className: "text-primary" },
    saving: { icon: Loader2, label: "Saving...", className: "text-saving animate-pulse-soft" },
    saved: { icon: Check, label: "Saved", className: "text-synced" },
  };

  const { icon: Icon, label, className } = config[state];

  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-medium", className)}>
      <Icon className={cn("w-3.5 h-3.5", state === "saving" && "animate-spin")} />
      {label}
    </div>
  );
};

export default SyncIndicator;
