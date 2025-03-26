import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BlipProps {
  content: string;
  userId: string;
  timestamp: string;
}

const ANONYMOUS_USER_ID = "550e8400-e29b-41d4-a716-446655440000"; // solución temporal

// Función para calcular el tiempo relativo
function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "hace unos segundos";
  if (diffHours < 1) return `hace ${diffMinutes} min`;
  if (diffDays < 1) return `hace ${diffHours} h`;
  if (diffDays < 30) return `hace ${diffDays} d`;

  // Si es más de un mes, mostrar fecha completa
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Blip({ content, userId, timestamp }: BlipProps) {
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const displayName = userId === ANONYMOUS_USER_ID ? "Blipper" : `@${userId.slice(0, 8)}`;
  const avatarUrl = "/default-avatar.jpg";
  const relativeTime = getRelativeTime(timestamp);

  return (
    <div className="py-4 border-b border-gray-200 hover:bg-gray-50 transition">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} alt={`${displayName}'s avatar`} />
          <AvatarFallback>{displayName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900 text-[15px]">{displayName}</span>
            <span className="text-gray-500 text-[13px]">· {relativeTime}</span>
          </div>
          <p className="text-gray-900 text-[15px] leading-5 mt-1 whitespace-pre-wrap">
            {content}
          </p>
          <span className="text-gray-400 text-[12px] mt-1 block" title={formattedDate}>
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}