import { useState, useCallback, useRef, useEffect } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { SpreadsheetData, cellKey, computeAll } from "@/lib/formulaEngine";
import {
  collection,
  doc,
  onSnapshot,
  writeBatch,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export type SyncState = "editing" | "saving" | "saved";

export function useSpreadsheet(documentId: string, rows = 50, cols = 26) {
  const { user } = useAuth();
  const [data, setData] = useState<SpreadsheetData>({});
  const [selectedCell, setSelectedCell] = useState<{ col: number; row: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ col: number; row: number } | null>(null);
  const [syncState, setSyncState] = useState<SyncState>("saved");
  const [loading, setLoading] = useState(true);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();
  const localChanges = useRef<Set<string>>(new Set());

  // Real-time listener for cells subcollection
  useEffect(() => {
    if (!documentId) return;

    const cellsRef = collection(db, "documents", documentId, "cells");
    const unsubscribe = onSnapshot(cellsRef, (snapshot) => {
      setData((prev) => {
        const next = { ...prev };
        snapshot.docChanges().forEach((change) => {
          const cellData = change.doc.data();
          const key = change.doc.id;

          if (change.type === "removed") {
            delete next[key];
            return;
          }

          // Skip our own changes (already applied locally)
          if (localChanges.current.has(key)) {
            localChanges.current.delete(key);
            return;
          }

          next[key] = { value: cellData.value || "" };
        });
        return computeAll(next);
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [documentId]);

  const getCellValue = useCallback(
    (col: number, row: number): string => {
      const key = cellKey(col, row);
      const cell = data[key];
      if (!cell) return "";
      return cell.computedValue !== undefined ? String(cell.computedValue) : cell.value;
    },
    [data]
  );

  const getCellRawValue = useCallback(
    (col: number, row: number): string => {
      const key = cellKey(col, row);
      return data[key]?.value ?? "";
    },
    [data]
  );

  const setCellValue = useCallback(
    (col: number, row: number, value: string) => {
      const key = cellKey(col, row);
      setSyncState("editing");

      // Mark as local change so realtime listener skips it
      localChanges.current.add(key);

      // Optimistic local update
      setData((prev) => {
        const next = { ...prev, [key]: { value } };
        return computeAll(next);
      });

      // Debounced save to Firestore
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        setSyncState("saving");
        try {
          const cellDocRef = doc(db, "documents", documentId, "cells", key);
          if (value === "") {
            await deleteDoc(cellDocRef);
          } else {
            const batch = writeBatch(db);
            batch.set(cellDocRef, {
              value,
              updated_by: user?.uid || null,
              updated_at: serverTimestamp(),
            }, { merge: true });
            // Update document timestamp
            const docRef = doc(db, "documents", documentId);
            batch.update(docRef, { updated_at: serverTimestamp() });
            await batch.commit();
          }
        } catch (err) {
          console.error("Error saving cell:", err);
        }
        setSyncState("saved");
      }, 300);
    },
    [documentId, user?.uid]
  );

  const navigate = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      setSelectedCell((prev) => {
        if (!prev) return { col: 0, row: 0 };
        const { col, row } = prev;
        switch (direction) {
          case "up": return { col, row: Math.max(0, row - 1) };
          case "down": return { col, row: Math.min(rows - 1, row + 1) };
          case "left": return { col: Math.max(0, col - 1), row };
          case "right": return { col: Math.min(cols - 1, col + 1), row };
        }
      });
      setEditingCell(null);
    },
    [rows, cols]
  );

  return {
    data,
    selectedCell,
    editingCell,
    syncState,
    loading,
    rows,
    cols,
    setSelectedCell,
    setEditingCell,
    getCellValue,
    getCellRawValue,
    setCellValue,
    navigate,
  };
}
