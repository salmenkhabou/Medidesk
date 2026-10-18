import React from "react";

import { date } from "../ui/format";
import { Empty, PageHeader, useData, DataState } from "../ui/components";
export default function Audit({ revision }) {
  const state = useData("/audit", revision);
  return (
    <>
      <PageHeader eyebrow="ADMINISTRATION" title="Journal d’activité">
        Connexions et modifications importantes de la plateforme.
      </PageHeader>
      <section className="panel">
        <DataState state={state}>
          {({ data }) =>
            data.length ? (
              <div className="table-wrap">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Événement</th>
                      <th>Compte</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((e) => (
                      <tr key={e.id}>
                        <td data-label="Événement">
                          <code>{e.action}</code>
                        </td>
                        <td data-label="Compte">{e.actor || "Système"}</td>
                        <td data-label="Date">{date(e.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty title="Aucun événement enregistré" />
            )
          }
        </DataState>
      </section>
    </>
  );
}
