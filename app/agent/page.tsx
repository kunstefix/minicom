"use client";

import { useChatStore } from "@/store/chat-store";
import { getDefaultAgent } from "@/lib/get-default-agent";
import { useAgentInbox } from "@/hooks/use-agent-inbox";
import { InboxList } from "@/components/minicom/inbox-list";
import { ThreadPanel } from "@/components/minicom/thread-panel";
import { useEffect } from "react";

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

  return (
    <main className="flex h-screen w-full">
      <aside className="flex w-80 shrink-0 flex-col min-h-0 border-r border-border">
        <div className="border-b border-border p-3">
          <h1 className="font-semibold">Inbox</h1>
        </div>
        <InboxList
          agentId={agentId}
          selectedThreadId={selectedThreadId}
          onSelectThread={(id) => selectThread(id)}
        />
      </aside>
      <section className="flex-1 flex flex-col min-w-0">
        <ThreadPanel
          threadId={selectedThreadId}
          onBack={() => selectThread(null)}
        />
      </section>
    </main>
  );
}
