// Helper format ISO 8601 -> tampilan lokal (slice aman untuk offset +07:00 / Z)

export function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

export function formatTime(iso: string): string {
  return iso.slice(11, 16);
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} ${formatTime(iso)}`;
}
