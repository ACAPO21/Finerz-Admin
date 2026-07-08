export function formatDate(value: string | null | undefined): string {
  if (!value) return "Aucune donnée";
  return new Date(value).toLocaleString("fr-FR");
}
