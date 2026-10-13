import React, { useState, useEffect } from 'react';

export default function PatientNotificationCenterView({ setView }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [notificationGroups, setNotificationGroups] = useState([]);
  const [unreadCount, setUnreadCount] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/patient/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotificationGroups(data.groups || []);
          setUnreadCount(data.unreadCount || 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching notifications:', err);
        setLoading(false);
      });
  }, []);

  const handleMarkAllRead = () => {
    fetch('/api/patient/notifications/read-all', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUnreadCount(0);
          setNotificationGroups((prev) =>
            prev.map((g) => ({
              ...g,
              items: g.items.map((item) => ({ ...item, read: true }))
            }))
          );
        }
      });
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center p-8">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface min-h-screen flex flex-col pb-16">
      
      {/* Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
          <button onClick={() => setView('patient-dashboard')} className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">home</span>
            Accueil
          </button>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-semibold">Centre de notifications</span>
        </nav>

        {/* Page Header */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                Notifications &amp; Alertes de Soins
              </h1>
              {unreadCount > 0 ? (
                <span className="px-3 py-1 rounded-full bg-secondary text-on-secondary text-xs font-bold shadow-sm inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  {unreadCount} non-lues
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-surface-container text-primary text-xs font-bold inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  Tout est à jour
                </span>
              )}
            </div>
            <p className="text-body-md text-on-surface-variant text-sm max-w-2xl">
              Suivi en temps réel de vos consultations, ordonnances sécurisées et alertes cliniques pour votre dossier <span className="font-bold text-primary">#TN-8831</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleMarkAllRead}
              className="h-11 px-4 rounded-xl bg-surface-container-lowest text-primary hover:bg-surface-container transition-all shadow-sm text-xs font-bold flex items-center gap-2 border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              Tout marquer comme lu
            </button>
            <button
              onClick={() => setView('patient-account-settings')}
              className="h-11 px-4 rounded-xl bg-primary-container text-on-primary hover:bg-primary transition-all shadow-sm text-xs font-bold flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Paramètres
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT Notifications Stream */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* Filter Tabs */}
            <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-sm border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    filterCategory === 'all'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span>Toutes</span>
                </button>
                <button
                  onClick={() => setFilterCategory('appointments')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    filterCategory === 'appointments'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span>Rendez-vous</span>
                </button>
                <button
                  onClick={() => setFilterCategory('documents')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    filterCategory === 'documents'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  <span>Documents</span>
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none px-2 py-1">
                <span className="text-xs text-on-surface-variant font-medium">Non-lues uniquement</span>
                <input
                  type="checkbox"
                  checked={onlyUnread}
                  onChange={(e) => setOnlyUnread(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
              </label>
            </div>

            {/* Notification Groups */}
            <div className="space-y-6">
              {notificationGroups.map((group, groupIdx) => {
                const filteredItems = group.items.filter((item) => {
                  const matchCat = filterCategory === 'all' || item.category === filterCategory;
                  const matchUnread = !onlyUnread || !item.read;
                  return matchCat && matchUnread;
                });

                if (filteredItems.length === 0) return null;

                return (
                  <div key={groupIdx} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">{group.title}</span>
                      <div className="h-px bg-surface-container-high flex-grow" />
                    </div>

                    <div className="space-y-3">
                      {filteredItems.map((item) => (
                        <article
                          key={item.id}
                          className={`relative rounded-2xl p-5 shadow-sm border border-surface-container-high flex flex-col sm:flex-row items-start gap-4 transition-all ${
                            item.read ? 'bg-surface-container-lowest' : 'bg-surface-container-low'
                          }`}
                        >
                          <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-2xl ${item.priority ? 'bg-secondary' : 'bg-primary'}`} />

                          <div className="shrink-0 pl-1">
                            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shadow-sm">
                              <span className="material-symbols-outlined text-[24px]">
                                {item.category === 'appointments' ? 'event_available' : 'prescriptions'}
                              </span>
                            </div>
                          </div>

                          <div className="flex-grow min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.priority ? 'bg-secondary text-on-secondary' : 'bg-primary/10 text-primary'}`}>
                                  {item.badge}
                                </span>
                                <h3 className="font-bold text-on-surface text-base mt-1">{item.title}</h3>
                              </div>
                              <span className="text-xs text-outline">{item.time}</span>
                            </div>

                            <p className="text-sm text-on-surface-variant leading-relaxed">{item.description}</p>

                            {item.action && (
                              <div className="pt-2">
                                <button 
                                  onClick={() => {
                                    if (item.category === 'appointments') setView('patient-queue-tracker');
                                    else setView('patient-medical-record');
                                  }}
                                  className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-colors shadow-sm"
                                >
                                  {item.action}
                                </button>
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* RIGHT Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">contactless</span>
                <h2 className="font-bold text-sm text-on-surface">Canaux de réception</h2>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                  <div>
                    <span className="font-bold text-on-surface block">+216 20 123 456</span>
                    <span className="text-on-surface-variant">SMS Prioritaire</span>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Actif</span>
                </li>
                <li className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                  <div>
                    <span className="font-bold text-on-surface block">yasmine.b***@gmail.com</span>
                    <span className="text-on-surface-variant">Email PDF</span>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Actif</span>
                </li>
              </ul>
            </div>
          </aside>

        </div>

      </div>
    </div>
  );
}
