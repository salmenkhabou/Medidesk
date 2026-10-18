import React from "react";
import { Stethoscope } from "lucide-react";
import { api } from "../ui/api";

import { date, today } from "../ui/format";
import { Field, Modal, MutationForm } from "../ui/components";
export default function Booking({ doctor, close, done }) {
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
            required
          />
          <Field
            label="Heure · Tunis"
            type="time"
            name="appointment_time"
            required
          />
        </div>
        <Field label="Motif · facultatif">
          <textarea name="reason" rows={3} maxLength={1000} />
        </Field>
      </MutationForm>
    </Modal>
  );
}
