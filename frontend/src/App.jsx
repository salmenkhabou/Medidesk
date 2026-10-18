import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDownLeft,
  BarChart3,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Plus,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  Sun,
  Users,
  X,
} from "lucide-react";
import { api, saveToken } from "./ui/api";
import { PreferencesProvider, usePreferences } from "./ui/preferences";

import { roles } from "./ui/format";
import { Icon, Modal, Comfort, ErrorMessage } from "./ui/components";
import Access from "./pages/Access";
import Directory from "./pages/Directory";
import Booking from "./pages/Booking";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Records from "./pages/Records";
import Payments from "./pages/Payments";
import Suggestions from "./pages/Suggestions";
import Team from "./pages/Team";
import Applications from "./pages/Applications";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";

import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import { pages, resolvePage, canView } from "./site";
import { usePageMetadata } from "./ui/metadata";
import { AnalyticsProvider, usePageAnalytics } from "./ui/analytics";
const navigation = (user) =>
  user
    ? [
        ["dashboard", "Vue d’ensemble", LayoutDashboard],
        ["appointments", "Rendez-vous", CalendarDays],
        ...(["patient", "doctor"].includes(user.role)
          ? [
              [
                "records",
                user.role === "patient"
                  ? "Mon dossier médical"
                  : "Consultations",
                FileText,
              ],
            ]
          : []),
        ...(user.role !== "patient"
          ? [["payments", "Règlements", CreditCard]]
          : [["directory", "Trouver un praticien", Stethoscope]]),
        ...(["superadmin", "doctor"].includes(user.role)
          ? [["team", "Équipe", Users]]
          : []),
        ...(user.role === "superadmin"
          ? [["applications", "Demandes de praticiens", ClipboardList]]
          : []),
        ["suggestions", "Suggestions & retours", MessageSquare],
        ...(user.role === "superadmin"
          ? [
              ["audit", "Journal d’activité", ShieldCheck],
              ["analytics", "Statistiques", BarChart3],
            ]
          : []),
        ["settings", "Paramètres", Settings2],
      ]
    : [
        ["directory", "Nos praticiens", Stethoscope],
        ["login", "Connexion", ArrowDownLeft],
        ["application", "Rejoindre le réseau", Users],
        ["settings", "Affichage & confort", Settings2],
      ];
