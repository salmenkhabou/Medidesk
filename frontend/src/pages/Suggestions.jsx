import React, { useState } from "react";
import { ArrowRight, MessageSquare, Plus } from "lucide-react";
import { api } from "../ui/api";

import { statuses, date } from "../ui/format";
import {
  Badge,
  Empty,
  Field,
  PageHeader,
  Modal,
  useData,
  DataState,
  MutationForm,
} from "../ui/components";
export default function Suggestions({ user, revision, refresh, notify }) {
  const state = useData("/suggestions", revision);
  const [selected, setSelected] = useState(null);
  const admin = user.role === "superadmin";
  return (
    <>
      <PageHeader
        eyebrow="À VOTRE ÉCOUTE"
        title="Suggestions & retours"
        action={
          !admin && (
            <button
              className="button primary"
              onClick={() => setSelected("new")}
            >
              <Plus size={17} />
              Partager une suggestion
            </button>
          )
        }
      >
        {admin
          ? "Examinez les retours reçus et apportez une réponse à leur auteur."
          : "Partagez vos besoins et retrouvez les réponses de l’équipe."}
      </PageHeader>
      <DataState state={state}>
        {({ data }) =>
          data.length ? (
            <div className="suggestions">
              {data.map((s) => (
                <article key={s.id} className="panel suggestion">
                  <div className="suggestion-top">
                    <span className="category">{s.category}</span>
                    <Badge status={s.status} />
                  </div>
                  <h2>{s.author}</h2>
                  <p className="suggestion-message">{s.message}</p>
                  {s.response && (
                    <div className="response">
                      <strong>Réponse de l’équipe</strong>
                      <p>{s.response}</p>
                    </div>
                  )}
                  <footer>
                    <span>Reçu le {date(s.created_at)}</span>
                    {admin && (
                      <button
                        className="text-button"
                        onClick={() => setSelected(s)}
                      >
                        Examiner & répondre
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <section className="panel">
              <Empty icon={MessageSquare} title="Chaque retour compte">
                {admin
                  ? "Les suggestions envoyées par les utilisateurs apparaîtront ici."
                  : "Aucune suggestion envoyée. Décrivez un besoin concret pour aider l’équipe à améliorer MediDesk."}
              </Empty>
            </section>
          )
        }
      </DataState>
      {selected && (
        <Modal
          title={
            selected === "new"
              ? "Partager une suggestion"
              : "Examiner la suggestion"
          }
          onClose={() => setSelected(null)}
        >
          <MutationForm
            onSubmit={(body) =>
              api(
                selected === "new"
                  ? "/suggestions"
                  : `/suggestions/${selected.id}`,
                { method: selected === "new" ? "POST" : "PATCH", body },
              )
            }
            onSuccess={() => {
              refresh();
              setSelected(null);
              notify("Suggestion enregistrée.");
            }}
          >
            {selected === "new" ? (
              <>
                <Field label="Catégorie">
                  <select name="category">
                    <option>Expérience utilisateur</option>
                    <option>Rendez-vous</option>
                    <option>Dossier médical</option>
                    <option>Facturation</option>
                    <option>Autre</option>
                  </select>
                </Field>
                <Field label="Votre suggestion">
                  <textarea
                    name="message"
                    minLength={10}
                    maxLength={4000}
                    required
                    rows={5}
                    placeholder="Décrivez votre besoin et son contexte…"
                  />
                </Field>
                <p className="fine-print">
                  N’incluez aucune donnée médicale ni information permettant
                  d’identifier un patient.
                </p>
              </>
            ) : (
              <>
                <p className="pre-wrap">{selected.message}</p>
                <Field label="Statut">
                  <select name="status" defaultValue={selected.status}>
                    {["new", "under_review", "planned", "closed"].map((s) => (
                      <option key={s} value={s}>
                        {statuses[s]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Réponse à l’auteur">
                  <textarea
                    name="response"
                    defaultValue={selected.response}
                    maxLength={4000}
                    rows={5}
                  />
                </Field>
              </>
            )}
          </MutationForm>
        </Modal>
      )}
    </>
  );
}
