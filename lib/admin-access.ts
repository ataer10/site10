/**
 * Admin e-posta beyaz listesi.
 * Yalnızca bu e-postalar /admin'e girebilir (kimliği doğrulanmış olsa bile).
 * Liste env ile genişletilebilir: ADMIN_EMAILS="a@x.com,b@y.com"
 * server-only YOK — proxy (edge) ve sunucu tarafında kullanılır.
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "info@muratboyraz.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
