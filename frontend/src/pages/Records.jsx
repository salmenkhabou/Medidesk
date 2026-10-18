import React from "react";
import { FileText } from "lucide-react";

import { date } from "../ui/format";
import { Empty, PageHeader, useData, DataState } from "../ui/components";
export default function Records({ revision, user }) {
  const state = useData("/consultations", revision);
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
    </>
  );
}
