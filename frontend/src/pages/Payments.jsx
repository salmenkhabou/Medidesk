import React from "react";
import { CreditCard } from "lucide-react";

import { money, date } from "../ui/format";
import { Empty, PageHeader, useData, DataState } from "../ui/components";
export default function Payments({ revision }) {
  const state = useData("/payments", revision);
  return (
    <>
      <PageHeader eyebrow="GESTION DU CABINET" title="Règlements">
        Les paiements reçus et enregistrés par votre cabinet.
      </PageHeader>
      <DataState state={state}>
        {({ data }) => (
          <>
            <div className="panel payment-total">
              <span>Total des règlements enregistrés</span>
              <strong>
                {money(
                  data.reduce((sum, p) => sum + p.amount_millimes, 0) / 1000,
                )}
              </strong>
              <small>Sur les {data.length} derniers enregistrements</small>
            </div>
            <section className="panel">
              {data.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Référence</th>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Mode</th>
                        <th>Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((p) => (
                        <tr key={p.id}>
                          <td>REG-{String(p.id).padStart(5, "0")}</td>
                          <td>
                            {p.patient_name}
                            <small>{p.doctor_name}</small>
                          </td>
                          <td>{date(p.created_at)}</td>
                          <td>
                            {
                              {
                                cash: "Espèces",
                                card: "Carte",
                                transfer: "Virement",
                              }[p.method]
                            }
                          </td>
                          <td>
                            <strong>{money(p.amount_millimes / 1000)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty icon={CreditCard} title="Aucun règlement enregistré">
                  Ouvrez un rendez-vous pour enregistrer un règlement reçu.
                </Empty>
              )}
            </section>
          </>
        )}
      </DataState>
    </>
  );
}
