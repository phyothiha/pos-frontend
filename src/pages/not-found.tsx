import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";

export function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/dashboard" className={buttonVariants()}>
        Go to dashboard
      </Link>
    </main>
  );
}
