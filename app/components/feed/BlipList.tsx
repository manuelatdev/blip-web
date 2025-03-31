// components/feed/BlipList.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import Blip from "../blip/Blip";
import { BlipResponse, getBlipsBeforeTimestamp } from "../../actions/blips";
import { useBlipsStore } from "../../../store/BlipStore";

interface BlipListProps {
  accessToken: string;
}

export default function BlipList({ accessToken }: BlipListProps) {
  const {
    blips,
    cursor,
    hasMore,
    setBlips,
    appendBlips,
    setCursor,
    setHasMore,
  } = useBlipsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchBlips = async (initialLoad = false) => {
    if (isLoading || (!hasMore && !initialLoad)) return;

    setIsLoading(true);
    try {
      const limit = 10;
      console.log("Fetching blips with cursor:", cursor);
      const result = await getBlipsBeforeTimestamp(limit, cursor);

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch blips");
      }

      const fetchedBlips = result.blips;
      console.log("Fetched blips:", JSON.stringify(fetchedBlips, null, 2));

      if (fetchedBlips.length === 0) {
        setHasMore(false);
      } else {
        if (initialLoad) {
          setBlips(fetchedBlips); // Carga inicial: reemplaza los blips
        } else {
          appendBlips(fetchedBlips); // Carga posterior: agrega los blips
        }
        setCursor(fetchedBlips[fetchedBlips.length - 1].timestamp);
        console.log(
          "New cursor set to:",
          fetchedBlips[fetchedBlips.length - 1].timestamp
        );
      }
    } catch (error) {
      console.error("Failed to fetch blips:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      if (initialLoad) setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    console.log("Component mounted, initial fetch with cursor:", cursor);
    fetchBlips(true);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          console.log("Intersection observed, fetching more blips");
          fetchBlips();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, cursor, isLoading]);

  return (
    <div className="space-y-1">
      {isInitialLoad && isLoading ? (
        <div className="flex justify-center items-center py-4">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : blips.length > 0 ? (
        blips.map((blip) => (
          <Blip
            key={blip.blipId}
            blipId={blip.blipId}
            content={blip.content}
            imageUrl1={blip.imageUrl1}
            imageUrl2={blip.imageUrl2}
            imageUrl3={blip.imageUrl3}
            imageUrl4={blip.imageUrl4}
            userId={blip.userId}
            displayName={blip.displayName}
            profilePictureUrl={blip.profilePictureUrl}
            timestamp={blip.timestamp}
            accessToken={accessToken}
          />
        ))
      ) : !hasMore ? (
        <p className="text-gray-500 text-center py-8">
          No hay blips disponibles por ahora.
        </p>
      ) : null}

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="h-10 flex justify-center items-center"
        >
          {isLoading && !isInitialLoad ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
          ) : null}
        </div>
      )}
    </div>
  );
}
