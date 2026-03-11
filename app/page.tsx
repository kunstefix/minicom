import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ChatLauncher } from "@/components/minicom/chat-launcher";

const REPO_URL = "https://github.com/kunstefix/minicom";
const ICON_SIZE = 16;

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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/sign-up">Sign up</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View repository on GitHub"
              >
                <Github size={ICON_SIZE} className="text-muted-foreground" />
              </a>
            </Button>
            <ThemeSwitcher />
          </div>
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
        <span>MiniCom</span>
      </footer>

      <ChatLauncher />
    </main>
  );
}
