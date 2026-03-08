import React, { useCallback, useEffect, useRef } from "react";
import Cell from "./Cell";
import { indexToCol } from "@/lib/formulaEngine";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import FormulaBar from "./FormulaBar";
import SyncIndicator from "./SyncIndicator";
import PresenceAvatars from "./PresenceAvatars";

const VISIBLE_ROWS = 30;
const VISIBLE_COLS = 26;

interface SpreadsheetGridProps {
  title: string;
  documentId: string;
}

const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({ title, documentId }) => {
  const {
    selectedCell,
    editingCell,
    syncState,
    loading,
    setSelectedCell,
    setEditingCell,
    getCellValue,
    getCellRawValue,
    setCellValue,
    navigate,
  } = useSpreadsheet(documentId, VISIBLE_ROWS, VISIBLE_COLS);

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      if (editingCell) return;
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case "ArrowUp": e.preventDefault(); navigate("up"); break;
        case "ArrowDown": e.preventDefault(); navigate("down"); break;
        case "ArrowLeft": e.preventDefault(); navigate("left"); break;
        case "ArrowRight": e.preventDefault(); navigate("right"); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, editingCell, navigate]);

  const handleFormulaChange = useCallback(
    (value: string) => {
      if (selectedCell) {
        setCellValue(selectedCell.col, selectedCell.row, value);
      }
    },
    [selectedCell, setCellValue]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Loading spreadsheet...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <h2 className="text-sm font-semibold text-foreground truncate">{title}</h2>
        <div className="flex items-center gap-3">
          <SyncIndicator state={syncState} />
          <PresenceAvatars documentId={documentId} />
        </div>
      </div>

      <FormulaBar
        selectedCell={selectedCell}
        rawValue={selectedCell ? getCellRawValue(selectedCell.col, selectedCell.row) : ""}
        onChange={handleFormulaChange}
      />

      <div ref={gridRef} className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          <div className="flex sticky top-0 z-10">
            <div className="w-12 h-8 bg-cell-header-bg border-r border-b border-cell-border flex-shrink-0" />
            {Array.from({ length: VISIBLE_COLS }, (_, c) => (
              <div
                key={c}
                className="h-8 border-r border-b border-cell-border bg-cell-header-bg flex items-center justify-center text-xs font-medium text-muted-foreground select-none"
                style={{ minWidth: 100 }}
              >
                {indexToCol(c)}
              </div>
            ))}
          </div>

          {Array.from({ length: VISIBLE_ROWS }, (_, r) => (
            <div key={r} className="flex">
              <div className="w-12 h-8 bg-cell-header-bg border-r border-b border-cell-border flex items-center justify-center text-xs font-medium text-muted-foreground select-none flex-shrink-0 sticky left-0 z-[5]">
                {r + 1}
              </div>
              {Array.from({ length: VISIBLE_COLS }, (_, c) => (
                <Cell
                  key={`${c}-${r}`}
                  col={c}
                  row={r}
                  value={getCellValue(c, r)}
                  rawValue={getCellRawValue(c, r)}
                  isSelected={selectedCell?.col === c && selectedCell?.row === r}
                  isEditing={editingCell?.col === c && editingCell?.row === r}
                  onSelect={() => { setSelectedCell({ col: c, row: r }); setEditingCell(null); }}
                  onStartEdit={() => { setSelectedCell({ col: c, row: r }); setEditingCell({ col: c, row: r }); }}
                  onEndEdit={(val) => { setCellValue(c, r, val); setEditingCell(null); }}
                  onNavigate={navigate}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetGrid;
