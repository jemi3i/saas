
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  CreditCard,
  PieChart,
  Zap,
  X,
  History,
  Users2,
  Database,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../atoms/Button';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const user = useAuthStore(state => state.user);

  const allNavItems = [
    // 1. Platform Admin (PLATFORM_ADMIN)
    { 
      name: 'System Admin', 
      icon: Database, 
      path: '/admin/system', 
      roles: [Role.PLATFORM_ADMIN] 
    },
    { 
      name: 'System Logs', 
      icon: History, 
      path: '/audit-logs', 
      roles: [Role.PLATFORM_ADMIN] 
    },
    
    // Common Dashboard Access
    { 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard', 
      roles: [Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN, Role.ACCOUNTANT, Role.TEAM_MEMBER] 
    },
    
    // 4. Accountant (ACCOUNTANT) & Owner
    { 
      name: 'Invoices', 
      icon: FileText, 
      path: '/invoices', 
      roles: [Role.BUSINESS_OWNER, Role.ACCOUNTANT, Role.CLIENT_EXTERNAL] 
    },
    { 
      name: 'Expenses', 
      icon: CreditCard, 
      path: '/expenses', 
      roles: [Role.BUSINESS_OWNER, Role.ACCOUNTANT] 
    },
    { 
      name: 'Financial Reports', 
      icon: PieChart, 
      path: '/reports', 
      roles: [Role.BUSINESS_OWNER, Role.ACCOUNTANT] 
    },
    
    // 3. Business Admin (BUSINESS_ADMIN) & Owner
    { 
      name: 'Clients (CRM)', 
      icon: Users, 
      path: '/clients', 
      roles: [Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN, Role.ACCOUNTANT] 
    },
    { 
      name: 'Team Management', 
      icon: Users2, 
      path: '/team', 
      roles: [Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN] 
    },
    { 
      name: 'Audit Logs', 
      icon: History, 
      path: '/audit-logs', 
      roles: [Role.BUSINESS_OWNER] 
    },
    { 
      name: 'Settings', 
      icon: Settings, 
      path: '/settings', 
      roles: [Role.BUSINESS_OWNER, Role.BUSINESS_ADMIN] 
    },
  ];

  const filteredNavItems = allNavItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 border-r bg-card flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 font-bold text-2xl text-primary">
            <Zap className="fill-primary h-6 w-6" />
            <span className="tracking-tight">Nova SaaS</span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {user?.role === Role.PLATFORM_ADMIN ? 'System Control' : 'Operations'}
          </p>
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => { if(window.innerWidth < 768) onClose(); }}
              className={({ isActive }) => cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-transform group-hover:scale-110",
                location.pathname.startsWith(item.path) ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t">
          <div className={cn(
            "rounded-xl p-4 border",
            user?.role === Role.PLATFORM_ADMIN 
              ? "bg-primary/10 border-primary/20" 
              : "bg-emerald-500/10 border-emerald-500/20"
          )}>
            <div className="flex items-center gap-1.5 mb-1">
               {user?.role === Role.PLATFORM_ADMIN ? (
                 <ShieldAlert className="h-3 w-3 text-primary" />
               ) : (
                 <ShieldCheck className="h-3 w-3 text-emerald-600" />
               )}
               <p className={cn(
                 "text-[10px] font-black uppercase tracking-widest",
                 user?.role === Role.PLATFORM_ADMIN ? "text-primary" : "text-emerald-700"
               )}>
                {user?.role.replace('_', ' ')}
               </p>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {user?.role === Role.PLATFORM_ADMIN 
                ? "SaaS Master Authority Active." 
                : "Tunisian Data Sovereignty compliant environment."}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
