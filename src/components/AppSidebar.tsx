import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Users,
  Layers,
  Brain,
  Plug,
  FileBarChart,
  Settings,
  Rocket,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { 
    title: "Setup", 
    url: "/setup", 
    icon: Rocket,
    disabled: false,
  },
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: LayoutDashboard,
    disabled: true,
  },
  { 
    title: "Business Map", 
    url: "/", 
    icon: Map,
    disabled: false,
  },
  { 
    title: "Actions", 
    url: "/actions", 
    icon: Users,
    disabled: false,
  },
  { 
    title: "Customer Profiles", 
    url: "/profiles", 
    icon: Users,
    disabled: true,
  },
  { 
    title: "Compositions", 
    url: "/compositions", 
    icon: Layers,
    disabled: true,
  },
  { 
    title: "Decisioning Assets", 
    url: "/decisioning", 
    icon: Brain,
    disabled: true,
  },
  { 
    title: "Integrations", 
    url: "/integrations", 
    icon: Plug,
    disabled: true,
  },
  { 
    title: "Analytics & Reports", 
    url: "/analytics", 
    icon: FileBarChart,
    disabled: true,
  },
  { 
    title: "Settings", 
    url: "/settings", 
    icon: Settings,
    disabled: true,
  },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild={!item.disabled}
                    disabled={item.disabled}
                    tooltip={item.title}
                  >
                    {item.disabled ? (
                      <div className="flex items-center gap-3 opacity-50 cursor-not-allowed">
                        <item.icon className="h-5 w-5" />
                        {open && <span>{item.title}</span>}
                      </div>
                    ) : (
                      <NavLink 
                        to={item.url} 
                        end
                        className={({ isActive }) => 
                          isActive 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                            : ""
                        }
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
