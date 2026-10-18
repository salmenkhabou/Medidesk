export const roles = {
  patient: "Patient",
  doctor: "Médecin",
  secretariat: "Secrétariat",
  superadmin: "Administrateur",
};
export const statuses = {
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
  new: "Nouveau",
  under_review: "En cours d’analyse",
  planned: "Planifié",
  closed: "Clôturé",
  pending: "À examiner",
  reviewed: "Examinée",
  rejected: "Refusée",
};
export const money = (n) =>
  new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND" }).format(
    n,
  );
export const date = (value) =>
  value
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeZone: "Africa/Tunis",
      }).format(
        new Date(
          value.length === 10
            ? `${value}T12:00:00Z`
            : `${value.replace(" ", "T")}Z`,
        ),
      )
    : "—";
export const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Tunis" }).format(
    new Date(),
  );
