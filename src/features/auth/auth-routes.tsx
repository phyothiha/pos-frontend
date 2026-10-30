import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./queries";
import { Button } from "@/components/ui/button";
import { clearSession } from "./session";

function SessionStatus() {
  const auth = useAuth();
  if (!auth.error) {
    return (
      <div className="flex min-h-svh items-center justify-center" role="status">
        Loading your account…
      </div>
    );
  }
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <p role="alert">Unable to connect. Please try again.</p>
      <Button onClick={() => window.location.reload()}>
        Try again
      </Button>
      <Button variant="outline" onClick={clearSession}>Back to login</Button>
    </div>
  );
}

export function RequireAuth() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.loading || auth.error) return <SessionStatus />;
  if (!auth.user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  return <Outlet />;
}

export function GuestOnly() {
  const auth = useAuth();
  const location = useLocation();
  const from: unknown = location.state?.from;
  const destination =
    typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//") &&
    from !== "/"
      ? from
      : "/dashboard";

  if (auth.loading || auth.error) return <SessionStatus />;
  if (!auth.user) return <Outlet />;
  return <Navigate to={destination} replace />;
}
