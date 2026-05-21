import { useEffect, useState } from "react";
import * as sound from "./sound";

const BASE = import.meta.env.BASE_URL;

const PASSWORD = "sheep";
const RIDDLE =
  "I follow the leader without a question,\nWear a cloud, give wool on suggestion.\nI'm what insomniacs reach for in vain —\nName me, and unlock this domain.";
const HINT = "First word of the latest movie you watched.";

const PHOTOS = [
  { id: 1, caption: "Exhibit A: Keep Smiling, Charlene 😇" },
  { id: 2, caption: "Exhibit B: Piche dekho Piche" },
  { id: 3, caption: "Exhibit C: 👍" },
];

const BIRYANI_PROMPTS = {
  idle: "Will you send ₹200 for biryani party?? Dare you to click on 'No'",
  "denied-once": "Plz send me the biryani or I'll cry 😢",
  "denied-twice": "Fine. I'll just eat plain rice. 💀",
  accepted: "🎉 YOU'RE THE BEST. Biryani party CONFIRMED.",
};

const WORD = "BIRYANI";
const DISMISS_THRESHOLD = 80;
const TAP_THRESHOLD = 6;

export default function App() {
  const [stage, setStage] = useState("password");

  const [guess, setGuess] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [shake, setShake] = useState(false);
  const [denyMsg, setDenyMsg] = useState("");

  const [photos, setPhotos] = useState([1, 2, 3]);
  const [drag, setDrag] = useState(null);
  const [exitTransform, setExitTransform] = useState(null);

  const [biryani, setBiryani] = useState("idle");
  const [shakeKey, setShakeKey] = useState(0);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (guess.trim().toLowerCase() === PASSWORD) {
      sound.chime();
      setStage("photos");
      setDenyMsg("");
    } else {
      sound.buzz();
      setShake(true);
      setDenyMsg("Access denied. Try again.");
      setTimeout(() => setShake(false), 600);
    }
  };

  useEffect(() => {
    if (!exitTransform) return;
    const t = setTimeout(() => {
      setPhotos((prev) => prev.slice(0, -1));
      setExitTransform(null);
      setDrag(null);
    }, 450);
    return () => clearTimeout(t);
  }, [exitTransform]);

  useEffect(() => {
    if (stage === "photos" && photos.length === 0) {
      const t = setTimeout(() => setStage("wish"), 350);
      return () => clearTimeout(t);
    }
  }, [photos.length, stage]);

  const onPointerDown = (e) => {
    if (exitTransform) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ startX: e.clientX, startY: e.clientY, x: 0, y: 0 });
  };
  const onPointerMove = (e) => {
    if (!drag || exitTransform) return;
    setDrag((d) => ({
      ...d,
      x: e.clientX - d.startX,
      y: e.clientY - d.startY,
    }));
  };
  const onPointerUp = (e) => {
    if (!drag || exitTransform) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    const dist = Math.hypot(drag.x, drag.y);
    if (dist < TAP_THRESHOLD) {
      sound.swipe();
      setExitTransform({ x: window.innerWidth * 1.5, y: -120, rot: 28 });
    } else if (dist > DISMISS_THRESHOLD) {
      sound.swipe();
      const angle = Math.atan2(drag.y, drag.x);
      const flyDist = Math.max(window.innerWidth, window.innerHeight) * 1.4;
      setExitTransform({
        x: Math.cos(angle) * flyDist,
        y: Math.sin(angle) * flyDist,
        rot: (drag.x / window.innerWidth) * 60,
      });
    } else {
      setDrag(null);
    }
  };

  const handleYes = () => {
    sound.pop();
    for (let i = 0; i < WORD.length; i++) {
      setTimeout(() => sound.tick(), 120 + i * 110);
    }
    setBiryani("accepted");
  };
  const handleNo = () => {
    sound.nope();
    setShakeKey((k) => k + 1);
    if (biryani === "idle") setBiryani("denied-once");
    else if (biryani === "denied-once") setBiryani("denied-twice");
  };

  const yesShift =
    biryani === "denied-once"
      ? "translate-x-4 scale-110"
      : biryani === "denied-twice"
      ? "translate-x-12 scale-125"
      : "translate-x-0 scale-100";
  const noShrink =
    biryani === "denied-once"
      ? "scale-75 opacity-70"
      : biryani === "denied-twice"
      ? "scale-50 opacity-40"
      : "scale-100";

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main
      className="relative min-h-[100svh] w-full font-sans antialiased text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65)), url(${BASE}bg/bg.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: "#0f0f14",
      }}
    >
      {stage === "password" && (
        <section className="min-h-[100svh] flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-red-400 mb-4">
            // Access Denied //
          </p>
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-10">
            Enter
            <br />
            Key Phrase.
          </h2>
          <pre className="font-sans text-base sm:text-lg italic text-white/85 whitespace-pre-line max-w-md leading-relaxed mb-10 px-4">
            {RIDDLE}
          </pre>
          <form
            onSubmit={handleUnlock}
            className={`flex flex-col items-center gap-4 w-full max-w-sm ${
              shake ? "animate-shake-once" : ""
            }`}
          >
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="your answer..."
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              className="w-full min-h-[56px] px-5 py-3 bg-white text-black border-2 border-white text-lg font-medium text-center uppercase tracking-widest focus:outline-none focus:bg-black focus:text-white transition-colors"
            />
            <button
              type="submit"
              className="w-full min-h-[56px] px-8 py-4 bg-white text-black text-lg font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-transform"
            >
              Unlock
            </button>
          </form>
          {denyMsg && (
            <p className="mt-4 text-sm font-bold text-red-400 uppercase tracking-wider">
              {denyMsg}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setShowHint((s) => !s);
            }}
            className="mt-8 min-h-[44px] text-sm underline underline-offset-4 text-white/70 hover:text-white"
          >
            {showHint ? "Hide hint" : "Need a hint?"}
          </button>
          {showHint && (
            <p className="mt-3 text-sm text-white/80 italic max-w-xs">{HINT}</p>
          )}
        </section>
      )}

      {stage === "photos" && (
        <section className="min-h-[100svh] flex flex-col items-center justify-center px-6 py-12 select-none animate-fade-in">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-white/70 mb-6">
            tap or swipe
          </p>
          <div className="relative w-[min(92vw,460px)] aspect-[3/4]">
            {photos.map((id, i) => {
              const stackPos = photos.length - 1 - i;
              const isTop = i === photos.length - 1;
              const isExiting = isTop && !!exitTransform;
              const isDragging = isTop && !!drag && !exitTransform;
              const meta = PHOTOS.find((p) => p.id === id);

              let transform;
              if (isExiting) {
                transform = `translate(${exitTransform.x}px, ${exitTransform.y}px) rotate(${exitTransform.rot}deg)`;
              } else if (isDragging) {
                transform = `translate(${drag.x}px, ${drag.y}px) rotate(${
                  drag.x / 18
                }deg)`;
              } else {
                transform = `translateY(${stackPos * 14}px) scale(${
                  1 - stackPos * 0.05
                })`;
              }
              const transition = isDragging
                ? "none"
                : "transform 0.4s ease-out, opacity 0.4s";

              return (
                <div
                  key={id}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ zIndex: i + 1 }}
                >
                  <div
                    className="bg-white p-3 sm:p-4 pb-6 sm:pb-8 shadow-2xl w-full h-full flex flex-col"
                    style={{
                      transform,
                      transition,
                      touchAction: "none",
                      opacity: isExiting ? 0 : 1,
                      cursor: isTop ? "grab" : "default",
                      pointerEvents: isTop ? "auto" : "none",
                    }}
                    onPointerDown={isTop ? onPointerDown : undefined}
                    onPointerMove={isTop ? onPointerMove : undefined}
                    onPointerUp={isTop ? onPointerUp : undefined}
                    onPointerCancel={isTop ? onPointerUp : undefined}
                  >
                    <div className="flex-1 min-h-0 bg-gray-200 overflow-hidden">
                      <img
                        src={`${BASE}photos/exhibit-${id}.jpg`}
                        alt={`Exhibit ${id}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </div>
                    <p className="mt-3 text-center text-xs sm:text-sm font-medium text-gray-700 italic px-2">
                      {meta?.caption}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {stage === "wish" && (
        <section className="min-h-[100svh] flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
          <h2 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter leading-[0.85] animate-shake animate-rainbow mb-10">
            Happy
            <br />
            Birthday
            <br />
            Laasya!
          </h2>
          <p className="max-w-md text-base sm:text-xl text-white/85 px-4 leading-relaxed mb-12">
            Hope your year is full of laughter, bad decisions, and enough fun to make future-you slightly concerned. STAY YOUNG!!!
          </p>
          <button
            onClick={() => {
              sound.tap();
              setStage("biryani");
            }}
            className="min-h-[56px] min-w-[220px] px-10 py-4 bg-white text-black text-lg font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform"
          >
            Continue
          </button>
        </section>
      )}

      {stage === "biryani" && (
        <section className="min-h-[100svh] bg-white text-[#1a1a1b] flex flex-col items-center px-4 py-6 animate-fade-in">
          <header className="w-full max-w-md border-b border-gray-200 pb-3">
            <p className="text-center text-[10px] sm:text-xs font-bold text-red-600 tracking-[0.3em] uppercase">
              The Times of India
            </p>
            <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-1 tracking-wider uppercase">
              Wordle · {today}
            </p>
          </header>

          <div className="flex-1 w-full flex flex-col items-center justify-center gap-8 sm:gap-10 py-8">
            <div
              key={shakeKey}
              className={shakeKey > 0 ? "animate-shake-once" : ""}
            >
              <div className="flex gap-1 sm:gap-1.5">
                {WORD.split("").map((char, i) => (
                  <div
                    key={i}
                    className="w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center font-black text-xl sm:text-2xl"
                    style={{
                      borderWidth: 2,
                      borderColor: biryani === "accepted" ? "#6aaa64" : "#d3d6da",
                      background: biryani === "accepted" ? "#6aaa64" : "#ffffff",
                      color: biryani === "accepted" ? "#ffffff" : "#1a1a1b",
                      transition: "all 0.4s ease-out",
                      transitionDelay:
                        biryani === "accepted" ? `${i * 110}ms` : "0ms",
                    }}
                  >
                    {char}
                  </div>
                ))}
              </div>
            </div>

            <p className="max-w-md text-center text-base sm:text-xl font-bold px-4 leading-snug">
              {BIRYANI_PROMPTS[biryani]}
            </p>

            {biryani !== "accepted" ? (
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <button
                  onClick={handleYes}
                  className={`min-h-[56px] min-w-[120px] px-7 py-4 bg-[#6aaa64] text-white text-xl font-black uppercase tracking-wider shadow-md transition-all duration-300 ease-out ${yesShift} active:scale-95`}
                >
                  Yes
                </button>
                <button
                  onClick={handleNo}
                  className={`min-h-[56px] min-w-[120px] px-7 py-4 bg-[#787c7e] text-white text-xl font-black uppercase tracking-wider shadow-md transition-all duration-300 ease-out ${noShrink} active:scale-95`}
                >
                  No
                </button>
              </div>
            ) : (
              <p className="text-sm sm:text-base font-medium text-[#6aaa64] max-w-md text-center px-4">
                GPay number is same as phone number😄.  
              </p>
            )}
          </div>

          <footer className="w-full max-w-md border-t border-gray-200 pt-4">
            <p className="text-[11px] text-gray-500 tracking-wide text-center px-4">
              Failure to comply with the biryani clause above is a Class-A
              friendship offense.
            </p>
          </footer>
        </section>
      )}
    </main>
  );
}
