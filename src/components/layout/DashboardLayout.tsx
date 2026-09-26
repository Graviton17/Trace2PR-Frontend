import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  const sidebarWidth = !isCollapsed || isHovered ? 240 : 72;

  return (
    <div className="min-h-screen bg-[var(--page)] flex font-[var(--sans)] overflow-hidden">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        isHovered={isHovered}
        setIsHovered={setIsHovered}
      />
      
      <motion.div 
        layout
        initial={false}
        animate={{ paddingLeft: sidebarWidth }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="flex-1 flex flex-col min-w-0 h-screen"
      >
        <Topbar />
        
        <main className="flex-1 overflow-auto p-6 bg-[var(--page-deep)] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}
