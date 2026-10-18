import React, { useState } from "react";
import { ArrowRight, Search, Stethoscope, CalendarDays, FileText, Users, Plus } from "lucide-react";

import { Icon, Empty, PageHeader, useData, DataState } from "../ui/components";
export default function Directory({ user, book, navigate }) {
  const [search, setSearch] = useState("");
  const state = useData("/doctors");
  return (
    <>
      {!user && (
        <section className="welcome-hero" aria-labelledby="welcome-title">
          <div className="welcome-copy">
            <span className="eyebrow">MEDIDESK · VOTRE SANTÉ, SIMPLEMENT</span>
            <h1 id="welcome-title">Plus de clarté.<br /><span>Plus de place pour le soin.</span></h1>
            <p>Trouvez votre praticien, préparez votre rendez-vous et retrouvez votre suivi dans un espace personnel, pensé pour votre quotidien.</p>
            <div className="welcome-actions">
              <a className="button primary" href="#praticiens">Trouver un praticien <ArrowRight size={18} aria-hidden="true" /></a>
              <button className="button secondary" onClick={() => navigate("login")}>Accéder à mon espace</button>
            </div>
            <p className="welcome-footnote">Patient, médecin ou secrétaire : chacun retrouve les outils adaptés à son rôle.</p>
          </div>
          <div className="care-scene" aria-hidden="true">
            <div className="care-orbit" />
            <div className="care-platform" />
            <div className="care-object"><div className="care-cross"><Plus size={92} strokeWidth={3} /></div><span>Le soin, mieux organisé</span><div className="care-object-lines"><i /><i /><i /></div></div>
            <div className="care-chip care-chip-calendar"><CalendarDays size={23} /><span>Rendez-vous</span></div>
            <div className="care-chip care-chip-record"><FileText size={23} /><span>Suivi médical</span></div>
          </div>
        </section>
      )}
      {!user && <div className="welcome-paths" aria-label="Choisir mon espace">
        <button onClick={() => navigate("register")}><CalendarDays aria-hidden="true" /><span><strong>Je suis patient</strong><small>Créer mon espace personnel</small></span><ArrowRight aria-hidden="true" size={18} /></button>
        <button onClick={() => navigate("application")}><Stethoscope aria-hidden="true" /><span><strong>Je suis médecin</strong><small>Présenter mon cabinet</small></span><ArrowRight aria-hidden="true" size={18} /></button>
        <button onClick={() => navigate("login")}><Users aria-hidden="true" /><span><strong>Je suis secrétaire</strong><small>Retrouver mon cabinet</small></span><ArrowRight aria-hidden="true" size={18} /></button>
      </div>}
      <section id="praticiens" className="directory-section" aria-label="Recherche de praticiens">
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
      </section>
    </>
  );
}
