import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-lg font-semibold">404</h2>
      <p className="text-sm text-muted-foreground">This page could not be found.</p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
