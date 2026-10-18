import { AnalyticsChoice } from "./analytics";
import React, { useEffect, useRef, useState } from "react";
import { Activity, ArrowRight, ClipboardList, X } from "lucide-react";
import { api } from "./api";
import { usePreferences } from "./preferences";

import { statuses } from "./format";

export function Icon({ icon: Component, ...props }) {
  return (
    <Component size={20} strokeWidth={1.7} aria-hidden="true" {...props} />
  );
}
export function Badge({ status }) {
  return (
    <span className={`badge status-${status}`}>
      {statuses[status] || status}
    </span>
  );
}
export function Empty({
  title = "Aucun élément pour le moment",
  children,
  icon = ClipboardList,
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon icon={icon} size={26} />
      </span>
      <h3>{title}</h3>
      <p>{children || "Les éléments enregistrés apparaîtront ici."}</p>
    </div>
  );
}
export function ErrorMessage({ message }) {
  return message ? (
    <div className="error-message" role="alert">
      {message}
    </div>
  ) : null;
}
export function Field({ label, children, ...props }) {
  const id = React.useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children ? (
        React.cloneElement(children, { id, ...props })
      ) : (
        <input id={id} {...props} />
      )}
    </div>
  );
}
export function Submit({ busy, children = "Enregistrer" }) {
  return (
    <button className="button primary" disabled={busy} type="submit">
      {busy ? "Enregistrement…" : children}
      <Icon icon={busy ? Activity : ArrowRight} size={16} />
    </button>
  );
}
export function PageHeader({ eyebrow, title, children, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow || "VOTRE ESPACE MEDIDESK"}</div>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
      {action}
    </div>
  );
}
export function Modal({ title, onClose, children }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    const close = () => onClose();
    dialog.addEventListener("cancel", close);
    return () => {
      dialog.removeEventListener("cancel", close);
      if (dialog.open) dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog ref={ref} className="modal" aria-labelledby="modal-title">
      <div className="modal-heading">
        <h2 id="modal-title">{title}</h2>
        <button className="icon-button" aria-label="Fermer" onClick={onClose}>
          <Icon icon={X} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function useData(path, revision = 0) {
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, data: null, error: "" });
    api(path, { signal: controller.signal })
      .then((data) => setState({ loading: false, data, error: "" }))
      .catch((err) => {
        if (err.name !== "AbortError")
          setState({ loading: false, data: null, error: err.message });
      });
    return () => controller.abort();
  }, [path, revision]);
  return state;
}
export function DataState({ state, children }) {
  if (state.loading)
    return (
      <div className="loading" role="status">
        <Activity size={20} />
        Chargement des données…
      </div>
    );
  if (state.error) return <ErrorMessage message={state.error} />;
  return children(state.data);
}
export function MutationForm({
  children,
  onSubmit,
  submit = "Enregistrer",
  onSuccess,
  className = "",
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className={`form ${className}`}
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        const body = Object.fromEntries(new FormData(e.currentTarget));
        setBusy(true);
        setError("");
        try {
          const data = await onSubmit(body);
          onSuccess?.(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy} aria-busy={busy}>
        {children}
      </fieldset>
      <ErrorMessage message={error} />
      <Submit busy={busy}>{submit}</Submit>
    </form>
  );
}
export function Comfort() {
  const { preferences: p, set, reset } = usePreferences();
  return (
    <div className="comfort">
      <p className="muted">
        Vos préférences s’appliquent à tous les écrans et restent enregistrées
        sur cet appareil.
      </p>
      <Field label="Apparence">
        <select value={p.theme} onChange={(e) => set("theme", e.target.value)}>
          <option value="system">Selon le système</option>
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
        </select>
      </Field>
      <Field label="Taille du texte">
        <select value={p.size} onChange={(e) => set("size", e.target.value)}>
          <option value="standard">Standard</option>
          <option value="large">Grande</option>
          <option value="larger">Très grande</option>
        </select>
      </Field>
      <Field label="Espacement">
        <select
          value={p.density}
          onChange={(e) => set("density", e.target.value)}
        >
          <option value="comfortable">Confortable</option>
          <option value="compact">Compact</option>
        </select>
      </Field>
      <label className="toggle-row">
        <span>
          <strong>Contraste renforcé</strong>
          <small>Des bordures et des textes plus distincts.</small>
        </span>
        <input
          type="checkbox"
          checked={p.contrast}
          onChange={(e) => set("contrast", e.target.checked)}
        />
      </label>
      <label className="toggle-row">
        <span>
          <strong>Réduire les animations</strong>
          <small>Les préférences système sont aussi respectées.</small>
        </span>
        <input
          type="checkbox"
          checked={p.motion}
          onChange={(e) => set("motion", e.target.checked)}
        />
      </label>
      <AnalyticsChoice />
      <button className="button secondary" onClick={reset}>
        Rétablir les préférences
      </button>
    </div>
  );
}
