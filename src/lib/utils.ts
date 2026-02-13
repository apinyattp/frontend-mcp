export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const GRADIENTS = [
  "linear-gradient(135deg,#6c5ce7,#4834d4)",
  "linear-gradient(135deg,#00b894,#00a381)",
  "linear-gradient(135deg,#e17055,#d63031)",
  "linear-gradient(135deg,#fdcb6e,#e5a100)",
  "linear-gradient(135deg,#74b9ff,#0984e3)",
  "linear-gradient(135deg,#a29bfe,#6c5ce7)",
  "linear-gradient(135deg,#fd79a8,#e84393)",
  "linear-gradient(135deg,#55efc4,#00b894)",
];

export function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

// Color for group icon backgrounds (deterministic from name)
const GROUP_COLORS = [
  "rgba(108,92,231,0.12)",
  "rgba(0,184,148,0.1)",
  "rgba(253,203,110,0.12)",
  "rgba(225,112,85,0.12)",
  "rgba(116,185,255,0.12)",
  "rgba(162,155,254,0.12)",
];

export function getGroupColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GROUP_COLORS[Math.abs(hash) % GROUP_COLORS.length];
}
