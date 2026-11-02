(() => {
  if (window.hasDeepawaliUtsavV9) return;
  window.hasDeepawaliUtsavV9 = true;

  let settings = {
    phuljhadiCursor: true,
    phuljhadiColor: 'rainbow',
    rocketSend: true,
    searchDecor: true,
    lightningBars: true
  };

  let particles = [];
  let shockwaves = [];
  let rockets = [];
  let audioCtx = null;
  let lastRocketTime = 0;      // 10-second cooldown
  let lastMegaRocketTime = 0;  // 30-second mega blast cooldown
  let mouse = { x: -1000, y: -1000 };
  let colorCycleIdx = 0;

  // Color Themes for Multi-Color Phuljhadi
  const phuljhadiThemes = {
    gold: {
      outer: '%23fff3b0',
      inner: '%23ff9900',
      rays: '%23ffd166',
      sparks: ['#ffd700', '#ffb703', '#fff3b0', '#ff9900', '#ff6d00']
    },
    pink: {
      outer: '%23ffc8dd',
      inner: '%23ff006e',
      rays: '%23ff70a6',
      sparks: ['#ff006e', '#ff70a6', '#ffbe0b', '#ffc8dd', '#fb5607']
    },
    cyan: {
      outer: '%23caf0f8',
      inner: '%2300b4d8',
      rays: '%2300f5d4',
      sparks: ['#00f5d4', '#00bbf9', '#caf0f8', '#90e0ef', '#ffd166']
    },
    emerald: {
      outer: '%23d8f3dc',
      inner: '%2306d6a0',
      rays: '%2352b788',
      sparks: ['#06d6a0', '#38b000', '#b7efc5', '#ffd166', '#70e000']
    },
    purple: {
      outer: '%23e0aaff',
      inner: '%238338ec',
      rays: '%23c77dff',
      sparks: ['#8338ec', '#c77dff', '#e0aaff', '#ff006e', '#ffd166']
    }
  };
  const themeKeys = Object.keys(phuljhadiThemes);

  // Rotate active theme every 2.5 seconds when in 'rainbow' mode
  setInterval(() => {
    if (settings.phuljhadiColor === 'rainbow' && settings.phuljhadiCursor) {
      colorCycleIdx = (colorCycleIdx + 1) % themeKeys.length;
      updateStyles();
    }
  }, 2500);

  function getActiveTheme() {
    if (settings.phuljhadiColor === 'rainbow') {
      return phuljhadiThemes[themeKeys[colorCycleIdx]];
    }
    return phuljhadiThemes[settings.phuljhadiColor] || phuljhadiThemes.gold;
  }

  const style = document.createElement('style');
  style.id = 'diwali-v9-styles';
  
  function updateStyles() {
    const t = getActiveTheme();
    style.textContent = `
      /* Multi-Color Phuljhadi Cursor (NO scrollbar changes, NO homepage overrides) */
      ${settings.phuljhadiCursor ? `
        html, body, body.diwali-phuljhadi-cursor,
        body.diwali-phuljhadi-cursor * {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><line x1="26" y1="26" x2="8" y2="8" stroke="%238d6e63" stroke-width="2.5" stroke-linecap="round"/><line x1="20" y1="20" x2="8" y2="8" stroke="${t.rays}" stroke-width="3.5" stroke-linecap="round"/><circle cx="7" cy="7" r="5" fill="${t.outer}"/><circle cx="7" cy="7" r="3" fill="${t.inner}"/><path d="M7 0 L7 14 M0 7 L14 7 M2 2 L12 12 M12 2 L2 12" stroke="${t.rays}" stroke-width="1.5"/></svg>') 7 7, auto !important;
        }
      ` : ''}

      /* Lightning Video/Audio/Progress Scrubbers & Timers */
      ${settings.lightningBars ? `
        input[type="range"],
        progress,
        .ytp-play-progress,
        .chapter-progress,
        .progress-bar-fill,
        [role="slider"] {
          filter: drop-shadow(0 0 4px #ffb703);
        }

        .ytp-swatch-background-color,
        .ytp-play-progress {
          background: linear-gradient(90deg, #ff9900, #ff006e, #00f5d4, #ffd700, #ff9900) !important;
          background-size: 200% auto !important;
          animation: lightning-bar-flow 2.5s linear infinite !important;
          box-shadow: 0 0 10px #ff9900, 0 0 4px #fff3b0 !important;
        }

        @keyframes lightning-bar-flow {
          to { background-position: 200% center; }
        }

        .ytp-scrubber-button,
        [role="slider"]::-webkit-slider-thumb {
          background: radial-gradient(circle, #fff3b0 0%, #ffd700 60%, #ff006e 100%) !important;
          box-shadow: 0 0 12px #ff9900, 0 0 6px #ffd700 !important;
          border: 2px solid #fff !important;
        }
      ` : ''}

      /* Smart Search Bar Diya & Lights Overlay */
      .diwali-search-overlay {
        position: fixed;
        pointer-events: none;
        z-index: 2147483644;
        transition: opacity 0.2s ease;
      }

      .diwali-corner-diya {
        position: absolute;
        top: -18px;
        width: 30px;
        height: 30px;
        filter: drop-shadow(0 0 6px #ff9900);
        animation: diya-float 2.4s infinite ease-in-out alternate;
        transition: left 0.25s ease, right 0.25s ease;
      }

      .diwali-corner-diya.diya-on-right {
        right: -12px;
        left: auto;
      }

      .diwali-corner-diya.diya-on-left {
        left: -12px;
        right: auto;
        transform: scaleX(-1);
      }

      .diwali-flame {
        transform-origin: 16px 13px;
        animation: flame-flicker 0.35s infinite alternate ease-in-out;
      }

      @keyframes flame-flicker {
        0% { transform: scale(0.92, 1.05) rotate(-3deg); opacity: 0.9; }
        100% { transform: scale(1.06, 0.95) rotate(3deg); opacity: 1; }
      }

      @keyframes diya-float {
        0% { transform: translateY(0px); }
        100% { transform: translateY(-2px); }
      }

      .diwali-hanging-lights {
        position: absolute;
        bottom: -11px;
        left: 10px;
        right: 10px;
        height: 12px;
        display: flex;
        justify-content: space-around;
        align-items: flex-start;
        overflow: hidden;
      }

      .diwali-mini-bulb {
        width: 6px;
        height: 8px;
        border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%;
        animation: diwali-bulb-twinkle 1.2s infinite alternate ease-in-out;
        position: relative;
      }

      .diwali-mini-bulb::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -10px;
        width: 20px;
        height: 5px;
        border-bottom: 1px solid rgba(212, 175, 55, 0.6);
        border-radius: 50%;
      }

      @keyframes diwali-bulb-twinkle {
        0% { opacity: 0.45; transform: scale(0.85); }
        100% { opacity: 1; transform: scale(1.15); }
      }
    `;
  }

  document.head.appendChild(style);

  // Canvas for Multi-Color Phuljhadi Sparkles & Rocket Blasts
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647;';
  document.body.appendChild(canvas);

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateSearchOverlayPositions();
  }
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', updateSearchOverlayPositions, { passive: true });

  let lastSparkSpawn = 0;

  function spawnCursorSparks(x, y, count = 2) {
    const activePalette = getActiveTheme().sparks;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.0 + 0.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.35,
        life: 0.9,
        decay: Math.random() * 0.032 + 0.022,
        color: activePalette[Math.floor(Math.random() * activePalette.length)],
        size: Math.random() * 1.9 + 1.0
      });
    }
  }

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!settings.phuljhadiCursor) return;
    const now = performance.now();
    if (now - lastSparkSpawn > 16) {
      lastSparkSpawn = now;
      spawnCursorSparks(e.clientX, e.clientY, 2);
    }
  }, { passive: true });

  // Redesigned Web Audio Synthesizer for New Rocket Launch & Explosion Sounds
  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // New Rocket Launch Sound:Realistic Fizzy Propellant Hiss + Fluttering Whistle
  function playNewRocketLaunchSound(isMega = false) {
    try {
      ensureAudio();
      const now = audioCtx.currentTime;
      const dur = isMega ? 0.72 : 0.52;

      // 1. Fizzy black-powder propellant hiss ( sweeping high-pass noise )
      const bufSize = Math.floor(audioCtx.sampleRate * dur);
      const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufSize) * Math.PI);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buf;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(3800, now + dur);
      filter.Q.setValueAtTime(2.2, now);

      const nGain = audioCtx.createGain();
      nGain.gain.setValueAtTime(isMega ? 0.28 : 0.18, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(audioCtx.destination);
      noise.start(now);

      // 2. FM-modulated bottle-rocket scream/whistle
      const carrier = audioCtx.createOscillator();
      const mod = audioCtx.createOscillator();
      const modGain = audioCtx.createGain();
      const cGain = audioCtx.createGain();

      carrier.type = 'triangle';
      carrier.frequency.setValueAtTime(isMega ? 380 : 520, now);
      carrier.frequency.exponentialRampToValueAtTime(isMega ? 1850 : 2200, now + dur);

      mod.frequency.setValueAtTime(35, now);
      modGain.gain.setValueAtTime(45, now);

      cGain.gain.setValueAtTime(isMega ? 0.16 : 0.11, now);
      cGain.gain.exponentialRampToValueAtTime(0.005, now + dur);

      mod.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(cGain);
      cGain.connect(audioCtx.destination);

      mod.start(now);
      carrier.start(now);
      mod.stop(now + dur);
      carrier.stop(now + dur);
    } catch (e) {}
  }

  // New Explosion Sound: Deep Bass Cannon Thump + Multi-Crackling Starburst Pops
  function playNewRocketExplosionSound(isMega = false) {
    try {
      ensureAudio();
      const now = audioCtx.currentTime;

      // 1. Deep chest-thumping sub-bass boom
      const sub = audioCtx.createOscillator();
      const subGain = audioCtx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(isMega ? 135 : 95, now);
      sub.frequency.exponentialRampToValueAtTime(22, now + (isMega ? 0.55 : 0.32));
      subGain.gain.setValueAtTime(isMega ? 0.65 : 0.42, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + (isMega ? 0.55 : 0.32));
      sub.connect(subGain);
      subGain.connect(audioCtx.destination);
      sub.start(now);
      sub.stop(now + (isMega ? 0.56 : 0.33));

      // 2. Main aerial shell burst
      triggerNoisePop(now, isMega ? 0.45 : 0.26, isMega ? 160 : 240, isMega ? 0.6 : 0.38);

      // 3. Delayed crackling glitter pops (especially rich on Mega Blast)
      const crackleCount = isMega ? 9 : 4;
      for (let i = 0; i < crackleCount; i++) {
        const delay = 0.06 + i * (isMega ? 0.045 : 0.035) + Math.random() * 0.03;
        triggerNoisePop(now + delay, 0.09, 1400 + Math.random() * 1600, isMega ? 0.28 : 0.16);
      }
    } catch (e) {}
  }

  function triggerNoisePop(startTime, duration, freq, vol) {
    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.24));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, startTime);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(startTime);
  }

  const burstColors = ['#ffd700', '#ff9900', '#ff006e', '#06d6a0', '#fff3b0', '#00bbf9', '#8338ec', '#ffbe0b'];

  function spawnExplosion(x, y, isMega = false) {
    playNewRocketExplosionSound(isMega);

    if (!isMega) {
      // Normal 10s Rocket Blast
      const count = 65;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
        const speed = Math.random() * 4.5 + 1.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: Math.random() * 0.02 + 0.014,
          color: burstColors[Math.floor(Math.random() * burstColors.length)],
          size: Math.random() * 2.6 + 1.2
        });
      }
    } else {
      // MEGA 30s Rocket Blast: Expanding Shockwave Ring + Double Concentric Starburst + Secondary Sub-Cluster Pops!
      shockwaves.push({ x, y, r: 5, maxR: 260, alpha: 0.95, color: '#ffd700' });

      const megaCount = 160;
      for (let i = 0; i < megaCount; i++) {
        const angle = (Math.PI * 2 * i) / megaCount + (Math.random() - 0.5) * 0.15;
        const ringSpeed = i % 2 === 0 ? (Math.random() * 8.5 + 4.5) : (Math.random() * 4.2 + 1.5);
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * ringSpeed,
          vy: Math.sin(angle) * ringSpeed,
          life: 1.25,
          decay: Math.random() * 0.014 + 0.01,
          color: burstColors[Math.floor(Math.random() * burstColors.length)],
          size: Math.random() * 3.8 + 1.8
        });
      }

      // Secondary mini-clusters bursting 220ms later around the main sky-shot
      setTimeout(() => {
        for (let c = 0; c < 3; c++) {
          const cx = x + (Math.random() - 0.5) * 180;
          const cy = y + (Math.random() - 0.5) * 100;
          for (let j = 0; j < 35; j++) {
            const a = (Math.PI * 2 * j) / 35;
            const sp = Math.random() * 4.5 + 1.5;
            particles.push({
              x: cx,
              y: cy,
              vx: Math.cos(a) * sp,
              vy: Math.sin(a) * sp,
              life: 0.95,
              decay: 0.024,
              color: burstColors[Math.floor(Math.random() * burstColors.length)],
              size: 2.4
            });
          }
        }
      }, 220);
    }
  }

  function launchArrowRocket(startX, startY, isMega = false) {
    const targetY = Math.max(90, Math.min(window.innerHeight * 0.22, startY - 270));
    playNewRocketLaunchSound(isMega);
    rockets.push({
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 0.8,
      vy: isMega ? -5.8 : -4.6,
      ay: isMega ? -0.52 : -0.42,
      targetY: targetY,
      isMega: isMega
    });
  }

  // Click Handler: 10s Rocket Cooldown + Every 30s Mega Rocket Blast
  window.addEventListener('mousedown', (e) => {
    if (!settings.rocketSend) return;
    const nowTime = Date.now();
    const sinceLastRocket = (nowTime - lastRocketTime) / 1000;
    const sinceLastMega = (nowTime - lastMegaRocketTime) / 1000;

    if (sinceLastRocket >= 10) {
      lastRocketTime = nowTime;
      // Check if 30 seconds have elapsed for the Larger Mega Rocket Blast
      if (sinceLastMega >= 30) {
        lastMegaRocketTime = nowTime;
        launchArrowRocket(e.clientX, e.clientY, true);
      } else {
        launchArrowRocket(e.clientX, e.clientY, false);
      }
    }
  }, true);

  // Smart Left/Right Diya & Hanging Lights on Search Bars (Unchanged)
  const trackedInputs = new Map();

  function createDiyaSVG() {
    return `
      <svg viewBox="0 0 32 32" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
        <g class="diwali-flame">
          <path d="M16 3 C12 9, 11 13, 16 16 C21 13, 20 9, 16 3 Z" fill="#ff9900"/>
          <path d="M16 6 C14 10, 13.5 13, 16 15 C18.5 13, 18 10, 16 6 Z" fill="#fff3b0"/>
        </g>
        <path d="M4 16 Q16 20 28 16 L24 25 Q16 28 8 25 Z" fill="#b5451b" stroke="#ffd700" stroke-width="1.2"/>
        <path d="M6 17 Q16 21 26 17" fill="none" stroke="#ffb703" stroke-width="1.5"/>
      </svg>
    `;
  }

  function scanAndDecorateSearchBars() {
    if (!settings.searchDecor) {
      trackedInputs.forEach(item => item.overlay.remove());
      trackedInputs.clear();
      return;
    }

    const selectors = [
      'input[type="search"]',
      'input[name="q"]',
      'input[name="search"]',
      'input[name="search_query"]',
      'textarea[name="q"]',
      'input[placeholder*="Search" i]',
      'input[aria-label*="Search" i]',
      '[role="search"] input'
    ];

    const candidates = document.querySelectorAll(selectors.join(','));
    candidates.forEach(input => {
      const targetBox = input.closest('.search-form, [role="search"], form') || input;
      if (trackedInputs.has(targetBox)) return;
      const rect = targetBox.getBoundingClientRect();
      if (rect.width < 110 || rect.height < 20) return;

      const overlay = document.createElement('div');
      overlay.className = 'diwali-search-overlay';

      const diya = document.createElement('div');
      diya.className = 'diwali-corner-diya diya-on-right';
      diya.innerHTML = createDiyaSVG();
      overlay.appendChild(diya);

      const lightsRow = document.createElement('div');
      lightsRow.className = 'diwali-hanging-lights';
      const bulbColors = ['#ffbe0b', '#fb5607', '#ff006e', '#ffd166', '#06d6a0'];
      const numBulbs = Math.max(6, Math.min(18, Math.floor(rect.width / 28)));
      for (let i = 0; i < numBulbs; i++) {
        const b = document.createElement('div');
        b.className = 'diwali-mini-bulb';
        const c = bulbColors[i % bulbColors.length];
        b.style.background = c;
        b.style.boxShadow = `0 2px 6px ${c}`;
        b.style.animationDelay = `${(i * 0.18) % 1.2}s`;
        lightsRow.appendChild(b);
      }
      overlay.appendChild(lightsRow);

      document.body.appendChild(overlay);
      trackedInputs.set(targetBox, { overlay, diya });
    });

    updateSearchOverlayPositions();
  }

  function updateSearchOverlayPositions() {
    trackedInputs.forEach((item, targetBox) => {
      const { overlay, diya } = item;
      if (!document.body.contains(targetBox) || !settings.searchDecor) {
        overlay.remove();
        trackedInputs.delete(targetBox);
        return;
      }

      const r = targetBox.getBoundingClientRect();
      const visible = r.width > 80 && r.height > 16 && r.bottom > 0 && r.top < window.innerHeight;

      if (!visible) {
        overlay.style.opacity = '0';
      } else {
        overlay.style.opacity = '1';
        overlay.style.top = `${r.top}px`;
        overlay.style.left = `${r.left}px`;
        overlay.style.width = `${r.width}px`;
        overlay.style.height = `${r.height}px`;

        const searchCenterX = r.left + r.width / 2;
        if (searchCenterX > window.innerWidth * 0.52) {
          diya.classList.remove('diya-on-right');
          diya.classList.add('diya-on-left');
        } else {
          diya.classList.remove('diya-on-left');
          diya.classList.add('diya-on-right');
        }
      }
    });
  }

  setInterval(scanAndDecorateSearchBars, 1000);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (settings.phuljhadiCursor && mouse.x > 0 && Math.random() < 0.25) {
      spawnCursorSparks(mouse.x, mouse.y, 1);
    }

    // Draw expanding shockwaves for Mega 30s Rocket Blasts
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.r += 7.5;
      sw.alpha -= 0.032;
      if (sw.alpha <= 0) {
        shockwaves.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff006e';
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.restore();
    }

    for (let i = rockets.length - 1; i >= 0; i--) {
      const rk = rockets[i];
      rk.x += rk.vx;
      rk.y += rk.vy;
      rk.vy += rk.ay;

      const trailCount = rk.isMega ? 6 : 3;
      for (let t = 0; t < trailCount; t++) {
        particles.push({
          x: rk.x + (Math.random() - 0.5) * (rk.isMega ? 8 : 4),
          y: rk.y + 12,
          vx: (Math.random() - 0.5) * 2.0,
          vy: Math.random() * 2.5 + 1,
          life: 0.8,
          decay: 0.045,
          color: rk.isMega ? burstColors[Math.floor(Math.random() * burstColors.length)] : '#ffd700',
          size: rk.isMega ? 3.0 : 2.2
        });
      }

      ctx.save();
      ctx.translate(rk.x, rk.y);
      const scale = rk.isMega ? 1.45 : 1.0;
      ctx.scale(scale, scale);
      ctx.fillStyle = rk.isMega ? '#ff006e' : '#fff3b0';
      ctx.strokeStyle = '#ffd700';
      ctx.shadowColor = rk.isMega ? '#ff006e' : '#ff9900';
      ctx.shadowBlur = rk.isMega ? 18 : 12;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-2.5, 0);
      ctx.lineTo(-2.5, 10);
      ctx.lineTo(2.5, 10);
      ctx.lineTo(2.5, 0);
      ctx.lineTo(7, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      if (rk.y <= rk.targetY) {
        spawnExplosion(rk.x, rk.y, rk.isMega);
        rockets.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.11;
      p.vx *= 0.985;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.strokeStyle = p.color;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.lineWidth = p.size;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 1.6, p.y - p.vy * 1.6);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }

  function applySettings() {
    if (settings.phuljhadiCursor) {
      document.body.classList.add('diwali-phuljhadi-cursor');
    } else {
      document.body.classList.remove('diwali-phuljhadi-cursor');
    }
    updateStyles();
    scanAndDecorateSearchBars();
  }

  chrome.storage.local.get(Object.keys(settings), (res) => {
    Object.keys(settings).forEach(k => {
      if (res[k] !== undefined) settings[k] = res[k];
    });
    resize();
    updateStyles();
    applySettings();
    scanAndDecorateSearchBars();
    animate();
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'UPDATE_SETTING') {
      settings[msg.key] = msg.value;
      applySettings();
    } else if (msg.type === 'TEST_ROCKET') {
      launchArrowRocket(window.innerWidth / 2, window.innerHeight - 80, !!msg.mega);
    }
  });
})();
