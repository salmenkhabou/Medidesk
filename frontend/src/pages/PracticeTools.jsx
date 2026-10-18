import React, { useState } from "react";
import { api } from "../ui/api";
import {
  Field,
  PageHeader,
  MutationForm,
  DataState,
  useData,
  Empty,
  ErrorMessage,
} from "../ui/components";
import { today, date } from "../ui/format";
export function PracticeTools({ notify }) {
  const [revision, refresh] = useState(0),
    [error, setError] = useState(""),
    templates = useData("/templates", revision),
    medicines = useData("/medicines", revision);
  const done = () => {
    refresh((n) => n + 1);
    notify("Enregistrement effectué.");
  };
  return (
    <>
      <PageHeader eyebrow="OUTILS DU PRATICIEN" title="Modèles & médicaments">
        Vos modèles de rédaction et votre catalogue personnel. Aucun contrôle
        pharmacologique automatique n’est activé.
      </PageHeader>
      <section className="panel practice-section">
        <h2>Modèles de documents</h2>
        <DataState state={templates}>
          {({ data }) =>
            data.map((t) => (
              <details key={t.id} className="template-item">
                <summary>
                  {t.title} ·{" "}
                  {
                    {
                      report: "Compte rendu",
                      certificate: "Certificat",
                      prescription: "Ordonnance",
                      lab: "Bilan",
                      imaging: "Imagerie",
                    }[t.kind]
                  }
                </summary>
                <p className="pre-wrap">{t.body}</p>
                <button
                  className="button secondary"
                  onClick={async () => {
                    try {
                      await api(`/templates/${t.id}`, { method: "DELETE" });
                      done();
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  Supprimer ce modèle
                </button>
              </details>
            ))
          }
        </DataState>
        <MutationForm
          submit="Enregistrer le modèle"
          onSubmit={(body) => api("/templates", { method: "POST", body })}
          onSuccess={done}
        >
          <Field label="Titre du modèle" name="title" required minLength={2} />
          <Field label="Type de modèle">
            <select name="kind">
              <option value="report">Compte rendu</option>
              <option value="certificate">Certificat</option>
              <option value="prescription">Ordonnance</option>
              <option value="lab">Bilan</option>
              <option value="imaging">Imagerie</option>
            </select>
          </Field>
          <Field label="Texte du modèle">
            <textarea
              name="body"
              rows={6}
              required
              minLength={2}
              maxLength={15000}
            />
          </Field>
        </MutationForm>
      </section>
      <section className="panel practice-section">
        <h2>Catalogue personnel de médicaments</h2>
        <p className="service-note">
          Ce catalogue est saisi par le médecin. Il ne constitue pas un
          référentiel validé et ne détecte pas les interactions ou
          contre-indications. Vérifiez chaque prescription avec une source
          professionnelle à jour.
        </p>
        <DataState state={medicines}>
          {({ data }) =>
            data.length ? (
              data.map((m) => (
                <article className="template-item" key={m.id}>
                  <h3>{m.name}</h3>
                  <p>{m.ingredient}</p>
                  <p className="pre-wrap">{m.notes}</p>
                  <p>
                    Source : {m.source || "Non renseignée"} · Date de revue :{" "}
                    {date(m.reviewed_on)}
                  </p>
                </article>
              ))
            ) : (
              <Empty title="Aucun médicament enregistré" />
            )
          }
        </DataState>
        <MutationForm
          submit="Ajouter au catalogue personnel"
          onSubmit={(body) => api("/medicines", { method: "POST", body })}
          onSuccess={done}
        >
          <Field label="Nom du médicament" name="name" minLength={2} required />
          <Field label="DCI / substance" name="ingredient" />
          <Field
            label="Source professionnelle consultée"
            name="source"
            required
          />
          <Field
            label="Date de revue"
            name="reviewed_on"
            type="date"
            defaultValue={today()}
            required
          />
          <Field label="Notes du praticien">
            <textarea name="notes" rows={4} maxLength={5000} />
          </Field>
        </MutationForm>
      </section>
      <ErrorMessage message={error} />
    </>
  );
}
export function Notifications({ notify, navigate, user }) {
  const [revision, refresh] = useState(0),
    state = useData("/notifications", revision),
    preferences = useData("/notification-preferences", revision),
    [error, setError] = useState("");
  return (
    <>
      <PageHeader eyebrow="INFORMATIONS" title="Notifications & rappels">
        Rappels dans votre espace. Les SMS sont désactivés.
      </PageHeader>
      {user.role === "patient" && (
        <DataState state={preferences}>
          {({ data }) => (
            <section className="panel practice-section">
              <h2>Rappels par email</h2>
              <p>
                {data.smtp_configured
                  ? "Le service email est configuré."
                  : "L’envoi Gmail reste à configurer par l’administrateur."}
              </p>
              <MutationForm
                submit="Enregistrer mon choix"
                onSubmit={(body) =>
                  api("/notification-preferences", {
                    method: "PUT",
                    body: { email_opt_in: body.email_opt_in === "yes" },
                  })
                }
                onSuccess={() => {
                  refresh((n) => n + 1);
                  notify("Préférence enregistrée.");
                }}
              >
                <Field label="Recevoir des rappels génériques par email">
                  <select
                    name="email_opt_in"
                    defaultValue={data.email_opt_in ? "yes" : "no"}
                  >
                    <option value="no">Non</option>
                    <option value="yes">Oui, j’accepte</option>
                  </select>
                </Field>
                <p className="fine-print">
                  Aucun résultat médical ni compte rendu ne sera envoyé par
                  email. Vous pouvez retirer votre accord ici.
                </p>
              </MutationForm>
            </section>
          )}
        </DataState>
      )}
      <DataState state={state}>
        {({ data }) =>
          data.length ? (
            <div className="record-list">
              {data.map((n) => (
                <article className="panel practice-section" key={n.id}>
                  <h2>{n.title}</h2>
                  <p>
                    {date(n.created_at)} · {n.read_at ? "Lue" : "Non lue"}
                  </p>
                  <div className="button-row">
                    <button
                      className="button primary"
                      onClick={() => navigate(n.page)}
                    >
                      Ouvrir
                    </button>
                    {!n.read_at && (
                      <button
                        className="button secondary"
                        onClick={async () => {
                          try {
                            await api(`/notifications/${n.id}/read`, {
                              method: "PATCH",
                              body: {},
                            });
                            refresh((v) => v + 1);
                          } catch (e) {
                            setError(e.message);
                          }
                        }}
                      >
                        Marquer comme lue
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <section className="panel">
              <Empty title="Aucune notification" />
            </section>
          )
        }
      </DataState>
      <ErrorMessage message={error} />
    </>
  );
}
export function SecurityStatus() {
  const state = useData("/security-status");
  return (
    <>
      <PageHeader eyebrow="ADMINISTRATION" title="Sécurité & intégrations">
        État technique et points de configuration à vérifier avant exploitation
        médicale.
      </PageHeader>
      <DataState state={state}>
        {({ data }) => (
          <section className="panel practice-section">
            <h2>Protection et exploitation</h2>
            <dl className="data-grid">
              <div>
                <dt>Champs cliniques, documents et messages</dt>
                <dd>{data.algorithm}</dd>
              </div>
              <div>
                <dt>Chiffrement du disque</dt>
                <dd>{data.full_disk_encryption}</dd>
              </div>
              <div>
                <dt>Sauvegardes hors serveur</dt>
                <dd>{data.external_backups}</dd>
              </div>
              <div>
                <dt>Protection des données en Tunisie</dt>
                <dd>{data.legal_review}</dd>
              </div>
              <div>
                <dt>SMTP Gmail</dt>
                <dd>
                  {data.smtp_configured
                    ? "Configuré · vérifier la délivrabilité"
                    : "À configurer sur le serveur"}
                </dd>
              </div>
            </dl>
            <p className="service-note">
              Les contrôles techniques ne constituent pas une certification de
              conformité. Vérifiez les formalités applicables auprès de l’INPDP,
              la gestion des consentements, la durée de conservation et les
              contrats des prestataires.
            </p>
          </section>
        )}
      </DataState>
    </>
  );
}
