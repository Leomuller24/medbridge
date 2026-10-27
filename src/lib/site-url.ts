// The app's published address. Fill in once the app is published;
// until then, confirmation links return to the address the user signed up from.
export const PUBLISHED_URL = "";

export function authRedirectUrl(): string {
  return PUBLISHED_URL || window.location.origin;
}
