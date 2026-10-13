import React, { useState, useEffect } from 'react';
import { fetchSuperAdminTeam } from '../services/api';

export default function SuperAdminTeamPermissionsView({ setView }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await fetchSuperAdminTeam();
      setTeam(res.team || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-500/30">
                Gouvernance MediDesk
              </span>
              <h1 className="text-2xl font-bold text-white">Équipe SuperAdmin & Droits d'Accès</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Gestion des comptes administrateurs plateforme, ingénieurs HDS et agents de conformité CNOM.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setView('superadmin')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors">
              ← Dashboard Principal
            </button>
          </div>
        </div>


        {/* Team Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Chargement de l'équipe...</div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Membres de l'Équipe d'Administration</h3>
              <button className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all">
                + Ajouter un Administrateur
              </button>
            </div>

            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Nom & Email</th>
                  <th className="p-3">Rôle Platforme</th>
                  <th className="p-3">Droits d'Accès</th>
                  <th className="p-3">Authentification 2FA</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {team.map(member => (
                  <tr key={member.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{member.name}</div>
                      <div className="text-xs text-slate-400">{member.email}</div>
                    </td>
                    <td className="p-3 font-semibold text-teal-400">{member.role}</td>
                    <td className="p-3 text-xs text-slate-200">{member.permissions}</td>
                    <td className="p-3">
                      <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {member['2fa'] ? '✓ TOTP Enforced' : 'Non configuré'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-emerald-300 font-semibold">{member.status}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg">
                        Gérer Rôle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
