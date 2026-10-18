import React, { useState } from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import { api } from "../ui/api";

import { date } from "../ui/format";
import {
  Badge,
  Empty,
  ErrorMessage,
  Field,
  PageHeader,
  Modal,
  useData,
  DataState,
  MutationForm,
} from "../ui/components";
import AppointmentTable from "./AppointmentTable";
export default function Appointments({ user, revision, refresh, notify }) {
  const state = useData("/appointments", revision);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const capabilities = useData("/capabilities");
  const [video, setVideo] = useState(""),
    [videoConsent, setVideoConsent] = useState(false);
  const close = () => {
    setSelected(null);
    setVideo("");
    setVideoConsent(false);
    setError("");
  };
  return (
    <>
      <PageHeader eyebrow="ORGANISATION" title="Rendez-vous">
        Votre agenda partagé avec les personnes concernées.
      </PageHeader>
      <div className="filter-tabs" aria-label="Filtrer les rendez-vous">
        {[
          ["all", "Tous"],
          ["confirmed", "Confirmés"],
          ["completed", "Terminés"],
          ["cancelled", "Annulés"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={filter === value}
            className={filter === value ? "active" : ""}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <section className="panel">
        <DataState state={state}>
          {({ data }) => {
            const items = data.filter(
              (a) => filter === "all" || a.status === filter,
            );
            return items.length ? (
              <AppointmentTable
                items={items}
                user={user}
                action={(a) => (
                  <button
                    className="text-button"
                    onClick={() => {
                      setSelected(a);
                      setAction("details");
                    }}
                  >
                    Ouvrir
                    <ChevronRight size={16} />
                  </button>
                )}
              />
            ) : (
              <Empty icon={CalendarDays} title="Aucun rendez-vous">
                Les rendez-vous correspondant à ce filtre apparaîtront ici.
              </Empty>
            );
          }}
        </DataState>
      </section>
      {selected && (
        <Modal title={`Rendez-vous #${selected.id}`} onClose={close}>
          <div className="appointment-detail">
            <Badge status={selected.status} />
            <h3>
              {user.role === "patient"
                ? selected.doctor_name
                : selected.patient_name}
            </h3>
            <p>
              {date(selected.appointment_date)} à {selected.appointment_time} ·
              Tunis
            </p>
            <p className="pre-wrap">
              {selected.reason || "Aucun motif renseigné."}
            </p>
          </div>
          {["doctor", "patient"].includes(user.role) &&
            selected.status === "confirmed" &&
            action === "details" && (
              <section className="service-note">
                <h3>Téléconsultation</h3>
                {capabilities.data?.data?.video ? (
                  <>
                    <label className="toggle-row">
                      <span>
                        J’accepte d’utiliser le service vidéo configuré pour ce
                        rendez-vous.
                      </span>
                      <input
                        type="checkbox"
                        checked={videoConsent}
                        onChange={(e) => setVideoConsent(e.target.checked)}
                      />
                    </label>
                    <button
                      className="button secondary"
                      disabled={!videoConsent}
                      onClick={async () => {
                        try {
                          const { data } = await api(
                            `/appointments/${selected.id}/video`,
                            { method: "POST", body: { consent: true } },
                          );
                          setVideo(data.url);
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      Rejoindre la téléconsultation
                    </button>
                    {video && (
                      <iframe
                        className="video-session"
                        src={video}
                        title="Salle de téléconsultation"
                        allow="camera; microphone; fullscreen"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </>
                ) : (
                  <p>
                    La téléconsultation vidéo n’est pas encore activée. Elle
                    nécessite un prestataire adapté et une configuration
                    validée.
                  </p>
                )}
                <ErrorMessage message={error} />
              </section>
            )}
          {action === "consultation" ? (
            <MutationForm
              submit="Enregistrer et terminer"
              onSubmit={(body) =>
                api(`/appointments/${selected.id}/consultation`, {
                  method: "POST",
                  body,
                })
              }
              onSuccess={() => {
                refresh();
                close();
                notify("Consultation enregistrée.");
              }}
            >
              <ConsultationFields />
              <p className="fine-print">
                Le patient pourra consulter ces informations dans son dossier.
                L’enregistrement clôture ce rendez-vous.
              </p>
            </MutationForm>
          ) : action === "payment" ? (
            <MutationForm
              submit="Enregistrer le règlement"
              onSubmit={(body) =>
                api(`/appointments/${selected.id}/payment`, {
                  method: "POST",
                  body,
                })
              }
              onSuccess={() => {
                refresh();
                close();
                notify("Règlement enregistré.");
              }}
            >
              <Field
                label="Montant · TND"
                type="number"
                name="amount"
                min="0.001"
                max="100000"
                step="0.001"
                required
              />
              <Field label="Mode de règlement">
                <select name="method">
                  <option value="cash">Espèces</option>
                  <option value="card">Carte</option>
                  <option value="transfer">Virement</option>
                </select>
              </Field>
              <p className="fine-print">
                Ce formulaire enregistre un règlement reçu. Il ne débite aucune
                carte.
              </p>
            </MutationForm>
          ) : action === "cancel" ? (
            <>
              <p>Confirmer l’annulation ? Le créneau sera libéré.</p>
              <ErrorMessage message={error} />
              <div className="button-row">
                <button
                  className="button secondary"
                  onClick={() => setAction("details")}
                >
                  Revenir
                </button>
                <button
                  disabled={busy}
                  className="button danger"
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await api(`/appointments/${selected.id}`, {
                        method: "PATCH",
                        body: { status: "cancelled" },
                      });
                      refresh();
                      close();
                      notify("Rendez-vous annulé.");
                    } catch (err) {
                      setError(err.message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Confirmer l’annulation
                </button>
              </div>
            </>
          ) : (
            <div className="button-row">
              {selected.status === "confirmed" && (
                <>
                  <button
                    className="button secondary"
                    onClick={() => setAction("cancel")}
                  >
                    Annuler le rendez-vous
                  </button>
                  {user.role === "doctor" && (
                    <button
                      className="button primary"
                      onClick={() => setAction("consultation")}
                    >
                      Saisir la consultation
                    </button>
                  )}
                </>
              )}
              {["doctor", "secretariat"].includes(user.role) &&
                selected.status !== "cancelled" && (
                  <button
                    className="button secondary"
                    onClick={() => setAction("payment")}
                  >
                    Enregistrer un règlement
                  </button>
                )}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

function ConsultationFields() {
  const state = useData("/templates"),
    [values, setValues] = useState({}),
    [template, setTemplate] = useState("");
  const fields = [
    ["reason", "Motif clinique"],
    ["examination", "Examen clinique"],
    ["diagnosis", "Diagnostic"],
    ["notes", "Compte rendu"],
    ["prescription", "Ordonnance · facultative"],
    ["lab_orders", "Bilans prescrits"],
    ["imaging_orders", "Imagerie prescrite"],
    ["certificate", "Certificat médical"],
  ];
  return (
    <>
      <DataState state={state}>
        {({ data }) =>
          data.length ? (
            <div className="template-picker">
              <Field label="Modèle de rédaction">
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                >
                  <option value="">Choisir un modèle</option>
                  {data.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </Field>
              <button
                type="button"
                className="button secondary"
                disabled={!template}
                onClick={() => {
                  const t = data.find((t) => String(t.id) === template);
                  const key = {
                    report: "notes",
                    certificate: "certificate",
                    prescription: "prescription",
                    lab: "lab_orders",
                    imaging: "imaging_orders",
                  }[t.kind];
                  setValues((v) => ({ ...v, [key]: t.body }));
                }}
              >
                Appliquer le modèle au champ correspondant
              </button>
            </div>
          ) : null
        }
      </DataState>
      {fields.map(([key, label]) => (
        <Field key={key} label={label}>
          <textarea
            name={key}
            rows={key === "notes" ? 5 : 3}
            required={key === "notes"}
            minLength={key === "notes" ? 2 : undefined}
            maxLength={
              key === "notes" || key === "prescription" ? 10000 : 15000
            }
            value={values[key] || ""}
            onChange={(e) =>
              setValues((v) => ({ ...v, [key]: e.target.value }))
            }
          />
        </Field>
      ))}
    </>
  );
}
