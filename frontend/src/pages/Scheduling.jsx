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
import { date, today } from "../ui/format";
export default function Scheduling({ user, notify }) {
  const [day, setDay] = useState(today()),
    [revision, refresh] = useState(0),
    [error, setError] = useState("");
  const staff = ["doctor", "secretariat"].includes(user.role),
    [doctorId, setDoctorId] = useState("");
  const people = useData(staff ? "/patients" : "/doctors", revision),
    appointments = useData("/appointments", revision),
    waiting = useData("/waiting-list", revision),
    slots = useData(
      staff
        ? `/schedule?from=${day}&to=${day}`
        : doctorId
          ? `/schedule?doctor_id=${doctorId}&from=${day}&to=${day}`
          : "/capabilities",
      revision,
    );
  const done = () => {
    refresh((n) => n + 1);
    notify("Agenda mis à jour.");
  };
  const mutate = async (path, method, body) => {
    try {
      await api(path, { method, body });
      done();
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <>
      <PageHeader eyebrow="ORGANISATION" title="Agenda & liste d’attente">
        Créneaux et rendez-vous en heure de Tunis. Une fois des disponibilités
        publiées, les patients réservent uniquement ces créneaux. Les urgences
        vitales nécessitent les services d’urgence.
      </PageHeader>
      <Field
        label="Jour de l’agenda"
        type="date"
        value={day}
        onChange={(e) => setDay(e.target.value || today())}
      />
      {!staff && (
        <DataState state={people}>
          {({ data }) => (
            <Field label="Médecin pour les disponibilités">
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">Choisir un médecin</option>
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
      <section className="panel practice-section">
        <h2>Rendez-vous du {date(day)}</h2>
        <DataState state={appointments}>
          {({ data }) => {
            const items = data
              .filter((a) => a.appointment_date === day)
              .sort((a, b) =>
                a.appointment_time.localeCompare(b.appointment_time),
              );
            return items.length ? (
              <div className="record-list">
                {items.map((a) => (
                  <article key={a.id} className="agenda-item">
                    <strong>
                      {a.appointment_time} · {a.duration} min
                    </strong>
                    <h3>
                      {user.role === "patient" ? a.doctor_name : a.patient_name}
                    </h3>
                    <p>
                      {a.priority === "urgent"
                        ? "Urgent"
                        : a.priority === "special"
                          ? "Créneau spécial"
                          : "Consultation"}{" "}
                      ·{" "}
                      {
                        {
                          confirmed: "Confirmé",
                          completed: "Terminé",
                          cancelled: "Annulé",
                        }[a.status]
                      }
                    </p>
                    {a.attendance !== "pending" && (
                      <p>
                        Présence :{" "}
                        {a.attendance === "present" ? "Présent" : "Absent"}
                      </p>
                    )}
                    {staff &&
                      a.status !== "cancelled" &&
                      new Date(
                        `${a.appointment_date}T${a.appointment_time}:00+01:00`,
                      ) <= new Date() && (
                        <div className="button-row">
                          <button
                            className="button secondary"
                            onClick={() =>
                              mutate(`/attendance/${a.id}`, "PATCH", {
                                attendance: "present",
                              })
                            }
                          >
                            Présent
                          </button>
                          <button
                            className="button secondary"
                            onClick={() =>
                              mutate(`/attendance/${a.id}`, "PATCH", {
                                attendance: "absent",
                              })
                            }
                          >
                            Absent
                          </button>
                        </div>
                      )}
                  </article>
                ))}
              </div>
            ) : (
              <Empty title="Aucun rendez-vous ce jour" />
            );
          }}
        </DataState>
      </section>
      {(staff || doctorId) && (
        <section className="panel practice-section">
          <h2>{staff ? "Créneaux du cabinet" : "Créneaux publiés"}</h2>
          <DataState state={slots}>
            {({ data }) =>
              data.length ? (
                <div className="slot-grid">
                  {data.map((s) => (
                    <article key={s.id} className="slot">
                      <strong>
                        {s.slot_time} · {s.duration} min
                      </strong>
                      <span>
                        {
                          {
                            available: "Disponible",
                            urgent: "Réservé aux urgences",
                            blocked: "Indisponible",
                          }[s.kind]
                        }
                      </span>
                      {staff && (
                        <button
                          className="button secondary"
                          onClick={() => mutate(`/schedule/${s.id}`, "DELETE")}
                        >
                          Retirer le créneau
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <Empty title="Aucun créneau publié" />
              )
            }
          </DataState>
          {staff && (
            <MutationForm
              submit="Ajouter le créneau"
              onSubmit={(body) =>
                api("/schedule", {
                  method: "POST",
                  body: { ...body, slot_date: day },
                })
              }
              onSuccess={done}
            >
              <div className="form-grid">
                <Field label="Heure" type="time" name="slot_time" required />
                <Field
                  label="Durée · minutes"
                  type="number"
                  name="duration"
                  min="5"
                  max="240"
                  defaultValue="30"
                  required
                />
                <Field label="Type de créneau">
                  <select name="kind">
                    <option value="available">Disponible</option>
                    <option value="urgent">Réservé aux urgences</option>
                    <option value="blocked">Indisponible</option>
                  </select>
                </Field>
              </div>
            </MutationForm>
          )}
        </section>
      )}
      {staff && (
        <section className="panel practice-section">
          <h2>Ajouter un rendez-vous au cabinet</h2>
          <DataState state={people}>
            {({ data }) =>
              data.length ? (
                <MutationForm
                  submit="Créer le rendez-vous"
                  onSubmit={(body) =>
                    api("/staff-appointments", {
                      method: "POST",
                      body: { ...body, appointment_date: day },
                    })
                  }
                  onSuccess={done}
                >
                  <Field label="Patient">
                    <select name="patient_id" required>
                      {data.map((p) => (
                        <option value={p.id} key={p.id}>
                          {p.demographics?.name || p.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="form-grid">
                    <Field
                      label="Heure du rendez-vous"
                      name="appointment_time"
                      type="time"
                      required
                    />
                    <Field
                      label="Durée du rendez-vous · minutes"
                      name="duration"
                      type="number"
                      defaultValue="30"
                      min="5"
                      max="240"
                      required
                    />
                    <Field label="Priorité">
                      <select name="priority">
                        <option value="normal">Normale</option>
                        <option value="urgent">Urgente</option>
                        <option value="special">Créneau spécial</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Motif" name="reason" maxLength={1000} />
                </MutationForm>
              ) : (
                <p>Créez d’abord un dossier dans Patients & dossiers.</p>
              )
            }
          </DataState>
        </section>
      )}
      <section className="panel practice-section">
        <h2>Liste d’attente</h2>
        <DataState state={waiting}>
          {({ data }) =>
            data.length ? (
              <div className="record-list">
                {data.map((w) => (
                  <article className="agenda-item" key={w.id}>
                    <h3>{staff ? w.patient_name : w.doctor_name}</h3>
                    <p>
                      {date(w.preferred_date)} ·{" "}
                      {
                        {
                          waiting: "En attente",
                          contacted: "Contacté",
                          booked: "Rendez-vous fixé",
                          cancelled: "Annulé",
                        }[w.status]
                      }
                    </p>
                    <p>{w.payload.note}</p>
                    {w.status === "waiting" && (
                      <div className="button-row">
                        {staff && (
                          <>
                            <button
                              className="button secondary"
                              onClick={() =>
                                mutate(`/waiting-list/${w.id}`, "PATCH", {
                                  status: "contacted",
                                })
                              }
                            >
                              Marquer contacté
                            </button>
                            <button
                              className="button secondary"
                              onClick={() =>
                                mutate(`/waiting-list/${w.id}`, "PATCH", {
                                  status: "booked",
                                })
                              }
                            >
                              Marquer rendez-vous fixé
                            </button>
                          </>
                        )}
                        <button
                          className="button secondary"
                          onClick={() =>
                            mutate(`/waiting-list/${w.id}`, "PATCH", {
                              status: "cancelled",
                            })
                          }
                        >
                          Retirer la demande
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <Empty title="Aucune demande en attente" />
            )
          }
        </DataState>
        <DataState state={people}>
          {({ data }) =>
            data.length ? (
              <MutationForm
                submit="Ajouter à la liste d’attente"
                onSubmit={(body) =>
                  api("/waiting-list", { method: "POST", body })
                }
                onSuccess={done}
              >
                <Field label={staff ? "Patient en attente" : "Médecin demandé"}>
                  <select name={staff ? "patient_id" : "doctor_id"}>
                    {data.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.demographics?.name || p.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Date souhaitée"
                  type="date"
                  name="preferred_date"
                  min={today()}
                  defaultValue={day}
                  required
                />
                <Field label="Précisions" name="note" maxLength={1000} />
              </MutationForm>
            ) : null
          }
        </DataState>
      </section>
      <ErrorMessage message={error} />
    </>
  );
}
