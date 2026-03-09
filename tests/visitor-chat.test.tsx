import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageComposer } from "@/components/minicom/message-composer";

describe("Visitor chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("MessageComposer calls onSend with trimmed content when submit", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<MessageComposer onSend={onSend} />);
    const input = screen.getByRole("textbox", { name: /message input/i });
    await userEvent.type(input, "  Hello  ");
    const sendBtn = screen.getByRole("button", { name: /send message/i });
    await userEvent.click(sendBtn);
    expect(onSend).toHaveBeenCalledWith("Hello");
  });

  it("MessageComposer does not call onSend when content is empty", async () => {
    const onSend = vi.fn();
    render(<MessageComposer onSend={onSend} />);
    const sendBtn = screen.getByRole("button", { name: /send message/i });
    expect(sendBtn).toBeDisabled();
    await userEvent.click(sendBtn);
    expect(onSend).not.toHaveBeenCalled();
  });
});
