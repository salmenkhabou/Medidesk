import React from "react";
import { BarChart3 } from "lucide-react";
import { DataState, Empty, PageHeader, useData } from "../ui/components";
const names = {
  directory: "Annuaire des praticiens",
  application: "Rejoindre le réseau",
  privacy: "Confidentialité",
};
export default function Analytics({ revision }) {
  const state = useData("/analytics/summary", revision);
  return (
    <>
      <PageHeader eyebrow="AUDIENCE" title="Statistiques de fréquentation">
        Vues des pages publiques avec consentement, sur les 30 derniers jours
        (UTC).
      </PageHeader>
      <DataState state={state}>
        {({ data }) => (
          <>
            <section className="panel payment-total">
              <span>Vues comptabilisées</span>
              <strong>
                {data.reduce((total, row) => total + row.views, 0)}
              </strong>
              <small>
                Compteurs agrégés · ce total ne représente pas des visiteurs
                uniques.
              </small>
            </section>
            <section className="panel">
              {data.length ? (
                <div className="table-wrap">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Jour · UTC</th>
                        <th>Page publique</th>
                        <th>Vues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row) => (
                        <tr key={`${row.day}-${row.page}`}>
                          <td data-label="Jour · UTC">{row.day}</td>
                          <td data-label="Page publique">{names[row.page]}</td>
                          <td data-label="Vues">{row.views}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty icon={BarChart3} title="Aucune vue comptabilisée">
                  Les visites des pages publiques sont comptées uniquement après
                  accord. Les espaces privés sont exclus.
                </Empty>
              )}
            </section>
          </>
        )}
      </DataState>
    </>
  );
}
