"use client";

import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiGoogle } from "react-icons/si";
import Link from "next/link";
import { useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();

  const defaultAvatarUrl = "/default-avatar.jpg";
  const userRole = session?.role || "USER";
  const isAdmin = userRole === "ADMIN";

  // Usar useEffect para depurar solo cuando la sesión o el estado cambien
  useEffect(() => {
    console.log("Navbar - Datos de la sesión (actualizados):", session);
    console.log("Navbar - Estado (actualizado):", status);
    console.log("Navbar - Rol (actualizado):", userRole);
  }, [session, status]); // Dependencias: se ejecuta cuando cambian session o status

  return (
    <nav className="bg-white border-b border-gray-200 py-2 sm:py-3 px-2 sm:px-4 fixed top-0 left-0 right-0 z-10">
      <div className="max-w-xl w-full mx-auto flex justify-between items-center">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
          <Link
            href="/"
            className="hover:text-gray-700 transition flex flex-row gap-x-1 items-center"
          >
            Blip
          </Link>
        </h1>
        <div className="flex items-center gap-3 min-w-0">
          {status === "loading" ? (
            <span className="text-gray-500 text-sm animate-pulse">
              Cargando...
            </span>
          ) : session ? (
            <>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage
                  src={session.user?.image || defaultAvatarUrl}
                  alt={
                    session.user?.name
                      ? `${session.user.name}'s avatar`
                      : "Avatar del usuario"
                  }
                />
                <AvatarFallback>
                  {session.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full hover:bg-red-600 transition text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap"
                aria-label="Cerrar sesión"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded-full hover:bg-blue-600 transition text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap"
              aria-label="Iniciar sesión con Google"
            >
              <SiGoogle className="text-white text-sm sm:text-base" />
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
