import { auth } from "@/auth";
import BlipFeed from "./components/BlipFeed";
import Navbar from "./components/Navbar";
import AdminControls from "./components/AdminControls";

export default async function Home() {
  const session = await auth();

  const userRole = session?.role || "USER";
  const isAdmin = userRole === "ADMIN";
  const isDevEnv = process.env.NODE_ENV === "development";

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <AdminControls isAdmin={isAdmin && !!session} isDevEnv={isDevEnv} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6">
        <BlipFeed
          accessToken={session?.accessToken || ""}
          isAdmin={isAdmin && !!session}
          isDevEnv={isDevEnv}
        />
      </div>
    </div>
  );
}
