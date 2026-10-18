import React, { useState } from "react";
import { Printer, Plus } from "lucide-react";
import { api } from "../ui/api";
import {
  Field,
  PageHeader,
  MutationForm,
  DataState,
  useData,
  Empty,
  Modal,
} from "../ui/components";
import { date, money } from "../ui/format";
const methods = {
  cash: "Espèces",
  card: "Carte",
  cheque: "Chèque",
  transfer: "Virement",
  third_party: "Tiers payant",
};
export default function Billing({ user, notify }) {
  const [revision, refresh] = useState(0),
    [create, setCreate] = useState(false),
    [selected, setSelected] = useState(null),
    [action, setAction] = useState(""),
    [filter, setFilter] = useState("all"),
    [lineCount, setLineCount] = useState(1);
  const staff = ["doctor", "secretariat"].includes(user.role),
    state = useData("/invoices", revision),
    patients = useData(staff ? "/patients" : "/capabilities");
  const done = () => {
    refresh((n) => n + 1);
    setSelected(null);
    notify("Facturation mise à jour.");
  };
  return (
    <>
      <PageHeader
        eyebrow="FACTURATION"
        title={
          user.role === "patient"
            ? "Mes factures & reçus"
            : "Factures & suivi des règlements"
        }
        action={
          staff ? (
            <button className="button primary" onClick={() => setCreate(true)}>
              <Plus size={18} />
              Nouvelle facture
            </button>
          ) : null
        }
      >
        Factures en TND, paiements reçus et suivi administratif des assurances.
      </PageHeader>
      <div className="filter-tabs">
        <button
          className={filter === "all" ? "active" : ""}
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          Toutes
        </button>
        <button
          className={filter === "unpaid" ? "active" : ""}
          aria-pressed={filter === "unpaid"}
          onClick={() => setFilter("unpaid")}
        >
          Soldes impayés
        </button>
      </div>
      <DataState state={state}>
        {({ data }) => {
          const rows = data.filter(
            (i) => filter !== "unpaid" || i.balance_millimes > 0,
          );
          return rows.length ? (
            <div className="record-list">
              {rows.map((i) => (
                <article className="panel practice-section" key={i.id}>
                  <h2>Facture MED-{String(i.id).padStart(6, "0")}</h2>
                  <p>
                    {i.patient_name} · {i.doctor_name} · {date(i.created_at)}
                  </p>
                  <div className="billing-summary">
                    <span>
                      Total <strong>{money(i.total_millimes / 1000)}</strong>
                    </span>
                    <span>
                      Reçu <strong>{money(i.paid_millimes / 1000)}</strong>
                    </span>
                    <span>
                      Solde <strong>{money(i.balance_millimes / 1000)}</strong>
                    </span>
                  </div>
                  <div className="button-row">
                    <button
                      className="button secondary"
                      onClick={() => {
                        setSelected(i);
                        setAction("view");
                      }}
                    >
                      Facture & reçus
                    </button>
                    {staff && i.balance_millimes > 0 && (
                      <button
                        className="button primary"
                        onClick={() => {
                          setSelected(i);
                          setAction("receipt");
                        }}
                      >
                        Enregistrer un règlement
                      </button>
                    )}
                    {staff && (
                      <button
                        className="button secondary"
                        onClick={() => {
                          setSelected(i);
                          setAction("claim");
                        }}
                      >
                        Dossier assurance
                      </button>
                    )}
                  </div>
                  {i.claim && (
                    <p>
                      Assurance : {i.claim.insurer} ·{" "}
                      {
                        {
                          draft: "Brouillon",
                          submitted: "Déposé",
                          accepted: "Accepté",
                          rejected: "Rejeté",
                          reimbursed: "Remboursé",
                        }[i.claim.status]
                      }
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <section className="panel">
              <Empty title="Aucune facture correspondante" />
            </section>
          );
        }}
      </DataState>
      {create && (
        <Modal title="Nouvelle facture" onClose={() => setCreate(false)}>
          <DataState state={patients}>
            {({ data }) =>
              data.length ? (
                <MutationForm
                  submit="Émettre la facture"
                  onSubmit={(body) => {
                    const lines = Array.from({ length: lineCount }, (_, n) => ({
                      label: body[`label_${n}`],
                      quantity: body[`quantity_${n}`],
                      unit_amount: body[`price_${n}`],
                    }));
                    return api("/invoices", {
                      method: "POST",
                      body: { ...body, lines },
                    });
                  }}
                  onSuccess={() => {
                    setCreate(false);
                    done();
                  }}
                >
                  <Field label="Patient facturé">
                    <select name="patient_id" required>
                      {data.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.demographics?.name || p.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Rendez-vous lié · numéro facultatif"
                    name="appointment_id"
                    type="number"
                    min="1"
                  />
                  <Field
                    label="Adresse du cabinet"
                    name="issuer_address"
                    required
                    maxLength={1000}
                  />
                  <Field
                    label="Identifiant fiscal du cabinet"
                    name="issuer_tax_id"
                    required
                    maxLength={100}
                  />
                  {Array.from({ length: lineCount }, (_, n) => (
                    <fieldset className="invoice-line" key={n}>
                      <legend>Prestation {n + 1}</legend>
                      <Field
                        label={`Désignation ${n + 1}`}
                        name={`label_${n}`}
                        required
                        maxLength={300}
                      />
                      <div className="form-grid">
                        <Field
                          label={`Quantité ${n + 1}`}
                          name={`quantity_${n}`}
                          type="number"
                          defaultValue="1"
                          min="1"
                          max="1000"
                          required
                        />
                        <Field
                          label={`Prix unitaire ${n + 1} · TND`}
                          name={`price_${n}`}
                          type="number"
                          min="0.001"
                          max="100000"
                          step="0.001"
                          required
                        />
                      </div>
                    </fieldset>
                  ))}
                  {lineCount < 30 && (
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setLineCount((n) => n + 1)}
                    >
                      Ajouter une prestation
                    </button>
                  )}
                  <Field
                    label="Note de facturation"
                    name="note"
                    maxLength={2000}
                  />
                  <p className="fine-print">
                    Vérifiez les mentions légales du cabinet avant émission. Les
                    transmissions CNAM et assureurs ne sont pas automatisées.
                  </p>
                </MutationForm>
              ) : (
                <p>Créez d’abord un dossier patient.</p>
              )
            }
          </DataState>
        </Modal>
      )}
      {selected && (
        <Modal
          title={`Facture MED-${String(selected.id).padStart(6, "0")}`}
          onClose={() => setSelected(null)}
        >
          {action === "receipt" ? (
            <MutationForm
              submit="Enregistrer le règlement reçu"
              onSubmit={(body) =>
                api(`/invoices/${selected.id}/receipts`, {
                  method: "POST",
                  body,
                })
              }
              onSuccess={done}
            >
              <Field
                label="Montant reçu · TND"
                name="amount"
                type="number"
                min="0.001"
                max={selected.balance_millimes / 1000}
                step="0.001"
                required
              />
              <Field label="Mode de règlement">
                <select name="method">
                  {Object.entries(methods).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <p className="fine-print">
                Enregistrement comptable uniquement : aucune carte n’est
                débitée.
              </p>
            </MutationForm>
          ) : action === "claim" ? (
            <MutationForm
              submit="Enregistrer le dossier assurance"
              onSubmit={(body) =>
                api(`/invoices/${selected.id}/claim`, { method: "PUT", body })
              }
              onSuccess={done}
            >
              <Field
                label="CNAM / mutuelle / assurance"
                name="insurer"
                defaultValue={selected.claim?.insurer || ""}
                required
              />
              <Field
                label="Référence du dossier"
                name="reference"
                defaultValue={selected.claim?.reference || ""}
              />
              <Field label="État du dossier">
                <select
                  name="status"
                  defaultValue={selected.claim?.status || "draft"}
                >
                  {Object.entries({
                    draft: "Brouillon",
                    submitted: "Déposé",
                    accepted: "Accepté",
                    rejected: "Rejeté",
                    reimbursed: "Remboursé",
                  }).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Note administrative"
                name="note"
                defaultValue={selected.claim?.note || ""}
              />
              <p className="fine-print">
                Ce suivi ne transmet pas le dossier à l’organisme et ne confirme
                pas un remboursement bancaire.
              </p>
            </MutationForm>
          ) : (
            <div className="print-document">
              <h2>{selected.clinic || selected.doctor_name}</h2>
              <p>
                {selected.doctor_name} · CNOM {selected.cnom || "À compléter"}
              </p>
              <p>{selected.issuer_address}</p>
              <p>
                Identifiant fiscal : {selected.issuer_tax_id || "À compléter"}
              </p>
              <hr />
              <h3>Facture MED-{String(selected.id).padStart(6, "0")}</h3>
              <p>Patient : {selected.patient_name}</p>
              <p>Date : {date(selected.created_at)}</p>
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Prestation</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.lines.map((l, n) => (
                    <tr key={n}>
                      <td data-label="Prestation">{l.label}</td>
                      <td data-label="Quantité">{l.quantity}</td>
                      <td data-label="Prix unitaire">
                        {money(l.unit_millimes / 1000)}
                      </td>
                      <td data-label="Total">
                        {money((l.quantity * l.unit_millimes) / 1000)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3>Total : {money(selected.total_millimes / 1000)}</h3>
              <h3>Solde : {money(selected.balance_millimes / 1000)}</h3>
              <h3>Reçus</h3>
              {selected.receipts.map((r, n) => (
                <p key={n}>
                  Reçu {r.legacy ? "REG" : "REC"}-{r.id} · {date(r.created_at)}{" "}
                  · {methods[r.method]} · {money(r.amount_millimes / 1000)}
                </p>
              ))}
              <p>{selected.note}</p>
              <p>
                Feuille de soins : les informations ci-dessus peuvent
                accompagner votre dossier. Elles ne remplacent pas un formulaire
                officiel CNAM.
              </p>
              <button className="button primary" onClick={() => window.print()}>
                <Printer size={18} />
                Imprimer / enregistrer en PDF
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
