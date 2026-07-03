const STORAGE_NAMESPACE = 'hrms_employee';
const TOKEN_KEY = 'token';

function storageKey(key) {
  return `${STORAGE_NAMESPACE}:${key}`;
}

export function getToken() {
  return localStorage.getItem(storageKey(TOKEN_KEY));
}

export function setToken(token) {
  localStorage.setItem(storageKey(TOKEN_KEY), token);
}

export function clearAuth() {
  localStorage.removeItem(storageKey(TOKEN_KEY));
  localStorage.removeItem(storageKey('user'));
}

export function setUser(user) {
  localStorage.setItem(storageKey('user'), JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem(storageKey('user'));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasRole(user, role) {
  return Array.isArray(user?.roles) && user.roles.includes(role);
}

export function getCompanyId() {
  return getUser()?.companyId ?? null;
}
