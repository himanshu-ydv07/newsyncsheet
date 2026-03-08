import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SpreadsheetGrid from "@/components/spreadsheet/SpreadsheetGrid";
import { ArrowLeft, FileSpreadsheet, Pencil } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

const SheetEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("Loading...");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "documents", id)).then((snap) => {
      if (!snap.exists()) {
        toast.error("Document not found");
        navigate("/");
      } else {
        setTitle(snap.data().title || "Untitled Sheet");
      }
    });
  }, [id, navigate]);

  const saveTitle = async () => {
    if (!titleInput.trim() || !id) return;
    try {
      await updateDoc(doc(db, "documents", id), { title: titleInput.trim() });
      setTitle(titleInput.trim());
    } catch (err: any) {
      toast.error(err.message);
    }
    setEditingTitle(false);
  };

  if (!id) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card flex-shrink-0">
        <button
          onClick={() => navigate("/")}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-primary" />
          {editingTitle ? (
            <input
              className="text-sm font-semibold text-foreground bg-transparent border-b border-primary outline-none"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === "Enter" && saveTitle()}
              autoFocus
            />
          ) : (
            <button
              onClick={() => { setTitleInput(title); setEditingTitle(true); }}
              className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors group"
            >
              {title}
              <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 p-2 overflow-hidden">
        <SpreadsheetGrid title={title} documentId={id} />
      </div>
    </div>
  );
};

export default SheetEditor;
