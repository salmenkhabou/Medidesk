import React from "react";
import { ArrowRight, Search } from "lucide-react";
export default function NotFound({ navigate, user, denied = false }) {
  return (
    <section className="panel not-found">
      <span className="empty-icon">
        <Search aria-hidden="true" size={28} />
      </span>
      <span className="eyebrow">
        {denied ? "ACCÈS NON DISPONIBLE" : "ERREUR 404"}
      </span>
      <h1>
        {denied
          ? "Cette page n’est pas accessible à votre compte"
          : "Cette page a perdu son chemin"}
      </h1>
      <p>
        {denied
          ? "Retrouvez les rubriques autorisées depuis votre espace personnel."
          : "Le lien a peut-être changé, ou cette page n’existe plus. Retrouvez votre chemin depuis l’annuaire ou votre espace."}
      </p>
      <div className="button-row">
        <button
          className="button primary"
          onClick={() => navigate(user ? "dashboard" : "directory")}
        >
          {user ? "Revenir à mon espace" : "Trouver un praticien"}
          <ArrowRight aria-hidden="true" size={17} />
        </button>
        <button
          className="button secondary"
          onClick={() => navigate("privacy")}
        >
          Confidentialité
        </button>
      </div>
    </section>
  );
}
