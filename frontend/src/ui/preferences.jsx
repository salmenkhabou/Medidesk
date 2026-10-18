import React, { createContext, useContext, useEffect, useState } from "react";
const defaults = {
  theme: "system",
  contrast: false,
  motion: false,
  size: "standard",
  density: "comfortable",
};
const Context = createContext(null);
export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved =
        JSON.parse(localStorage.getItem("medidesk_preferences")) || {};
      return {
        theme: ["light", "dark", "system"].includes(saved.theme)
          ? saved.theme
          : defaults.theme,
        contrast: saved.contrast === true,
        motion: saved.motion === true,
        size: ["standard", "large", "larger"].includes(saved.size)
          ? saved.size
          : defaults.size,
        density: saved.density === "compact" ? "compact" : defaults.density,
      };
    } catch {
      return defaults;
    }
  });
  const [effectiveTheme, setEffectiveTheme] = useState(
    document.documentElement.dataset.theme || "light",
  );
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const root = document.documentElement;
      root.dataset.theme =
        preferences.theme === "system"
          ? media.matches
            ? "dark"
            : "light"
          : preferences.theme;
      setEffectiveTheme(root.dataset.theme);
      root.dataset.contrast = String(preferences.contrast);
      root.dataset.motion = preferences.motion ? "reduced" : "system";
      root.dataset.size = preferences.size;
      root.dataset.density = preferences.density;
      root.style.colorScheme = root.dataset.theme;
    };
    apply();
    media.addEventListener("change", apply);
    try {
      localStorage.setItem("medidesk_preferences", JSON.stringify(preferences));
    } catch {}
    return () => media.removeEventListener("change", apply);
  }, [preferences]);
  return (
    <Context.Provider
      value={{
        preferences,
        effectiveTheme,
        set: (key, value) => setPreferences((p) => ({ ...p, [key]: value })),
        reset: () => setPreferences(defaults),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const usePreferences = () => useContext(Context);
