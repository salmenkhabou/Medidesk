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
import { downloadDocument } from "./Clinical";
import { date } from "../ui/format";
export default function Messaging({ user, notify }) {
  const [revision, refresh] = useState(0),
    [error, setError] = useState(""),
    [patient, setPatient] = useState("");
  const state = useData("/messages", revision),
    contacts = useData("/contacts"),
    patients = useData(user.role === "doctor" ? "/patients" : "/my-files"),
    documents = useData(
      user.role === "doctor" && patient
        ? `/patients/${patient}/documents`
        : "/capabilities",
      revision,
    );
  return (
    <>
      <PageHeader eyebrow="COMMUNICATION" title="Messagerie confidentielle">
        Échanges avec les professionnels de votre parcours. Ce service ne
        remplace pas une prise en charge urgente.
      </PageHeader>
      <section className="panel practice-section">
        <h2>Nouveau message</h2>
        <DataState state={contacts}>
          {({ data }) =>
            data.length ? (
              <MutationForm
                submit="Envoyer le message"
                onSubmit={(body) =>
                  api("/messages", {
                    method: "POST",
                    body: { ...body, patient_id: patient || undefined },
                  })
                }
                onSuccess={() => {
                  refresh((n) => n + 1);
                  notify("Message envoyé dans la messagerie MediDesk.");
                }}
              >
                <Field label="Destinataire">
                  <select name="recipient_id" required>
                    {data.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} · {c.role === "doctor" ? "Médecin" : "Patient"}
                      </option>
                    ))}
                  </select>
                </Field>
                {user.role === "doctor" && (
                  <>
                    <DataState state={patients}>
                      {({ data }) => (
                        <Field label="Dossier concerné · pour un adressage à un confrère">
                          <select
                            value={patient}
                            onChange={(e) => setPatient(e.target.value)}
                          >
                            <option value="">Aucun dossier joint</option>
                            {data.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.demographics?.name || p.name}
                              </option>
                            ))}
                          </select>
                        </Field>
                      )}
                    </DataState>
                    {patient && (
                      <DataState state={documents}>
                        {({ data }) => (
                          <Field label="Document à partager">
                            <select name="document_id">
                              <option value="">Aucun document</option>
                              {data.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                          </Field>
                        )}
                      </DataState>
                    )}
                  </>
                )}
                <Field
                  label="Objet"
                  name="subject"
                  minLength={2}
                  maxLength={200}
                  required
                />
                <Field label="Votre message">
                  <textarea
                    name="body"
                    required
                    rows={6}
                    minLength={2}
                    maxLength={15000}
                  />
                </Field>
                <p className="fine-print">
                  Ne partagez que les informations nécessaires avec le
                  destinataire concerné. Les laboratoires sans compte MediDesk
                  ne reçoivent pas de messages automatiquement.
                </p>
              </MutationForm>
            ) : (
              <Empty title="Aucun correspondant disponible">
                Un médecin doit être rattaché à votre parcours avant de pouvoir
                échanger.
              </Empty>
            )
          }
        </DataState>
      </section>
      <ErrorMessage message={error} />
      <DataState state={state}>
        {({ data }) =>
          data.length ? (
            <div className="record-list">
              {data.map((m) => (
                <article className="panel practice-section" key={m.id}>
                  <h2>{m.subject}</h2>
                  <p>
                    {m.sender_name} → {m.recipient_name} · {date(m.created_at)}
                  </p>
                  <p className="pre-wrap message-body">{m.body}</p>
                  {m.document_id && (
                    <button
                      className="button secondary"
                      onClick={async () => {
                        try {
                          await downloadDocument(m.document_id);
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      Télécharger le document partagé
                    </button>
                  )}
                  {m.recipient_id === user.id && !m.read_at && (
                    <button
                      className="button secondary"
                      onClick={async () => {
                        try {
                          await api(`/messages/${m.id}/read`, {
                            method: "PATCH",
                            body: {},
                          });
                          refresh((n) => n + 1);
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      Marquer comme lu
                    </button>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <section className="panel">
              <Empty title="Aucun message" />
            </section>
          )
        }
      </DataState>
    </>
  );
}
