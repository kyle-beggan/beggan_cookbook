import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { BookOpen, PlusCircle, Link as LinkIcon, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Beggan Family Cookbook",
  description: "Family recipes and more",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body
        className="antialiased min-h-screen flex flex-col bg-[var(--color-rustic-bg)] text-[var(--color-rustic-text)]"
      >
        <header className="bg-[var(--color-rustic-card)] border-b border-[var(--color-rustic-muted)]/20 shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-[var(--color-rustic-accent)] hover:opacity-80 transition-opacity">
              <BookOpen className="w-6 h-6" />
              <span>Beggan Family Cookbook</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              {user ? (
                <>
                  <Link href="/add" className="flex items-center gap-1.5 hover:text-[var(--color-rustic-accent)] transition-colors">
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Custom</span>
                  </Link>
                  <Link href="/import" className="flex items-center gap-1.5 hover:text-[var(--color-rustic-accent)] transition-colors">
                    <LinkIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Import URL</span>
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="flex items-center gap-1.5 text-[var(--color-rustic-muted)] hover:text-red-600 transition-colors">
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 opacity-50 cursor-not-allowed text-[var(--color-rustic-muted)]">
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Custom</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-50 cursor-not-allowed text-[var(--color-rustic-muted)]">
                    <LinkIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Import URL</span>
                  </div>
                  <Link href="/login" className="flex items-center gap-1.5 text-[var(--color-rustic-muted)] hover:text-[var(--color-rustic-accent)] transition-colors">
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
