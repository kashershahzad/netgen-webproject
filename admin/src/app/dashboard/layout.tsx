"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-surface">
        <Sidebar />
        <main className="flex-1 min-w-0 pt-16 lg:pt-0">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
