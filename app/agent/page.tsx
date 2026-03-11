"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chat-store";
import { getDefaultAgent } from "@/lib/get-default-agent";
import { useAgentInbox } from "@/hooks/use-agent-inbox";
import { InboxList } from "@/components/minicom/inbox-list";
import { ThreadPanel } from "@/components/minicom/thread-panel";
import { cn } from "@/lib/utils";

export default function AgentPage() {
  const agentId = "demo-agent";
  const selectedThreadId = useChatStore((s) => s.selectedThreadId);
  const selectThread = useChatStore((s) => s.selectThread);
  const setViewer = useChatStore((s) => s.setViewer);
  const upsertParticipant = useChatStore((s) => s.upsertParticipant);

  useAgentInbox(agentId);

  useEffect(() => {
    getDefaultAgent().then((agent) => {
      if (agent) {
        upsertParticipant(agent);
        setViewer(agent);
      }
    });
  }, [setViewer, upsertParticipant]);

  const showList = !selectedThreadId;
  const showPanel = selectedThreadId;

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden sm:flex-row">
      <aside
        className={cn(
          "flex min-h-0 flex-col border-border w-full flex-1 sm:w-60 sm:flex-none sm:shrink-0 sm:border-r sm:overflow-hidden",
          !showList && "hidden sm:flex"
        )}
      >
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3 py-2">
          <h1 className="truncate font-semibold">Inbox</h1>
        </div>
        <InboxList
          agentId={agentId}
          selectedThreadId={selectedThreadId}
          onSelectThread={(id) => selectThread(id)}
        />
      </aside>
      <section
        className={cn(
          "flex min-h-0 flex-1 flex-col min-w-0",
          !showPanel && "hidden sm:flex"
        )}
      >
        <ThreadPanel
          threadId={selectedThreadId}
          onBack={() => selectThread(null)}
        />
      </section>
    </main>
  );
}
