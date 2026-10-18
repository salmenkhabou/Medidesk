import React from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

import { roles, date, today } from "../ui/format";
import { Icon, Empty, PageHeader, useData, DataState } from "../ui/components";
import AppointmentTable from "./AppointmentTable";
export default function Dashboard({ user, revision, navigate }) {
  const state = useData("/dashboard", revision);
  return (
    <>
      <PageHeader
        title={`Bonjour, ${user.name}`}
        eyebrow={roles[user.role]}
        action={
          <span className="date-label">
            <CalendarDays size={16} />
            {date(today())}
          </span>
        }
      >
        Une vue d’ensemble de votre activité, à partir des données enregistrées.
      </PageHeader>
      <DataState state={state}>
        {(data) => (
          <>
            <div className="metrics">
              {(user.role === "superadmin"
                ? [
                    ["Praticiens", data.doctors, Stethoscope],
                    ["Patients", data.patients, Users],
                    [
                      "Demandes à examiner",
                      data.pending_applications,
                      ClipboardList,
                    ],
                    ["Rendez-vous enregistrés", data.total, CalendarDays],
                  ]
                : [
                    ["Aujourd’hui", data.appointments_today, CalendarDays],
                    ["À venir", data.upcoming, Activity],
                    ["Consultations terminées", data.completed, Check],
                    ["Rendez-vous enregistrés", data.total, ClipboardList],
                  ]
              ).map(([label, value, icon]) => (
                <div className="panel metric" key={label}>
                  <div className="metric-label">
                    {label}
                    <Icon icon={icon} />
                  </div>
                  <strong>{value}</strong>
                  <span>Données de votre espace</span>
                </div>
              ))}
            </div>
            <div className="dashboard-columns">
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Derniers rendez-vous</h2>
                    <p>Les réservations les plus récentes</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => navigate("appointments")}
                  >
                    Tout voir
                    <ArrowRight size={16} />
                  </button>
                </div>
                {data.recent.length ? (
                  <AppointmentTable items={data.recent} user={user} />
                ) : (
                  <Empty icon={CalendarDays} title="Votre agenda commence ici">
                    {user.role === "patient"
                      ? "Choisissez un praticien pour réserver votre premier rendez-vous."
                      : "Les rendez-vous enregistrés apparaîtront dans votre agenda."}
                  </Empty>
                )}
              </section>
              <aside className="panel next-step">
                <span className="eyebrow">À PORTÉE DE MAIN</span>
                <h2>
                  {user.role === "patient"
                    ? "Votre prochain rendez-vous"
                    : "Un espace à votre mesure"}
                </h2>
                <p>
                  {user.role === "patient"
                    ? "Parcourez les profils des praticiens et réservez un créneau."
                    : "Ajustez l’affichage, gérez votre équipe et retrouvez vos informations sans quitter votre espace."}
                </p>
                <button
                  className="button primary"
                  onClick={() =>
                    navigate(user.role === "patient" ? "directory" : "settings")
                  }
                >
                  {user.role === "patient"
                    ? "Consulter l’annuaire"
                    : "Personnaliser mon espace"}
                  <ArrowRight size={16} />
                </button>
                <div className="quiet-note">
                  <ShieldCheck size={18} />
                  <span>
                    Retrouvez vos informations dans un espace adapté aux droits
                    de votre compte.
                  </span>
                </div>
              </aside>
            </div>
          </>
        )}
      </DataState>
    </>
  );
}
