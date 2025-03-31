"use client";

import { useBlipsStore } from "@/store/BlipStore"; // Ajusta la ruta si es necesario
import ClearBlipsForm from "./ClearBlipsForm";

interface AdminControlsProps {
  isAdmin: boolean;
  isDevEnv: boolean;
}

export default function AdminControls({
  isAdmin,
  isDevEnv,
}: AdminControlsProps) {
  const { clearAllBlips } = useBlipsStore();

  if (!isAdmin) return null;

  return (
    <div className="fixed top-16 left-4 z-20 text-gray-700 text-sm">
      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
        Admin
      </span>
      {isDevEnv && <ClearBlipsForm onBlipsCleared={clearAllBlips} />}
    </div>
  );
}
