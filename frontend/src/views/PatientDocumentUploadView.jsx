import React, { useState } from 'react';

export default function PatientDocumentUploadView({ setView }) {
  const [category, setCategory] = useState('laboratoire');
  const [doctorAssociation, setDoctorAssociation] = useState('dr-ben-mahmoud');
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(72);
  const [files, setFiles] = useState([
    {
      id: 'F1',
      name: 'Bilan_Biologique_Lipidique_Oct2024.pdf',
      size: '3.4 Mo',
      category: "Résultats d'analyses (Laboratoire)",
      progress: 72,
      status: 'uploading'
    },
    {
      id: 'F2',
      name: 'CIN_Yasmine_BenAmor_RectoVerso.jpg',
      size: '1.8 Mo',
      category: "Pièce d'identité (Vérifiée)",
      status: 'success',
      date: "Aujourd'hui à 10:42",
      doctor: 'Dr. Karim Ben Mahmoud'
    },
    {
      id: 'F3',
      name: 'Compte_Rendu_Echo_Cardiaque_Alyssa.pdf',
      size: '6.2 Mo',
      category: 'Imagerie médicale',
      status: 'success',
      date: 'Hier à 16:15',
      doctor: 'Laboratoire Berges du Lac'
    },
    {
      id: 'F4',
      name: 'Ordonnance_Scan_Flou.png',
      size: '8.1 Mo',
      category: 'Échec d\'analyse de lisibilité',
      status: 'error',
      errorReason: 'Fichier illisible — Résolution insuffisante'
    }
  ]);

  const handleSimulatedDrop = (e) => {
    e.preventDefault();
    handleUploadFile('Nouvel_Analyse_Sanguine.pdf');
  };

  const handleUploadFile = (fileName = 'Document_Patient_Scanne.pdf') => {
    setUploading(true);
    fetch('/api/patient/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, doctorId: doctorAssociation, note, fileName })
    })
      .then((res) => res.json())
      .then((data) => {
        setUploading(false);
        if (data.success) {
          setFiles((prev) => [
            {
              id: data.file.id,
              name: data.file.fileName,
              size: '2.4 Mo',
              category: 'Analyse Médicale',
              status: 'success',
              date: "Aujourd'hui",
              doctor: 'Dr. Karim Ben Mahmoud'
            },
            ...prev
          ]);
        }
      })
      .catch((err) => {
        console.error('Error uploading file:', err);
        setUploading(false);
      });
  };

  return (
    <div className="w-full bg-background font-body-md text-on-surface min-h-screen flex flex-col pb-16">
      
      {/* Top Header Strip */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* Breadcrumb & Title */}
        <section className="space-y-4">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <button onClick={() => setView('patient-dashboard')} className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">home</span>
              Accueil
            </button>
            <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <button onClick={() => setView('patient-medical-record')} className="hover:text-primary transition-colors">Mes Documents</button>
            <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
            <span className="text-primary font-bold">Ajouter un document médical</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-xs font-semibold">
                <span className="material-symbols-outlined text-[15px]">lock</span>
                <span>Canal crypté de bout en bout • HDS Tunisie</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                Ajouter un document à mon dossier
              </h1>
              <p className="text-body-md text-on-surface-variant text-sm">
                Transmettez vos pièces d'identité, résultats d'analyses, ordonnances ou imageries pour votre équipe soignante. Les fichiers sont chiffrés de bout en bout et certifiés conformes INPDP.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
              <div className="bg-surface-container-low px-4 py-2.5 rounded-xl space-y-1.5 w-full sm:w-auto">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-primary">cloud_done</span>
                    Espace Patient Sécurisé
                  </span>
                  <span className="text-xs text-primary font-bold">48 Mo / 5 Go</span>
                </div>
                <div className="w-full sm:w-56 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '1.2%' }}></div>
                </div>
                <p className="text-[11px] text-outline">99% d'espace libre restant</p>
              </div>
            </div>
          </div>
        </section>

        {/* 1. Configuration & Metadata Form */}
        <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-low">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Configuration &amp; Métadonnées du dépôt</h2>
                <p className="text-xs text-on-surface-variant">Précisez le type de pièce et associez-le au praticien concerné.</p>
              </div>
            </div>
            <span className="text-xs text-secondary bg-secondary-fixed/40 px-2.5 py-1 rounded-md font-semibold">
              * Champ obligatoire
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center justify-between" htmlFor="doc-cat">
                <span>Catégorie du document <span className="text-secondary">*</span></span>
              </label>
              <div className="relative">
                <select
                  id="doc-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 pl-11 pr-10 bg-surface-container-low text-on-surface text-sm rounded-xl focus:outline-none focus:bg-surface-container-lowest transition-colors cursor-pointer border border-transparent focus:border-primary"
                >
                  <option value="laboratoire">🧪 Résultats d'analyses &amp; Biologie (Laboratoire)</option>
                  <option value="cin">🪪 Pièce d'identité (CIN / Passeport tunisien)</option>
                  <option value="imagerie">🩻 Imagerie médicale (Radio, Scanner, Écho, IRM)</option>
                  <option value="ordonnance">📋 Ordonnance antérieure</option>
                  <option value="justificatif">📄 Autre pièce justificative (Prise en charge CNAM)</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary">
                  <span className="material-symbols-outlined text-[20px]">science</span>
                </div>
              </div>
            </div>

            {/* Practitioner */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center justify-between" htmlFor="doctor-assoc">
                <span>Associer à une consultation ou un médecin</span>
                <span className="text-outline text-[11px]">Optionnel</span>
              </label>
              <div className="relative">
                <select
                  id="doctor-assoc"
                  value={doctorAssociation}
                  onChange={(e) => setDoctorAssociation(e.target.value)}
                  className="w-full h-11 pl-11 pr-10 bg-surface-container-low text-on-surface text-sm rounded-xl focus:outline-none focus:bg-surface-container-lowest transition-colors cursor-pointer border border-transparent focus:border-primary"
                >
                  <option value="dr-ben-mahmoud">Dr. Karim Ben Mahmoud (Cardiologie) — Prochaine visite du 29 Oct.</option>
                  <option value="all-team">Tout mon dossier soignant (Tous les médecins autorisés)</option>
                  <option value="dr-amara">Dr. Leila Amara (Médecine Générale)</option>
                  <option value="none">Archive personnelle (Privée uniquement)</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary">
                  <span className="material-symbols-outlined text-[20px]">stethoscope</span>
                </div>
              </div>
            </div>
          </div>

          {/* Short Note */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-on-surface flex items-center justify-between" htmlFor="upload-note">
              <span>Ajouter une note ou remarque clinique pour le médecin</span>
            </label>
            <textarea
              id="upload-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Dernier bilan sanguin à jeun du laboratoire Berges du Lac. Glycémie et profil lipidique complets..."
              rows={2}
              className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface text-sm rounded-xl focus:outline-none focus:bg-surface-container-lowest placeholder:text-outline border border-transparent focus:border-primary transition-colors resize-none"
            />
          </div>
        </section>

        {/* 2. Interactive Dropzone */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Déposez votre document médical</h2>
              <p className="text-xs text-on-surface-variant">Sélectionnez le fichier depuis votre appareil ou prenez une photo haute définition.</p>
            </div>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleSimulatedDrop}
            className="group relative rounded-2xl bg-surface-container-low hover:bg-surface-container-high/40 transition-all p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm border-2 border-dashed border-primary/30"
          >
            <div className="w-16 h-16 rounded-2xl bg-surface-container-lowest shadow-md flex items-center justify-center text-primary group-hover:scale-105 transition-transform mb-4">
              <span className="material-symbols-outlined text-[40px]">cloud_upload</span>
            </div>

            <div className="max-w-xl space-y-1 mb-4">
              <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Glissez-déposez vos fichiers ici, ou parcourez vos dossiers
              </p>
              <p className="text-xs text-on-surface-variant">
                Formats acceptés : <strong className="text-on-surface font-semibold">PDF, JPG, JPEG, PNG, DICOM</strong> • Taille max : <strong className="text-on-surface font-semibold">25 Mo</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => handleUploadFile()}
                disabled={uploading}
                className="px-6 py-3 rounded-xl bg-primary text-on-primary font-label-lg text-xs font-bold shadow-sm hover:bg-primary-container transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">{uploading ? 'sync' : 'folder_open'}</span>
                <span>{uploading ? 'Téléversement en cours...' : 'Sélectionner un fichier depuis l\'ordinateur'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3. Live Uploads List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Téléversement en cours &amp; Fichiers récents</h2>
                <p className="text-xs text-on-surface-variant">Supervisez l'état de validation de vos pièces rattachées.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="relative bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    file.status === 'uploading'
                      ? 'bg-primary'
                      : file.status === 'success'
                      ? 'bg-emerald-600'
                      : 'bg-red-500'
                  }`}
                />

                <div className="flex items-start gap-4 flex-1 min-w-0 pl-2">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-bold">
                    <span className="material-symbols-outlined text-[26px]">
                      {file.status === 'error' ? 'broken_image' : 'description'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-on-surface truncate">{file.name}</h3>
                      <span className="text-xs text-on-surface-variant">{file.size}</span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold">
                        {file.category}
                      </span>
                    </div>

                    {file.status === 'uploading' && (
                      <div className="space-y-1 max-w-xl">
                        <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300 animate-pulse"
                            style={{ width: `${file.progress || 72}%` }}
                          />
                        </div>
                        <span className="text-xs text-primary font-semibold">Téléversement et chiffrement AES-256...</span>
                      </div>
                    )}

                    {file.status === 'success' && (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">verified_user</span>
                        {file.date} • Transmis et certifié INPDP
                      </span>
                    )}

                    {file.status === 'error' && (
                      <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">error</span>
                        {file.errorReason}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  {file.status === 'error' && (
                    <button
                      onClick={() => handleUploadFile(file.name)}
                      className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">replay</span>
                      Réessayer
                    </button>
                  )}
                  {file.status === 'success' && (
                    <button onClick={() => window.print()} className="p-2 rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security & Compliance Banner */}
        <section className="rounded-2xl bg-surface-container-low p-6 space-y-4 shadow-sm border border-surface-container-high">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[28px]">security</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Protection de vos données de santé</h3>
                <p className="text-xs text-on-surface-variant">Normes souveraines de confidentialité clinique en vigueur en République Tunisienne.</p>
              </div>
            </div>
            <span className="text-xs text-primary font-bold bg-surface-container-lowest px-4 py-1.5 rounded-full shadow-xs border border-surface-container">
              Certifié ISO 27001 &amp; HDS
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setView('patient-medical-record')}
              className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
              Terminer et retourner au dossier médical
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
