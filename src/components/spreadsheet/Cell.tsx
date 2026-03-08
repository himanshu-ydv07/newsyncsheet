import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CellProps {
  col: number;
  row: number;
  value: string;
  rawValue: string;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onEndEdit: (value: string) => void;
  onNavigate: (dir: "up" | "down" | "left" | "right") => void;
}

const Cell: React.FC<CellProps> = ({
  value,
  rawValue,
  isSelected,
  isEditing,
  onSelect,
  onStartEdit,
  onEndEdit,
  onNavigate,
}) => {
  const [editValue, setEditValue] = useState(rawValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditValue(rawValue);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isEditing, rawValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === "Enter") {
        onEndEdit(editValue);
        onNavigate("down");
      } else if (e.key === "Escape") {
        onEndEdit(rawValue);
      } else if (e.key === "Tab") {
        e.preventDefault();
        onEndEdit(editValue);
        onNavigate(e.shiftKey ? "left" : "right");
      }
      return;
    }

    switch (e.key) {
      case "ArrowUp": e.preventDefault(); onNavigate("up"); break;
      case "ArrowDown": e.preventDefault(); onNavigate("down"); break;
      case "ArrowLeft": e.preventDefault(); onNavigate("left"); break;
      case "ArrowRight": e.preventDefault(); onNavigate("right"); break;
      case "Enter": e.preventDefault(); onStartEdit(); break;
      case "Backspace":
      case "Delete":
        e.preventDefault();
        onEndEdit("");
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          onStartEdit();
          setEditValue(e.key);
        }
    }
  };

  return (
    <div
      className={cn(
        "h-8 border-r border-b border-cell-border font-mono text-sm px-1.5 flex items-center cursor-cell select-none overflow-hidden whitespace-nowrap",
        isSelected && !isEditing && "ring-2 ring-cell-selected ring-inset bg-primary/5",
        isEditing && "ring-2 ring-cell-editing ring-inset"
      )}
      style={{ minWidth: 100 }}
      onClick={onSelect}
      onDoubleClick={onStartEdit}
      onKeyDown={handleKeyDown}
      tabIndex={isSelected ? 0 : -1}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="w-full h-full bg-transparent outline-none font-mono text-sm text-foreground"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => onEndEdit(editValue)}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <span className="truncate text-foreground/90">
          {value}
        </span>
      )}
    </div>
  );
};

export default React.memo(Cell);
