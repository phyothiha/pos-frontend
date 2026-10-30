import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useLogout } from "@/features/auth/queries";

export function NavUser() {
  const { user } = useAuth();
  const logout = useLogout();
  if (!user) return null;

  async function handleLogout() {
    try {
      await logout.mutateAsync();
    } catch {
      toast.error("Unable to log out. Please try again.");
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.username}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            side="right"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem
              disabled={logout.isPending}
              onClick={() => void handleLogout()}
            >
              <LogOutIcon />
              {logout.isPending ? "Logging out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
