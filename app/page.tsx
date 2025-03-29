import { auth } from "@/auth"; // Importa desde tu archivo auth.ts
import { getLatestBlips } from "./actions";
import Blip from "./components/Blip";
import CreateBlipForm from "./components/CreateBlipForm";
import Navbar from "./components/Navbar";

interface BlipData {
  blipId: string;
  content: string;
  userId: string;
  timestamp: string;
}

export default async function Home() {
  const session = await auth(); // Obtiene la sesión en el servidor
  const blips = await getLatestBlips();

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />{" "}
      {/* Navbar usará la sesión del cliente, pero SSR debería funcionar */}
      <div className="max-w-xl mx-auto px-4 pt-16 pb-6">
        <section className="mb-6">
          <CreateBlipForm />
        </section>
        <section>
          <div className="space-y-0">
            {blips.map((blip: BlipData) => (
              <Blip
                key={blip.blipId}
                content={blip.content}
                userId={blip.userId}
                timestamp={blip.timestamp}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
