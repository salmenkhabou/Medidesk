let token = sessionStorage.getItem("medidesk_session");
export function saveToken(value) {
  token = value;
  if (value) sessionStorage.setItem("medidesk_session", value);
  else sessionStorage.removeItem("medidesk_session");
}
export async function api(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    signal,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/"))
      window.dispatchEvent(new Event("medidesk:unauthorized"));
    throw new Error(
      data.message || "Le service est momentanément indisponible.",
    );
  }
  return data;
}
