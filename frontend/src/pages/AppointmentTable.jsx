import React from "react";

import { date } from "../ui/format";
import { Badge } from "../ui/components";
export default function AppointmentTable({ items, user, action }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{user.role === "patient" ? "Praticien" : "Patient"}</th>
            <th>Date & heure</th>
            <th>Statut</th>
            {action && (
              <th>
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td>
                <strong>
                  {user.role === "patient" ? a.doctor_name : a.patient_name}
                </strong>
                <small>
                  {user.role === "patient" ? a.specialty : a.doctor_name}
                </small>
              </td>
              <td>
                {date(a.appointment_date)}
                <small>{a.appointment_time} · Tunis</small>
              </td>
              <td>
                <Badge status={a.status} />
              </td>
              {action && <td>{action(a)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
