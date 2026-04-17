import React, { useState, useEffect } from "react";
import {
  Terminal,
  Lock,
  Unlock,
  Eye,
  Database,
  Grid,
  Radio,
  Skull,
  ChevronRight,
  Zap,
  ExternalLink,
  User,
  Image as ImageIcon,
} from "lucide-react";

// --- FIREBASE DATABASE IMPORTS ---
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// --- CONFIGURATION ---
const IG_DOC_URL =
  "https://www.instagram.com/dimension_overdose?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";
const IG_TOD_URL =
  "https://www.instagram.com/totalxoverdose?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";

// --- SET YOUR NEW PASSWORD HERE ---
const SECRET_PASSWORD = "AWAKEN";

// --- DATABASE SETUP ---
let app, auth, db, appId;
try {
  if (typeof __firebase_config !== "undefined") {
    const config = JSON.parse(__firebase_config);
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
  }
} catch (e) {
  console.error("Database connection standing by for live environment.");
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [accessGranted, setAccessGranted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error(e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-mono selection:bg-blue-500 selection:text-black overflow-hidden relative">
      {/* Global Ambient Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse"></div>
      <div
        className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-rose-900/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      {!accessGranted ? (
        <Gatekeeper
          onUnlock={() => setAccessGranted(true)}
          user={user}
          db={db}
          appId={appId}
        />
      ) : (
        <DOCDashboard />
      )}
    </div>
  );
}

// --- GATEKEEPER COMPONENT ---
const Gatekeeper = ({ onUnlock, user, db, appId }) => {
  const [step, setStep] = useState("PASSWORD");
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [typing, setTyping] = useState("");
  const [checking, setChecking] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  const welcomeText =
    "A.R_I18N // SYSTEM ANOMALY DETECTED. SPECTACLE DISTRACTS. REFLECTION DEMANDED. ENTER THE SEEKER's FREQUENCY TO PROCEED.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTyping(welcomeText.slice(0, i));
      i++;
      if (i > welcomeText.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (input.toUpperCase() === SECRET_PASSWORD.toUpperCase()) {
      setChecking(true);
      if (user && db) {
        try {
          const docRef = doc(
            db,
            "artifacts",
            appId,
            "users",
            user.uid,
            "profile",
            "data"
          );
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            onUnlock();
          } else {
            setStep("REGISTER");
          }
        } catch (err) {
          console.error(err);
          setStep("REGISTER");
        }
      } else {
        setStep("REGISTER");
      }
      setChecking(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
      setInput("");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setChecking(true);
    if (user && db) {
      try {
        const docRef = doc(
          db,
          "artifacts",
          appId,
          "users",
          user.uid,
          "profile",
          "data"
        );
        await setDoc(docRef, {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          registeredAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to save profile", err);
      }
    }
    setChecking(false);
    onUnlock();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-xl w-full z-10 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 p-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600"></div>

        <div className="flex items-center gap-3 mb-6 text-blue-500">
          <Terminal className="w-6 h-6 animate-pulse" />
          <span className="tracking-widest uppercase text-sm font-bold shadow-blue-500/50 drop-shadow-md">
            Terminal / DOC.OS
          </span>
        </div>

        <div className="min-h-[80px] mb-8 text-sm md:text-base text-zinc-400 leading-relaxed font-bold">
          {typing}
          <span className="animate-pulse bg-blue-500 w-2 h-4 inline-block ml-1 align-middle shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
        </div>

        {step === "PASSWORD" && (
          <form
            onSubmit={handlePasswordSubmit}
            className="relative animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center border-b-2 border-zinc-700 focus-within:border-blue-500 transition-colors pb-2">
              <ChevronRight className="w-5 h-5 text-zinc-500 mr-2" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-white uppercase tracking-[0.3em] font-black placeholder-zinc-800"
                placeholder="ENTER FREQUENCY"
                autoFocus
                disabled={checking}
                maxLength={15}
              />
              {checking ? (
                <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
              ) : error ? (
                <Lock className="w-5 h-5 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              ) : (
                <Unlock className="w-5 h-5 text-zinc-500" />
              )}
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-3 uppercase tracking-widest animate-bounce font-bold">
                [ERR] Frequency unrecognized. The way back is lost.
              </p>
            )}
          </form>
        )}

        {step === "REGISTER" && (
          <form
            onSubmit={handleRegisterSubmit}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="flex items-center gap-2 text-rose-500 mb-2 border border-rose-500/30 bg-rose-500/10 p-3 shadow-[0_0_15px_rgba(225,29,72,0.1)]">
              <User className="w-4 h-4" />
              <p className="text-xs uppercase tracking-widest font-bold">
                NEW SIGNATURE DETECTED. LOG IDENTITY TO PROCEED.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs tracking-widest font-bold">
                  ID:
                </div>
                <input
                  required
                  type="text"
                  placeholder="FULL NAME"
                  className="w-full bg-black/50 border border-zinc-800 pl-12 pr-4 py-3 text-sm text-white uppercase font-bold focus:border-blue-500 focus:outline-none transition-colors placeholder-zinc-800"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs tracking-widest font-bold">
                  COM:
                </div>
                <input
                  required
                  type="tel"
                  placeholder="PHONE NUMBER"
                  className="w-full bg-black/50 border border-zinc-800 pl-14 pr-4 py-3 text-sm text-white uppercase font-bold focus:border-blue-500 focus:outline-none transition-colors placeholder-zinc-800"
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs tracking-widest font-bold">
                  NET:
                </div>
                <input
                  required
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  className="w-full bg-black/50 border border-zinc-800 pl-14 pr-4 py-3 text-sm text-white uppercase font-bold focus:border-blue-500 focus:outline-none transition-colors placeholder-zinc-800"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={checking}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] py-4 mt-2 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
            >
              {checking ? "PROCESSING..." : "INITIATE TRANSFER"}
            </button>
          </form>
        )}

        <div className="mt-12 pt-4 border-t border-zinc-900 text-[10px] text-zinc-700 font-bold flex justify-between uppercase tracking-widest">
          <span>HINT: CHECK THE LORE DOCS</span>
          <span>SYS.VER: 1.2.0</span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const DOCDashboard = () => {
  const [activeTab, setActiveTab] = useState("prophecy");

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative z-10">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="p-6 border-b border-zinc-800/80">
          <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
            DIMENSION <br />
            <span className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
              OVERDOSE
            </span>{" "}
            <br />
            COMICS
          </h1>
          <a
            href={IG_DOC_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-500 mt-3 font-bold tracking-[0.2em] hover:text-blue-400 hover:shadow-blue-500 transition-colors"
          >
            [ @DOC ARCHIVES ] <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavButton
            active={activeTab === "prophecy"}
            onClick={() => setActiveTab("prophecy")}
            icon={<Eye />}
            label="The Prophecy"
          />
          <NavButton
            active={activeTab === "archives"}
            onClick={() => setActiveTab("archives")}
            icon={<Grid />}
            label="Visual Archives"
          />
          <NavButton
            active={activeTab === "seekers"}
            onClick={() => setActiveTab("seekers")}
            icon={<Radio />}
            label="Seeker Comm-Link"
          />
        </nav>

        <div className="p-6 border-t border-zinc-800/80 text-[10px] text-blue-500 font-black tracking-[0.2em] uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          Connected: {SECRET_PASSWORD}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-black/60 backdrop-blur-sm p-6 md:p-12 overflow-y-auto relative">
        {/* Deep Background Graphic */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none mix-blend-screen">
          <Skull
            className="w-[50vw] h-[50vw] text-zinc-500 blur-[2px]"
            strokeWidth={1}
          />
          <Skull
            className="absolute inset-0 w-[50vw] h-[50vw] text-blue-500 blur-[8px] animate-pulse"
            strokeWidth={0.5}
          />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {activeTab === "prophecy" && <ProphecyTab />}
          {activeTab === "archives" && <ArchivesTab />}
          {activeTab === "seekers" && <SeekersTab />}
        </div>
      </main>
    </div>
  );
};

// --- NAVIGATION BUTTON ---
const NavButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-4 rounded-none transition-all duration-300 uppercase text-xs font-black tracking-[0.2em] border-l-4 ${
      active
        ? "bg-gradient-to-r from-blue-500/20 to-transparent text-blue-400 border-blue-500 shadow-[inset_4px_0_12px_rgba(59,130,246,0.1)]"
        : "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900"
    }`}
  >
    {React.cloneElement(icon, {
      className: `w-4 h-4 ${
        active ? "drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" : ""
      }`,
    })}
    {label}
  </button>
);

// --- TAB 1: THE PROPHECY (Lore Text) ---
const ProphecyTab = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <header className="border-b border-zinc-800 pb-8 relative">
      <div className="absolute right-0 top-0 opacity-20 pointer-events-none">
        <div className="w-32 h-32 border border-blue-500/30 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center">
          <div className="w-24 h-24 border border-rose-500/30 rounded-full animate-[spin_7s_linear_infinite_reverse]"></div>
        </div>
      </div>
      <h2 className="text-xs text-blue-500 font-bold tracking-[0.4em] mb-3 uppercase drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">
        File: A.R_I18N
      </h2>
      <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
        The Prophecy
      </h1>
    </header>

    {/* Lore Image Banner */}
    <div className="w-full h-64 border border-zinc-800 relative overflow-hidden group">
      <div className="absolute inset-0 bg-blue-900 mix-blend-color z-10 opacity-40 group-hover:opacity-20 transition-opacity"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20"></div>
      {/* Generic abstract placeholder image */}
      <img
        src="https://picsum.photos/seed/dimension/800/400"
        alt="Dimension Visual"
        className="w-full h-full object-cover filter contrast-125 grayscale-[30%] scale-105 group-hover:scale-100 transition-transform duration-1000"
      />
      <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-zinc-400" />
        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
          Encrypted Archive .001
        </span>
      </div>
    </div>

    <article className="prose prose-invert prose-p:text-zinc-400 prose-p:leading-loose prose-p:font-mono prose-p:text-sm max-w-none">
      <p className="text-lg md:text-xl text-white font-bold border-l-4 border-blue-500 pl-6 py-4 bg-gradient-to-r from-blue-500/10 to-transparent shadow-[inset_4px_0_0_rgba(59,130,246,1)]">
        What comes next is not spectacle. Because spectacle distracts. It
        entertains without asking anything of you. And this universe does not
        begin with distraction. It begins by slowing you down. It is reflection.
      </p>

      <div className="grid md:grid-cols-2 gap-12 mt-12">
        <div className="space-y-6">
          <p>The system was not broken overnight.</p>
          <p>It became polluted slowly.</p>
          <p>
            Desperate systems trying to survive. Power concentrated where it
            shouldn't be. Order maintained, but meaning lost. Everything was
            functioning... yet nothing felt right.
          </p>
        </div>
        <div className="space-y-6">
          <p>
            In the middle of this imbalance, there was a Seeker. An adventurer
            of the cosmos.
          </p>
          <p>Drawn not by power, but by understanding.</p>
          <p>
            Not content with answers that only worked on the surface. In the
            search for meaning, the Seeker went too far.
          </p>
          <p className="text-rose-500 font-black drop-shadow-[0_0_5px_rgba(225,29,72,0.6)]">
            Beyond certainty. Beyond return. The way back was lost.
          </p>
        </div>
      </div>

      <div className="mt-16 p-10 border border-zinc-800 bg-zinc-950/80 backdrop-blur-md text-center space-y-4 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500 to-transparent"></div>
        <p className="uppercase font-bold tracking-[0.3em] text-[10px] text-zinc-500">
          Transmission End
        </p>
        <p className="text-2xl md:text-3xl font-black text-white tracking-tighter group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all">
          YOU'VE GOT GREATNESS INSIDE YOU.
        </p>
      </div>
    </article>
  </div>
);

// --- TAB 2: VISUAL ARCHIVES (IG Grid Simulation) ---
const ArchivesTab = () => {
  // Added imgUrl to simulate the real IG grid posts.
  // We use specific seed words in picsum to get consistent abstract/dark images for the preview.
  const panels = [
    {
      id: 1,
      title: "01: AWAKENING",
      text: "The moment before the shift.",
      type: "comic",
      link: IG_DOC_URL,
      imgUrl: "/Awakening.png",
    },
    {
      id: 2,
      title: "02: THE FRACTURE",
      text: "Reality begins to distort.",
      type: "art",
      link: IG_DOC_URL,
      imgUrl: "https://picsum.photos/seed/neon/400/400",
    },
    {
      id: 3,
      title: "03: UNREST",
      text: "Is intensity a gift or a burden?",
      type: "quote",
      link: IG_TOD_URL,
      imgUrl: "https://picsum.photos/seed/darkness/400/400",
    },
    {
      id: 4,
      title: "04: THE ANOMALY",
      text: "A glitch in the perfect system.",
      type: "comic",
      link: IG_DOC_URL,
      imgUrl: "https://picsum.photos/seed/glitch/400/400",
    },
    {
      id: 5,
      title: "05: SEEKER",
      text: "Standing at the edge of chaos.",
      type: "art",
      link: IG_DOC_URL,
      imgUrl: "/Seeker.png",
    },
    {
      id: 6,
      title: "06: NO RETURN",
      text: "The way back was lost.",
      type: "comic",
      link: IG_DOC_URL,
      imgUrl: "https://picsum.photos/seed/space/400/400",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-zinc-800 pb-8 gap-4">
        <div>
          <h2 className="text-xs text-blue-500 font-bold tracking-[0.4em] mb-3 uppercase drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">
            Database: Visual
          </h2>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
            Fragment Archives
          </h1>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="text-[10px] font-bold text-zinc-500 tracking-[0.2em]">
            [ 9-GRID SYNC ACTIVE ]
          </div>
          <a
            href={IG_DOC_URL}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-black bg-blue-500/10 text-blue-400 border border-blue-500/40 px-4 py-2 uppercase hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center gap-2"
          >
            View Live on IG <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {panels.map((panel) => (
          <a
            key={panel.id}
            href={panel.link}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square bg-zinc-950 border border-zinc-800 overflow-hidden cursor-crosshair block"
          >
            {/* Visual Image Background */}
            <div className="absolute inset-0 z-0">
              <img
                src={panel.imgUrl}
                alt={panel.title}
                className="w-full h-full object-cover filter contrast-125 grayscale-[20%] opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700"
              />
              {/* Color Blend Overlay to give the "Dimension" aesthetic */}
              <div
                className={`absolute inset-0 mix-blend-multiply transition-opacity duration-500 opacity-80 group-hover:opacity-40 
                ${
                  panel.type === "comic"
                    ? "bg-blue-700"
                    : panel.type === "art"
                    ? "bg-rose-700"
                    : "bg-zinc-800"
                }`}
              />
            </div>

            {/* Hacker Grid Lines Overlay */}
            <div className="absolute inset-0 z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            {/* Content Foreground */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
              <div className="flex justify-between items-start">
                <div className="bg-black/80 backdrop-blur-sm px-2 py-1 text-[10px] font-black text-white tracking-[0.2em] border border-zinc-800">
                  {panel.title}
                </div>
                <div className="bg-black/50 p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out bg-gradient-to-t from-black/90 via-black/50 to-transparent -mx-6 -mb-6 p-6 pt-12">
                <Database
                  className={`w-5 h-5 mb-3 ${
                    panel.type === "art" ? "text-rose-400" : "text-blue-400"
                  }`}
                />
                <p className="text-sm font-black text-white uppercase drop-shadow-md">
                  {panel.text}
                </p>
                <p
                  className={`text-[10px] mt-2 font-bold tracking-[0.2em] ${
                    panel.type === "art" ? "text-rose-400" : "text-blue-400"
                  }`}
                >
                  DECODE ON INSTAGRAM →
                </p>
              </div>
            </div>

            {/* Hover Frame Glow */}
            <div
              className={`absolute inset-0 border-2 border-transparent transition-colors duration-300 z-30 pointer-events-none
              ${
                panel.type === "art"
                  ? "group-hover:border-rose-500/50 group-hover:shadow-[inset_0_0_20px_rgba(225,29,72,0.3)]"
                  : "group-hover:border-blue-500/50 group-hover:shadow-[inset_0_0_20px_rgba(59,130,246,0.3)]"
              }`}
            ></div>
          </a>
        ))}

        {/* Locked Panels */}
        {[7, 8, 9].map((lockedId) => (
          <div
            key={lockedId}
            className="aspect-square bg-black border border-zinc-900 flex items-center justify-center flex-col gap-3 group relative overflow-hidden"
          >
            {/* Faint static image for locked panels */}
            <img
              src={`https://picsum.photos/seed/lock${lockedId}/400/400`}
              alt="Encrypted"
              className="absolute inset-0 w-full h-full object-cover opacity-10 filter blur-sm grayscale"
            />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px]"></div>

            <div className="z-10 bg-black/80 p-4 border border-zinc-800 rounded-full group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,0,0,0.8)]">
              <Lock className="w-6 h-6 text-zinc-600 group-hover:text-red-500 transition-colors" />
            </div>
            <span className="z-10 text-[10px] font-bold tracking-[0.3em] text-zinc-600 text-center px-4 bg-black/60 py-1">
              ENCRYPTED
              <br />
              <span className="text-[8px] text-zinc-700">
                AWAITING TRANSMISSION
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- TAB 3: SEEKER COMM-LINK (Community Board Simulation) ---
const SeekersTab = () => {
  const logs = [
    {
      id: 1,
      user: "USR_992A",
      time: "10:42 SECONDS AGO",
      message:
        "Found the frequency on the back of the Drop 1 teaser reel. We are in.",
    },
    {
      id: 2,
      user: "USR_104B",
      time: "2 HOURS AGO",
      message:
        "The aesthetic is crazy. Does anyone know what the snake symbol on @TOD means?",
    },
    {
      id: 3,
      user: "USR_777X",
      time: "5 HOURS AGO",
      message:
        "I decoded the binary in yesterday's comic panel. It points to a physical location in Mumbai. Going there tonight.",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="border-b border-zinc-800 pb-8">
        <h2 className="text-xs text-green-500 font-bold tracking-[0.4em] mb-3 uppercase drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">
          Comm-Link: Active
        </h2>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
          Seeker Transmissions
        </h1>
      </header>

      <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-0"></div>

        <div className="space-y-6 relative z-10">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border-b border-zinc-800/50 pb-6 last:border-0 last:pb-0 hover:bg-zinc-900/30 p-2 -mx-2 rounded transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-4 h-4 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                <span className="text-xs font-black text-white tracking-[0.2em]">
                  {log.user}
                </span>
                <span className="text-[10px] font-bold text-zinc-600 tracking-widest">
                  [{log.time}]
                </span>
              </div>
              <p className="text-sm text-zinc-400 pl-7 font-medium">
                {log.message}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800 relative z-10">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/40 to-transparent"></div>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="BROADCAST TO FREQUENCY..."
              className="flex-1 bg-black/80 border border-zinc-800 px-4 py-4 text-sm text-white font-bold placeholder-zinc-700 focus:outline-none focus:border-green-500 transition-colors shadow-inner"
              disabled
            />
            <button
              disabled
              className="bg-green-500/10 text-green-500 border border-green-500/40 px-8 py-4 text-sm font-black tracking-[0.2em] uppercase hover:bg-green-500/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
            >
              Transmit
            </button>
          </div>
          <p className="text-[10px] font-bold text-rose-500 mt-4 text-right tracking-[0.2em] uppercase flex items-center justify-end gap-2">
            <Lock className="w-3 h-3" />
            Transmission locked until Drop 1 launch
          </p>
        </div>
      </div>
    </div>
  );
};
