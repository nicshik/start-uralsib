/**
 * Detects gender from Russian patronymic (отчество).
 * Patronymic endings are deterministic in Russian:
 *   -овна, -евна, -ична, -инична → Женский
 *   -ович, -евич, -ич             → Мужской
 * Returns null if patronymic is absent or unrecognised.
 */
export function detectGender(middleName?: string): "Мужской" | "Женский" | null {
  if (!middleName?.trim()) return null;
  const m = middleName.trim().toLowerCase();
  if (
    m.endsWith("овна") ||
    m.endsWith("евна") ||
    m.endsWith("ична") ||
    m.endsWith("инична") ||
    m.endsWith("ьична")
  ) {
    return "Женский";
  }
  if (
    m.endsWith("ович") ||
    m.endsWith("евич") ||
    m.endsWith("ич")
  ) {
    return "Мужской";
  }
  return null;
}
