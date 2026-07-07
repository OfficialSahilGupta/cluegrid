import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

declare const THREE: any;

interface LandingPageProps {
  currentView: string;
  setCurrentView: (view: "lobby" | "rules" | "features" | "changelog" | "about" | "admin" | "support") => void;
  setAuthOpen: (open: boolean) => void;
  handleCreateRoom: (options: { teamCount: number; gameMode: "classic" | "coop"; language: string }) => void;
  loading: boolean;
  children?: React.ReactNode;
  isActiveRoom?: boolean;
}

export function LandingPage({
  currentView,
  setCurrentView,
  setAuthOpen,
  handleCreateRoom,
  loading,
  children,
  isActiveRoom = false,
}: LandingPageProps) {
  const { t } = useTranslation();
  const mountRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const isActiveRoomRef = useRef(isActiveRoom);
  useEffect(() => {
    isActiveRoomRef.current = isActiveRoom;
  }, [isActiveRoom]);

  // States
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false); // Controlled by intro timeline
  const [showCTA, setShowCTA] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Room config state
  const [gameMode, setGameMode] = useState<"classic" | "coop">("classic");
  const [selectedTeams, setSelectedTeams] = useState<number>(2);
  const [lang, setLang] = useState<string>("en");

  // Feedback State
  const [reportType, setReportType] = useState<"bug" | "idea" | "other">("bug");
  const [reportText, setReportText] = useState("");
  const [transmitting, setTransmitting] = useState(false);

  // Advanced Surveillance & Decryption States
  const [logLines, setLogLines] = useState<{ id: number; text: string; tag: string }[]>([]);
  const [hexKeyStream, setHexKeyStream] = useState("A9 B2 F5 E1 0C 88");
  const [vectorGrid, setVectorGrid] = useState({ x: 12, y: 34, status: "LOCKED" });
  
  // Surveillance roster with network latency pings
  const [surveillanceRoster, setSurveillanceRoster] = useState([
    { name: "ORACLE-3", role: "Leader", status: "Active Grid", color: "#ef959c", shape: "diamond", ping: 12, signal: "94%" },
    { name: "NOX-7", role: "Analyst", status: "Surveilled", color: "#b2ef9b", shape: "hexagon", ping: 18, signal: "88%" },
    { name: "WARDEN", role: "Military Intel", status: "Compromised", color: "#1b9aaa", shape: "circle", ping: 42, signal: "64%" },
    { name: "GHOST", role: "Infiltrator", status: "Decrypted", color: "#9aa29b", shape: "plus", ping: 8, signal: "99%" },
  ]);

  // Subtitle briefing sequence matching video subtitles
  const lines = [
    { s: "B", name: "ORACLE-3", text: "Security grid bypassed. System is open." },
    { s: "A", name: "NOX-7", text: "Decrypting board keys... We have 5 suspects, 1 grid." },
    { s: "B", name: "ORACLE-3", text: "Watch out for neutral civilians. Collateral damage ruins the score." },
    { s: "A", name: "NOX-7", text: "And lock down the Assassin. One click and the link terminates." },
    { s: "B", name: "ORACLE-3", text: "I'm seeding the coordinates now. Spymasters, transmit your signals." },
    { s: "A", name: "NOX-7", text: "Understood. Relaying localized word packs to the channel." },
  ];

  const [lineIndex, setLineIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState<{ s: string; name: string } | null>(null);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [showCursor, setShowCursor] = useState(false);

  // Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const clickNoiseBufferRef = useRef<AudioBuffer | null>(null);
  const soundPlayedRef = useRef(false);
  const soundSuccessRef = useRef(false);

  // Three.js animations state
  const threeStateRef = useRef<{
    renderer: any;
    scene: any;
    camera: any;
    agents: any[];
    particles: any;
    letterTiles: any[];
    caseMonitors: any[];
    hologramGroups: any[];
    entering: boolean;
    dollyProgress: number;
    baseCameraZ: number;
    currentSpeaker: string | null;
  } | null>(null);

  // Ensure Audio Setup
  const ensureAudio = () => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
    } catch (e) {
      console.warn("AudioContext initialization bypassed:", e);
    }
  };

  const getClickNoiseBuffer = (ctx: AudioContext) => {
    if (clickNoiseBufferRef.current) return clickNoiseBufferRef.current;
    const len = Math.floor(ctx.sampleRate * 0.02);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    }
    clickNoiseBufferRef.current = buf;
    return buf;
  };

  const playTypeBlip = (speaker: string) => {
    if (!sfxEnabled || !audioCtxRef.current || audioCtxRef.current.state !== "running") return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const speakerPitch: Record<string, number> = { A: 130, B: 180 };
    const base = speakerPitch[speaker] || 160;

    const noise = ctx.createBufferSource();
    noise.buffer = getClickNoiseBuffer(ctx);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 3400 + Math.random() * 500;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.02);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(base + (Math.random() * 10 - 5), now);
    osc.frequency.exponentialRampToValueAtTime(base * 0.85, now + 0.028);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.exponentialRampToValueAtTime(0.07, now + 0.003);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  };

  const playMaterializeSound = () => {
    try {
      ensureAudio();
      if (!sfxEnabled || !audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      if (ctx.state !== "running") return; // still suspended

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      // Sweeping frequencies upward for cyber chime effect
      osc1.frequency.setValueAtTime(260, now);
      osc1.frequency.exponentialRampToValueAtTime(780, now + 1.4);

      osc2.frequency.setValueAtTime(520, now);
      osc2.frequency.exponentialRampToValueAtTime(1560, now + 1.4);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.7);
      osc2.stop(now + 1.7);

      soundSuccessRef.current = true;
    } catch (e) {
      console.warn("Materialize sound playback bypassed:", e);
    }
  };

  // Radar sweep and encryption scrolling graph
  useEffect(() => {
    const canvas = leftCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrame: number;
    let phase = 0;
    
    const historyPoints: number[] = Array.from({ length: 25 }, () => 15 + Math.random() * 30);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cw = canvas.width;
      const ch = canvas.height;

      ctx.strokeStyle = "rgba(27,154,170,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < cw; x += 16) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke();
      }
      for (let y = 0; y < ch; y += 16) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
      }

      const rcx = 36;
      const rcy = ch / 2;
      const rr = 24;

      ctx.strokeStyle = "rgba(27,154,170,0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(rcx, rcy, rr, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(27,154,170,0.15)";
      ctx.beginPath();
      ctx.moveTo(rcx - rr, rcy); ctx.lineTo(rcx + rr, rcy);
      ctx.moveTo(rcx, rcy - rr); ctx.lineTo(rcx, rcy + rr);
      ctx.stroke();

      const sweepAngle = phase * 0.05;
      ctx.strokeStyle = "rgba(178,239,155,0.7)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(rcx, rcy);
      ctx.lineTo(rcx + Math.cos(sweepAngle) * rr, rcy + Math.sin(sweepAngle) * rr);
      ctx.stroke();

      const targets = [
        { tx: rcx - 12, ty: rcy - 8, offset: 0.5 },
        { tx: rcx + 10, ty: rcy + 12, offset: 2.2 },
      ];
      ctx.fillStyle = "#b2ef9b";
      targets.forEach((tgt) => {
        const opacity = Math.max(0, Math.sin(phase * 0.15 + tgt.offset));
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(tgt.tx, tgt.ty, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      const gxStart = 82;
      const gxEnd = cw - 12;
      const gWidth = gxEnd - gxStart;
      const gHeight = ch - 16;

      ctx.strokeStyle = "rgba(27,154,170,0.2)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(gxStart, 8, gWidth, gHeight);

      if (Math.random() < 0.22) {
        historyPoints.shift();
        historyPoints.push(10 + Math.random() * 32);
      }

      const grad = ctx.createLinearGradient(gxStart, 8, gxStart, 8 + gHeight);
      grad.addColorStop(0, "rgba(27,154,170,0.22)");
      grad.addColorStop(1, "rgba(27,154,170,0)");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(gxStart, 8 + gHeight);
      historyPoints.forEach((pt, idx) => {
        const px = gxStart + (idx / (historyPoints.length - 1)) * gWidth;
        const py = 8 + gHeight - (pt / 50) * gHeight;
        ctx.lineTo(px, py);
      });
      ctx.lineTo(gxEnd, 8 + gHeight);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#b2ef9b";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      historyPoints.forEach((pt, idx) => {
        const px = gxStart + (idx / (historyPoints.length - 1)) * gWidth;
        const py = 8 + gHeight - (pt / 50) * gHeight;
        if (idx === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      });
      ctx.stroke();

      phase += 0.4;
      animationFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Cyber Surveillance World Map Drawing in Right Panel
  useEffect(() => {
    const canvas = rightCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrame: number;
    let mapPhase = 0;

    const drawWorldMap = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cw = canvas.width;
      const ch = canvas.height;

      ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < cw; x += 12) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke();
      }
      for (let y = 0; y < ch; y += 12) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
      }

      const continents = [
        [[15, 20], [35, 15], [52, 25], [42, 45], [32, 40], [22, 45]],
        [[32, 40], [42, 45], [45, 60], [38, 85], [32, 70], [28, 55]],
        [[58, 20], [85, 12], [125, 15], [130, 38], [105, 48], [80, 48], [72, 38], [62, 35]],
        [[68, 38], [82, 42], [90, 55], [82, 75], [74, 75], [64, 52]],
        [[112, 60], [128, 60], [126, 74], [114, 72]]
      ];

      ctx.strokeStyle = "rgba(27,154,170,0.45)";
      ctx.lineWidth = 1.2;
      continents.forEach((poly) => {
        ctx.beginPath();
        poly.forEach((pt, idx) => {
          const px = (pt[0]! / 140) * cw;
          const py = (pt[1]! / 95) * ch;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.stroke();
      });

      const sweepX = (mapPhase * 1.5) % cw;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, ch);
      ctx.stroke();

      const targets = [
        { x: cw * 0.25, y: ch * 0.32, color: "#ef959c" },
        { x: cw * 0.65, y: ch * 0.28, color: "#b2ef9b" },
        { x: cw * 0.85, y: ch * 0.42, color: "#00f0ff" },
        { x: cw * 0.58, y: ch * 0.62, color: "#ef959c" }
      ];
      targets.forEach((tgt) => {
        const rad = 2 + Math.abs(Math.sin(mapPhase * 0.08 + tgt.x)) * 3;
        ctx.fillStyle = tgt.color;
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(mapPhase * 0.1));
        ctx.beginPath();
        ctx.arc(tgt.x, tgt.y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      mapPhase += 0.8;
      animationFrame = requestAnimationFrame(drawWorldMap);
    };
    drawWorldMap();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Cryptographic matrices
  useEffect(() => {
    const logPool = [
      { text: "DECRYPT: AES key handshake validated.", tag: "DEC" },
      { text: "SIGNAL: Intercepting node 0x48A.", tag: "SIG" },
      { text: "VECTOR: Lock coordinates acquired.", tag: "VCT" },
      { text: "SYS: Core mainframe memory flushed.", tag: "SYS" },
      { text: "NET: Route handshake latency stable.", tag: "NET" },
      { text: "CYPHER: Scrambler grid randomized.", tag: "CYP" },
    ];
    let counter = 0;
    const timer = setInterval(() => {
      const item = logPool[Math.floor(Math.random() * logPool.length)]!;
      setLogLines((prev) => {
        const next = [...prev, { id: counter++, text: item.text, tag: item.tag }];
        if (next.length > 4) next.shift();
        return next;
      });

      const hexChars = "0123456789ABCDEF";
      let key = "";
      for (let i = 0; i < 6; i++) {
        key += hexChars[Math.floor(Math.random() * 16)]! + hexChars[Math.floor(Math.random() * 16)]! + " ";
      }
      setHexKeyStream(key.trim());

      setVectorGrid({
        x: Math.floor(Math.random() * 24),
        y: Math.floor(Math.random() * 24),
        status: Math.random() > 0.3 ? "DECRYPTING" : "LOCKED",
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Latency pings
  useEffect(() => {
    const timer = setInterval(() => {
      setSurveillanceRoster((prev) => {
        return prev.map((op) => {
          const nextPing = Math.max(4, op.ping + Math.floor(Math.random() * 10 - 5));
          const nextSignal = Math.min(100, Math.max(30, parseInt(op.signal) + Math.floor(Math.random() * 6 - 3))) + "%";
          return { ...op, ping: nextPing, signal: nextSignal };
        });
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Audio trigger
  useEffect(() => {
    const unlock = () => {
      ensureAudio();
      if (!soundSuccessRef.current && soundPlayedRef.current) {
        playMaterializeSound();
      }
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    };
    document.addEventListener("pointerdown", unlock, { passive: true });
    document.addEventListener("keydown", unlock, { passive: true });
    document.addEventListener("touchstart", unlock, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    };
  }, []);

  // Dialogue effect
  useEffect(() => {
    if (!isPlayingBriefing) {
      setActiveSpeaker(null);
      setTypedText("");
      setShowCursor(false);
      if (threeStateRef.current) {
        threeStateRef.current.currentSpeaker = null;
      }
      return;
    }

    if (lineIndex >= lines.length) {
      setIsPlayingBriefing(false);
      setShowCTA(true);
      return;
    }

    const currentEntry = lines[lineIndex];
    if (!currentEntry) return;
    setActiveSpeaker({ s: currentEntry.s, name: currentEntry.name });
    if (threeStateRef.current) {
      threeStateRef.current.currentSpeaker = currentEntry.s;
    }
    setTypedText("");
    setShowCursor(true);

    let charIdx = 0;
    const typeInterval = setInterval(() => {
      setTypedText(currentEntry.text.slice(0, charIdx + 1));
      if (currentEntry.text[charIdx] !== " " && charIdx % 2 === 0) {
        playTypeBlip(currentEntry.s);
      }
      charIdx++;
      if (charIdx >= currentEntry.text.length) {
        clearInterval(typeInterval);
        setShowCursor(false);
        if (threeStateRef.current) {
          threeStateRef.current.currentSpeaker = null;
        }

        setTimeout(() => {
          setLineIndex((prev) => prev + 1);
        }, 1800);
      }
    }, 24);

    return () => {
      clearInterval(typeInterval);
    };
  }, [lineIndex, isPlayingBriefing]);

  // Three.js Setup & Timeline animation loop
  useEffect(() => {
    if (typeof THREE === "undefined" || !mountRef.current) return;

    let mounted = true;
    const sceneEl = mountRef.current;
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    let baseCameraZ = 5.4;
    camera.position.set(0, 2.3, baseCameraZ);
    camera.lookAt(0, 1.7, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    sceneEl.appendChild(renderer.domElement);

    const updateCameraFraming = () => {
      const aspect = window.innerWidth / window.innerHeight;
      camera.aspect = aspect;
      const baseAspect = 1.78;
      const overshoot = Math.max(0, aspect - baseAspect);
      baseCameraZ = 5.4 - Math.min(1.5, overshoot * 1.4);
      if (threeStateRef.current && !threeStateRef.current.entering) {
        camera.position.z = baseCameraZ;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    updateCameraFraming();
    window.addEventListener("resize", updateCameraFraming);

    // Lighting
    scene.add(new THREE.AmbientLight(0x2a3a3d, 0.7));

    const spotRose = new THREE.SpotLight(0xef959c, 2.4, 14, Math.PI / 6, 0.5, 1.2);
    spotRose.position.set(-2.4, 5.5, 2.5);
    spotRose.target.position.set(-1.6, 1.6, 0);
    scene.add(spotRose, spotRose.target);

    const spotTeal = new THREE.SpotLight(0x1b9aaa, 2.4, 14, Math.PI / 6, 0.5, 1.2);
    spotTeal.position.set(2.4, 5.5, 2.5);
    spotTeal.target.position.set(1.6, 1.6, 0);
    scene.add(spotTeal, spotTeal.target);

    const rim = new THREE.PointLight(0x00f0ff, 1.1, 20);
    rim.position.set(0, 2.5, -3);
    scene.add(rim);

    // Glow generators
    const makeGlowTexture = (hex: number) => {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      const col = "#" + hex.toString(16).padStart(6, "0");
      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, col);
      grad.addColorStop(0.35, col);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(c);
    };

    const addGlowSprite = (color: number, x: number, y: number, z: number, scale: number, opacity: number) => {
      const tex = makeGlowTexture(color);
      const mat = new THREE.SpriteMaterial({ map: tex, color: color, transparent: true, opacity: opacity, blending: THREE.AdditiveBlending, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(x, y, z);
      sprite.scale.set(scale, scale, 1);
      scene.add(sprite);
      return sprite;
    };

    addGlowSprite(0xb2ef9b, -4.4, 2.2, -4.5, 8.5, 0.2);
    addGlowSprite(0xef959c, 4.4, 2.2, -4.5, 8.5, 0.2);
    addGlowSprite(0x1b9aaa, 0, 3.4, -6, 9, 0.18);
    addGlowSprite(0x00f0ff, 0, 0.4, -3, 10, 0.15);

    addGlowSprite(0xb2ef9b, -8, 0.6, -5, 6, 0.14);
    addGlowSprite(0xef959c, 8, 0.6, -5, 6, 0.14);

    // 1. Data-Mapped Server Clusters Background
    const makeServerClusterTexture = () => {
      const w = 512, h = 512;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#091215";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(0,240,255,0.15)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const sx = 20 + i * 120;
        ctx.strokeRect(sx, 10, 100, h - 20);
        for (let y = 30; y < h - 20; y += 28) {
          ctx.strokeStyle = "rgba(238,243,238,0.06)";
          ctx.beginPath(); ctx.moveTo(sx + 5, y); ctx.lineTo(sx + 95, y); ctx.stroke();
          ctx.strokeStyle = "rgba(0,240,255,0.08)";
          ctx.beginPath(); ctx.moveTo(sx + 10, y + 10); ctx.lineTo(sx + 30, y + 10); ctx.stroke();
        }
      }
      return new THREE.CanvasTexture(c);
    };

    const serverClusterMat = new THREE.MeshBasicMaterial({ map: makeServerClusterTexture(), transparent: true, opacity: 0.8 });
    const serverClusterLeft = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), serverClusterMat);
    serverClusterLeft.position.set(-4.5, 3.0, -4.5);
    scene.add(serverClusterLeft);

    const serverClusterRight = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), serverClusterMat);
    serverClusterRight.position.set(2.8, 3.0, -4.5);
    scene.add(serverClusterRight);

    // Blinking lights on server racks
    const serverLEDs: any[] = [];
    const createServerLEDs = (parentX: number, startZ: number) => {
      for (let i = 0; i < 15; i++) {
        const ledColor = Math.random() > 0.5 ? 0x00f0ff : 0xef959c;
        const led = addGlowSprite(ledColor, parentX + (Math.random() - 0.5) * 4.0, 1.0 + Math.random() * 3.8, startZ + 0.05, 0.16, 0.4);
        led.userData = { 
          phase: Math.random() * Math.PI * 2, 
          speed: 1.5 + Math.random() * 2.0,
          baseOpacity: 0.35 + Math.random() * 0.4 
        };
        serverLEDs.push(led);
      }
    };
    createServerLEDs(-4.5, -4.5);
    createServerLEDs(2.8, -4.5);

    // 2. Mechanical Book Archive (Behind Albion)
    const makeBookArchiveTexture = () => {
      const w = 512, h = 512;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#060d10";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#121b1f";
      for (let y = 80; y < h; y += 120) {
        ctx.fillRect(10, y, w - 20, 12);
        ctx.fillStyle = "#1e2b30";
        ctx.fillRect(10, y + 12, w - 20, 3);
        let bx = 30;
        while (bx < w - 60) {
          const bw = 16 + Math.random() * 14;
          const bh = 70 + Math.random() * 25;
          ctx.fillStyle = "#0c1518";
          ctx.fillRect(bx, y - bh, bw, bh);
          ctx.strokeStyle = "rgba(178,239,155,0.4)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx + 2, y - bh + 2, bw - 4, bh - 4);
          ctx.beginPath();
          ctx.moveTo(bx + bw/2 - 4, y - bh/2);
          ctx.lineTo(bx + bw/2 + 4, y - bh/2);
          ctx.stroke();
          bx += bw + 4 + Math.random() * 6;
        }
        ctx.fillStyle = "#121b1f";
      }
      return new THREE.CanvasTexture(c);
    };

    const bookArchiveMat = new THREE.MeshBasicMaterial({ map: makeBookArchiveTexture(), transparent: true, opacity: 0.95 });
    const bookArchive = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.8), bookArchiveMat);
    bookArchive.position.set(-1.0, 2.9, -4.2);
    scene.add(bookArchive);

    // Etched gear texture for rotating overlays
    const makeGearTexture = () => {
      const c = document.createElement("canvas");
      c.width = 128; c.height = 128;
      const ctx = c.getContext("2d")!;
      const cx = 64, cy = 64, r = 40;
      ctx.strokeStyle = "rgba(178,239,155,0.5)";
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ang);
        ctx.fillRect(-6, -r - 6, 12, 10);
        ctx.restore();
      }
      return new THREE.CanvasTexture(c);
    };

    const gearMat = new THREE.MeshBasicMaterial({ map: makeGearTexture(), transparent: true, opacity: 0.65 });
    
    const gear1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), gearMat);
    gear1.position.set(-2.0, 4.4, -4.1);
    scene.add(gear1);

    const gear2 = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), gearMat);
    gear2.position.set(-0.2, 4.6, -4.1);
    scene.add(gear2);

    const gears = [gear1, gear2];

    // Floor grid
    const makeGridTexture = () => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext("2d")!;
      const step = 64;
      let gi = 0;
      for (let i = 0; i <= 512; i += step) {
        ctx.strokeStyle = gi % 4 === 0 ? "rgba(0,240,255,0.28)" : "rgba(178,239,155,0.1)";
        ctx.lineWidth = gi % 4 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
        gi++;
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(10, 10);
      return tex;
    };

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ map: makeGridTexture(), roughness: 0.9, metalness: 0.1, transparent: true })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Dust particles
    const particleCount = 180;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = Math.random() * 5.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xb2ef9b, size: 0.02, transparent: true, opacity: 0.35 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Drifting letter tiles
    const makeLetterTexture = (letter: string, colorHex: string) => {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext("2d")!;
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.55;
      ctx.strokeRect(16, 16, 96, 96);
      ctx.globalAlpha = 1;
      ctx.fillStyle = colorHex;
      ctx.font = "700 60px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letter, 64, 70);
      return new THREE.CanvasTexture(c);
    };

    const tileLetters = "RMDB";
    const tileColors = [0x00f0ff, 0xb2ef9b, 0xef959c, 0x1b9aaa];
    const letterTiles: any[] = [];

    const seedLetterZone = (count: number, xMin: number, xMax: number, yMin: number, yMax: number, zMin: number, zMax: number) => {
      for (let i = 0; i < count; i++) {
        const ch = tileLetters[Math.floor(Math.random() * tileLetters.length)]!;
        const colHex = tileColors[Math.floor(Math.random() * tileColors.length)]!;
        const colStr = "#" + colHex.toString(16).padStart(6, "0");
        const mat = new THREE.SpriteMaterial({ map: makeLetterTexture(ch, colStr), transparent: true, opacity: 0, depthWrite: false });
        const spr = new THREE.Sprite(mat);
        const x = xMin + Math.random() * (xMax - xMin);
        const z = zMin + Math.random() * (zMax - zMin);
        spr.position.set(x, yMin, z);
        const s = 0.58 + Math.random() * 0.42;
        spr.scale.set(s, s, 1);
        spr.userData = {
          baseY: Math.random() * (yMax - yMin),
          yMin,
          yMax,
          x,
          z,
          speed: 0.06 + Math.random() * 0.08,
          phase: Math.random() * Math.PI * 2,
          baseOpacity: 0.32 + Math.random() * 0.34,
        };
        scene.add(spr);
        letterTiles.push(spr);
      }
    };
    seedLetterZone(12, -11.5, -6, 0.4, 5.6, -7, -1.5);
    seedLetterZone(12, 6, 11.5, 0.4, 5.6, -7, -1.5);
    seedLetterZone(8, -2.6, 2.6, 3.4, 5.6, -6, -3.5);

    // 3. Central Hologram Platform/Emitter
    const makeHolographicEmitterTexture = () => {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(128, 128, 110, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(128, 128);
        ctx.lineTo(128 + Math.cos(ang) * 110, 128 + Math.sin(ang) * 110);
        ctx.stroke();
      }
      return new THREE.CanvasTexture(c);
    };

    const emitterMat = new THREE.MeshBasicMaterial({ 
      map: makeHolographicEmitterTexture(), 
      transparent: true, 
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const platform = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), emitterMat);
    platform.rotation.x = -Math.PI / 2;
    platform.position.set(0, 0.02, 0);
    scene.add(platform);

    const ringMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5 });
    const ringGeo = new THREE.BufferGeometry();
    const rPoints = [];
    for (let i = 0; i <= 32; i++) {
      const ang = (i / 32) * Math.PI * 2;
      rPoints.push(Math.cos(ang) * 1.5, 0, Math.sin(ang) * 1.5);
    }
    ringGeo.setAttribute("position", new THREE.Float32BufferAttribute(rPoints, 3));
    
    const projRing1 = new THREE.Line(ringGeo, ringMat);
    projRing1.position.set(0, 0.2, 0);
    scene.add(projRing1);

    const projRing2 = new THREE.Line(ringGeo, ringMat);
    projRing2.scale.set(0.7, 1, 0.7);
    projRing2.position.set(0, 0.45, 0);
    scene.add(projRing2);

    const beamGeo = new THREE.CylinderGeometry(1.4, 1.8, 4.0, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({ 
      color: 0x00f0ff, 
      transparent: true, 
      opacity: 0.12, 
      blending: THREE.AdditiveBlending, 
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const emitterBeam = new THREE.Mesh(beamGeo, beamMat);
    emitterBeam.position.set(0, 2.0, 0);
    scene.add(emitterBeam);

    const hologramGroups: any[] = [];

    // Case File Monitor
    const makeCaseFileTexture = (feedId: string, operative: { name: string; role: string; accent: number; hairStyle: string }) => {
      const w = 320, h = 400;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#050d10";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(0,240,255,0.5)";
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 6, w - 12, h - 12);

      ctx.fillStyle = "rgba(0,240,255,0.85)";
      ctx.font = "700 15px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText("FEED: " + feedId, 22, 34);
      ctx.fillStyle = "rgba(238,243,238,0.4)";
      ctx.font = "500 11px 'JetBrains Mono', monospace";
      ctx.fillText("OPERATIVES LOG: VALIDATED", 22, 54);

      ctx.fillStyle = "#000";
      const barsY = [96, 118, 140, 220, 242, 264];
      barsY.forEach((by) => {
        const bw = 60 + Math.random() * 100;
        ctx.fillRect(22, by, bw, 12);
      });

      ctx.fillStyle = "rgba(178,239,155,0.7)";
      ctx.font = "700 12px 'JetBrains Mono', monospace";
      ctx.fillText("DEX_NET ACTIVE", 22, h - 58);
      ctx.fillStyle = "rgba(238,243,238,0.32)";
      ctx.font = "500 10px 'JetBrains Mono', monospace";
      ctx.fillText("CYBERNET PROTOCOL", 22, h - 38);
      ctx.fillText("AUTH: CLUEGRID INTEL DIV.", 22, h - 22);

      return new THREE.CanvasTexture(c);
    };

    const caseMonitors: any[] = [];
    const createCaseMonitor = (x: number, y: number, z: number, feedId: string, operative: { name: string; role: string; accent: number; hairStyle: string }) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);

      const bezel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.86, 2.3),
        new THREE.MeshBasicMaterial({ color: 0x02080a, transparent: true, opacity: 0.55 })
      );
      bezel.position.z = -0.01;
      group.add(bezel);

      const screenMat = new THREE.MeshBasicMaterial({ map: makeCaseFileTexture(feedId, operative), transparent: true, opacity: 0 });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.1), screenMat);
      group.add(screen);

      const scanTex = makeGlowTexture(0x00f0ff);
      const scanMat = new THREE.MeshBasicMaterial({ map: scanTex, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
      const scanline = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.5), scanMat);
      scanline.position.z = 0.01;
      group.add(scanline);

      const flashers: any[] = [];
      const flashSpecs = [
        [-0.32, 0.58, 0.5],
        [0.1, 0.36, 0.7],
        [-0.2, -0.02, 0.42],
      ];
      flashSpecs.forEach(([fx, fy, fw]) => {
        const fm = new THREE.Mesh(new THREE.PlaneGeometry(fw, 0.1), new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0 }));
        fm.position.set(fx, fy, 0.015);
        fm.userData = { phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 0.4 };
        group.add(fm);
        flashers.push(fm);
      });

      const blinkDot = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), new THREE.MeshBasicMaterial({ color: 0xef959c }));
      blinkDot.position.set(0.78, 0.98, 0.02);
      group.add(blinkDot);

      group.userData = { screenMat, scanline, flashers, blinkDot, phase: Math.random() * Math.PI * 2 };
      scene.add(group);
      caseMonitors.push(group);
      return group;
    };

    createCaseMonitor(-9.1, 1.05, -3.9, "OPER-01", { name: "NOX-7", role: "Analyst", accent: 0xb2ef9b, hairStyle: "swept" });
    createCaseMonitor(9.1, 1.05, -3.9, "OPER-02", { name: "ORACLE-3", role: "Leader", accent: 0xef959c, hairStyle: "short" });

    // Blank texture maker for placeholder use before loaded
    const makeBlankTexture = () => {
      const c = document.createElement("canvas");
      c.width = 1; c.height = 1;
      return new THREE.CanvasTexture(c);
    };

    // Operatives container
    const agents: any[] = [];
    const ambientAgents: any[] = [];
    const allOps: any[] = [];
    let materializeProgress = 0.0;

    const createOperative = (charIndex: number, accentHex: number, scale: number, isAmbient: boolean) => {
      const group = new THREE.Group();
      
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 512;
      const sctx = canvas.getContext("2d")!;
      const tex = new THREE.CanvasTexture(canvas);

      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, color: accentHex, opacity: 0 });
      const sprite = new THREE.Sprite(mat);
      const height = 3.2 * scale;
      const width = height * 0.5;
      sprite.scale.set(width, height, 1);
      sprite.position.y = height / 2;
      group.add(sprite);



      const groundGlow = addGlowSprite(accentHex, 0, 0.04, 0.16, 1.4, 0.0); // starts hidden
      groundGlow.rotation.x = -Math.PI / 2;
      group.add(groundGlow);

      // System Font and Theme Styled Nameplate Canvas Texture
      const makeNamePlateTexture = (name: string, role: string, colorStr: string) => {
        const c = document.createElement("canvas");
        c.width = 256;
        c.height = 72;
        const ctx = c.getContext("2d")!;
        
        ctx.strokeStyle = colorStr;
        ctx.lineWidth = 1.5;
        // Draw cyber-border
        ctx.strokeRect(8, 8, 240, 56);
        
        // Corner indicators
        ctx.fillStyle = colorStr;
        ctx.fillRect(8, 8, 5, 5);
        ctx.fillRect(243, 8, 5, 5);
        ctx.fillRect(8, 59, 5, 5);
        ctx.fillRect(243, 59, 5, 5);
        
        // Name text
        ctx.fillStyle = "#eef3ee";
        ctx.font = "700 13px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(name, 128, 26);
        
        // Role text
        ctx.fillStyle = colorStr;
        ctx.font = "500 9.5px 'JetBrains Mono', monospace";
        ctx.fillText(role, 128, 44);
        
        return new THREE.CanvasTexture(c);
      };

      const charInfo = [
        { name: "VESPER", role: "THE HANDLER" },
        { name: "ALBION", role: "THE STRATEGIST" },
        { name: "LACE", role: "THE INFILTRATOR" },
        { name: "REQUIEM", role: "THE ENFORCER" },
      ][charIndex] || { name: "AGENT", role: "OPERATIVE" };

      const colorStr = "#" + accentHex.toString(16).padStart(6, "0");
      const namePlateMat = new THREE.SpriteMaterial({ 
        map: makeNamePlateTexture(charInfo.name, charInfo.role, colorStr), 
        transparent: true,
        opacity: 0, // starts hidden
        depthWrite: false
      });
      const namePlateSprite = new THREE.Sprite(namePlateMat);
      namePlateSprite.position.set(0, -0.28, 0.1);
      namePlateSprite.scale.set(1.5, 0.42, 1);
      group.add(namePlateSprite);

      group.userData = { sprite, mat, groundGlow, namePlateSprite, canvas, sctx, img: null, baseScale: scale, baseY: 0, speaking: 0, ambient: isAmbient };
      return group;
    };

    // Instantiate 4 ambient & active operatives (grouped closer in the center grid)
    const opC = createOperative(0, 0x1b9aaa, 0.92, true); // Vesper
    opC.position.set(-1.8, 0, -0.5);
    scene.add(opC);

    const opA = createOperative(1, 0xb2ef9b, 1.0, false); // Albion
    opA.position.set(-0.6, 0, 0);
    scene.add(opA);

    const opB = createOperative(2, 0xef959c, 1.0, false); // Lace
    opB.position.set(0.6, 0, 0);
    scene.add(opB);

    const opD = createOperative(3, 0x9aa29b, 0.92, true); // Requiem
    opD.position.set(1.8, 0, -0.5);
    scene.add(opD);

    agents.push(opA, opB);
    ambientAgents.push(opC, opD);
    allOps.push(opC, opA, opB, opD);

    // Load character sheet asset asynchronously
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("/spy-characters.png", (texture: any) => {
      const img = texture.image;
      allOps.forEach((op) => {
        op.userData.img = img;
      });
    });

    let introTime = 0.0;
    let briefingStarted = false;

    threeStateRef.current = {
      renderer,
      scene,
      camera,
      agents,
      particles,
      letterTiles,
      caseMonitors,
      hologramGroups,
      entering: false,
      dollyProgress: 0,
      baseCameraZ,
      currentSpeaker: null,
    };

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const t = clock.getElapsedTime();
      const state = threeStateRef.current;
      if (!state) return;

      // Dynamic materialization entrance (voxelization, scanning sweep, opacity shimmer)
      if (materializeProgress < 1.0) {
        let step = 0.007;
        if (isActiveRoomRef.current) {
          step = allOps.every(op => op.userData.img) ? 1.0 : 0.0;
        }
        materializeProgress = Math.min(1.0, materializeProgress + step);
        if (!soundPlayedRef.current && allOps.some(op => op.userData.img)) {
          soundPlayedRef.current = true;
          if (!isActiveRoomRef.current) {
            playMaterializeSound();
          }
        }
        
        // Easing factor: easeOutCubic
        const tProgress = 1 - Math.pow(1 - materializeProgress, 3);
        
        allOps.forEach((op, i) => {
          const d = op.userData;
          if (!d.img) return;
          
          const canvas = d.canvas;
          const sctx = d.sctx;
          const img = d.img;
          const w = canvas.width;
          const h = canvas.height;
          
          sctx.clearRect(0, 0, w, h);
          
          // Smoothly increase voxelization resolution based on progress
          const resScale = 0.03 + 0.97 * Math.pow(tProgress, 2.5);
          const tempW = Math.max(8, Math.floor(256 * resScale));
          const tempH = Math.max(16, Math.floor(512 * resScale));
          
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = tempW;
          tempCanvas.height = tempH;
          const tctx = tempCanvas.getContext("2d")!;
          
          const srcW = img.width / 4;
          const srcH = img.height;
          const srcX = i * srcW;
          
          tctx.drawImage(img, srcX, 0, srcW, srcH, 0, 0, tempW, tempH);
          
          // White background chroma keying
          const imgData = tctx.getImageData(0, 0, tempW, tempH);
          const pix = imgData.data;
          for (let p = 0; p < pix.length; p += 4) {
            const r = pix[p]!;
            const g = pix[p+1]!;
            const b = pix[p+2]!;
            if (r > 240 && g > 240 && b > 240) {
              pix[p+3] = 0;
            } else if (r > 210 && g > 210 && b > 210) {
              const maxVal = Math.max(r, g, b);
              const factor = (240 - maxVal) / 30;
              pix[p+3] = Math.max(0, Math.floor(pix[p+3]! * factor));
            }
          }
          tctx.putImageData(imgData, 0, 0);
          
          sctx.imageSmoothingEnabled = false;
          sctx.drawImage(tempCanvas, 0, 0, tempW, tempH, 0, 0, w, h);
          
          // Scanlines
          const scanY = (t * 240) % h;
          sctx.fillStyle = "rgba(0, 240, 255, 0.45)";
          sctx.fillRect(0, scanY, w, 4.5);
          
          // Mask edges
          sctx.globalCompositeOperation = "destination-in";
          const gradV = sctx.createLinearGradient(0, 0, 0, 512);
          gradV.addColorStop(0, "rgba(0,0,0,0)");
          gradV.addColorStop(0.1, "rgba(0,0,0,1)");
          gradV.addColorStop(0.85, "rgba(0,0,0,1)");
          gradV.addColorStop(1, "rgba(0,0,0,0)");
          sctx.fillStyle = gradV;
          sctx.fillRect(0, 0, 256, 512);

          const gradH = sctx.createLinearGradient(0, 0, 256, 0);
          gradH.addColorStop(0, "rgba(0,0,0,0)");
          gradH.addColorStop(0.12, "rgba(0,0,0,1)");
          gradH.addColorStop(0.88, "rgba(0,0,0,1)");
          gradH.addColorStop(1, "rgba(0,0,0,0)");
          sctx.fillStyle = gradH;
          sctx.fillRect(0, 0, 256, 512);
          sctx.globalCompositeOperation = "source-over";
          
          d.mat.map.needsUpdate = true;
          
          // Eased rise up position transition
          const targetY = Math.sin(t * 0.8 + op.position.x) * 0.02;
          op.position.y = -0.22 * (1.0 - tProgress) + targetY;
          
          d.mat.opacity = tProgress * (0.75 + 0.25 * Math.random());
          d.groundGlow.material.opacity = tProgress * 0.12;
          d.namePlateSprite.material.opacity = tProgress * 0.9;
          
          // Set correct group scale
          op.scale.set(1, 1, 1);
          op.scale.y = 0.1 + 0.9 * tProgress;
        });
      } else {
        // Stabilized standing animations
        state.agents.forEach((op, idx) => {
          const d = op.userData;
          const activeSide = idx === 0 ? "A" : "B";
          const isSpeaking = state.currentSpeaker === activeSide;
          const targetSpeak = isSpeaking ? 1 : 0;
          d.speaking += (targetSpeak - d.speaking) * 0.08;

          op.position.y = Math.sin(t * 0.5 + op.position.x) * 0.015 + d.speaking * Math.sin(t * 2.8) * 0.016;
          d.mat.rotation = 0;
          d.mat.opacity = 1.0;
          d.groundGlow.material.opacity = 0.12;
          d.namePlateSprite.material.opacity = 0.9;
          op.scale.set(1, 1, 1);
          op.scale.setScalar(1 + d.speaking * 0.025);
        });

        ambientAgents.forEach((op) => {
          const d = op.userData;
          op.position.y = Math.sin(t * 1.0 + op.position.x) * 0.038;
          d.mat.rotation = 0;
          d.mat.opacity = 1.0;
          d.groundGlow.material.opacity = 0.12;
          d.namePlateSprite.material.opacity = 0.8;
          op.scale.set(1, 1, 1);
        });

        // Trigger briefing typing
        if (!briefingStarted) {
          briefingStarted = true;
          if (!isActiveRoomRef.current) {
            setIsPlayingBriefing(true);
          }
        }
      }

      // Rotate projection platform and rings
      projRing1.rotation.y = t * 0.4;
      projRing2.rotation.y = -t * 0.6;
      platform.rotation.z = -t * 0.12;

      emitterBeam.material.opacity = isActiveRoomRef.current ? 0.14 : (0.08 + Math.abs(Math.sin(t * 4.5)) * 0.08);

      particles.rotation.y = t * 0.01;

      // Letter tiles scrolling
      state.letterTiles.forEach((spr) => {
        const d = spr.userData;
        const range = d.yMax - d.yMin;
        spr.position.y = d.yMin + ((d.baseY + t * d.speed) % range);
        spr.material.opacity = d.baseOpacity * (0.35 + 0.65 * Math.abs(Math.sin(t * 0.35 + d.phase)));
      });

      // Case monitors screen scanlines
      state.caseMonitors.forEach((g) => {
        const d = g.userData;
        if (d.screenMat.opacity < 0.78) d.screenMat.opacity += 0.006;

        const sweepT = (t * 0.18 + d.phase) % 1.6;
        d.scanline.position.y = 1.05 - sweepT * 2.1;
        d.scanline.material.opacity = 0.28 * Math.max(0, 1 - Math.abs(sweepT - 0.8) / 0.8);

        d.flashers.forEach((f: any) => {
          const fd = f.userData;
          f.material.opacity = Math.max(0, Math.sin(t * fd.speed + fd.phase)) * 0.5;
        });

        d.blinkDot.material.opacity = 0.4 + Math.abs(Math.sin(t * 3 + d.phase)) * 0.6;
      });

      // Rotate gears in control room backdrop
      gears.forEach((gear, idx) => {
        gear.rotation.z = t * 0.14 * (idx === 0 ? 1 : -1.2);
      });

      // Flashing server cluster LEDs
      serverLEDs.forEach((led) => {
        const ud = led.userData;
        led.material.opacity = ud.baseOpacity * (0.35 + 0.65 * Math.abs(Math.sin(t * ud.speed + ud.phase)));
      });

      // Projector holograms spinning
      state.hologramGroups.forEach((g) => {
        g.rotation.y = t * 0.07;
        g.children.forEach((mesh: any) => {
          if (mesh.userData && mesh.userData.bobSpeed) {
            const ud = mesh.userData;
            mesh.position.y = ud.baseY + Math.sin(t * ud.bobSpeed + ud.phase) * 0.06;
            if (mesh.material.opacity < ud.baseOpacity) mesh.material.opacity += 0.005;
          }
        });
      });

      if (!state.entering) {
        camera.position.x = Math.sin(t * 0.15) * 0.35;
        camera.position.y = 2.3 + Math.sin(t * 0.25) * 0.05;
        camera.lookAt(0, 1.7, 0);
      } else {
        state.dollyProgress = Math.min(1, state.dollyProgress + 0.02);
        camera.position.z = state.baseCameraZ - state.dollyProgress * 2.5;
        camera.position.x *= 0.95;
        camera.lookAt(0, 1.7, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mounted = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateCameraFraming);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && sceneEl.contains(renderer.domElement)) {
          sceneEl.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  // Mode select & Team info helpers
  const teamsInfo: Record<string, string> = {
    "2": "2 Teams: 9 / 8 Cards, 7 Neutrals, 1 Assassin (5x5)",
    "3": "3 Teams: 7 / 7 / 6 Cards, 4 Neutrals, 1 Assassin (5x5)",
    "4": "4 Teams: 6 / 6 / 6 / 6 Cards, 5 Neutrals, 1 Assassin (6x6)",
  };

  const handleEnterGuest = () => {
    ensureAudio();
    if (threeStateRef.current) {
      threeStateRef.current.entering = true;
    }
    setShowCTA(false);
    setIsWiping(true);
    setTimeout(() => {
      setShowWelcome(true);
    }, 420);
    setTimeout(() => {
      setIsWiping(false);
    }, 900);
  };

  const triggerCreateRoom = () => {
    handleCreateRoom({
      teamCount: gameMode === "coop" ? 2 : selectedTeams,
      gameMode,
      language: lang,
    });
  };

  const handleReplayBriefing = () => {
    setShowWelcome(false);
    soundPlayedRef.current = false;
    soundSuccessRef.current = false;
    if (threeStateRef.current) {
      threeStateRef.current.entering = false;
      threeStateRef.current.dollyProgress = 0;
      threeStateRef.current.camera.position.set(0, 2.3, threeStateRef.current.baseCameraZ);
    }
    setLineIndex(0);
    setIsPlayingBriefing(true);
  };

  // Feedback Submission
  const handleFeedbackSubmit = async () => {
    if (!reportText.trim()) return;
    setTransmitting(true);
    try {
      const res = await fetch("/api/user/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: reportType, description: reportText }),
      });
      if (!res.ok) throw new Error("Failed to send feedback to server");
    } catch (err) {
      console.error(err);
      const feedbackList = JSON.parse(localStorage.getItem("cluegrid_feedback") || "[]");
      feedbackList.push({
        category: reportType,
        description: reportText,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("cluegrid_feedback", JSON.stringify(feedbackList));
    }
    setTimeout(() => {
      setTransmitting(false);
      setReportText("");
      setShowReport(false);
    }, 750);
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "fixed", inset: 0, zIndex: isActiveRoom ? 1 : 1000, overflow: "hidden", color: "#eef3ee", fontFamily: "'JetBrains Mono', monospace", background: "#081619" }}>
      {/* Background Vignette & scanlines (zIndex 2) */}
      <div className="vignette" style={{
        position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none",
        background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 42%, rgba(3,10,12,0.75) 100%),
                     linear-gradient(180deg, rgba(3,10,12,0.55) 0%, rgba(3,10,12,0) 16%, rgba(3,10,12,0) 78%, rgba(3,10,12,0.65) 100%)`
      }} />
      <div className="scanline" style={{
        position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none", opacity: 0.5,
        backgroundImage: `repeating-linear-gradient(to bottom, rgba(178,239,155,0.035) 0px, rgba(178,239,155,0.035) 1px, transparent 1px, transparent 3px)`
      }} />

      {/* 3D WebGL Canvas container (always visible) */}
      <div ref={mountRef} style={{ position: "fixed", inset: 0, zIndex: 4, pointerEvents: "none" }} />

      {!isActiveRoom && (
        <>
          {/* Left Column Advanced Decryption Center Panel (zIndex 5) */}
          <div className="hud-side-panel-left" style={{ position: "fixed", top: "110px", left: "24px", width: "270px", background: "rgba(8,22,25,0.76)", border: "1px solid rgba(238,243,238,0.14)", borderTop: "2px solid #1b9aaa", borderRadius: "4px", padding: "14px 16px", pointerEvents: "none" }}>
        <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#1b9aaa", borderBottom: "1px solid rgba(238,243,238,0.1)", paddingBottom: "6px", marginBottom: "8px", fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            SIGNAL INTEL
          </span>
          <span style={{ color: "#ef959c" }}>ONLINE</span>
        </div>
        
        <div style={{ width: "100%", height: "65px", background: "rgba(0,0,0,0.2)", borderRadius: "3px", overflow: "hidden", marginBottom: "10px", border: "1px solid rgba(27,154,170,0.15)" }}>
          <canvas ref={leftCanvasRef} width="238" height="65" style={{ width: "100%", height: "100%" }} />
        </div>

        <div style={{ fontSize: "9px", fontFamily: "monospace", color: "#b2ef9b", background: "rgba(255,255,255,0.02)", padding: "6px 8px", borderRadius: "3px", marginBottom: "10px", borderLeft: "2px solid #b2ef9b" }}>
          <div style={{ color: "rgba(238,243,238,0.4)", textTransform: "uppercase", fontSize: "8px", marginBottom: "2px" }}>KEY EXCHANGE STREAM:</div>
          <div>{hexKeyStream}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "9.5px", background: "rgba(0,0,0,0.15)", padding: "6px", borderRadius: "3px", marginBottom: "12px", border: "1px dashed rgba(238,243,238,0.1)" }}>
          <span>TARGET VCT: [{vectorGrid.x}, {vectorGrid.y}]</span>
          <span style={{ color: vectorGrid.status === "LOCKED" ? "#ef959c" : "#00f0ff", fontWeight: "bold" }}>{vectorGrid.status}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {logLines.map((log) => (
            <div key={log.id} style={{ fontSize: "10px", color: "rgba(238,243,238,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              <span style={{ color: "#1b9aaa" }}>[{log.tag}]</span> {log.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right Column Cyber Surveillance Map HUD Panel (zIndex 5) */}
      <div className="hud-side-panel-right" style={{ position: "fixed", top: "110px", right: "24px", width: "270px", background: "rgba(8,22,25,0.76)", border: "1px solid rgba(238,243,238,0.14)", borderTop: "2px solid #ef959c", borderRadius: "4px", padding: "14px 16px", pointerEvents: "none" }}>
        <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#ef959c", borderBottom: "1px solid rgba(238,243,238,0.1)", paddingBottom: "6px", marginBottom: "8px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>🌐 ACTIVE SURVEILLANCE</span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "9.5px", color: "#ef959c" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef959c", boxShadow: "0 0 6px #ef959c", animation: "pulse 1.6s infinite" }} />
            LIVE
          </span>
        </div>
        
        <div style={{ width: "100%", height: "115px", background: "rgba(0,0,0,0.25)", borderRadius: "3px", overflow: "hidden", marginBottom: "10px", border: "1px solid rgba(239,149,156,0.15)" }}>
          <canvas ref={rightCanvasRef} width="238" height="115" style={{ width: "100%", height: "100%" }} />
        </div>

        <div style={{ fontSize: "10.5px", color: "#ef959c", fontWeight: "bold", display: "flex", justifyContent: "space-between", borderTop: "1px dashed rgba(238,243,238,0.1)", paddingTop: "8px", marginTop: "4px" }}>
          <span>NETWORK WEMAPS</span>
          <span style={{ color: "#eef3ee", opacity: 0.5, fontSize: "9px" }}>v3.42</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
          {surveillanceRoster.slice(0, 3).map((op, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", color: "rgba(238,243,238,0.45)" }}>
              <span>{op.name} ({op.role})</span>
              <span style={{ color: op.color }}>{op.status}</span>
            </div>
          ))}
        </div>
      </div>

          {/* HUD Corners (zIndex 5) */}
          <div className="hud-corner tl" style={{ position: "fixed", zIndex: 5, width: "34px", height: "34px", pointerEvents: "none", borderTop: "2px solid rgba(178,239,155,0.4)", borderLeft: "2px solid rgba(178,239,155,0.4)", top: "14px", left: "14px" }}></div>
          <div className="hud-corner tr" style={{ position: "fixed", zIndex: 5, width: "34px", height: "34px", pointerEvents: "none", borderTop: "2px solid rgba(239,149,156,0.4)", borderRight: "2px solid rgba(239,149,156,0.4)", top: "14px", right: "14px" }}></div>
          <div className="hud-corner bl" style={{ position: "fixed", zIndex: 5, width: "34px", height: "34px", pointerEvents: "none", borderBottom: "2px solid rgba(239,149,156,0.4)", borderLeft: "2px solid rgba(239,149,156,0.4)", bottom: "14px", left: "14px" }}></div>
          <div className="hud-corner br" style={{ position: "fixed", zIndex: 5, width: "34px", height: "34px", pointerEvents: "none", borderBottom: "2px solid rgba(178,239,155,0.4)", borderRight: "2px solid rgba(178,239,155,0.4)", bottom: "14px", right: "14px" }}></div>

      {/* Top Header Logo (zIndex 6) */}
      <div className="wordmark" style={{ position: "fixed", top: "24px", left: "24px", zIndex: 6, display: "flex", flexDirection: "column", gap: "6px" }}>
        <div 
          onClick={() => setCurrentView("lobby")}
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        >
          <div className="rubiks-cube-container" style={{ width: "32px", height: "32px", perspective: "250px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="rubiks-cube" style={{ width: "24px", height: "24px", position: "relative", transformStyle: "preserve-3d", animation: "rotate-cube 8s infinite linear" }}>
              <div className="cube-face front" style={{ position: "absolute", width: "24px", height: "24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "#000", transform: "translateZ(12px)" }}>
                <div style={{ background: "#ef959c" }}></div><div style={{ background: "#1b9aaa" }}></div><div style={{ background: "#b2ef9b" }}></div>
                <div style={{ background: "#1b9aaa" }}></div><div style={{ background: "#111" }}></div><div style={{ background: "#ef959c" }}></div>
                <div style={{ background: "#b2ef9b" }}></div><div style={{ background: "#1b9aaa" }}></div><div style={{ background: "#ef959c" }}></div>
              </div>
              <div className="cube-face back" style={{ position: "absolute", width: "24px", height: "24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "#000", transform: "rotateY(180deg) translateZ(12px)" }}>
                <div style={{ background: "#b2ef9b" }}></div><div style={{ background: "#ef959c" }}></div><div style={{ background: "#1b9aaa" }}></div>
                <div style={{ background: "#ef959c" }}></div><div style={{ background: "#111" }}></div><div style={{ background: "#b2ef9b" }}></div>
                <div style={{ background: "#1b9aaa" }}></div><div style={{ background: "#ef959c" }}></div><div style={{ background: "#b2ef9b" }}></div>
              </div>
            </div>
          </div>
          <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: "28px", letterSpacing: "0.04em", color: "#eef3ee", lineHeight: 1 }}>
            CLUE<span style={{ color: "#00f0ff" }}>GRID</span>.GAMES
          </span>
        </div>
        <div className="tag" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "clamp(9px, 2.5vw, 11px)", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9AA29B", whiteSpace: "nowrap" }}>
          <span className="dot" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ef959c", boxShadow: "0 0 8px #ef959c", animation: "pulse 1.5s infinite" }} />
          Classified briefing — live feed
        </div>
      </div>

      {/* Navigation links */}
      <nav className="nav-links" style={{ position: "fixed", top: "28px", right: "64px", zIndex: 6, display: "flex", alignItems: "center", gap: "16px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        <button onClick={() => setCurrentView("rules")} className="cyber-dotted-link">How to play</button>
        <span style={{ opacity: 0.35 }}>·</span>
        <button onClick={() => setCurrentView("features")} className="cyber-dotted-link">Features</button>
        <span style={{ opacity: 0.35 }}>·</span>
        <button onClick={() => setCurrentView("changelog")} className="cyber-dotted-link">Changelog</button>
        <span style={{ opacity: 0.35 }}>·</span>
        <button onClick={() => setCurrentView("about")} className="cyber-dotted-link">About</button>
      </nav>

      {/* Hamburger button for mobile */}
      <button
        className="landing-hamburger"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 999,
          background: "rgba(8, 22, 25, 0.8)",
          border: "1px solid rgba(0, 240, 255, 0.4)",
          borderRadius: "4px",
          width: "38px",
          height: "38px",
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#00f0ff",
          boxShadow: "0 0 10px rgba(0, 240, 255, 0.2)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Mobile Menu Dropdown Panel */}
      {isMobileMenuOpen && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(3, 10, 12, 0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 997,
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            className="mobile-menu-animate"
            style={{
              position: "fixed",
              top: "72px",
              right: "24px",
              width: "180px",
              background: "#081619",
              border: "1.5px solid #00f0ff",
              borderRadius: "8px",
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              zIndex: 998,
              boxShadow: "0 15px 35px rgba(0,0,0,0.6), 0 0 15px rgba(0,240,255,0.15)",
            }}
          >
            <button
              onClick={() => { setCurrentView("rules"); setIsMobileMenuOpen(false); }}
              className="cyber-dotted-link"
              style={{ textAlign: "left", padding: "8px 6px", fontSize: "11.5px", width: "100%" }}
            >
              How to play
            </button>
            <button
              onClick={() => { setCurrentView("features"); setIsMobileMenuOpen(false); }}
              className="cyber-dotted-link"
              style={{ textAlign: "left", padding: "8px 6px", fontSize: "11.5px", width: "100%" }}
            >
              Features
            </button>
            <button
              onClick={() => { setCurrentView("changelog"); setIsMobileMenuOpen(false); }}
              className="cyber-dotted-link"
              style={{ textAlign: "left", padding: "8px 6px", fontSize: "11.5px", width: "100%" }}
            >
              Changelog
            </button>
            <button
              onClick={() => { setCurrentView("about"); setIsMobileMenuOpen(false); }}
              className="cyber-dotted-link"
              style={{ textAlign: "left", padding: "8px 6px", fontSize: "11.5px", width: "100%" }}
            >
              About
            </button>
            <div style={{ height: "1px", background: "rgba(238,243,238,0.1)", margin: "4px 0" }} />
            <button
              onClick={() => { setCurrentView("support"); setIsMobileMenuOpen(false); }}
              className="cyber-dotted-link"
              style={{ textAlign: "left", padding: "8px 6px", fontSize: "11.5px", width: "100%", color: "#ef959c" }}
            >
              ☕ Supply Line: Coffee
            </button>
            <button
              onClick={() => { setShowReport(true); setIsMobileMenuOpen(false); }}
              className="cyber-dotted-link"
              style={{ textAlign: "left", padding: "8px 6px", fontSize: "11.5px", width: "100%", color: "#00f0ff" }}
            >
              🐛 Report Bug / Idea
            </button>
          </div>
        </>
      )}

      {/* Bottom left indicators */}
      <button 
        onClick={() => setCurrentView("support")}
        className="coffee-btn"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
        <span>SUPPLY LINE : COFFEE</span>
      </button>

      <button 
        onClick={() => setShowReport(true)}
        className="bug-btn"
      >
        <span className="fdot-wrap" style={{ position: "relative", width: "5px", height: "5px" }}>
          <span className="fdot" style={{ position: "relative", width: "5px", height: "5px", borderRadius: "50%", background: "#00f0ff", boxShadow: "0 0 6px #00f0ff", animation: "pulse 1.5s infinite" }} />
          <span className="fping" style={{ position: "absolute", inset: "-3px", borderRadius: "50%", border: "1px solid #00f0ff", opacity: 0.6, animation: "pulse 1.5s infinite" }} />
        </span>
        Need a feature or found a bug?
      </button>

      {/* Field Report Overlay */}
      {showReport && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowReport(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 25, display: "flex", alignItems: "flex-end", justifyContent: "flex-start", padding: "40px", backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(2px)" }}
        >
          <div 
            style={{
              width: "min(420px, 88vw)",
              background: "linear-gradient(155deg, rgba(6,24,28,0.97) 0%, rgba(4,12,15,0.98) 100%)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(0,240,255,0.25)",
              borderRadius: "12px",
              padding: "24px 24px 22px",
              boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: "19px", color: "#00f0ff", letterSpacing: "0.02em" }}>Field Report</span>
              <button 
                onClick={() => setShowReport(false)}
                style={{ marginLeft: "auto", background: "transparent", border: "1px solid rgba(0,240,255,0.25)", color: "#eef3ee", width: "26px", height: "26px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: "11px", color: "#9AA29B", margin: "0 0 18px 0", letterSpacing: "0.03em" }}>Bugs, ideas, anything that's not working — goes straight to the team.</p>

            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "11.5px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#eef3ee", opacity: 0.85, marginBottom: "10px", fontWeight: 700 }}>Report Type</div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {(["bug", "idea", "other"] as const).map((t) => (
                  <button 
                    key={t}
                    onClick={() => setReportType(t)}
                    style={{
                      flex: 1, minWidth: "80px", background: reportType === t ? "rgba(0,240,255,0.08)" : "rgba(238,243,238,0.04)",
                      border: reportType === t ? "1.5px solid #00f0ff" : "1.5px solid rgba(238,243,238,0.14)",
                      color: reportType === t ? "#00f0ff" : "#eef3ee", padding: "8px", borderRadius: "8px", cursor: "pointer", textTransform: "capitalize", fontWeight: "bold"
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <textarea 
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="What happened, or what would make this better?" 
              style={{ width: "100%", minHeight: "88px", resize: "none", background: "rgba(238,243,238,0.04)", border: "1.5px solid rgba(238,243,238,0.14)", borderRadius: "8px", color: "#eef3ee", padding: "12px", marginBottom: "18px", outline: "none", fontFamily: "inherit" }}
            />

            <button 
              onClick={handleFeedbackSubmit}
              disabled={transmitting || !reportText.trim()}
              style={{ width: "100%", fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "17px", letterSpacing: "0.03em", background: "#00f0ff", color: "#040b0d", border: "none", padding: "13px", borderRadius: "8px", cursor: "pointer", opacity: transmitting ? 0.7 : 1 }}
            >
              {transmitting ? "Transmitting..." : "Transmit Report"}
            </button>
          </div>
        </div>
      )}

      {/* Briefing dialogue panel (types automatically after intro ends) */}
      {isPlayingBriefing && (
        <div style={{ position: "fixed", left: "50%", bottom: "110px", transform: "translateX(-50%)", zIndex: 5, width: "min(680px, 88vw)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            {activeSpeaker && (
              <div 
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", borderRadius: "2px", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", border: "1px solid currentColor",
                  color: activeSpeaker.s === "A" ? "#b2ef9b" : "#ef959c"
                }}
              >
                {activeSpeaker.name}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
              <button 
                onClick={() => setSfxEnabled(!sfxEnabled)} 
                style={{ background: "rgba(239, 149, 156, 0.08)", border: "1.5px solid #ef959c", color: "#ef959c", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 12px", borderRadius: "4px", cursor: "pointer", boxShadow: "0 0 10px rgba(239, 149, 156, 0.15)", transition: "all 0.2s ease" }}
                title="Toggle typing sound"
              >
                <svg width="20" height="16" viewBox="0 0 24 16" fill="none" style={{ opacity: sfxEnabled ? 1 : 0.4 }}>
                  <rect x="1" y="4" width="2.4" height="8" rx="0.5" fill="#ef959c"/>
                  <rect x="8" y="6" width="2.6" height="4" rx="1" fill="#ef959c"/>
                  <rect x="13" y="3" width="2.6" height="10" rx="1" fill="#ef959c"/>
                  <rect x="18" y="5.5" width="2.6" height="5" rx="1" fill="#ef959c"/>
                  {!sfxEnabled && <line x1="1" y1="1" x2="23" y2="15" stroke="#ef959c" strokeWidth="1.6"/>}
                </svg>
              </button>
              <button 
                onClick={() => {
                  setIsPlayingBriefing(false);
                  setShowCTA(true);
                }}
                style={{ background: "rgba(0, 240, 255, 0.08)", border: "1.5px solid #00f0ff", color: "#00f0ff", fontFamily: "inherit", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", boxShadow: "0 0 12px rgba(0, 240, 255, 0.2)", transition: "all 0.2s ease" }}
              >
                Skip briefing
              </button>
            </div>
          </div>
          <div style={{ minHeight: "56px", width: "100%", background: "linear-gradient(180deg, rgba(8,22,25,0.15), rgba(8,22,25,0.55))", borderLeft: "2px solid rgba(238,243,238,0.15)", padding: "12px 18px", fontSize: "16px", lineHeight: "1.5", color: "#eef3ee", textAlign: "center", backdropFilter: "blur(2px)" }}>
            {typedText}
            {showCursor && <span style={{ display: "inline-block", width: "8px", height: "1em", background: "#00f0ff", marginLeft: "2px", verticalAlign: "-2px" }} />}
          </div>
        </div>
      )}

      {/* CTA Wrap */}
      {showCTA && !showWelcome && currentView === "lobby" && (
        <div style={{ position: "fixed", left: "50%", bottom: "100px", transform: "translateX(-50%)", zIndex: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "78px", height: "78px", borderRadius: "50%", border: "2px solid #00f0ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "10px", letterSpacing: "0.08em", textAlign: "center", color: "#00f0ff", transform: "rotate(-18deg)", boxShadow: "0 0 22px rgba(0,240,255,0.25)" }}>
            CLEARANCE<br/>GRANTED
          </div>
          <button 
            onClick={handleEnterGuest}
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "22px", letterSpacing: "0.06em", background: "#00f0ff", color: "#040b0d", border: "none", padding: "15px 36px", borderRadius: "2px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 30px rgba(0,240,255,0.25)", width: "min(320px, 90vw)", boxSizing: "border-box" }}
          >
            ENTER AS GUEST <span style={{ transition: "transform .2s ease" }}>→</span>
          </button>
          <div style={{ fontSize: "11px", letterSpacing: "0.14em", color: "#9AA29B", textTransform: "uppercase", textAlign: "center", width: "100%", padding: "0 10px", boxSizing: "border-box" }}>No badge required · guest clearance</div>
          <div style={{ display: "flex", gap: "14px", alignItems: "center", fontSize: "11px", color: "#9AA29B" }}>
            <button onClick={() => setAuthOpen(true)} className="cyber-dotted-link">Already have an account? Sign in →</button>
          </div>
        </div>
      )}

      {/* Redaction wipe transition */}
      {isWiping && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 20, background: "#040b0d",
          animation: "wipeIn 0.7s cubic-bezier(.7,0,.2,1) forwards"
        }} />
      )}

      {/* Centered content overlay */}
      {(showWelcome || currentView !== "lobby") && (
        <div style={{ position: "fixed", inset: 0, zIndex: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", overflowY: "auto" }}>
          {currentView === "lobby" ? (
            <div style={{ width: "min(560px, 100%)", background: "rgba(6,24,28,0.9)", border: "1px solid rgba(0,240,255,0.35)", backdropFilter: "blur(6px)", padding: "40px", position: "relative", borderRadius: "14px" }}>
              <div style={{ marginBottom: "22px" }}>
                <div style={{ fontSize: "11.5px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#eef3ee", opacity: 0.85, marginBottom: "10px", fontWeight: 700 }}>Game Mode</div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    onClick={() => setGameMode("classic")}
                    style={{
                      flex: 1, background: gameMode === "classic" ? "rgba(0,240,255,0.08)" : "rgba(238,243,238,0.04)",
                      border: gameMode === "classic" ? "1.5px solid #00f0ff" : "1.5px solid rgba(238,243,238,0.14)",
                      color: gameMode === "classic" ? "#00f0ff" : "#eef3ee", padding: "13px 10px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold"
                    }}
                  >
                    Multi-Team
                  </button>
                  <button 
                    onClick={() => setGameMode("coop")}
                    style={{
                      flex: 1, background: gameMode === "coop" ? "rgba(0,240,255,0.08)" : "rgba(238,243,238,0.04)",
                      border: gameMode === "coop" ? "1.5px solid #00f0ff" : "1.5px solid rgba(238,243,238,0.14)",
                      color: gameMode === "coop" ? "#00f0ff" : "#eef3ee", padding: "13px 10px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold"
                    }}
                  >
                    Duet
                  </button>
                </div>
              </div>

              {gameMode !== "coop" && (
                <div style={{ marginBottom: "22px" }}>
                  <div style={{ fontSize: "11.5px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#eef3ee", opacity: 0.85, marginBottom: "10px", fontWeight: 700 }}>Number of Teams</div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {([2, 3, 4] as const).map((num) => (
                      <button 
                        key={num}
                        onClick={() => setSelectedTeams(num)}
                        style={{
                          flex: 1, background: selectedTeams === num ? "rgba(0,240,255,0.08)" : "rgba(238,243,238,0.04)",
                          border: selectedTeams === num ? "1.5px solid #00f0ff" : "1.5px solid rgba(238,243,238,0.14)",
                          color: selectedTeams === num ? "#00f0ff" : "#eef3ee", padding: "13px 10px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold"
                        }}
                      >
                        {num} Teams
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#9AA29B", marginTop: "8px" }}>
                    {teamsInfo[selectedTeams]}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: "22px" }}>
                <div style={{ fontSize: "11.5px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#eef3ee", opacity: 0.85, marginBottom: "10px", fontWeight: 700 }}>Gameplay Word Pack Language</div>
                <div style={{ position: "relative" }}>
                  <select 
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    style={{ width: "100%", background: "rgba(238,243,238,0.04)", border: "1.5px solid rgba(238,243,238,0.14)", borderRadius: "8px", color: "#eef3ee", fontSize: "14px", padding: "13px 14px", cursor: "pointer", outline: "none", appearance: "none" }}
                  >
                    <option value="en" style={{ color: "#040b0d" }}>🇬🇧 English</option>
                    <option value="es" style={{ color: "#040b0d" }}>🇪🇸 Spanish</option>
                    <option value="fr" style={{ color: "#040b0d" }}>🇫🇷 French</option>
                    <option value="de" style={{ color: "#040b0d" }}>🇩🇪 German</option>
                    <option value="hi" style={{ color: "#040b0d" }}>🇮🇳 Hindi</option>
                  </select>
                  <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#9AA29B", pointerEvents: "none" }}>▾</span>
                </div>
              </div>

              <button 
                onClick={triggerCreateRoom}
                disabled={loading}
                style={{ width: "100%", fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "19px", letterSpacing: "0.03em", background: "#00f0ff", color: "#040b0d", border: "none", padding: "15px", borderRadius: "8px", cursor: "pointer", boxShadow: "0 6px 24px rgba(0,240,255,0.2)" }}
              >
                {loading ? "Creating Room..." : "Create Room"}
              </button>

              <button 
                onClick={handleReplayBriefing}
                style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", color: "#9AA29B", fontFamily: "inherit", fontSize: "12px", textDecoration: "underline", cursor: "pointer" }}
              >
                Run the briefing again
              </button>
            </div>
          ) : (
            <div 
              style={{ 
                width: "min(800px, 95%)", 
                maxHeight: "85vh", 
                overflowY: "auto", 
                background: "rgba(6,24,28,0.92)", 
                border: "1px solid rgba(0,240,255,0.35)", 
                backdropFilter: "blur(8px)", 
                padding: "32px", 
                position: "relative", 
                borderRadius: "14px",
                textAlign: "left"
              }}
            >
              <button 
                onClick={() => setCurrentView("lobby")}
                style={{ 
                  position: "absolute", top: "16px", right: "16px", 
                  background: "transparent", border: "1.5px solid rgba(0,240,255,0.4)", 
                  color: "#00f0ff", padding: "6px 12px", borderRadius: "8px", 
                  cursor: "pointer", fontFamily: "inherit", fontSize: "12px"
                }}
              >
                ← Back to Briefing
              </button>
              
              <div style={{ marginTop: "24px" }}>
                {children}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )}

      {/* Embedded CSS */}
      <style>{`
        @keyframes wipeIn {
          0% { clip-path: inset(0 100% 0 0); }
          55% { clip-path: inset(0 0 0 0); }
          100% { clip-path: inset(0 0 0 100%); }
        }
        @keyframes rotate-cube {
          0% { transform: rotateX(-20deg) rotateY(0deg); }
          100% { transform: rotateX(-20deg) rotateY(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .cyber-dotted-link {
          background: none;
          border: none;
          color: #9AA29B;
          cursor: pointer;
          transition: all 0.25s ease;
          border-bottom: 2px dotted rgba(0, 240, 255, 0.45);
          padding-bottom: 2px;
          font-family: inherit;
          text-transform: uppercase;
        }
        .cyber-dotted-link:hover {
          color: #00f0ff;
          border-bottom: 2px solid #00f0ff;
          text-shadow: 0 0 8px rgba(0, 240, 255, 0.65);
        }
        .coffee-btn {
          position: fixed;
          bottom: 72px;
          left: 24px;
          z-index: 6;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 240, 255, 0.06);
          border: 1.5px solid rgba(0, 240, 255, 0.35);
          color: #00f0ff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 8px 14px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.05);
        }
        .coffee-btn:hover {
          background: #00f0ff;
          color: #02080a;
          border-color: #00f0ff;
          box-shadow: 0 0 18px rgba(0, 240, 255, 0.35);
        }
        .bug-btn {
          position: fixed;
          bottom: 22px;
          left: 24px;
          z-index: 6;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(238, 243, 238, 0.04);
          border: 1px solid rgba(0, 240, 255, 0.16);
          color: #9AA29B;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.03em;
          padding: 8px 14px 8px 12px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .bug-btn:hover {
          color: #00f0ff;
          border-color: #00f0ff;
          box-shadow: 0 0 12px rgba(0, 240, 255, 0.15);
        }
      `}</style>
    </div>
  );
}
