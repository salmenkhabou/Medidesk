import React, { useState } from "react";
import { ChevronRight, Eye, ShieldCheck, Users } from "lucide-react";
import { api, saveToken } from "../ui/api";

import {
  Icon,
  Field,
  PageHeader,
  MutationForm,
  Comfort,
} from "../ui/components";
export default function Settings({ user, onUser, notify }) {
  const [tab, setTab] = useState("comfort");
  return (
    <>
      <PageHeader eyebrow="PRÉFÉRENCES" title="Un espace qui vous ressemble">
        Réglez votre confort de lecture et gérez les informations de votre
        compte.
      </PageHeader>
      <div className="settings-layout">
        <nav aria-label="Rubriques des paramètres" className="settings-nav">
          {[
            ["comfort", "Affichage & confort", Eye],
            ...(user
              ? [
                  ["account", "Mon compte", Users],
                  ["security", "Sécurité", ShieldCheck],
                ]
              : []),
          ].map(([key, label, icon]) => (
            <button
              key={key}
              aria-current={tab === key ? "page" : undefined}
              onClick={() => setTab(key)}
              className={tab === key ? "active" : ""}
            >
              <Icon icon={icon} />
              {label}
              <ChevronRight size={16} />
            </button>
          ))}
        </nav>
        <section className="panel settings-panel">
          {tab === "comfort" ? (
            <>
              <h2>Affichage & confort</h2>
              <Comfort />
            </>
          ) : tab === "account" ? (
            <>
              <h2>Mon compte</h2>
              <MutationForm
                onSubmit={(body) => api("/account", { method: "PUT", body })}
                onSuccess={({ user }) => {
                  onUser(user);
                  notify("Informations mises à jour.");
                }}
              >
                <Field
                  label="Nom complet"
                  name="name"
                  defaultValue={user.name}
                  required
                  minLength={2}
                  maxLength={120}
                />
                <Field
                  label="Téléphone"
                  name="phone"
                  defaultValue={user.phone}
                  maxLength={40}
                />
                <Field label="Adresse email" value={user.email} readOnly />
                <p className="fine-print">
                  Pour modifier votre adresse email ou vos droits, contactez
                  votre administrateur.
                </p>
              </MutationForm>
            </>
          ) : (
            <>
              <h2>Changer le mot de passe</h2>
              <MutationForm
                onSubmit={(body) =>
                  api("/account/password", { method: "PUT", body })
                }
                onSuccess={() => {
                  saveToken(null);
                  window.dispatchEvent(new Event("medidesk:unauthorized"));
                  notify(
                    "Mot de passe modifié. Connectez-vous avec votre nouveau mot de passe.",
                  );
                }}
                submit="Mettre à jour le mot de passe"
              >
                <Field
                  label="Mot de passe actuel"
                  name="current_password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
                <Field
                  label="Nouveau mot de passe · 12 caractères minimum"
                  name="password"
                  type="password"
                  required
                  minLength={12}
                  maxLength={72}
                  autoComplete="new-password"
                />
              </MutationForm>
              <div className="service-note">
                <h3>Services non configurés</h3>
                <p>
                  La double authentification et la récupération du mot de passe
                  par email ne sont pas activées. Contactez votre administrateur
                  en cas de difficulté d’accès.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
