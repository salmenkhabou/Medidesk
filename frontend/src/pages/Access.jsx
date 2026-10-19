import PasswordField from "../ui/PasswordField";
import React, { useState, useEffect } from "react";
import { CalendarDays, ChevronRight, FileText, Users } from "lucide-react";
import { api, saveToken } from "../ui/api";

import { Icon, Field, MutationForm } from "../ui/components";
export default function Access({ mode, onMode, onLogin, notify }) {
  const [challenge, setChallenge] = useState(null);
  const [recovery, setRecovery] = useState(false);
  useEffect(() => {
    setChallenge(null);
    setRecovery(false);
  }, [mode]);
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
        {challenge && mode === "login" ? (
          <>
            <h3>Vérification de sécurité</h3>
            <p>
              Saisissez le code de votre application Authenticator ou un code de
              secours.
            </p>
            <MutationForm
              submit="Vérifier et se connecter"
              onSubmit={(body) =>
                api("/auth/verify-2fa", {
                  method: "POST",
                  body: { ...body, challenge },
                })
              }
              onSuccess={(data) => {
                saveToken(data.token);
                onLogin(data.user);
              }}
            >
              <Field
                label="Code de sécurité"
                name="code"
                autoComplete="one-time-code"
                required
                maxLength={40}
              />
            </MutationForm>
            <button
              className="button secondary"
              onClick={() => setChallenge(null)}
            >
              Recommencer la connexion
            </button>
          </>
        ) : recovery && mode === "login" ? (
          <>
            <h3>Récupérer mon compte</h3>
            <p>
              Demandez un code par email, puis saisissez-le avec votre nouveau
              mot de passe. Le code expire après 30 minutes.
            </p>
            <MutationForm
              submit="Envoyer un code de récupération"
              onSubmit={(body) =>
                api("/auth/forgot-password", { method: "POST", body })
              }
              onSuccess={(data) => notify(data.message)}
            >
              <Field
                label="Email du compte à récupérer"
                type="email"
                name="email"
                autoComplete="email"
                required
              />
            </MutationForm>
            <MutationForm
              submit="Enregistrer le nouveau mot de passe"
              onSubmit={(body) =>
                api("/auth/reset-password", { method: "POST", body })
              }
              onSuccess={(data) => {
                notify(data.message);
                setRecovery(false);
              }}
            >
              <Field
                label="Code de récupération reçu par email"
                name="code"
                autoComplete="one-time-code"
                maxLength={48}
                required
              />
              <PasswordField label="Nouveau mot de passe" />
            </MutationForm>
            <button
              className="button secondary"
              onClick={() => setRecovery(false)}
            >
              Retour à la connexion
            </button>
          </>
        ) : (
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
              } else if (data.requires_mfa) {
                setChallenge(data.challenge);
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
            {!application &&
              (register ? (
                <PasswordField />
              ) : (
                <Field
                  label="Mot de passe"
                  type="password"
                  name="password"
                  required
                  maxLength={200}
                  autoComplete="current-password"
                />
              ))}
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
        )}
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
        {mode === "login" && !challenge && !recovery && (
          <button className="button ghost" onClick={() => setRecovery(true)}>
            Mot de passe oublié ?
          </button>
        )}
      </section>
    </div>
  );
}
