import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileSpreadsheet, Clock, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

interface Document {
  id: string;
  title: string;
  owner_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "documents"),
      where("owner_id", "==", user.uid),
      orderBy("updated_at", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const documents: Document[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Document[];
      setDocs(documents);
      setLoading(false);
    }, (error) => {
      toast.error(error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createDoc = async () => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, "documents"), {
        owner_id: user.uid,
        title: "Untitled Sheet",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      navigate(`/sheet/${docRef.id}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteDocument = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "documents", id));
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp?.toDate) return "Just now";
    const diff = Date.now() - timestamp.toDate().getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">SyncSheet</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={createDoc}>
              <Plus className="w-4 h-4" />
              New Sheet
            </Button>
            <Button size="sm" variant="ghost" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
          Your Documents
        </h2>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : docs.length === 0 ? (
          <div className="text-center py-16">
            <FileSpreadsheet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No sheets yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {docs.map((d) => (
              <button
                key={d.id}
                onClick={() => navigate(`/sheet/${d.id}`)}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{d.title}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(d.updated_at)}
                  </div>
                  {d.owner_id === user?.uid && (
                    <button
                      onClick={(e) => deleteDocument(e, d.id)}
                      className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
