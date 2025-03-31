"use client";

import CreateBlipForm from "../CreateBlipForm";
import BlipList from "./BlipList";
import { useBlipsStore } from "@/store/BlipStore";

interface BlipFeedProps {
  accessToken: string;
  isAdmin: boolean; // No lo usamos aquí, pero lo mantenemos por consistencia
  isDevEnv: boolean; // No lo usamos aquí, pero lo mantenemos por consistencia
}

export default function BlipFeed({ accessToken }: BlipFeedProps) {
  const { addNewBlip } = useBlipsStore();

  return (
    <>
      <section className="mb-6">
        <CreateBlipForm onBlipCreated={addNewBlip} />
      </section>
      <section>
        <BlipList accessToken={accessToken} />
      </section>
    </>
  );
}
