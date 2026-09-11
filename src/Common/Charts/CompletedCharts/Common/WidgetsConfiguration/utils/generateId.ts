export function generateId(length = 6) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  return Array.from(array, (num) =>
    charset[num % charset.length]
  ).join("");
}
