import React, { useEffect, useState } from "react";
import { rtdb } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { ref, onValue, set, onDisconnect, serverTimestamp } from "firebase/database";

const COLORS = [
  "hsl(var(--presence-1))",
  "hsl(var(--presence-2))",
  "hsl(var(--presence-3))",
  "hsl(var(--presence-4))",
];

interface PresenceUser {
  user_id: string;
  display_name: string;
}

const PresenceAvatars: React.FC<{ documentId: string }> = ({ documentId }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!documentId || !user) return;

    const displayName = user.displayName || user.email?.split("@")[0] || "User";

    // Set our presence
    const userPresenceRef = ref(rtdb, `presence/${documentId}/${user.uid}`);
    set(userPresenceRef, {
      display_name: displayName,
      online: true,
      last_seen: serverTimestamp(),
    });

    // Remove presence on disconnect
    onDisconnect(userPresenceRef).remove();

    // Listen for all presence in this document
    const presenceRef = ref(rtdb, `presence/${documentId}`);
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const present: PresenceUser[] = [];
      snapshot.forEach((child) => {
        const data = child.val();
        if (data?.online) {
          present.push({
            user_id: child.key!,
            display_name: data.display_name || "User",
          });
        }
      });
      setUsers(present);
    });

    return () => {
      // Clean up presence
      set(userPresenceRef, null);
      unsubscribe();
    };
  }, [documentId, user]);

  return (
    <div className="flex items-center -space-x-1.5">
      {users.map((u, i) => (
        <div
          key={u.user_id}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-card"
          style={{ backgroundColor: COLORS[i % COLORS.length], color: "white" }}
          title={u.display_name}
        >
          {u.display_name[0]?.toUpperCase()}
        </div>
      ))}
      {users.length > 0 && (
        <span className="pl-2.5 text-xs text-muted-foreground">{users.length} online</span>
      )}
    </div>
  );
};

export default PresenceAvatars;
