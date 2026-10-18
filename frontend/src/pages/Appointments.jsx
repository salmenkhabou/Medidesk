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
  const close = () => {
    setSelected(null);
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
              <Field label="Compte rendu">
                <textarea
                  name="notes"
                  required
                  minLength={2}
                  maxLength={10000}
                  rows={5}
                />
              </Field>
              <Field label="Ordonnance · facultative">
                <textarea name="prescription" maxLength={10000} rows={4} />
              </Field>
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
