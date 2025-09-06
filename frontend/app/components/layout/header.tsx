// frontend/app/component/layout/header.tsx
import { useAuth } from "@/provider/auth-context";
import { Button } from "../ui/button";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Link, useNavigate } from "react-router";
import { BarChart3 } from "lucide-react";
import { memo } from "react";

interface HeaderProps {
  onProjectSelect?: (project: any) => void;
  selectedProject?: any;
}

// Memoize the Header component to prevent unnecessary re-renders
const HeaderComponent = memo(({ onProjectSelect, selectedProject }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  return (
    <div className="bg-background sticky top-0 z-40 border-b">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center">
          {/* <BarChart3 className="h-6 w-6 text-blue-600 mr-2" /> */}
          <h1 className="text-xl font-bold"></h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full border p-1 w-8 h-8">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profilePicture} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/user/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});

HeaderComponent.displayName = 'Header';

// Export the component with the name 'Header'
export { HeaderComponent as Header };