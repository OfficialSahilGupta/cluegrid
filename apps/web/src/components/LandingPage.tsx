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
}

export function LandingPage({
  currentView,
  setCurrentView,
  setAuthOpen,
  handleCreateRoom,
  loading,
  children,
}: LandingPageProps) {
  const { t } = useTranslation();
  const mountRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(true);
  const [showCTA, setShowCTA] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showReport, setShowReport] = useState(false);

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

  // Dialogue properties (Edwardian intelligence briefing)
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
    if (typeof window === "undefined") return;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
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

    // strike click
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

    // pitched tone
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

  // Live signal radar sweep and scrolling encryption rate graph visualizer
  useEffect(() => {
    const canvas = leftCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrame: number;
    let phase = 0;
    
    // Track line chart history points
    const historyPoints: number[] = Array.from({ length: 25 }, () => 15 + Math.random() * 30);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cw = canvas.width;
      const ch = canvas.height;

      // 1. Draw background grid lines
      ctx.strokeStyle = "rgba(27,154,170,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < cw; x += 16) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke();
      }
      for (let y = 0; y < ch; y += 16) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
      }

      // 2. Left Side: Surveillance Radar Sweep (cx: 36, cy: 32, r: 26)
      const rcx = 36;
      const rcy = ch / 2;
      const rr = 24;

      // Outer radar ring
      ctx.strokeStyle = "rgba(27,154,170,0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(rcx, rcy, rr, 0, Math.PI * 2);
      ctx.stroke();

      // Inner crosshairs
      ctx.strokeStyle = "rgba(27,154,170,0.15)";
      ctx.beginPath();
      ctx.moveTo(rcx - rr, rcy); ctx.lineTo(rcx + rr, rcy);
      ctx.moveTo(rcx, rcy - rr); ctx.lineTo(rcx, rcy + rr);
      ctx.stroke();

      // Sweeping radar arm
      const sweepAngle = phase * 0.05;
      ctx.strokeStyle = "rgba(178,239,155,0.7)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(rcx, rcy);
      ctx.lineTo(rcx + Math.cos(sweepAngle) * rr, rcy + Math.sin(sweepAngle) * rr);
      ctx.stroke();

      // Radar targets (flickering green blips)
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

      // 3. Right Side: Scrolling Encryption Rate Graph (x: 82 to cw - 12)
      const gxStart = 82;
      const gxEnd = cw - 12;
      const gWidth = gxEnd - gxStart;
      const gHeight = ch - 16;
      const gYCenter = ch / 2;

      // Graph frame
      ctx.strokeStyle = "rgba(27,154,170,0.2)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(gxStart, 8, gWidth, gHeight);

      // Shift history and push a new calculated signal point
      if (Math.random() < 0.22) {
        historyPoints.shift();
        historyPoints.push(10 + Math.random() * 32);
      }

      // Draw filled gradient area under the curve
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

      // Draw the green plot line
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

  // Decryption Log stream, Hex cipher streams, and Vector grid calculations
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

      // Shifting hexadecimal keys
      const hexChars = "0123456789ABCDEF";
      let key = "";
      for (let i = 0; i < 6; i++) {
        key += hexChars[Math.floor(Math.random() * 16)]! + hexChars[Math.floor(Math.random() * 16)]! + " ";
      }
      setHexKeyStream(key.trim());

      // Target vector shifts
      setVectorGrid({
        x: Math.floor(Math.random() * 24),
        y: Math.floor(Math.random() * 24),
        status: Math.random() > 0.3 ? "DECRYPTING" : "LOCKED",
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Latency ping adjustments
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

  // Listeners to unlock audio
  useEffect(() => {
    const unlock = () => {
      ensureAudio();
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
      setShowCTA(true);
      if (threeStateRef.current) {
        threeStateRef.current.currentSpeaker = null;
      }
      return;
    }

    if (lineIndex >= lines.length) {
      setIsPlayingBriefing(false);
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

        // Wait then move to next line
        setTimeout(() => {
          setLineIndex((prev) => prev + 1);
        }, 1800);
      }
    }, 24);

    return () => {
      clearInterval(typeInterval);
    };
  }, [lineIndex, isPlayingBriefing]);

  // Three.js Setup & Loop
  useEffect(() => {
    if (typeof THREE === "undefined" || !mountRef.current) return;

    const sceneEl = mountRef.current;
    const scene = new THREE.Scene();
    
    // Clear color is transparent so the HTML panels behind the canvas are visible
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

    // lighting
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

    // Glow sprite maker (fake bloom)
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

    // Ambient glow pools
    addGlowSprite(0xb2ef9b, -4.4, 2.2, -4.5, 8.5, 0.2);
    addGlowSprite(0xef959c, 4.4, 2.2, -4.5, 8.5, 0.2);
    addGlowSprite(0x1b9aaa, 0, 3.4, -6, 9, 0.18);
    addGlowSprite(0x00f0ff, 0, 0.4, -3, 10, 0.15);

    // Floor-level fill
    addGlowSprite(0xb2ef9b, -8, 0.6, -5, 6, 0.14);
    addGlowSprite(0xef959c, 8, 0.6, -5, 6, 0.14);

    // Skyline backdrop
    const makeSkylineTexture = () => {
      const w = 2048, h = 512;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#050f13");
      sky.addColorStop(0.6, "#0a1c21");
      sky.addColorStop(1, "#0c2126");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      const winColors = ["#1b9aaa", "#b2ef9b", "#ef959c", "#00f0ff"];
      const drawBuildingRow = (baseY: number, minH: number, maxH: number, minW: number, maxW: number, alpha: number) => {
        let x = 0;
        while (x < w) {
          const bw = minW + Math.random() * (maxW - minW);
          const bh = minH + Math.random() * (maxH - minH);
          ctx.fillStyle = `rgba(4,12,15,${alpha})`;
          ctx.fillRect(x, baseY - bh, bw, bh);
          for (let wy = baseY - bh + 10; wy < baseY - 8; wy += 16) {
            for (let wx = x + 6; wx < x + bw - 6; wx += 14) {
              if (Math.random() < 0.16) {
                ctx.fillStyle = winColors[Math.floor(Math.random() * winColors.length)]!;
                ctx.globalAlpha = 0.55;
                ctx.fillRect(wx, wy, 5, 7);
                ctx.globalAlpha = 1;
              }
            }
          }
          x += bw + 4 + Math.random() * 10;
        }
      };
      drawBuildingRow(h * 0.78, 60, 160, 40, 90, 0.55);
      drawBuildingRow(h * 0.9, 100, 260, 30, 70, 0.85);

      const haze = ctx.createLinearGradient(0, h * 0.55, 0, h);
      haze.addColorStop(0, "rgba(11,32,39,0)");
      haze.addColorStop(1, "rgba(8,22,25,0.9)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, w, h);

      return new THREE.CanvasTexture(c);
    };

    const skylineMat = new THREE.MeshBasicMaterial({ map: makeSkylineTexture(), fog: true });
    const skyline = new THREE.Mesh(new THREE.PlaneGeometry(64, 13), skylineMat);
    skyline.position.set(0, 4.2, -9);
    scene.add(skyline);

    // Floor grid
    const makeGridTexture = () => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#0c2126";
      ctx.fillRect(0, 0, 512, 512);
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
      new THREE.MeshStandardMaterial({ map: makeGridTexture(), roughness: 0.9, metalness: 0.1 })
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

    // Drifting Letter Tiles
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

    const tileLetters = "CLUEGRIDWORDPACKTEAMASSASSINGUESSVERB";
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

    // Grid Holograms
    const roundRectPath = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const makeGridCardTexture = (word: string, colorHex: string, isAssassin: boolean) => {
      const c = document.createElement("canvas");
      c.width = 200;
      c.height = 240;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = isAssassin ? "#0a0a0a" : "#0d1116";
      roundRectPath(ctx, 6, 6, 188, 228, 16);
      ctx.fill();
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = isAssassin ? 3 : 4;
      roundRectPath(ctx, 6, 6, 188, 228, 16);
      ctx.stroke();
      ctx.fillStyle = colorHex;
      ctx.beginPath();
      ctx.arc(30, 34, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#EDEFEC";
      ctx.font = "700 24px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(word, 100, 145);
      if (isAssassin) {
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(80, 185);
        ctx.lineTo(120, 205);
        ctx.moveTo(120, 185);
        ctx.lineTo(80, 205);
        ctx.stroke();
      }
      return new THREE.CanvasTexture(c);
    };

    const makeHologramFrame = () => {
      const size = 2.6;
      const group = new THREE.Group();
      const boxGeo = new THREE.BoxGeometry(size, size, 0.02);
      const edges = new THREE.EdgesGeometry(boxGeo);
      const frame = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x1b9aaa, transparent: true, opacity: 0.62 }));
      group.add(frame);

      const pts: number[] = [];
      const step = size / 3;
      for (let i = 1; i < 3; i++) {
        const p = -size / 2 + i * step;
        pts.push(-size / 2, p, 0, size / 2, p, 0);
        pts.push(p, -size / 2, 0, p, size / 2, 0);
      }
      const innerGeo = new THREE.BufferGeometry();
      innerGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      const innerLines = new THREE.LineSegments(innerGeo, new THREE.LineBasicMaterial({ color: 0x1b9aaa, transparent: true, opacity: 0.3 }));
      group.add(innerLines);

      const baseDisc = new THREE.Mesh(new THREE.CircleGeometry(size * 0.42, 24), new THREE.MeshBasicMaterial({ color: 0x1b9aaa, transparent: true, opacity: 0.1 }));
      baseDisc.rotation.x = -Math.PI / 2;
      baseDisc.position.y = -size / 2 - 0.02;
      group.add(baseDisc);
      return group;
    };

    const hologramGroups: any[] = [];
    const createGridHologram = (x: number, y: number, z: number, cards: { word: string; color: number; assassin?: boolean }[]) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.add(makeHologramFrame());

      cards.forEach((spec, idx) => {
        const colorStr = "#" + spec.color.toString(16).padStart(6, "0");
        const tex = makeGridCardTexture(spec.word, colorStr, !!spec.assassin);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 1.05), mat);
        const ang = (idx / cards.length) * Math.PI * 2;
        mesh.position.set(Math.cos(ang) * 0.92, Math.sin(ang) * 0.74, 0.22 + idx * 0.03);
        mesh.userData = {
          baseOpacity: 0.5 + Math.random() * 0.28,
          phase: Math.random() * Math.PI * 2,
          bobSpeed: 0.3 + Math.random() * 0.2,
          spinSpeed: 0.12 + Math.random() * 0.12,
          baseY: mesh.position.y,
        };
        group.add(mesh);
      });
      scene.add(group);
      hologramGroups.push(group);
      return group;
    };

    createGridHologram(-8.6, 2.9, -4.6, [
      { word: "OCEAN", color: 0xb2ef9b },
      { word: "MIRROR", color: 0xef959c },
      { word: "ANCHOR", color: 0x1b9aaa },
    ]);
    createGridHologram(8.6, 2.9, -4.6, [
      { word: "ORBIT", color: 0xb2ef9b },
      { word: "VOID", color: 0xef959c, assassin: true },
      { word: "LANTERN", color: 0x1b9aaa },
    ]);

    // Vector dossier drawing helper
    const drawPortraitBust = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, accentHex: number, hairStyle: string) => {
      const hex = "#" + accentHex.toString(16).padStart(6, "0");
      ctx.save();
      ctx.translate(cx, cy);

      // shoulders
      ctx.fillStyle = "#161c22";
      ctx.beginPath();
      ctx.moveTo(-r * 1.15, r * 1.7);
      ctx.quadraticCurveTo(-r * 1.1, r * 0.55, 0, r * 0.5);
      ctx.quadraticCurveTo(r * 1.1, r * 0.55, r * 1.15, r * 1.7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = hex;
      ctx.lineWidth = 2;
      ctx.stroke();

      // neck
      ctx.fillStyle = "#8a6a5c";
      ctx.fillRect(-r * 0.22, r * 0.28, r * 0.44, r * 0.35);

      // head
      ctx.fillStyle = "#9c7a68";
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.72, r * 0.82, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.14)";
      ctx.beginPath();
      ctx.ellipse(r * 0.28, r * 0.05, r * 0.42, r * 0.75, 0, -0.4, 1.6);
      ctx.fill();

      // hair
      ctx.fillStyle = "#0d0f12";
      if (hairStyle === "swept") {
        ctx.beginPath();
        ctx.moveTo(-r * 0.78, -r * 0.15);
        ctx.quadraticCurveTo(-r * 0.9, -r * 1.05, 0, -r * 1.02);
        ctx.quadraticCurveTo(r * 0.95, -r * 1.1, r * 0.65, -r * 0.1);
        ctx.quadraticCurveTo(r * 0.3, -r * 0.55, r * 0.05, -r * 0.2);
        ctx.quadraticCurveTo(-r * 0.35, -r * 0.65, -r * 0.78, -r * 0.15);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = hex;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.moveTo(r * 0.2, -r * 0.95);
        ctx.quadraticCurveTo(r * 0.55, -r * 0.5, r * 0.35, -r * 0.05);
        ctx.quadraticCurveTo(r * 0.15, -r * 0.5, r * 0.2, -r * 0.95);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.35, r * 0.82, r * 0.55, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = hex;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(-r * 0.7, -r * 0.42, r * 0.3, r * 0.16);
        ctx.globalAlpha = 1;
      }

      // eyes
      ctx.fillStyle = hex;
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * r * 0.28, r * 0.06);
        ctx.rotate(side * -0.12);
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.16, r * 0.065, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(side * r * 0.04, -r * 0.02, r * 0.035, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = hex;
        ctx.restore();
      });

      // brow
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.lineWidth = r * 0.05;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, -r * 0.16);
      ctx.lineTo(-r * 0.14, -r * 0.22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(r * 0.14, -r * 0.22);
      ctx.lineTo(r * 0.4, -r * 0.16);
      ctx.stroke();

      ctx.restore();
    };

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

      drawPortraitBust(ctx, 234, 108, 46, operative.accent, operative.hairStyle);

      ctx.fillStyle = "#" + operative.accent.toString(16).padStart(6, "0");
      ctx.font = "700 12px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(operative.name, 234, 172);
      ctx.fillStyle = "rgba(238,243,238,0.45)";
      ctx.font = "500 9.5px 'JetBrains Mono', monospace";
      ctx.fillText(operative.role, 234, 186);
      ctx.textAlign = "left";

      // Redaction bars
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

      // Moving scanline
      const scanTex = makeGlowTexture(0x00f0ff);
      const scanMat = new THREE.MeshBasicMaterial({ map: scanTex, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
      const scanline = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.5), scanMat);
      scanline.position.z = 0.01;
      group.add(scanline);

      // Flashing redaction chips
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

    // Procedural vector character texture builder
    const makeSpyTexture = (accentHex: number, hairStyle: string, handedness: string) => {
      const w = 300, h = 600;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      const hex = "#" + accentHex.toString(16).padStart(6, "0");
      const cx = w / 2;
      const flip = handedness === "left" ? -1 : 1;

      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(cx, 572, 62, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // shoes
      ctx.fillStyle = "#0c0e11";
      ctx.beginPath();
      ctx.ellipse(cx - 22, 560, 20, 11, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 22, 560, 20, 11, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // trousers
      ctx.fillStyle = "#14171c";
      ctx.fillRect(cx - 34, 500, 26, 62);
      ctx.fillRect(cx + 8, 500, 26, 62);

      // coat silhouette
      ctx.fillStyle = "#191d24";
      ctx.beginPath();
      ctx.moveTo(cx - 58, 250);
      ctx.bezierCurveTo(cx - 95, 340, cx - 100, 460, cx - 96, 520);
      ctx.lineTo(cx + 96, 520);
      ctx.bezierCurveTo(cx + 100, 460, cx + 95, 340, cx + 58, 250);
      ctx.closePath();
      ctx.fill();

      // coat rim highlight
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.moveTo(cx + 40, 258);
      ctx.bezierCurveTo(cx + 78, 340, cx + 90, 450, cx + 88, 512);
      ctx.lineTo(cx + 96, 520);
      ctx.bezierCurveTo(cx + 100, 460, cx + 95, 340, cx + 58, 250);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // vest/inside coat lining
      ctx.fillStyle = "#0c0e11";
      ctx.beginPath();
      ctx.moveTo(cx - 6, 268);
      ctx.lineTo(cx - 24, 500);
      ctx.lineTo(cx - 2, 500);
      ctx.bezierCurveTo(cx + 4, 400, cx + 2, 320, cx + 10, 268);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.moveTo(cx - 6, 270);
      ctx.lineTo(cx - 16, 420);
      ctx.lineTo(cx - 3, 420);
      ctx.lineTo(cx + 2, 270);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // belt
      ctx.fillStyle = "#0c0e11";
      ctx.fillRect(cx - 62, 372, 124, 14);
      ctx.fillStyle = hex;
      ctx.fillRect(cx - 8, 373, 16, 12);

      // shoulders
      ctx.fillStyle = "#20252d";
      ctx.beginPath();
      ctx.moveTo(cx - 58, 250);
      ctx.lineTo(cx - 30, 225);
      ctx.lineTo(cx - 6, 268);
      ctx.lineTo(cx - 40, 278);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 58, 250);
      ctx.lineTo(cx + 30, 225);
      ctx.lineTo(cx + 6, 268);
      ctx.lineTo(cx + 40, 278);
      ctx.closePath();
      ctx.fill();

      // arms
      ctx.fillStyle = "#191d24";
      ctx.beginPath(); // relaxed arm
      ctx.moveTo(cx - 58 * flip, 258);
      ctx.quadraticCurveTo(cx - 84 * flip, 340, cx - 72 * flip, 430);
      ctx.lineTo(cx - 52 * flip, 428);
      ctx.quadraticCurveTo(cx - 62 * flip, 340, cx - 38 * flip, 262);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#8a6a5c";
      ctx.beginPath();
      ctx.ellipse(cx - 64 * flip, 438, 12, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // pocketed arm
      ctx.fillStyle = "#15181d";
      ctx.beginPath();
      ctx.moveTo(cx + 30 * flip, 265);
      ctx.quadraticCurveTo(cx + 58 * flip, 320, cx + 46 * flip, 370);
      ctx.quadraticCurveTo(cx + 26 * flip, 382, cx + 14 * flip, 372);
      ctx.quadraticCurveTo(cx + 24 * flip, 320, cx + 8 * flip, 268);
      ctx.closePath();
      ctx.fill();

      // popped collar
      ctx.fillStyle = "#20252d";
      ctx.beginPath();
      ctx.moveTo(cx - 46, 232);
      ctx.lineTo(cx - 14, 196);
      ctx.lineTo(cx - 4, 236);
      ctx.lineTo(cx - 30, 252);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 46, 232);
      ctx.lineTo(cx + 14, 196);
      ctx.lineTo(cx + 4, 236);
      ctx.lineTo(cx + 30, 252);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.moveTo(cx + 46, 232);
      ctx.lineTo(cx + 30, 210);
      ctx.lineTo(cx + 22, 232);
      ctx.lineTo(cx + 30, 252);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // neck + face
      ctx.fillStyle = "#8a6a5c";
      ctx.fillRect(cx - 11, 205, 22, 26);
      ctx.beginPath();
      ctx.ellipse(cx, 178, 30, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(cx + 11, 180, 18, 32, 0, -0.4, 1.6);
      ctx.fill();
      ctx.restore();

      // eyes
      ctx.fillStyle = hex;
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(cx + side * 11, 176);
        ctx.rotate(side * -0.14);
        ctx.beginPath();
        ctx.ellipse(0, 0, 6.5, 2.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 18, 166);
      ctx.lineTo(cx - 5, 161);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 5, 161);
      ctx.lineTo(cx + 18, 166);
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - 4, 196);
      ctx.lineTo(cx + 4, 196);
      ctx.stroke();

      // hair peeking
      ctx.fillStyle = "#0d0f12";
      if (hairStyle === "swept") {
        ctx.beginPath();
        ctx.moveTo(cx - 30, 158);
        ctx.quadraticCurveTo(cx - 40, 140, cx - 24, 132);
        ctx.quadraticCurveTo(cx - 30, 150, cx - 14, 156);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(cx - 24, 150, 9, 14, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 24, 150, 9, 14, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // fedora
      ctx.fillStyle = "#14171c";
      ctx.beginPath();
      ctx.moveTo(cx - 24, 142);
      ctx.quadraticCurveTo(cx - 20, 102, cx, 100);
      ctx.quadraticCurveTo(cx+20, 102, cx+24, 142);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, 144, 52, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hex;
      ctx.fillRect(cx - 24, 126, 48, 7);

      return new THREE.CanvasTexture(c);
    };

    const createOperative = (accentHex: number, opts: { hairStyle?: string; handedness?: string; scale?: number; ambient?: boolean }) => {
      const group = new THREE.Group();
      const tex = makeSpyTexture(accentHex, opts.hairStyle || "swept", opts.handedness || "right");
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.35 });
      const sprite = new THREE.Sprite(mat);
      const height = 2.9 * (opts.scale || 1);
      const width = height * (300 / 600);
      sprite.scale.set(width, height, 1);
      sprite.position.y = height / 2;
      group.add(sprite);

      const eyeGlow = addGlowSprite(accentHex, 0, height * 0.815, 0.16, 0.5, 0.5);
      group.add(eyeGlow);
      eyeGlow.position.set(0, height * 0.815, 0.18);
      const groundGlow = addGlowSprite(accentHex, 0, 0.04, 0.16, 1.5, 0.14);
      groundGlow.rotation.x = -Math.PI / 2;
      group.add(groundGlow);

      group.userData = { sprite, mat, eyeGlow, baseY: 0, speaking: 0, ambient: !!opts.ambient };
      return group;
    };

    // Instantiate 4 illustrated operatives
    const opA = createOperative(0xb2ef9b, { hairStyle: "swept", handedness: "right" });
    opA.position.set(-1.7, 0, 0);
    scene.add(opA);

    const opB = createOperative(0xef959c, { hairStyle: "short", handedness: "left" });
    opB.position.set(1.7, 0, 0);
    scene.add(opB);

    const opC = createOperative(0x1b9aaa, { hairStyle: "short", handedness: "right", scale: 0.94, ambient: true });
    opC.position.set(-4.1, 0, -1.3);
    scene.add(opC);

    const opD = createOperative(0x9aa29b, { hairStyle: "swept", handedness: "left", scale: 0.94, ambient: true });
    opD.position.set(4.1, 0, -1.3);
    scene.add(opD);

    const agents = [opA, opB];
    const ambientAgents = [opC, opD];

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
      const t = clock.getElapsedTime();
      const state = threeStateRef.current;
      if (!state) return;

      // Animate active briefing agents
      state.agents.forEach((op, idx) => {
        const d = op.userData;
        const activeSide = idx === 0 ? "A" : "B";
        const isSpeaking = state.currentSpeaker === activeSide;
        const targetSpeak = isSpeaking ? 1 : 0;
        d.speaking += (targetSpeak - d.speaking) * 0.08;

        op.position.y = Math.sin(t * 1.4 + op.position.x) * 0.035;
        d.mat.rotation = Math.sin(t * 7) * 0.05 * d.speaking + Math.sin(t * 0.5 + op.position.x) * 0.015;
        d.eyeGlow.material.opacity = 0.4 + d.speaking * 0.5 + Math.abs(Math.sin(t * 6)) * d.speaking * 0.15;
        op.scale.setScalar(1 + d.speaking * 0.025);
      });

      // Animate ambient supporting agents
      ambientAgents.forEach((op) => {
        const d = op.userData;
        op.position.y = Math.sin(t * 0.9 + op.position.x) * 0.02;
        d.mat.rotation = Math.sin(t * 0.3 + op.position.x * 0.5) * 0.02;
        d.eyeGlow.material.opacity = 0.32 + Math.abs(Math.sin(t * 0.8 + op.position.x)) * 0.16;
      });

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
    <div style={{ width: "100%", height: "100%", position: "fixed", inset: 0, zIndex: 1000, overflow: "hidden", color: "#eef3ee", fontFamily: "'JetBrains Mono', monospace", background: "#081619" }}>
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

      {/* Left Column Advanced Decryption Center Panel (zIndex 4 - placed in front of canvas) */}
      <div style={{ position: "fixed", top: "110px", left: "24px", zIndex: 4, width: "270px", background: "rgba(8,22,25,0.76)", border: "1px solid rgba(238,243,238,0.14)", borderTop: "2px solid #1b9aaa", borderRadius: "4px", padding: "14px 16px", pointerEvents: "none" }}>
        <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#1b9aaa", borderBottom: "1px solid rgba(238,243,238,0.1)", paddingBottom: "6px", marginBottom: "8px", fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
          <span>🔒 SIGNAL INTEL</span>
          <span style={{ color: "#ef959c" }}>ONLINE</span>
        </div>
        
        {/* Oscilloscope canvas */}
        <div style={{ width: "100%", height: "65px", background: "rgba(0,0,0,0.2)", borderRadius: "3px", overflow: "hidden", marginBottom: "10px", border: "1px solid rgba(27,154,170,0.15)" }}>
          <canvas ref={leftCanvasRef} width="238" height="65" style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Shifting cryptographic matrix keys */}
        <div style={{ fontSize: "9px", fontFamily: "monospace", color: "#b2ef9b", background: "rgba(255,255,255,0.02)", padding: "6px 8px", borderRadius: "3px", marginBottom: "10px", borderLeft: "2px solid #b2ef9b" }}>
          <div style={{ color: "rgba(238,243,238,0.4)", textTransform: "uppercase", fontSize: "8px", marginBottom: "2px" }}>KEY EXCHANGE STREAM:</div>
          <div>{hexKeyStream}</div>
        </div>

        {/* Coordinates Vector Grid Status */}
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

      {/* Right Column Advanced Surveillance Feed Panel (zIndex 4 - placed in front of canvas) */}
      <div style={{ position: "fixed", top: "110px", right: "24px", zIndex: 4, width: "270px", background: "rgba(8,22,25,0.76)", border: "1px solid rgba(238,243,238,0.14)", borderTop: "2px solid #ef959c", borderRadius: "4px", padding: "14px 16px", pointerEvents: "none" }}>
        <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#ef959c", borderBottom: "1px solid rgba(238,243,238,0.1)", paddingBottom: "6px", marginBottom: "8px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>🌐 ACTIVE SURVEILLANCE</span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "9.5px", color: "#ef959c" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef959c", boxShadow: "0 0 6px #ef959c", animation: "pulse 1.6s infinite" }} />
            LIVE
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {surveillanceRoster.map((op, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: i < 3 ? "1px solid rgba(238,243,238,0.06)" : "none", paddingBottom: "6px" }}>
              <span style={{ display: "inline-flex", width: "15px", height: "15px", flexShrink: 0, color: op.color, transform: op.shape === "diamond" ? "rotate(45deg)" : "none" }}>
                {op.shape === "diamond" && <span style={{ width: "11px", height: "11px", border: "2px solid currentColor" }} />}
                {op.shape === "hexagon" && <span style={{ width: "15px", height: "15px", background: "currentColor", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />}
                {op.shape === "circle" && <span style={{ width: "13px", height: "13px", border: "2px solid currentColor", borderRadius: "50%" }} />}
                {op.shape === "plus" && (
                  <span style={{ position: "relative", width: "13px", height: "13px" }}>
                    <span style={{ position: "absolute", left: "5px", top: 0, width: "3px", height: "13px", background: "currentColor" }} />
                    <span style={{ position: "absolute", left: 0, top: "5px", width: "13px", height: "3px", background: "currentColor" }} />
                  </span>
                )}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#eef3ee" }}>{op.name}</span>
                  <span style={{ fontSize: "8.5px", fontFamily: "monospace", color: "#b2ef9b" }}>{op.ping}ms</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", color: "rgba(238,243,238,0.4)" }}>
                  <span>{op.role} · <span style={{ color: op.color, fontWeight: 600 }}>{op.status}</span></span>
                  <span style={{ fontSize: "8.5px" }}>SIG: {op.signal}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3D WebGL Canvas container (zIndex 3 - Rendered in front of vignette, scanlines & side panels) */}
      <div ref={mountRef} style={{ position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none" }} />

      {/* HUD Corners (zIndex 4) */}
      <div className="hud-corner tl" style={{ position: "fixed", zIndex: 4, width: "34px", height: "34px", pointerEvents: "none", borderTop: "2px solid rgba(178,239,155,0.4)", borderLeft: "2px solid rgba(178,239,155,0.4)", top: "14px", left: "14px" }}></div>
      <div className="hud-corner tr" style={{ position: "fixed", zIndex: 4, width: "34px", height: "34px", pointerEvents: "none", borderTop: "2px solid rgba(239,149,156,0.4)", borderRight: "2px solid rgba(239,149,156,0.4)", top: "14px", right: "14px" }}></div>
      <div className="hud-corner bl" style={{ position: "fixed", zIndex: 4, width: "34px", height: "34px", pointerEvents: "none", borderBottom: "2px solid rgba(239,149,156,0.4)", borderLeft: "2px solid rgba(239,149,156,0.4)", bottom: "14px", left: "14px" }}></div>
      <div className="hud-corner br" style={{ position: "fixed", zIndex: 4, width: "34px", height: "34px", pointerEvents: "none", borderBottom: "2px solid rgba(178,239,155,0.4)", borderRight: "2px solid rgba(178,239,155,0.4)", bottom: "14px", right: "14px" }}></div>

      {/* Top Header Logo (zIndex 5) */}
      <div className="wordmark" style={{ position: "fixed", top: "24px", left: "24px", zIndex: 5, display: "flex", flexDirection: "column", gap: "6px" }}>
        <div 
          onClick={() => setCurrentView("lobby")}
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        >
          {/* Animated Sonar Rubik Logo */}
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
        <div className="tag" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9AA29B" }}>
          <span className="dot" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ef959c", boxShadow: "0 0 8px #ef959c", animation: "pulse 1.5s infinite" }} />
          Classified briefing — live feed
        </div>
      </div>

      {/* Top Right Navigation (zIndex 5) */}
      <nav className="nav-links" style={{ position: "fixed", top: "28px", right: "64px", zIndex: 5, display: "flex", alignItems: "center", gap: "16px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        <button onClick={() => setCurrentView("features")} style={{ background: "none", border: "none", color: "#9AA29B", cursor: "pointer", transition: "color .2s ease", borderBottom: "2px dotted rgba(0,240,255,0.45)", paddingBottom: "2px" }} className="hover:text-[#00f0ff]">Features</button>
        <span style={{ opacity: 0.35 }}>·</span>
        <button onClick={() => setCurrentView("changelog")} style={{ background: "none", border: "none", color: "#9AA29B", cursor: "pointer", transition: "color .2s ease", borderBottom: "2px dotted rgba(0,240,255,0.45)", paddingBottom: "2px" }} className="hover:text-[#00f0ff]">Changelog</button>
        <span style={{ opacity: 0.35 }}>·</span>
        <button onClick={() => setCurrentView("about")} style={{ background: "none", border: "none", color: "#9AA29B", cursor: "pointer", transition: "color .2s ease", borderBottom: "2px dotted rgba(0,240,255,0.45)", paddingBottom: "2px" }} className="hover:text-[#00f0ff]">About</button>
      </nav>

      {/* Bottom Left Buttons & Feedback (zIndex 5) */}
      <button 
        onClick={() => setCurrentView("support")}
        style={{
          position: "fixed", bottom: "72px", left: "24px", zIndex: 5,
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(0,240,255,0.06)", border: "1.5px solid rgba(0,240,255,0.35)",
          color: "#00f0ff", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
          padding: "8px 14px", borderRadius: "4px", cursor: "pointer",
          transition: "all .2s ease",
          boxShadow: "0 0 10px rgba(0,240,255,0.05)"
        }}
        className="hover:bg-[#00f0ff] hover:text-[#02080a]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
        <span>SUPPLY LINE : COFFEE</span>
      </button>

      <button 
        onClick={() => setShowReport(true)}
        style={{
          position: "fixed", bottom: "22px", left: "24px", zIndex: 5,
          display: "inline-flex", alignItems: "center", gap: "7px",
          background: "rgba(238,243,238,0.04)", border: "1px solid rgba(0,240,255,0.16)",
          color: "#9AA29B", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.03em",
          padding: "8px 14px 8px 12px", borderRadius: "20px", cursor: "pointer",
          transition: "border-color .2s ease, color .2s ease"
        }}
      >
        <span className="fdot-wrap" style={{ position: "relative", width: "5px", height: "5px" }}>
          <span className="fdot" style={{ position: "relative", width: "5px", height: "5px", borderRadius: "50%", background: "#00f0ff", boxShadow: "0 0 6px #00f0ff" }} />
          <span className="fping" style={{ position: "absolute", inset: "-3px", borderRadius: "50%", border: "1px solid #00f0ff", opacity: 0.6 }} />
        </span>
        Need a feature or found a bug?
      </button>

      {/* Field Report Overlay (zIndex 25) */}
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
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

      {/* Briefing dialogue panel (zIndex 5) */}
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
                style={{ background: "transparent", border: "1px solid rgba(238,243,238,0.3)", color: "rgba(238,243,238,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 10px", borderRadius: "2px", cursor: "pointer" }}
                title="Toggle typing sound"
              >
                <svg width="20" height="16" viewBox="0 0 24 16" fill="none" style={{ opacity: sfxEnabled ? 1 : 0.4 }}>
                  <rect x="1" y="4" width="2.4" height="8" rx="0.5" fill="#eef3ee"/>
                  <rect x="8" y="6" width="2.6" height="4" rx="1" fill="#00f0ff"/>
                  <rect x="13" y="3" width="2.6" height="10" rx="1" fill="#00f0ff"/>
                  <rect x="18" y="5.5" width="2.6" height="5" rx="1" fill="#00f0ff"/>
                  {!sfxEnabled && <line x1="1" y1="1" x2="23" y2="15" stroke="#eef3ee" strokeWidth="1.6"/>}
                </svg>
              </button>
              <button 
                onClick={() => setIsPlayingBriefing(false)}
                style={{ background: "transparent", border: "1px solid rgba(238,243,238,0.3)", color: "rgba(238,243,238,0.75)", fontFamily: "inherit", fontSize: "10.5px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 12px", borderRadius: "2px", cursor: "pointer" }}
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

      {/* CTA Wrap (zIndex 6) */}
      {showCTA && !showWelcome && currentView === "lobby" && (
        <div style={{ position: "fixed", left: "50%", bottom: "100px", transform: "translateX(-50%)", zIndex: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "78px", height: "78px", borderRadius: "50%", border: "2px solid #00f0ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "10px", letterSpacing: "0.08em", textAlign: "center", color: "#00f0ff", transform: "rotate(-18deg)", boxShadow: "0 0 22px rgba(0,240,255,0.25)" }}>
            CLEARANCE<br/>GRANTED
          </div>
          <button 
            onClick={handleEnterGuest}
            style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "22px", letterSpacing: "0.06em", background: "#00f0ff", color: "#040b0d", border: "none", padding: "15px 36px", borderRadius: "2px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 8px 30px rgba(0,240,255,0.25)" }}
          >
            ENTER AS GUEST <span style={{ transition: "transform .2s ease" }}>→</span>
          </button>
          <div style={{ fontSize: "11px", letterSpacing: "0.14em", color: "#9AA29B", textTransform: "uppercase" }}>No badge required · guest clearance</div>
          <div style={{ display: "flex", gap: "14px", alignItems: "center", fontSize: "11px", color: "#9AA29B" }}>
            <button onClick={() => setCurrentView("rules")} style={{ background: "none", border: "none", color: "#9AA29B", cursor: "pointer", borderBottom: "2px dotted rgba(0,240,255,0.45)" }} className="hover:text-[#00f0ff]">How to play</button>
            <span style={{ opacity: 0.35 }}>·</span>
            <button onClick={() => setAuthOpen(true)} style={{ background: "none", border: "none", color: "#9AA29B", cursor: "pointer", borderBottom: "2px dotted rgba(0,240,255,0.45)" }} className="hover:text-[#00f0ff]">Already have an account? Sign in →</button>
          </div>
        </div>
      )}

      {/* Redaction wipe transition (zIndex 20) */}
      {isWiping && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 20, background: "#040b0d",
          animation: "wipeIn 0.7s cubic-bezier(.7,0,.2,1) forwards"
        }} />
      )}

      {/* Centered content overlay (Welcome room config, or sub-view) (zIndex 15) */}
      {(showWelcome || currentView !== "lobby") && (
        <div style={{ position: "fixed", inset: 0, zIndex: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", overflowY: "auto" }}>
          {currentView === "lobby" ? (
            /* Welcome Room Setup */
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
                    Multi-Team (Max 4 Teams)
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
            /* Sub-views like Rules, About, Changelog, Support, Features, etc. */
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
              {/* Back to lobby button */}
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
              
              {/* Content slot */}
              <div style={{ marginTop: "24px" }}>
                {children}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Embedded CSS for animations */}
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
      `}</style>
    </div>
  );
}
