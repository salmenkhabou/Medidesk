import React, { useState } from "react";
import { Plus, Users } from "lucide-react";
import { api } from "../ui/api";

import { roles } from "../ui/format";
import {
  Empty,
  Field,
  PageHeader,
  Modal,
  useData,
  DataState,
  MutationForm,
} from "../ui/components";
export default function Team({ user, revision, refresh, notify }) {
  const state = useData("/team", revision);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(
    user.role === "superadmin" ? "doctor" : "secretariat",
  );
  return (
    <>
      <PageHeader
        eyebrow="COLLABORATION"
        title="Équipe"
        action={
          <button className="button primary" onClick={() => setOpen(true)}>
            <Plus size={17} />
            Créer un compte
          </button>
        }
      >
        Des comptes individuels avec des droits adaptés à chaque rôle.
      </PageHeader>
      <DataState state={state}>
        {({ data }) => (
          <>
            <section className="panel">
              {data.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Cabinet / spécialité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <strong>{u.name}</strong>
                          </td>
                          <td>{u.email}</td>
                          <td>
                            <span className="badge">{roles[u.role]}</span>
                          </td>
                          <td>
                            {[u.clinic, u.specialty]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty icon={Users} title="Votre équipe se construit ici">
                  Créez un compte pour le secrétariat de votre cabinet.
                </Empty>
              )}
            </section>
            {open && (
              <Modal
                title="Créer un compte professionnel"
                onClose={() => setOpen(false)}
              >
                <MutationForm
                  submit="Créer le compte"
                  onSubmit={(body) =>
                    api("/team", { method: "POST", body: { ...body, role } })
                  }
                  onSuccess={() => {
                    refresh();
                    setOpen(false);
                    notify(
                      "Compte créé. Transmettez les accès à la personne concernée par un canal sûr.",
                    );
                  }}
                >
                  <Field
                    label="Nom complet"
                    name="name"
                    required
                    minLength={2}
                    maxLength={120}
                  />
                  <Field label="Email" type="email" name="email" required />
                  <Field
                    label="Mot de passe initial · 12 caractères minimum"
                    type="password"
                    name="password"
                    required
                    minLength={12}
                    maxLength={72}
                    autoComplete="new-password"
                  />
                  {user.role === "superadmin" && (
                    <Field label="Rôle">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="doctor">Médecin</option>
                        <option value="secretariat">Secrétariat</option>
                        <option value="superadmin">Administrateur</option>
                      </select>
                    </Field>
                  )}
                  {role === "doctor" && (
                    <>
                      <Field
                        label="Spécialité"
                        name="specialty"
                        required
                        minLength={2}
                        maxLength={120}
                      />
                      <Field
                        label="Ville"
                        name="city"
                        required
                        minLength={2}
                        maxLength={120}
                      />
                      <Field
                        label="Numéro CNOM"
                        name="cnom"
                        required
                        minLength={2}
                        maxLength={80}
                      />
                      <Field label="Cabinet" name="clinic" maxLength={200} />
                    </>
                  )}
                  {role === "secretariat" && user.role === "superadmin" && (
                    <Field label="Médecin responsable">
                      <select name="doctor_id" required>
                        <option value="">Sélectionner un médecin</option>
                        {data
                          .filter((u) => u.role === "doctor")
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                      </select>
                    </Field>
                  )}
                  <p className="fine-print">
                    La vérification de l’identité et du numéro CNOM doit être
                    effectuée par l’administrateur avant la création du compte.
                    Aucun numéro n’est généré automatiquement.
                  </p>
                </MutationForm>
              </Modal>
            )}
          </>
        )}
      </DataState>
    </>
  );
}
