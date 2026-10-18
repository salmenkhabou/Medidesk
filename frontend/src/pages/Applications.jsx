import React, { useState } from "react";

import { api } from "../ui/api";

import { date } from "../ui/format";
import {
  Badge,
  Empty,
  ErrorMessage,
  PageHeader,
  useData,
  DataState,
} from "../ui/components";
export default function Applications({ revision, refresh, notify }) {
  const state = useData("/applications", revision);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <PageHeader eyebrow="LE RÉSEAU" title="Demandes de praticiens">
        Examinez les informations avant de créer un compte dans Équipe.
      </PageHeader>
      <ErrorMessage message={error} />
      <DataState state={state}>
        {({ data }) =>
          data.length ? (
            <div className="record-list">
              {data.map((a) => (
                <article className="panel record" key={a.id}>
                  <div className="suggestion-top">
                    <h2>{a.name}</h2>
                    <Badge status={a.status} />
                  </div>
                  <p>
                    {a.specialty} · {a.city}
                  </p>
                  <p>
                    {a.email} · CNOM {a.cnom}
                  </p>
                  <small>Reçue le {date(a.created_at)}</small>
                  {a.status === "pending" && (
                    <div className="button-row">
                      {[
                        ["reviewed", "Marquer comme examinée"],
                        ["rejected", "Refuser"],
                      ].map(([status, label]) => (
                        <button
                          className="button secondary"
                          disabled={busy}
                          key={status}
                          onClick={async () => {
                            setBusy(true);
                            setError("");
                            try {
                              const result = await api(
                                `/applications/${a.id}`,
                                { method: "PATCH", body: { status } },
                              );
                              refresh();
                              notify(result.message);
                            } catch (err) {
                              setError(err.message);
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <section className="panel">
              <Empty title="Aucune demande reçue">
                Les demandes envoyées depuis le formulaire professionnel
                apparaîtront ici.
              </Empty>
            </section>
          )
        }
      </DataState>
    </>
  );
}
