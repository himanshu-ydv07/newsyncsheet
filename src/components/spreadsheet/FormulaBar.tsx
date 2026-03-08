import React, { useState, useEffect } from "react";
import { indexToCol } from "@/lib/formulaEngine";

interface FormulaBarProps {
  selectedCell: { col: number; row: number } | null;
  rawValue: string;
  onChange: (value: string) => void;
}

const FormulaBar: React.FC<FormulaBarProps> = ({ selectedCell, rawValue, onChange }) => {
  const [value, setValue] = useState(rawValue);

  useEffect(() => {
    setValue(rawValue);
  }, [rawValue, selectedCell]);

  const cellRef = selectedCell
    ? `${indexToCol(selectedCell.col)}${selectedCell.row + 1}`
    : "";

  return (
    <div className="flex items-center border-b border-border bg-card px-2 gap-2">
      <div className="w-16 h-8 flex items-center justify-center text-xs font-mono font-medium text-muted-foreground bg-muted rounded-sm my-1">
        {cellRef}
      </div>
      <span className="text-muted-foreground text-sm">ƒ</span>
      <input
        className="flex-1 h-8 bg-transparent outline-none text-sm font-mono text-foreground placeholder:text-muted-foreground"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onChange(value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange(value);
          }
        }}
        placeholder="Enter a value or formula (e.g. =SUM(A1:A5))"
      />
    </div>
  );
};

export default FormulaBar;
