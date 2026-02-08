import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../organisms/Sidebar';
import Navbar from '../organisms/Navbar';
import { ShieldCheck } from 'lucide-react';
import { useBusinessStore } from '../../store/businessStore';
import { useEnterpriseStore } from '../../store/enterpriseStore';
import { useAuthStore } from '../../store/authStore';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { fetchBusinesses } = useBusinessStore();
  const { fetchMyEnterprise } = useEnterpriseStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchBusinesses();
      fetchMyEnterprise();
    }
  }, [isAuthenticated, fetchBusinesses, fetchMyEnterprise]);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-1 flex-col md:pl-64 transition-all duration-300">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6 px-4 md:px-8 max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Outlet />
          </div>
        </main>

        <footer className="py-6 px-8 border-t bg-muted/20">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2024 Nova SaaS Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Compliance: Tunisian Data Sovereignty Law - Physical Storage In Tunisia
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
