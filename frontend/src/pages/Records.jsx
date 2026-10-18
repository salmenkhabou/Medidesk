import React, { useState } from "react";
import { FileText } from "lucide-react";

import { date } from "../ui/format";
import {
  Empty,
  PageHeader,
  useData,
  DataState,
  Modal,
  Field,
} from "../ui/components";
export default function Records({ revision, user }) {
  const state = useData("/consultations", revision);
  const [printed, setPrinted] = useState(null),
    [kind, setKind] = useState("notes");
  return (
    <>
      <PageHeader
        eyebrow="SUIVI MÉDICAL"
        title={
          user.role === "patient" ? "Mon dossier médical" : "Consultations"
        }
      >
        Comptes rendus et ordonnances enregistrés à l’issue des consultations.
      </PageHeader>
      <DataState state={state}>
        {({ data }) =>
          data.length ? (
            <div className="record-list">
              {data.map((c) => (
                <article className="panel record" key={c.id}>
                  <div className="record-heading">
                    <span className="avatar">
                      <FileText size={22} />
                    </span>
                    <div>
                      <h2>
                        {user.role === "patient"
                          ? c.doctor_name
                          : c.patient_name}
                      </h2>
                      <p>
                        {date(c.created_at)} · Rendez-vous #{c.appointment_id}
                      </p>
                    </div>
                  </div>
                  <h3>Compte rendu</h3>
                  <p className="pre-wrap">{c.notes}</p>
                  {Object.entries(c.clinical || {})
                    .filter(([, v]) => v)
                    .map(([key, value]) => (
                      <section key={key}>
                        <h3>
                          {
                            {
                              reason: "Motif",
                              examination: "Examen clinique",
                              diagnosis: "Diagnostic",
                              lab_orders: "Bilans",
                              imaging_orders: "Imagerie",
                              certificate: "Certificat médical",
                            }[key]
                          }
                        </h3>
                        <p className="pre-wrap">{value}</p>
                      </section>
                    ))}
                  <button
                    className="button secondary"
                    onClick={() => {
                      setPrinted(c);
                      setKind(c.prescription ? "prescription" : "notes");
                    }}
                  >
                    Documents à imprimer / PDF
                  </button>
                  {c.prescription && (
                    <>
                      <h3>Ordonnance</h3>
                      <p className="pre-wrap prescription">{c.prescription}</p>
                      <p className="fine-print">
                        Transcription du praticien. Ce document ne constitue pas
                        une signature électronique certifiée.
                      </p>
                    </>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <section className="panel">
              <Empty icon={FileText} title="Aucune consultation enregistrée">
                Les comptes rendus enregistrés par votre médecin apparaîtront
                ici.
              </Empty>
            </section>
          )
        }
      </DataState>
      {printed && (
        <Modal
          title="Document de consultation"
          onClose={() => setPrinted(null)}
        >
          <Field label="Document à imprimer">
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              {[
                ["notes", "Compte rendu"],
                ["prescription", "Ordonnance"],
                ["lab_orders", "Demande de bilan"],
                ["imaging_orders", "Demande d’imagerie"],
                ["certificate", "Certificat médical"],
              ]
                .filter(([key]) => printed[key] || printed.clinical?.[key])
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
          </Field>
          <div className="print-document">
            <h2>
              {
                {
                  notes: "Compte rendu",
                  prescription: "Ordonnance",
                  lab_orders: "Demande de bilan",
                  imaging_orders: "Demande d’imagerie",
                  certificate: "Certificat médical",
                }[kind]
              }
            </h2>
            <p>Médecin : {printed.doctor_name}</p>
            <p>Patient : {printed.patient_name}</p>
            <p>{date(printed.created_at)}</p>
            <p className="pre-wrap">
              {printed[kind] || printed.clinical?.[kind]}
            </p>
            <p className="fine-print">
              Document rédigé par le praticien. Aucune signature électronique
              certifiée n’est apposée par l’application.
            </p>
            <button className="button primary" onClick={() => window.print()}>
              Imprimer ce document / PDF
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
