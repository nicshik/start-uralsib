import { useNavigate } from "react-router-dom";
import { User, FileText, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/context/AppContext";


interface UserMenuProps {
  variant?: "light" | "dark";
}

export function UserMenu({ variant = "dark" }: UserMenuProps) {
  const navigate = useNavigate();
  const { state, clearDraft } = useApp();

  const avatarBg = variant === "dark" ? "bg-white/20 hover:bg-white/30" : "bg-primary/10 hover:bg-primary/20";
  const avatarText = variant === "dark" ? "text-white" : "text-primary";

  const handleLogout = () => {
    clearDraft();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center justify-center w-9 h-9 rounded-full ${avatarBg} ${avatarText} text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50`}
          aria-label="Меню пользователя"
        >
          <User className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {state.phone && (
          <>
            <div className="px-3 py-2 text-xs text-muted-foreground truncate">{state.phone}</div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => navigate("/my-applications")}>
          <FileText className="h-4 w-4 mr-2" />
          Мои заявки
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
