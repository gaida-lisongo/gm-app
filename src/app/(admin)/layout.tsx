"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { useMentionsStore } from "@/store/mentionsStore";
import React, { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isLoading, fetchMentions } = useMentionsStore();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const mainContentMargin = isHomePage
    ? "ml-0"
    : isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  useEffect(() => {
    if (!isHomePage) {
      fetchMentions();
    }
  }, [fetchMentions, isHomePage]);

  if (!isHomePage && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen xl:flex">
      {!isHomePage && <AppSidebar />}
      {!isHomePage && <Backdrop />}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
