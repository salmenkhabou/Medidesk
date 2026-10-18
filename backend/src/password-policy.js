// Applied only when setting a password; existing accounts can still sign in.
export function validPassword(value) {
  return typeof value === 'string' && [...value].length >= 8 &&
    Buffer.byteLength(value, 'utf8') <= 72 && /\p{Lu}/u.test(value) &&
    /\p{Ll}/u.test(value) && /[0-9]/.test(value) && /[^\p{L}\p{N}\s]/u.test(value);
}
export const passwordHelp = 'Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial ; au maximum 72 octets.';
