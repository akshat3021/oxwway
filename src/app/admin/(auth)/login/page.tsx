import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { LoginForm } from "../../_components/LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  if (await getCurrentUser()) redirect("/admin");
  const { expired } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 font-mono">
      <div className="w-full max-w-sm border border-foreground/10 bg-surface p-8">
        <div className="text-[10px] uppercase tracking-[0.25em] text-accent mb-3">[ SYS.ADMIN.AUTH ]</div>
        <h1 className="text-xl font-display uppercase tracking-wide mb-8">
          O<span className="text-accent">X</span>WAY Admin
        </h1>
        <LoginForm expired={expired === "1"} />
      </div>
    </main>
  );
}
