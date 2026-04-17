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
  // This connects to the database if running in a supported environment
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

  // Authenticate the user's device silently in the background
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
          await signInAnonymously(auth); // Assigns a unique anonymous ID to the device
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
    <div className="min-h-screen bg-black text-zinc-300 font-mono selection:bg-blue-500 selection:text-black">
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

// --- GATEKEEPER COMPONENT (The Password & Lead Form) ---
const Gatekeeper = ({ onUnlock, user, db, appId }) => {
  const [step, setStep] = useState("PASSWORD"); // 'PASSWORD' or 'REGISTER'
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [typing, setTyping] = useState("");
  const [checking, setChecking] = useState(false);

  // Registration Form Data
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

  // Handle Password Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (input.toUpperCase() === SECRET_PASSWORD.toUpperCase()) {
      setChecking(true);

      // Check the database to see if this device has registered before
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
            // They have registered before! Let them right in.
            onUnlock();
          } else {
            // First time! Ask for their details.
            setStep("REGISTER");
          }
        } catch (err) {
          console.error(err);
          setStep("REGISTER"); // Fallback if db fails
        }
      } else {
        // If running locally without full database setup, just show the form for testing
        setStep("REGISTER");
      }
      setChecking(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
      setInput("");
    }
  };

  // Handle Registration Form Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setChecking(true);

    // Save their details to the database, linked to their anonymous device ID
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
    onUnlock(); // Enter the portal!
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-xl w-full z-10 bg-zinc-950 border border-zinc-800 p-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-rose-600"></div>

        <div className="flex items-center gap-3 mb-6 text-blue-500">
          <Terminal className="w-6 h-6 animate-pulse" />
          <span className="tracking-widest uppercase text-sm font-bold">
            Terminal / DOC.OS
          </span>
        </div>

        <div className="min-h-[80px] mb-8 text-sm md:text-base text-zinc-400 leading-relaxed">
          {typing}
          <span className="animate-pulse bg-blue-500 w-2 h-4 inline-block ml-1 align-middle"></span>
        </div>

        {/* STEP 1: PASSWORD INPUT */}
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
                className="bg-transparent border-none outline-none flex-1 text-white uppercase tracking-[0.3em] font-bold placeholder-zinc-700"
                placeholder="ENTER FREQUENCY"
                autoFocus
                disabled={checking}
                maxLength={15}
              />
              {checking ? (
                <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
              ) : error ? (
                <Lock className="w-5 h-5 text-red-500" />
              ) : (
                <Unlock className="w-5 h-5 text-zinc-500" />
              )}
            </div>

            {error && (
              <p className="text-red-500 text-xs mt-3 uppercase tracking-widest animate-bounce">
                [ERR] Frequency unrecognized. The way back is lost.
              </p>
            )}
          </form>
        )}

        {/* STEP 2: NEW SEEKER REGISTRATION FORM */}
        {step === "REGISTER" && (
          <form
            onSubmit={handleRegisterSubmit}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="flex items-center gap-2 text-rose-500 mb-2 border border-rose-500/30 bg-rose-500/10 p-3">
              <User className="w-4 h-4" />
              <p className="text-xs uppercase tracking-widest font-bold">
                NEW SIGNATURE DETECTED. LOG IDENTITY TO PROCEED.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs tracking-widest">
                  ID:
                </div>
                <input
                  required
                  type="text"
                  placeholder="FULL NAME"
                  className="w-full bg-black border border-zinc-800 pl-12 pr-4 py-3 text-sm text-white uppercase focus:border-blue-500 focus:outline-none transition-colors placeholder-zinc-700"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs tracking-widest">
                  COM:
                </div>
                <input
                  required
                  type="tel"
                  placeholder="PHONE NUMBER"
                  className="w-full bg-black border border-zinc-800 pl-14 pr-4 py-3 text-sm text-white uppercase focus:border-blue-500 focus:outline-none transition-colors placeholder-zinc-700"
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs tracking-widest">
                  NET:
                </div>
                <input
                  required
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  className="w-full bg-black border border-zinc-800 pl-14 pr-4 py-3 text-sm text-white uppercase focus:border-blue-500 focus:outline-none transition-colors placeholder-zinc-700"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={checking}
              className="w-full bg-blue-500 text-black font-bold uppercase tracking-widest py-3 mt-2 hover:bg-blue-400 transition-colors flex items-center justify-center gap-2"
            >
              {checking ? "PROCESSING..." : "INITIATE TRANSFER"}
            </button>
          </form>
        )}

        <div className="mt-12 pt-4 border-t border-zinc-900 text-xs text-zinc-600 flex justify-between">
          <span>HINT: CHECK THE LORE DOCS</span>
          <span>SYS.VER: 1.1.0</span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const DOCDashboard = () => {
  const [activeTab, setActiveTab] = useState("prophecy");

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-tight">
            DIMENSION <br />
            <span className="text-blue-500">OVERDOSE</span> <br />
            COMICS
          </h1>
          <a
            href={IG_DOC_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-500 mt-2 tracking-widest hover:text-blue-400 transition-colors"
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

        <div className="p-6 border-t border-zinc-800 text-xs text-blue-500 font-bold tracking-widest uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Connected: {SECRET_PASSWORD}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-black p-6 md:p-12 overflow-y-auto relative">
        {/* Background Graphic */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <Skull className="w-[40vw] h-[40vw]" />
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
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-300 uppercase text-xs font-bold tracking-widest border-l-2 ${
      active
        ? "bg-blue-500/10 text-blue-400 border-blue-500"
        : "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900"
    }`}
  >
    {React.cloneElement(icon, { className: "w-4 h-4" })}
    {label}
  </button>
);

// --- TAB 1: THE PROPHECY (Lore Text) ---
const ProphecyTab = () => (
  <div className="space-y-12 animate-in fade-in duration-700">
    <header className="border-b border-zinc-800 pb-6">
      <h2 className="text-sm text-blue-500 tracking-[0.4em] mb-2 uppercase">
        File: A.R_I18N
      </h2>
      <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
        The Prophecy
      </h1>
    </header>

    <article className="prose prose-invert prose-p:text-zinc-400 prose-p:leading-loose prose-p:font-mono max-w-none">
      <p className="text-xl text-white font-bold border-l-4 border-blue-500 pl-6 py-2 bg-blue-500/5">
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
          <p className="text-rose-500 font-bold">
            Beyond certainty. Beyond return. The way back was lost.
          </p>
        </div>
      </div>

      <div className="mt-16 p-8 border border-zinc-800 bg-zinc-950 text-center space-y-4">
        <p className="uppercase tracking-widest text-sm text-zinc-500">
          Transmission End
        </p>
        <p className="text-2xl font-black text-white tracking-tighter">
          YOU'VE GOT GREATNESS INSIDE YOU.
        </p>
      </div>
    </article>
  </div>
);

// --- TAB 2: VISUAL ARCHIVES (IG Grid Simulation) ---
const ArchivesTab = () => {
  const panels = [
    {
      id: 1,
      title: "01: AWAKENING",
      text: "The moment before the shift.",
      type: "comic",
      link: IG_DOC_URL,
    },
    {
      id: 2,
      title: "02: THE FRACTURE",
      text: "Reality begins to distort.",
      type: "art",
      link: IG_DOC_URL,
    },
    {
      id: 3,
      title: "03: UNREST",
      text: "Is intensity a gift or a burden?",
      type: "quote",
      link: IG_TOD_URL,
    },
    {
      id: 4,
      title: "04: THE ANOMALY",
      text: "A glitch in the perfect system.",
      type: "comic",
      link: IG_DOC_URL,
    },
    {
      id: 5,
      title: "05: SEEKER",
      text: "Standing at the edge of chaos.",
      type: "art",
      link: IG_DOC_URL,
    },
    {
      id: 6,
      title: "06: NO RETURN",
      text: "The way back was lost.",
      type: "comic",
      link: IG_DOC_URL,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-zinc-800 pb-6 gap-4">
        <div>
          <h2 className="text-sm text-blue-500 tracking-[0.4em] mb-2 uppercase">
            Database: Visual
          </h2>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            Fragment Archives
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-zinc-500 tracking-widest">
            [ 9-GRID SYNC ACTIVE ]
          </div>
          <a
            href={IG_DOC_URL}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 uppercase hover:bg-blue-500 hover:text-black transition-colors flex items-center gap-2"
          >
            View Live on IG <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {panels.map((panel) => (
          <a
            key={panel.id}
            href={panel.link}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square bg-zinc-950 border border-zinc-800 overflow-hidden cursor-crosshair block"
          >
            {/* Base Background indicating type */}
            <div
              className={`absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-10 
              ${
                panel.type === "comic"
                  ? "bg-blue-600"
                  : panel.type === "art"
                  ? "bg-rose-600"
                  : "bg-zinc-600"
              }`}
            />

            {/* Grid Lines Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="text-xs font-bold text-zinc-500 tracking-widest">
                  {panel.title}
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                <Database className="w-6 h-6 text-blue-500 mb-3" />
                <p className="text-sm font-bold text-white uppercase">
                  {panel.text}
                </p>
                <p className="text-xs text-blue-400 mt-2 tracking-widest">
                  DECODE ON INSTAGRAM →
                </p>
              </div>
            </div>

            {/* Hover Frame */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/50 transition-colors duration-300 z-20"></div>
          </a>
        ))}

        {/* Locked Panels */}
        {[7, 8, 9].map((lockedId) => (
          <div
            key={lockedId}
            className="aspect-square bg-black border border-zinc-900 flex items-center justify-center flex-col gap-3 group relative overflow-hidden"
          >
            <Lock className="w-6 h-6 text-zinc-700 group-hover:scale-110 transition-transform" />
            <span className="text-xs tracking-widest text-zinc-700 text-center px-4">
              ENCRYPTED
              <br />
              <span className="text-[10px] text-zinc-800">
                AWAITING IG TRANSMISSION
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="border-b border-zinc-800 pb-6">
        <h2 className="text-sm text-green-500 tracking-[0.4em] mb-2 uppercase">
          Comm-Link: Active
        </h2>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
          Seeker Transmissions
        </h1>
      </header>

      <div className="bg-zinc-900/50 border border-zinc-800 p-6">
        <div className="space-y-6">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border-b border-zinc-800/50 pb-6 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold text-white tracking-widest">
                  {log.user}
                </span>
                <span className="text-xs text-zinc-600">[{log.time}]</span>
              </div>
              <p className="text-sm text-zinc-400 pl-7">{log.message}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800 relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent"></div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="BROADCAST TO FREQUENCY..."
              className="flex-1 bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-green-500 transition-colors"
              disabled
            />
            <button
              disabled
              className="bg-green-500/10 text-green-500 border border-green-500/30 px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-green-500/20 transition-colors"
            >
              Transmit
            </button>
          </div>
          <p className="text-xs text-rose-500 mt-2 text-right">
            TRANSMISSION LOCKED UNTIL DROP 1 LAUNCH
          </p>
        </div>
      </div>
    </div>
  );
};
