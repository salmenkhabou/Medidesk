import React from 'react';

export default function StyleGuideView() {
  return (
    <div className="w-full min-h-screen bg-[#f4f7fb] text-slate-800 font-sans pb-24 pt-4">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
        
        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-[#0f6e6a] via-[#155e5b] to-[#0c3c39] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-xs border border-white/10">
              <span>🩺 Système d'Interface Médicale Souveraine</span>
              <span>•</span>
              <span className="text-amber-300">Tunisie & Afrique du Nord</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Référentiel Graphique & Bibliothèque UI MediDesk</h1>
            <p className="text-teal-100 text-sm leading-relaxed">
              Cette planche officielle rassemble les fondations visuelles, les logotypes, le système iconographique médical, la palette chromatique certifiée déontologique et l'ensemble des atomes UI utilisés à travers tous les modules MediDesk.
            </p>
          </div>
        </div>

        {/* 1. BRANDING & LOGOTYPES */}
        <section id="branding" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>🏷️ 1. Identité de Marque & Logotypes Officiels</span>
              </h2>
              <p class="text-xs text-slate-500">Logos vectoriels primaires, variantes sombres, monogrammes et favicons cliniques</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Tokens: brand.logo.*</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Brand Logo Light */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Logotype Principal (Fond Clair)</span>
                <div className="h-28 flex items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0f6e6a] flex items-center justify-center text-white shadow-md">
                      <span className="material-symbols-outlined text-[28px]">medical_services</span>
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">MediDesk</div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-[#0f6e6a]">CLINIC OS • TUNISIE</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Usage : Portails & Entêtes</span>
                <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded">SVG Vectorial</span>
              </div>
            </div>

            {/* Brand Logo Dark */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Logotype Inversé (Fond Sombre)</span>
                <div className="h-28 flex items-center justify-center p-4 bg-[#0a4b48] rounded-xl border border-teal-900">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#0f6e6a] shadow-md">
                      <span className="material-symbols-outlined text-[28px]">medical_services</span>
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-white tracking-tight leading-none">MediDesk</div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-teal-200">SANTÉ SOUVERAINE</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Usage : Footers sombres</span>
                <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded">SVG Contrast</span>
              </div>
            </div>

            {/* Monograms */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Monogrammes & App Icons</span>
                <div className="h-28 flex items-center justify-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-[#0f6e6a] text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[28px]">stethoscope</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#fd8863] text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[28px]">favorite</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shadow-md font-mono font-bold text-lg">
                    M+
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Usage : Favicon & PWA Icons</span>
                <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Multiple Sizes</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. COLOR PALETTE */}
        <section id="colors" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>🎨 2. Palette Chromatique Médicale Certifiée</span>
              </h2>
              <p className="text-xs text-slate-500">Harmonie clinique : Sarcelle médicale (#0F6E6A), corail (#FD8863) et neutres fonctionnels</p>
            </div>
            <span className="text-xs font-mono text-slate-400">HEX / Tokens</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="h-20 bg-[#005451] flex items-end p-2 text-white text-[10px] font-bold">PRIMARY DARK</div>
              <div className="p-3 space-y-1">
                <p className="text-xs font-bold text-slate-900">Sarcelle Profonde</p>
                <p className="font-mono text-[11px] text-slate-600">#005451</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="h-20 bg-[#0f6e6a] flex items-end p-2 text-white text-[10px] font-bold">PRIMARY MAIN</div>
              <div className="p-3 space-y-1">
                <p className="text-xs font-bold text-slate-900">Sarcelle Clinique</p>
                <p className="font-mono text-[11px] text-slate-600">#0F6E6A</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="h-20 bg-[#fd8863] flex items-end p-2 text-white text-[10px] font-bold">SECONDARY ACCENT</div>
              <div className="p-3 space-y-1">
                <p className="text-xs font-bold text-slate-900">Corail Chaleureux</p>
                <p className="font-mono text-[11px] text-slate-600">#FD8863</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="h-20 bg-[#9f4122] flex items-end p-2 text-white text-[10px] font-bold">SECONDARY DARK</div>
              <div className="p-3 space-y-1">
                <p className="text-xs font-bold text-slate-900">Terre Cuite</p>
                <p className="font-mono text-[11px] text-slate-600">#9F4122</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="h-20 bg-[#f8f9ff] border-b border-slate-200 flex items-end p-2 text-slate-600 text-[10px] font-bold">SURFACE BACKGROUND</div>
              <div className="p-3 space-y-1">
                <p className="text-xs font-bold text-slate-900">Gris Glacé Soft</p>
                <p className="font-mono text-[11px] text-slate-600">#F8F9FF</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="h-20 bg-[#121c2a] flex items-end p-2 text-white text-[10px] font-bold">TEXT ON-SURFACE</div>
              <div className="p-3 space-y-1">
                <p className="text-xs font-bold text-slate-900">Ardoise Nuit</p>
                <p className="font-mono text-[11px] text-slate-600">#121C2A</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE COMPONENTS */}
        <section id="components" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>🧩 3. Composants UI & Boutons</span>
              </h2>
              <p className="text-xs text-slate-500">Spécifications interactives des boutons, badges et cartes de données cliniques</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Design Tokens 2.0</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Variantes de Boutons</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button className="px-4 py-2 rounded-xl bg-[#005451] hover:bg-[#0f6e6a] text-white text-xs font-bold shadow-xs transition flex items-center gap-2">
                  <span>Enregistrer consultation</span>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                </button>

                <button className="px-4 py-2 rounded-xl bg-[#fd8863] hover:bg-[#9f4122] text-white text-xs font-bold shadow-xs transition flex items-center gap-2">
                  <span>Prendre rendez-vous</span>
                  <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                </button>

                <button className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition">
                  Annuler
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Badges & Pastilles Médicales</h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Présentiel Cabinet
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Téléconsultation
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  En Salle d'Attente
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
