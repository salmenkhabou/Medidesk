import React, { useState } from "react";
import { api } from "../ui/api";
import {
  Field,
  PageHeader,
  DataState,
  useData,
  ErrorMessage,
} from "../ui/components";
import { downloadBlob } from "./Clinical";
import { money, today } from "../ui/format";
export default function PracticeReports({ user }) {
  const [from, setFrom] = useState(today().slice(0, 7) + "-01"),
    [to, setTo] = useState(today()),
    [error, setError] = useState(""),
    state = useData(`/reports?from=${from}&to=${to}`);
  const exportData = async (format = "csv") => {
    try {
      const { data } = await api(
        `/reports/export?from=${from}&to=${to}&format=${format}`,
      );
      const content = data.content_base64
        ? Uint8Array.from(atob(data.content_base64), (c) => c.charCodeAt(0))
        : data.content;
      downloadBlob(new Blob([content], { type: data.mime }), data.name);
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <>
      <PageHeader eyebrow="PILOTAGE DU CABINET" title="Activité & comptabilité">
        Indicateurs calculés sur les données enregistrées, sans chiffres de
        démonstration.
      </PageHeader>
      <div className="form-grid">
        <Field
          label="Début de période"
          type="date"
          value={from}
          onChange={(e) => e.target.value && setFrom(e.target.value)}
        />
        <Field
          label="Fin de période"
          type="date"
          value={to}
          onChange={(e) => e.target.value && setTo(e.target.value)}
        />
      </div>
      <div className="button-row">
        <button className="button secondary" onClick={() => window.print()}>
          Imprimer / PDF
        </button>
        <button className="button secondary" onClick={() => exportData("csv")}>
          Exporter le journal · CSV
        </button>
        <button className="button secondary" onClick={() => exportData("xlsx")}>
          Exporter Excel · XLSX
        </button>
      </div>
      <ErrorMessage message={error} />
      <DataState state={state}>
        {({ data }) => (
          <>
            <div className="metrics">
              {[
                ["Consultations", data.consultations],
                ["Rendez-vous", data.appointments],
                ["Encaissements", money(data.revenue_millimes / 1000)],
                ["Absences", data.absent],
              ].map(([label, value]) => (
                <div className="panel metric" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <section className="panel practice-section">
              <h2>Agenda & présence</h2>
              <p>
                Taux d’occupation :{" "}
                {data.occupancy_rate == null
                  ? "Non calculable sans créneaux publiés"
                  : `${Math.round(data.occupancy_rate * 100)} %`}
              </p>
              <p>
                {data.occupied_minutes} minutes occupées sur{" "}
                {data.capacity_minutes} minutes publiées.
              </p>
              <p>
                Taux d’absence :{" "}
                {data.absence_rate == null
                  ? "Aucun rendez-vous écoulé"
                  : `${Math.round(data.absence_rate * 100)} %`}
              </p>
              <p className="fine-print">
                L’occupation compare les durées réservées aux créneaux
                disponibles ou urgents publiés. Le taux d’absence nécessite de
                renseigner la présence des patients.
              </p>
            </section>
            {user.role === "doctor" && (
              <section className="panel practice-section">
                <h2>Diagnostics renseignés</h2>
                {data.diagnoses.length ? (
                  data.diagnoses
                    .sort((a, b) => b.count - a.count)
                    .map((d) => (
                      <p key={d.name}>
                        {d.name} : {d.count} consultation(s)
                      </p>
                    ))
                ) : (
                  <p>Aucun diagnostic structuré sur cette période.</p>
                )}
              </section>
            )}
            <section className="panel practice-section">
              <h2>Journal des encaissements</h2>
              <div className="table-wrap">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Date UTC</th>
                      <th>Mode</th>
                      <th>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.receipts.map((r, n) => (
                      <tr key={n}>
                        <td data-label="Date UTC">{r.created_at}</td>
                        <td data-label="Mode">
                          {
                            {
                              cash: "Espèces",
                              card: "Carte",
                              transfer: "Virement",
                              cheque: "Chèque",
                              third_party: "Tiers payant",
                            }[r.method]
                          }
                        </td>
                        <td data-label="Montant">
                          {money(r.amount_millimes / 1000)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </DataState>
    </>
  );
}
