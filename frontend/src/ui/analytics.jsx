import React, { createContext, useContext, useEffect, useState } from "react";
const Context = createContext(null);
const publicPages = new Set(["directory", "application", "privacy"]);
function readChoice() {
  try {
    return ["accepted", "declined"].includes(
      localStorage.getItem("medidesk_analytics"),
    )
      ? localStorage.getItem("medidesk_analytics")
      : "unset";
  } catch {
    return "unset";
  }
}
export const trackingBlocked = () =>
  navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true;
export function AnalyticsProvider({ children }) {
  const [choice, setChoice] = useState(readChoice);
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "medidesk_analytics") setChoice(readChoice());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const choose = (value) => {
    try {
      localStorage.setItem("medidesk_analytics", value);
    } catch {}
    setChoice(value);
  };
  return (
    <Context.Provider value={{ choice, choose, blocked: trackingBlocked() }}>
      {children}
    </Context.Provider>
  );
}
export function usePageAnalytics(view) {
  const { choice, blocked } = useContext(Context);
  useEffect(() => {
    if (choice !== "accepted" || blocked || !publicPages.has(view)) return;
    const controller = new AbortController();
    const timer = setTimeout(
      () =>
        fetch("/api/analytics/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "omit",
          referrerPolicy: "no-referrer",
          body: JSON.stringify({ page: view, consent: true }),
          signal: controller.signal,
        }).catch(() => {}),
      0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [view, choice, blocked]);
}
export function AnalyticsChoice() {
  const titleId = React.useId();
  const { choice, choose, blocked } = useContext(Context);
  return (
    <section className="analytics-choice" aria-labelledby={titleId}>
      <h3 id={titleId}>Mesure d’audience facultative</h3>
      <p>
        Autoriser uniquement le comptage agrégé des pages publiques, sans
        identifiant de compte ni contenu médical. Aucun suivi publicitaire.
      </p>
      <p className="choice-status" role="status">
        {blocked
          ? "Le signal de confidentialité de votre navigateur est respecté : aucune mesure d’audience n’est envoyée."
          : choice === "accepted"
            ? "Votre choix : mesure d’audience autorisée."
            : choice === "declined"
              ? "Votre choix : mesure d’audience refusée."
              : "Aucune mesure d’audience tant que vous ne l’autorisez pas."}
      </p>
      <div className="button-row">
        <button
          className="button primary"
          disabled={blocked || choice === "accepted"}
          onClick={() => choose("accepted")}
        >
          Autoriser la mesure d’audience
        </button>
        <button className="button secondary" onClick={() => choose("declined")}>
          {choice === "accepted"
            ? "Retirer mon accord"
            : "Refuser la mesure d’audience"}
        </button>
      </div>
    </section>
  );
}
