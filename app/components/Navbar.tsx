"use client";

import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiGoogle } from "react-icons/si";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();

  const avatarUrl = "/default-avatar.jpg";
  console.log("Navbar - Datos de la sesión:", session);
  console.log("Navbar - Estado:", status);

  return (
    <nav className="bg-white border-b border-gray-200 py-3 px-4 fixed top-0 left-0 right-0 z-10">
      <div className="max-w-xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">
          <Link href="/" className="hover:text-gray-700 transition">
            Blip
          </Link>
        </h1>
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <span className="text-gray-500 text-sm">Cargando...</span>
          ) : session ? (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={session.user?.image || avatarUrl}
                  alt="Avatar del usuario"
                />
                <AvatarFallback>
                  {session.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition text-sm"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition text-sm flex items-center gap-1"
            >
              <SiGoogle className="text-white text-base" />
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
