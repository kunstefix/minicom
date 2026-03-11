import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ChatLauncher } from "@/components/minicom/chat-launcher";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-border h-16">
        <div className="w-full max-w-4xl flex justify-between items-center px-4 sm:px-6">
          <Link
            href="/"
            className="font-semibold text-lg text-foreground hover:opacity-80"
          >
            Minicom
          </Link>
          <ThemeSwitcher />
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-center max-w-2xl">
          Lightweight chat for your product
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-center max-w-xl">
          Embed a chat bubble, manage conversations in one place. No bloat, just
          you and your users.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/agent"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open inbox
          </Link>
        </div>
      </div>

      <footer className="w-full flex items-center justify-center border-t border-border py-8 text-sm text-muted-foreground">
        <span>Minicom</span>
      </footer>

      <ChatLauncher />
    </main>
  );
}
