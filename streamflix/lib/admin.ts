function getAdminSetting(name: "ADMIN_USERNAME" | "ADMIN_PASSWORD" | "ADMIN_SESSION_SECRET", developmentFallback: string) {
  const value = process.env[name];

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} must be configured in the production environment.`);
  }

  return developmentFallback;
}

export function getAdminUsername() {
  return getAdminSetting("ADMIN_USERNAME", "admin");
}

export function getAdminPassword() {
  return getAdminSetting("ADMIN_PASSWORD", "streamflex123");
}

export function getAdminSessionSecret() {
  return getAdminSetting("ADMIN_SESSION_SECRET", "streamflex-dev-secret");
}

export function createAdminSessionToken(username: string) {
  return Buffer.from(`${username}:${getAdminSessionSecret()}`).toString("base64url");
}

export function isAdminAuthenticated(token?: string) {
  if (!token) return false;

  const expected = createAdminSessionToken(getAdminUsername());
  return token === expected;
}
