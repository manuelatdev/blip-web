"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { clearAllBlipsAndBucket } from "../actions/blips";

interface ClearBlipsFormProps {
  onBlipsCleared?: () => void;
}

export default function ClearBlipsForm({
  onBlipsCleared,
}: ClearBlipsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    startTransition(async () => {
      try {
        await clearAllBlipsAndBucket();
        toast.success("Blips y bucket eliminados", {
          description:
            "Todos los blips y el bucket han sido eliminados con éxito.",
          duration: 3000,
        });
        console.log(
          "ClearBlipsForm: Action successful, calling onBlipsCleared"
        ); // Depuración
        setShowConfirm(false);
        if (onBlipsCleared) {
          onBlipsCleared(); // Dispara clearAllBlips del almacén
        }
      } catch (error) {
        console.error("Error al eliminar blips y bucket:", error);
        toast.error("Error al eliminar", {
          description:
            "No se pudo eliminar los blips y el bucket. Intenta de nuevo.",
          duration: 5000,
        });
        setShowConfirm(false);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      {showConfirm ? (
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full hover:bg-red-600"
          >
            {isPending ? "Eliminando..." : "Confirmar eliminación"}
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            className="text-xs bg-gray-300 text-black px-2 py-0.5 rounded-full hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isPending}
          className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full hover:bg-red-200"
        >
          Limpiar Todo
        </button>
      )}
    </form>
  );
}
