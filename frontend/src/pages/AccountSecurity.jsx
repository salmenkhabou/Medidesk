import React, { useState } from "react";
import { api, saveToken } from "../ui/api";
import { Field, MutationForm, DataState, useData } from "../ui/components";
export default function AccountSecurity({ notify }) {
  const [revision, setRevision] = useState(0),
    [setup, setSetup] = useState(null),
    [codes, setCodes] = useState(null);
  const state = useData("/account/security", revision);
  const session = (data) => {
    saveToken(data.token);
    setRevision((v) => v + 1);
  };
  return (
    <section className="account-protection">
      <h2>Protéger mon compte</h2>
      <DataState state={state}>
        {({ data }) => (
          <>
            <h3>Double authentification</h3>
            <p>
              {data.mfa_enabled
                ? "Active : un code supplémentaire est demandé à la connexion."
                : "Ajoutez un code généré par Google Authenticator, Microsoft Authenticator ou une autre application compatible."}
            </p>
            {!data.mfa_enabled && !setup && (
              <MutationForm
                submit="Configurer la double authentification"
                onSubmit={(body) =>
                  api("/account/security/mfa/setup", { method: "POST", body })
                }
                onSuccess={setSetup}
              >
                <Field
                  label="Mot de passe actuel pour configurer"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                />
              </MutationForm>
            )}
            {setup && !data.mfa_enabled && (
              <>
                <p>
                  Dans votre application Authenticator, ajoutez un compte
                  manuellement avec cette clé, de type « basé sur le temps ».
                  Cette configuration expire dans 10 minutes.
                </p>
                <p className="fine-print">
                  Gardez cette clé privée. Ne partagez pas de capture d’écran.
                </p>
                <code className="security-secret">{setup.secret}</code>
                <MutationForm
                  submit="Activer avec le code"
                  onSubmit={(body) =>
                    api("/account/security/mfa/enable", {
                      method: "POST",
                      body,
                    })
                  }
                  onSuccess={(data) => {
                    session(data);
                    setCodes(data.recovery_codes);
                    setSetup(null);
                    notify(
                      "Double authentification activée. Conservez les codes de secours.",
                    );
                  }}
                >
                  <Field
                    label="Code de l’application · 6 chiffres"
                    name="code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    autoComplete="one-time-code"
                    required
                  />
                </MutationForm>
                <button
                  className="button secondary"
                  onClick={() => setSetup(null)}
                >
                  Fermer la configuration
                </button>
              </>
            )}
            {codes && (
              <div className="service-note">
                <h3>Codes de secours — affichés une seule fois</h3>
                <p>
                  Conservez-les dans votre gestionnaire de mots de passe. Chaque
                  code remplace un code Authenticator une seule fois. Sans
                  téléphone ni code de secours, vous risquez de perdre l’accès.
                </p>
                <pre className="security-secret">{codes.join("\n")}</pre>
                <button
                  className="button secondary"
                  onClick={() => setCodes(null)}
                >
                  J’ai conservé mes codes
                </button>
              </div>
            )}
            {data.mfa_enabled && (
              <>
                <p>Codes de secours restants : {data.recovery_remaining}.</p>
                <MutationForm
                  submit="Désactiver la double authentification"
                  onSubmit={(body) =>
                    api("/account/security/mfa/disable", {
                      method: "POST",
                      body,
                    })
                  }
                  onSuccess={(data) => {
                    session(data);
                    setCodes(null);
                    notify("Double authentification désactivée.");
                  }}
                >
                  <Field
                    label="Mot de passe actuel pour désactiver"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    required
                  />
                  <Field
                    label="Code Authenticator ou code de secours"
                    name="code"
                    autoComplete="one-time-code"
                    required
                    maxLength={40}
                  />
                </MutationForm>
              </>
            )}
            <h3>Vérification de l’adresse email</h3>
            <p>
              {data.email_verified
                ? "Votre adresse email a été vérifiée."
                : data.smtp_configured
                  ? "Demandez un code pour confirmer que vous recevez les emails de votre compte."
                  : "L’administrateur doit configurer Gmail sur le serveur avant l’envoi des codes."}
            </p>
            {!data.email_verified && data.smtp_configured && (
              <>
                <MutationForm
                  submit="Envoyer un code par email"
                  onSubmit={() =>
                    api("/account/security/email/send", {
                      method: "POST",
                      body: {},
                    })
                  }
                  onSuccess={(r) => notify(r.message)}
                />
                <MutationForm
                  submit="Vérifier mon adresse"
                  onSubmit={(body) =>
                    api("/account/security/email/confirm", {
                      method: "POST",
                      body,
                    })
                  }
                  onSuccess={(r) => {
                    notify(r.message);
                    setRevision((v) => v + 1);
                  }}
                >
                  <Field
                    label="Code reçu par email"
                    name="code"
                    autoComplete="one-time-code"
                    maxLength={48}
                    required
                  />
                </MutationForm>
              </>
            )}
          </>
        )}
      </DataState>
    </section>
  );
}
