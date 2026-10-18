import React, { useState } from "react";
import { Plus, Search, FileText, Download, Printer } from "lucide-react";
import { api } from "../ui/api";
import {
  Field,
  PageHeader,
  MutationForm,
  Modal,
  DataState,
  useData,
  Empty,
  ErrorMessage,
} from "../ui/components";
import { date, today } from "../ui/format";
const demographicFields = [
  ["name", "Nom complet"],
  ["birth_date", "Date de naissance", "date"],
  ["phone", "Téléphone", "tel"],
  ["email", "Email", "email"],
  ["address", "Adresse"],
  ["insurance", "Couverture / organisme"],
  ["insurance_number", "Numéro d’affiliation"],
  ["coverage", "Prise en charge"],
];
export async function downloadDocument(id) {
  const { data } = await api(`/documents/${id}`);
  const bytes = Uint8Array.from(atob(data.content_base64), (c) =>
    c.charCodeAt(0),
  );
  downloadBlob(new Blob([bytes], { type: data.mime }), data.name);
}
export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Demographics({ value = {} }) {
  return (
    <>
      <div className="form-grid">
        {demographicFields.map(([key, label, type]) => (
          <Field
            key={key}
            name={key}
            label={label}
            type={type || "text"}
            required={key === "name"}
            defaultValue={value[key] || ""}
            maxLength={key === "address" ? 1000 : 200}
          />
        ))}
      </div>
      <Field label="Sexe">
        <select name="sex" defaultValue={value.sex || ""}>
          <option value="">Non renseigné</option>
          <option value="F">Féminin</option>
          <option value="M">Masculin</option>
          <option value="X">Autre / non précisé</option>
        </select>
      </Field>
    </>
  );
}
export default function Clinical({ user, notify }) {
  const [revision, refresh] = useState(0),
    [search, setSearch] = useState(""),
    [selected, select] = useState(null),
    [create, setCreate] = useState(false);
  const staff = user.role !== "patient",
    state = useData(staff ? "/patients" : "/my-files", revision);
  return (
    <>
      <PageHeader
        eyebrow={staff ? "CABINET" : "PORTAIL PATIENT"}
        title={staff ? "Dossiers patients" : "Mon dossier de santé"}
        action={
          staff ? (
            <button className="button primary" onClick={() => setCreate(true)}>
              <Plus size={18} />
              Nouveau patient
            </button>
          ) : null
        }
      >
        Identité, suivi et documents, avec des accès adaptés à chaque rôle.
      </PageHeader>
      {staff && (
        <div className="search-bar">
          <Search size={20} />
          <input
            aria-label="Rechercher un patient"
            placeholder="Nom, téléphone, assurance…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}
      {!staff && (
        <details className="panel practice-section">
          <summary>Rattacher un dossier créé par mon cabinet</summary>
          <MutationForm
            submit="Rattacher mon dossier"
            onSubmit={(body) => api("/my-files/link", { method: "POST", body })}
            onSuccess={() => {
              refresh((n) => n + 1);
              notify("Dossier rattaché à votre espace.");
            }}
          >
            <Field
              label="Code confidentiel remis par le médecin"
              name="token"
              required
              autoComplete="off"
            />
          </MutationForm>
        </details>
      )}
      <DataState state={state}>
        {({ data }) => {
          const rows = data.filter((p) =>
            JSON.stringify(p)
              .toLocaleLowerCase("fr")
              .includes(search.toLocaleLowerCase("fr")),
          );
          return rows.length ? (
            <div className="patient-list">
              {rows.map((p) => (
                <button
                  key={p.id}
                  className={`panel patient-choice ${selected?.id === p.id ? "selected" : ""}`}
                  onClick={() => select(p)}
                >
                  <strong>
                    {staff ? p.demographics?.name || p.name : p.name}
                  </strong>
                  <span>
                    {staff
                      ? p.demographics?.phone || "Coordonnées à compléter"
                      : p.specialty}
                  </span>
                  <span className="accent">Ouvrir le dossier →</span>
                </button>
              ))}
            </div>
          ) : (
            <section className="panel">
              <Empty
                title={
                  staff
                    ? "Aucun patient dans ce cabinet"
                    : "Aucun dossier rattaché"
                }
              >
                {staff
                  ? "Créez un dossier ou retrouvez les patients ayant réservé avec votre cabinet."
                  : "Vos dossiers apparaîtront après votre premier rendez-vous ou le rattachement par code."}
              </Empty>
            </section>
          );
        }}
      </DataState>
      {selected && (
        <PatientFile
          key={`${selected.id}-${revision}`}
          pid={staff ? selected.id : user.id}
          did={staff ? undefined : selected.id}
          user={user}
          notify={notify}
        />
      )}
      {create && (
        <Modal title="Nouveau dossier patient" onClose={() => setCreate(false)}>
          <MutationForm
            submit="Créer le dossier"
            onSubmit={(body) => api("/patients", { method: "POST", body })}
            onSuccess={({ data }) => {
              setCreate(false);
              refresh((n) => n + 1);
              select(data);
              notify("Dossier créé. Aucun identifiant de connexion partagé.");
            }}
          >
            <Demographics />
            <p className="fine-print">
              Le dossier ne crée pas de mot de passe patient. Un code de
              rattachement permet ensuite d’utiliser un compte personnel.
            </p>
          </MutationForm>
        </Modal>
      )}
    </>
  );
}
function PatientFile({ pid, did, user, notify }) {
  const [revision, refresh] = useState(0),
    [tab, setTab] = useState("identity"),
    [code, setCode] = useState(""),
    [error, setError] = useState("");
  const suffix = did ? `?doctor_id=${did}` : "",
    state = useData(`/patients/${pid}${suffix}`, revision),
    medical = user.role !== "secretariat";
  const changed = () => {
    refresh((n) => n + 1);
    notify("Dossier mis à jour.");
  };
  return (
    <section className="panel practice-section patient-file">
      <DataState state={state}>
        {({ data: p }) => (
          <>
            <div className="panel-heading">
              <div>
                <h2>{p.demographics.name || p.name}</h2>
                <p>Dossier du cabinet · #{p.id}</p>
              </div>
              {medical && (
                <button
                  className="button secondary"
                  onClick={() => window.print()}
                >
                  <Printer size={18} />
                  Imprimer / PDF
                </button>
              )}
            </div>
            <div className="filter-tabs" aria-label="Rubriques du dossier">
              {[
                ["identity", "Identité"],
                ...(medical
                  ? [
                      ["medical", "Dossier médical"],
                      ["history", "Consultations"],
                      ["vitals", "Constantes"],
                      ["documents", "Documents"],
                    ]
                  : []),
              ].map(([key, label]) => (
                <button
                  key={key}
                  aria-pressed={tab === key}
                  className={tab === key ? "active" : ""}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === "identity" &&
              (user.role === "patient" ? (
                <dl className="data-grid">
                  {demographicFields.map(([key, label]) => (
                    <div key={key}>
                      <dt>{label}</dt>
                      <dd>{p.demographics[key] || "—"}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <MutationForm
                  submit="Enregistrer les coordonnées"
                  onSubmit={(body) =>
                    api(`/patients/${pid}`, { method: "PUT", body })
                  }
                  onSuccess={changed}
                >
                  <Demographics value={p.demographics} />
                </MutationForm>
              ))}
            {tab === "identity" && user.role === "doctor" && (
              <div className="service-note">
                <h3>Accès au portail patient</h3>
                <p>
                  Remettez le code directement au patient après vérification de
                  son identité. Il expire après 24 heures et ne peut être
                  utilisé qu’une fois.
                </p>
                <button
                  className="button secondary"
                  onClick={async () => {
                    try {
                      const { data } = await api(
                        `/patients/${pid}/link-token`,
                        { method: "POST", body: {} },
                      );
                      setCode(data.token);
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  Créer un code de rattachement
                </button>
                {code && (
                  <p className="pre-wrap">
                    <code>{code}</code>
                  </p>
                )}
                <ErrorMessage message={error} />
              </div>
            )}
            {tab === "medical" &&
              (user.role === "doctor" ? (
                <MutationForm
                  submit="Enregistrer le dossier médical"
                  onSubmit={(body) =>
                    api(`/patients/${pid}/medical`, { method: "PUT", body })
                  }
                  onSuccess={changed}
                >
                  {[
                    ["history", "Antécédents"],
                    ["allergies", "Allergies"],
                    ["treatments", "Traitements en cours"],
                    ["diagnoses", "Diagnostics / pathologies"],
                  ].map(([key, label]) => (
                    <Field key={key} label={label}>
                      <textarea
                        name={key}
                        defaultValue={p.medical[key] || ""}
                        rows={4}
                        maxLength={15000}
                      />
                    </Field>
                  ))}
                </MutationForm>
              ) : (
                <div className="record-list">
                  {[
                    ["history", "Antécédents"],
                    ["allergies", "Allergies"],
                    ["treatments", "Traitements en cours"],
                    ["diagnoses", "Diagnostics / pathologies"],
                  ].map(([key, label]) => (
                    <section key={key}>
                      <h3>{label}</h3>
                      <p className="pre-wrap">
                        {p.medical[key] || "Non renseigné par le médecin."}
                      </p>
                    </section>
                  ))}
                </div>
              ))}
            {tab === "history" &&
              (p.consultations.length ? (
                <div className="record-list">
                  {p.consultations.map((c) => (
                    <article className="record" key={c.id}>
                      <h3>{date(c.created_at)}</h3>
                      {[
                        ["notes", "Compte rendu"],
                        ["prescription", "Ordonnance"],
                      ].map(
                        ([key, label]) =>
                          c[key] && (
                            <section key={key}>
                              <h3>{label}</h3>
                              <p className="pre-wrap">{c[key]}</p>
                            </section>
                          ),
                      )}
                      {Object.entries(c.clinical || {})
                        .filter(([, v]) => v)
                        .map(([key, value]) => (
                          <section key={key}>
                            <h3>
                              {
                                {
                                  reason: "Motif",
                                  examination: "Examen",
                                  diagnosis: "Diagnostic",
                                  lab_orders: "Bilans",
                                  imaging_orders: "Imagerie",
                                  certificate: "Certificat",
                                }[key]
                              }
                            </h3>
                            <p className="pre-wrap">{value}</p>
                          </section>
                        ))}
                    </article>
                  ))}
                </div>
              ) : (
                <Empty title="Aucune consultation enregistrée" />
              ))}
            {tab === "vitals" && (
              <Vitals pid={pid} suffix={suffix} user={user} notify={notify} />
            )}
            {tab === "documents" && (
              <Documents
                pid={pid}
                suffix={suffix}
                user={user}
                notify={notify}
              />
            )}
          </>
        )}
      </DataState>
    </section>
  );
}
function Vitals({ pid, suffix, user, notify }) {
  const [revision, refresh] = useState(0),
    [metric, setMetric] = useState("weight"),
    state = useData(`/patients/${pid}/vitals${suffix}`, revision);
  const fields = [
    ["weight", "Poids · kg"],
    ["height", "Taille · cm"],
    ["systolic", "Tension systolique · mmHg"],
    ["diastolic", "Tension diastolique · mmHg"],
    ["glucose", "Glycémie · g/L"],
    ["pulse", "Pouls · bpm"],
  ];
  return (
    <>
      <DataState state={state}>
        {({ data }) => (
          <>
            <Field label="Constante à afficher">
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
              >
                {fields.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Trend
              values={data.filter((v) => v[metric] != null)}
              metric={metric}
              label={fields.find((f) => f[0] === metric)[1]}
            />
            {data.length ? (
              <div className="table-wrap">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      {fields.map(([key, label]) => (
                        <th key={key}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((v) => (
                      <tr key={v.id}>
                        <td data-label="Date">{date(v.measured_at)}</td>
                        {fields.map(([key, label]) => (
                          <td key={key} data-label={label}>
                            {v[key] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty title="Aucune constante enregistrée" />
            )}
          </>
        )}
      </DataState>
      {user.role === "doctor" && (
        <MutationForm
          submit="Ajouter les constantes"
          onSubmit={(body) =>
            api(`/patients/${pid}/vitals`, { method: "POST", body })
          }
          onSuccess={() => {
            refresh((n) => n + 1);
            notify("Constantes enregistrées.");
          }}
        >
          <Field
            label="Date de mesure"
            type="date"
            name="measured_at"
            defaultValue={today()}
            required
          />
          <div className="form-grid">
            {fields.map(([key, label]) => (
              <Field
                key={key}
                label={label}
                type="number"
                name={key}
                step="0.01"
                min="0.01"
              />
            ))}
          </div>
        </MutationForm>
      )}
    </>
  );
}
function Trend({ values, metric, label }) {
  if (values.length < 2)
    return (
      <p className="muted">
        Deux mesures sont nécessaires pour tracer une courbe. Les valeurs
        restent disponibles dans le tableau.
      </p>
    );
  const low = Math.min(...values.map((v) => v[metric])),
    high = Math.max(...values.map((v) => v[metric])),
    range = high - low || 1,
    first = Date.parse(values[0].measured_at),
    last = Date.parse(values.at(-1).measured_at),
    span = last - first || 1;
  const points = values
    .map(
      (v) =>
        `${30 + ((Date.parse(v.measured_at) - first) / span) * 540},${155 - ((v[metric] - low) / range) * 120}`,
    )
    .join(" ");
  return (
    <figure className="vital-chart">
      <figcaption>
        {label} · {date(values[0].measured_at)} →{" "}
        {date(values.at(-1).measured_at)}
      </figcaption>
      <svg
        viewBox="0 0 600 190"
        role="img"
        aria-label={`Évolution : ${label}. Les valeurs exactes sont dans le tableau.`}
      >
        <line x1="30" y1="155" x2="570" y2="155" stroke="var(--border)" />
        <polyline
          points={points}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
        />
        {values.map((v, i) => {
          const [x, y] = points.split(" ")[i].split(",");
          return (
            <circle key={v.id} cx={x} cy={y} r="5" fill="var(--accent)">
              <title>
                {date(v.measured_at)} : {v[metric]}
              </title>
            </circle>
          );
        })}
        <text x="30" y="182" fill="var(--muted)" fontSize="12">
          {low}–{high}
        </text>
      </svg>
    </figure>
  );
}
function Documents({ pid, suffix, user, notify }) {
  const [revision, refresh] = useState(0),
    [file, setFile] = useState(null),
    [error, setError] = useState(""),
    state = useData(`/patients/${pid}/documents${suffix}`, revision);
  return (
    <>
      <DataState state={state}>
        {({ data }) =>
          data.length ? (
            <div className="record-list">
              {data.map((d) => (
                <article key={d.id} className="document-row">
                  <div>
                    <h3>{d.name}</h3>
                    <p>
                      {date(d.created_at)} · {Math.ceil(d.size / 1024)} Ko
                    </p>
                  </div>
                  <button
                    className="button secondary"
                    onClick={async () => {
                      try {
                        await downloadDocument(d.id);
                      } catch (e) {
                        setError(e.message);
                      }
                    }}
                  >
                    <Download size={18} />
                    Télécharger
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <Empty icon={FileText} title="Aucun document" />
          )
        }
      </DataState>
      <ErrorMessage message={error} />
      {user.role === "doctor" && (
        <MutationForm
          submit="Ajouter le document"
          onSubmit={async (body) => {
            if (!file || file.size > 3 * 1024 * 1024)
              throw Error("Choisissez un PDF, PNG ou JPEG de 3 Mo maximum.");
            const content_base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onerror = reject;
              reader.onload = () => resolve(reader.result.split(",")[1]);
              reader.readAsDataURL(file);
            });
            return api(`/patients/${pid}/documents`, {
              method: "POST",
              body: {
                ...body,
                name: file.name,
                mime: file.type,
                content_base64,
              },
            });
          }}
          onSuccess={() => {
            refresh((n) => n + 1);
            notify("Document ajouté au dossier.");
          }}
        >
          <Field
            label="Document · PDF, PNG, JPEG · 3 Mo maximum"
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <Field label="Catégorie">
            <select name="category">
              <option value="analysis">Analyses</option>
              <option value="imaging">Imagerie</option>
              <option value="report">Compte rendu</option>
              <option value="letter">Courrier</option>
              <option value="other">Autre</option>
            </select>
          </Field>
        </MutationForm>
      )}
    </>
  );
}
