import React, { useState } from "react";
import { Stethoscope } from "lucide-react";
import { api } from "../ui/api";

import { date, today } from "../ui/format";
import {
  Field,
  Modal,
  MutationForm,
  useData,
  DataState,
} from "../ui/components";
export default function Booking({ doctor, close, done }) {
  const [day, setDay] = useState(today()),
    [hour, setHour] = useState("");
  const slots = useData(
    `/schedule?doctor_id=${doctor.id}&from=${day}&to=${day}`,
  );
  return (
    <Modal title="Prendre rendez-vous" onClose={close}>
      <div className="inset-summary">
        <Stethoscope size={22} />
        <div>
          <strong>{doctor.name}</strong>
          <p>
            {doctor.specialty} · {doctor.city}
          </p>
        </div>
      </div>
      <p className="muted">
        Les horaires sont exprimés en heure de Tunis. Un créneau déjà réservé ne
        peut pas être sélectionné deux fois.
      </p>
      <MutationForm
        submit="Confirmer le rendez-vous"
        onSubmit={(body) =>
          api("/appointments", {
            method: "POST",
            body: { ...body, doctor_id: doctor.id },
          })
        }
        onSuccess={done}
      >
        <div className="form-grid">
          <Field
            label="Date"
            type="date"
            name="appointment_date"
            min={today()}
            value={day}
            onChange={(e) => {
              setDay(e.target.value || today());
              setHour("");
            }}
            required
          />
          <Field
            label="Heure · Tunis"
            type="time"
            name="appointment_time"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            required
          />
        </div>
        <DataState state={slots}>
          {({ data, published }) =>
            published ? (
              <div className="published-slots">
                <p>Choisissez un créneau publié :</p>
                {data.length ? (
                  <div className="slot-grid">
                    {data.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        className={`button ${hour === s.slot_time ? "primary" : "secondary"}`}
                        aria-pressed={hour === s.slot_time}
                        onClick={() => setHour(s.slot_time)}
                      >
                        {s.slot_time} · {s.duration} min
                      </button>
                    ))}
                  </div>
                ) : (
                  <p>
                    Aucun créneau libre ce jour. Choisissez une autre date ou
                    rejoignez la liste d’attente dans Agenda & attente.
                  </p>
                )}
              </div>
            ) : (
              <p className="fine-print">
                Ce cabinet n’a pas encore publié de créneaux. La réservation
                libre reste disponible sous réserve des rendez-vous déjà enregistrés.
              </p>
            )
          }
        </DataState>
        <Field label="Motif · facultatif">
          <textarea name="reason" rows={3} maxLength={1000} />
        </Field>
      </MutationForm>
    </Modal>
  );
}
