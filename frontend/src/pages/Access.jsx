import React from "react";
import { CalendarDays, ChevronRight, FileText, Users } from "lucide-react";
import { api, saveToken } from "../ui/api";

import { Icon, Field, MutationForm } from "../ui/components";
export default function Access({ mode, onMode, onLogin, notify }) {
  const register = mode === "register";
  const application = mode === "application";
  return (
    <div className="access-layout">
      <section className="access-story">
        <span className="eyebrow">LE SOIN, MIEUX ORGANISÉ</span>
        <h1>
          Un espace clair.
          <br />
          Un suivi qui compte.
        </h1>
        <p>
          Vos rendez-vous, votre cabinet et vos échanges, réunis au même
          endroit.
        </p>
        <div className="story-line">
          <Icon icon={CalendarDays} />
          Organisez les rendez-vous
        </div>
        <div className="story-line">
          <Icon icon={FileText} />
          Retrouvez les comptes rendus enregistrés
        </div>
        <div className="story-line">
          <Icon icon={Users} />
          Travaillez avec votre équipe
        </div>
        <span className="story-note">
          Pensé pour les patients et les professionnels de santé en Tunisie.
        </span>
      </section>
      <section className="access-card">
        <span className="eyebrow">BIENVENUE SUR MEDIDESK</span>
        <h2>
          {application
            ? "Rejoindre le réseau"
            : register
              ? "Créer votre compte patient"
              : "Heureux de vous retrouver"}
        </h2>
        <p className="muted">
          {application
            ? "Présentez votre cabinet. L’équipe examinera votre demande avant la création d’un compte."
            : register
              ? "Commencez avec un compte personnel, sans données préremplies."
              : "Connectez-vous pour retrouver votre espace personnel."}
        </p>
        <MutationForm
          key={mode}
          submit={
            application
              ? "Envoyer la demande"
              : register
                ? "Créer mon compte"
                : "Se connecter"
          }
          onSubmit={(body) =>
            api(
              application
                ? "/applications"
                : register
                  ? "/auth/register"
                  : "/auth/login",
              { method: "POST", body },
            )
          }
          onSuccess={(data) => {
            if (application) {
              notify(data.message);
              onMode("login");
            } else if (register) {
              notify("Compte créé. Vous pouvez vous connecter.");
              onMode("login");
            } else {
              saveToken(data.token);
              onLogin(data.user);
            }
          }}
        >
          {(register || application) && (
            <Field
              label="Nom complet"
              name="name"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
            />
          )}
          <Field
            label="Adresse email"
            type="email"
            name="email"
            required
            autoComplete="email"
            maxLength={254}
          />
          {!application && (
            <Field
              label={
                register
                  ? "Mot de passe · 12 caractères minimum"
                  : "Mot de passe"
              }
              type="password"
              name="password"
              required
              minLength={register ? 12 : 1}
              maxLength={72}
              autoComplete={register ? "new-password" : "current-password"}
            />
          )}
          {application && (
            <>
              <Field
                label="Spécialité"
                name="specialty"
                required
                minLength={2}
                maxLength={120}
              />
              <Field
                label="Ville"
                name="city"
                required
                minLength={2}
                maxLength={120}
              />
              <Field
                label="Numéro CNOM"
                name="cnom"
                required
                minLength={2}
                maxLength={80}
              />
            </>
          )}
        </MutationForm>
        <div className="access-links">
          {mode !== "login" ? (
            <button onClick={() => onMode("login")}>
              Déjà un compte ? Se connecter
            </button>
          ) : (
            <>
              <button onClick={() => onMode("register")}>
                Nouveau patient ? Créer un compte
                <ChevronRight size={15} />
              </button>
              <button onClick={() => onMode("application")}>
                Vous êtes professionnel de santé ?
              </button>
            </>
          )}
        </div>
        {mode === "login" && (
          <p className="fine-print">
            Mot de passe oublié ? Contactez votre administrateur. La
            récupération par email n’est pas encore disponible.
          </p>
        )}
      </section>
    </div>
  );
}
