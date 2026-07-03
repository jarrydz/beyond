const key = (profileId: string) => `onboarded:${profileId}`;

export function readOnboarded(profileId: string): boolean {
  try {
    return localStorage.getItem(key(profileId)) === '1';
  } catch {
    return false;
  }
}

export function writeOnboarded(profileId: string): void {
  try {
    localStorage.setItem(key(profileId), '1');
  } catch {
    // localStorage can be unavailable in private modes
  }
}