function Workspace() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [view, setView] = useState(() => resolvePage(location.pathname));
  const [mobile, setMobile] = useState(false);
  const [smallScreen, setSmallScreen] = useState(
    () => matchMedia("(max-width: 800px)").matches,
  );
  const drawer = useRef();
  const menuTrigger = useRef();
  const [comfort, setComfort] = useState(false);
  const [booking, setBooking] = useState(null);
  const [revision, setRevision] = useState(0);
  const [toast, setToast] = useState("");
  const timer = useRef();
  const main = useRef();
  const { effectiveTheme, set } = usePreferences();
  usePageMetadata(view);
  usePageAnalytics(view);
  const changePage = (key, replace = false) => {
    const target = pages[key] ? key : "notFound";
    if (location.pathname !== pages[target].path)
      history[replace ? "replaceState" : "pushState"](
        {},
        "",
        pages[target].path,
      );
    setView(target);
  };
  const logout = () => {
    if (sessionStorage.getItem("medidesk_session"))
      api("/auth/logout", { method: "POST", body: {} }).catch(() => {});
    saveToken(null);
    setUser(null);
    setBooking(null);
    changePage("login", true);
    setMobile(false);
  };
  useEffect(() => {
    // Retire prototype sessions; the server validates the current account on every request.
    localStorage.removeItem("medidesk_jwt_token");
    localStorage.removeItem("medidesk_current_user");
    (sessionStorage.getItem("medidesk_session")
      ? api("/auth/me")
      : Promise.reject(new Error(""))
    )
      .then(({ user }) => {
        setUser(user);
        if (
          ["directory", "login", "register"].includes(
            resolvePage(location.pathname),
          )
        )
          changePage("dashboard", true);
      })
      .catch((err) => {
        if (sessionStorage.getItem("medidesk_session"))
          setSessionError(err.message);
        saveToken(null);
      })
      .finally(() => setLoading(false));
    const expired = () => {
      logout();
      setSessionError("Votre session a expiré. Veuillez vous reconnecter.");
    };
    window.addEventListener("medidesk:unauthorized", expired);
    return () => {
      window.removeEventListener("medidesk:unauthorized", expired);
      clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    const onPop = () => {
      setView(resolvePage(location.pathname));
      setMobile(false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    const media = matchMedia("(max-width: 800px)");
    const resize = () => {
      setSmallScreen(media.matches);
      setMobile(false);
    };
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);
  useEffect(() => {
    if (!mobile || !smallScreen) return;
    const panel = drawer.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = () =>
      [
        ...panel.querySelectorAll(
          'button:not([disabled]), a[href], [tabindex="0"]',
        ),
      ].filter((element) => element.getClientRects().length);
    controls()[0]?.focus();
    const keyboard = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobile(false);
      }
      if (event.key !== "Tab") return;
      const items = controls(),
        first = items[0],
        last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    panel.addEventListener("keydown", keyboard);
    return () => {
      panel.removeEventListener("keydown", keyboard);
      document.body.style.overflow = overflow;
      if (panel.contains(document.activeElement))
        (previous?.isConnected ? previous : menuTrigger.current)?.focus();
    };
  }, [mobile, smallScreen]);
  const navigate = (next) => {
    changePage(next);
    setMobile(false);
    setSessionError("");
    window.scrollTo(0, 0);
    requestAnimationFrame(() => main.current?.focus());
  };
  const notify = (message) => {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(""), 6000);
  };
  const refresh = () => setRevision((n) => n + 1);
  const nav = navigation(user);
  const access = ["login", "register", "application"].includes(view);
  const quickNav = user
    ? nav.slice(0, 3)
    : [
        ["directory", "Praticiens", Stethoscope],
        ["login", "Connexion", ArrowDownLeft],
        ["settings", "Réglages", Settings2],
      ];
  return (
    <>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <header className="topbar" inert={mobile && smallScreen ? "" : undefined}>
        <div className="brand-group">
          <button
            ref={menuTrigger}
            className="icon-button mobile-toggle"
            aria-controls="main-navigation"
            aria-label="Ouvrir la navigation"
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            <Menu size={22} />
          </button>
          <button
            className="brand"
            onClick={() => navigate(user ? "dashboard" : "directory")}
            aria-label="MediDesk · accueil"
          >
            <span className="brand-mark">
              <Plus size={25} strokeWidth={2.5} />
            </span>
            <span>
              Medi<span className="brand-light">Desk</span>
              <small>LE SOIN, MIEUX ORGANISÉ</small>
            </span>
          </button>
        </div>
        <div className="topbar-actions">
          <button
            className="icon-button"
            aria-label={
              effectiveTheme === "dark"
                ? "Activer le thème clair"
                : "Activer le thème sombre"
            }
            onClick={() =>
              set("theme", effectiveTheme === "dark" ? "light" : "dark")
            }
          >
            <Icon icon={effectiveTheme === "dark" ? Sun : Moon} />
          </button>
          <button
            className="icon-button comfort-shortcut"
            aria-label="Préférences de confort"
            onClick={() => setComfort(true)}
          >
            <Icon icon={SlidersHorizontal} />
          </button>
          <span className="topbar-divider" />
          {user ? (
            <>
              <span className="avatar small">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <div className="header-user">
                <strong>{user.name}</strong>
                <small>{roles[user.role]}</small>
              </div>
            </>
          ) : (
            <button
              className="button small primary"
              onClick={() => navigate("login")}
            >
              Connexion
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </header>
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="Fermer la navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        id="main-navigation"
        ref={drawer}
        className={`sidebar ${mobile ? "is-open" : ""}`}
        role={smallScreen && mobile ? "dialog" : undefined}
        aria-modal={smallScreen && mobile ? true : undefined}
        aria-label={smallScreen && mobile ? "Menu de navigation" : undefined}
        inert={smallScreen && !mobile ? "" : undefined}
      >
        <div className="drawer-heading">
          <strong>Votre espace MediDesk</strong>
          <button
            className="icon-button"
            aria-label="Fermer le menu"
            onClick={() => setMobile(false)}
          >
            <X size={22} />
          </button>
        </div>
        <div className="workspace-label">
          {user ? roles[user.role] : "BIENVENUE"}
          <span>{user ? "Espace personnel" : "Votre parcours de santé"}</span>
        </div>
        <span className="nav-label">{user ? "MON ESPACE" : "DÉCOUVRIR"}</span>
        <nav aria-label="Navigation principale">
          {nav.map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => navigate(key)}
              aria-current={view === key ? "page" : undefined}
              className={view === key ? "active" : ""}
            >
              <Icon icon={icon} />
              <span>{label}</span>
              {view === key && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Heart size={20} />
            <strong>Votre confort compte</strong>
            <p>Adaptez l’affichage à votre façon de travailler.</p>
            <button onClick={() => setComfort(true)}>
              Personnaliser
              <ArrowRight size={14} />
            </button>
          </div>
          {user && (
            <button className="logout" onClick={logout}>
              <LogOut size={18} />
              Se déconnecter
            </button>
          )}
          <div className="sidebar-signature">
            MediDesk<span>Gestion & suivi médical</span>
          </div>
        </div>
      </aside>
      <div className="workspace" inert={mobile && smallScreen ? "" : undefined}>
        <main id="main" ref={main} tabIndex={-1}>
          <div className="breadcrumb">
            MediDesk
            <ChevronRight size={13} />
            <span>
              {nav.find((n) => n[0] === view)?.[1] || pages[view]?.title}
            </span>
          </div>
          <ErrorMessage message={sessionError} />
          {loading ? (
            <div className="loading" role="status">
              Ouverture de votre espace…
            </div>
          ) : view === "notFound" ? (
            <NotFound navigate={navigate} user={user} />
          ) : view === "privacy" ? (
            <Privacy />
          ) : user && !canView(view, user) ? (
            <NotFound navigate={navigate} user={user} denied />
          ) : view === "settings" ? (
            <Settings user={user} onUser={setUser} notify={notify} />
          ) : (access || !pages[view]?.public) && !user ? (
            <Access
              mode={access ? view : "login"}
              onMode={navigate}
              onLogin={(u) => {
                setUser(u);
                navigate("dashboard");
              }}
              notify={notify}
            />
          ) : view === "directory" || !user ? (
            <Directory user={user} book={setBooking} navigate={navigate} />
          ) : view === "dashboard" ? (
            <Dashboard user={user} revision={revision} navigate={navigate} />
          ) : view === "appointments" ? (
            <Appointments
              user={user}
              revision={revision}
              refresh={refresh}
              notify={notify}
            />
          ) : view === "records" ? (
            <Records revision={revision} user={user} />
          ) : view === "payments" ? (
            <Payments revision={revision} />
          ) : view === "suggestions" ? (
            <Suggestions
              user={user}
              revision={revision}
              refresh={refresh}
              notify={notify}
            />
          ) : view === "team" ? (
            <Team
              user={user}
              revision={revision}
              refresh={refresh}
              notify={notify}
            />
          ) : view === "applications" ? (
            <Applications
              revision={revision}
              refresh={refresh}
              notify={notify}
            />
          ) : view === "analytics" ? (
            <Analytics revision={revision} />
          ) : view === "audit" ? (
            <Audit revision={revision} />
          ) : (
            <Dashboard user={user} revision={revision} navigate={navigate} />
          )}
        </main>
        <footer className="site-footer">
          <span>© {new Date().getFullYear()} MediDesk</span>
          <a
            href="/confidentialite"
            onClick={(e) => {
              e.preventDefault();
              navigate("privacy");
            }}
          >
            Confidentialité & mesure d’audience
          </a>
          <button
            onClick={() => {
              navigate("settings");
            }}
          >
            Affichage & accessibilité
          </button>
        </footer>
      </div>
      <nav
        className="mobile-nav"
        aria-label="Navigation rapide"
        inert={mobile && smallScreen ? "" : undefined}
      >
        {quickNav.map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => navigate(key)}
            aria-current={view === key ? "page" : undefined}
          >
            <Icon icon={icon} size={21} />
            <span>{label}</span>
          </button>
        ))}
        <button
          onClick={() => setMobile(true)}
          aria-label="Ouvrir le menu complet"
          aria-expanded={mobile}
          aria-controls="main-navigation"
        >
          <Menu size={21} />
          <span>Menu</span>
        </button>
      </nav>
      {comfort && (
        <Modal
          title="Votre confort de lecture"
          onClose={() => setComfort(false)}
        >
          <Comfort />
        </Modal>
      )}
      {booking && (
        <Booking
          doctor={booking}
          close={() => setBooking(null)}
          done={() => {
            setBooking(null);
            refresh();
            notify("Rendez-vous confirmé. Retrouvez-le dans votre agenda.");
            navigate("appointments");
          }}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={19} />
          <span>{toast}</span>
          <button
            aria-label="Fermer la notification"
            onClick={() => setToast("")}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </>
  );
}
export default function App() {
  return (
    <PreferencesProvider>
      <AnalyticsProvider>
        <Workspace />
      </AnalyticsProvider>
    </PreferencesProvider>
  );
}
