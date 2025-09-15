import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/auth-context";
import {
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  ListCheck,
  LogOut,
  Settings,
  Users,
  Mail,
  Plus,
  Wrench,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarNav } from "./sidebar-nav";

export const SidebarComponent = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ];
    
    if (user?.role === "manager") {
      // Managers can see and access everything
      baseItems.push(
        {
          title: "Create Project",
          href: "/projects",
          icon: Plus,
        },
        {
          title: "Create Stages",
          href: "/stages",
          icon: Plus,
        },
        {
          title: "Emails",
          href: "/emails",
          icon: Mail,
        }
      );
    } else {
      // Regular users can only view projects
      baseItems.push(
        {
          title: "Projects",
          href: "/projects",
          icon: Plus,
        }
      );
    }
    
    // Both roles can access these
    baseItems.push(
      {
        title: "User Profile",
        href: "/user/profile",
        icon: Users,
      }
      // ,
      // {
      //   title: "Settings",
      //   href: "/settings",
      //   icon: Settings,
      // }
    );
    
    return baseItems;
  };
  
  const navItems = getNavItems();
  
  return (
    <div
      className={cn(
        "flex flex-col border-r bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16 md:w-[80px]" : "w-16 md:w-[240px]"
      )}
    >
      <div className="flex h-14 items-center border-b px-4 mb-4">
        <Link to="/dashboard" className="flex items-center">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <BarChart3 className="size-6 text-blue-600" />
              <span className="font-semibold text-lg hidden md:block">
                TaskHub
              </span>
            </div>
          )}
          {isCollapsed && <BarChart3 className="size-6 text-blue-600" />}
        </Link>
        <Button
          variant={"ghost"}
          size="icon"
          className="ml-auto hidden md:block"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <ChevronsLeft className="size-4" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        <SidebarNav
          items={navItems}
          isCollapsed={isCollapsed}
          className={cn(isCollapsed && "items-center space-y-2")}
        />
      </ScrollArea>
      <div className="mt-auto px-3 py-2">
        <Button
          variant={"ghost"}
          size={isCollapsed ? "icon" : "default"}
          className="w-full"
          onClick={logout}
        >
          <LogOut className={cn("size-4 mr-2", isCollapsed && "mr-0")} />
          {!isCollapsed && <span className="hidden md:block">Logout</span>}
        </Button>
      </div>
    </div>
  );
};