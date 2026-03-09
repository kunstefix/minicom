import type { Message } from "@/types/chat";
import { format, isToday, isYesterday } from "date-fns";

export interface MessageGroup {
  dateLabel: string;
  messages: Message[];
}

/**
 * Group messages by day for display (e.g. "Today", "Yesterday", "Mar 8, 2025").
 */
export function groupMessagesByDay(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  let currentDate: string | null = null;
  let currentMessages: Message[] = [];

  const toLabel = (date: Date) =>
    isToday(date)
      ? "Today"
      : isYesterday(date)
        ? "Yesterday"
        : format(date, "MMM d, yyyy");

  for (const msg of messages) {
    const d = new Date(msg.createdAt);
    const dateKey = d.toDateString();
    const label = toLabel(d);

    if (dateKey !== currentDate) {
      if (currentMessages.length > 0) {
        groups.push({
          dateLabel: toLabel(new Date(currentMessages[0].createdAt)),
          messages: currentMessages,
        });
      }
      currentDate = dateKey;
      currentMessages = [msg];
    } else {
      currentMessages.push(msg);
    }
  }
  if (currentMessages.length > 0) {
    groups.push({
      dateLabel: toLabel(new Date(currentMessages[0].createdAt)),
      messages: currentMessages,
    });
  }
  return groups;
}
