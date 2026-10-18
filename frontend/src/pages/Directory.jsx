import React, { useState } from "react";
import { ArrowRight, Search, Stethoscope } from "lucide-react";

import { Icon, Empty, PageHeader, useData, DataState } from "../ui/components";
export default function Directory({ user, book, navigate }) {
  const [search, setSearch] = useState("");
  const state = useData("/doctors");
  return (
    <>
      <PageHeader
        eyebrow="LE RÉSEAU"
        title="Trouvez votre praticien"
        action={
          !user ? (
            <button
              className="button primary"
              onClick={() => navigate("register")}
            >
              Créer mon compte patient
              <ArrowRight aria-hidden="true" size={17} />
            </button>
          ) : null
        }
      >
        Recherchez un médecin par nom, spécialité ou ville.
      </PageHeader>
      <div className="search-bar">
        <Icon icon={Search} />
        <input
          aria-label="Rechercher un médecin"
          placeholder="Un nom, une spécialité, une ville…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <DataState state={state}>
        {({ data }) => {
          const items = data.filter((d) =>
            `${d.name} ${d.specialty} ${d.city}`
              .toLocaleLowerCase("fr")
              .includes(search.toLocaleLowerCase("fr")),
          );
          return items.length ? (
            <div className="doctor-grid">
              {items.map((d) => (
                <article className="panel doctor-card" key={d.id}>
                  <div className="avatar large">
                    <Icon icon={Stethoscope} size={26} />
                  </div>
                  <div>
                    <h2>{d.name}</h2>
                    <p className="accent">{d.specialty}</p>
                  </div>
                  <div className="doctor-meta">
                    <span>{d.city}</span>
                    {d.clinic && <span>{d.clinic}</span>}
                    {d.cnom && <span>CNOM {d.cnom}</span>}
                  </div>
                  {(!user || user.role === "patient") && (
                    <button
                      className="button secondary"
                      onClick={() => (user ? book(d) : navigate("login"))}
                    >
                      Prendre rendez-vous
                      <ArrowRight size={16} />
                    </button>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="panel">
              <Empty
                icon={Stethoscope}
                title={search ? "Aucun résultat" : "Le réseau se prépare"}
              >
                {search
                  ? "Essayez une autre recherche."
                  : "Les praticiens inscrits apparaîtront ici après la création de leur compte par l’équipe."}
              </Empty>
            </div>
          );
        }}
      </DataState>
    </>
  );
}
