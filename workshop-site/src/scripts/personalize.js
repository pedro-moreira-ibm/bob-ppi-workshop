export function personalize(text, number) {
  if (!Number.isInteger(number) || number < 1 || number > 50) return text;
  const suffix = String(number).padStart(2, '0');
  return text.replace(/(FLGHT4|FLIGHT4|Flight4|flght4|flight4)nn\b/g, `$1${suffix}`)
    .replace(/\bFRS4nn\b/g, `FRS4${suffix}`)
    .replace(/\b30nn\b|<DEV_PORT>/g, String(3000 + number));
}
