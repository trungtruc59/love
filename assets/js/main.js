/* ═══════════════════════════════════════
   MAIN JS — For You 💌
   ═══════════════════════════════════════ */

/* ─── GATEWAY ─── */
(function initGateway() {
    const gw        = document.getElementById('gateway');
    const nameInput  = document.getElementById('crush-name');
    const enterBtn   = document.getElementById('enter-btn');
    const sparkCont  = document.getElementById('gw-sparkles');

    /* Restore saved name */
    const saved = localStorage.getItem('crush_name');
    if (saved) nameInput.value = saved;

    /* Create floating sparkles */
    for (let i = 0; i < 35; i++) {
        const s = document.createElement('div');
        s.classList.add('gw-sparkle');
        const sz = Math.random() * 3 + 1;
        s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random() * 100}vw;animation-duration:${Math.random() * 8 + 6}s;animation-delay:-${Math.random() * 10}s;`;
        sparkCont.appendChild(s);
    }

    /* Animate question + input in */
    anime.timeline({ easing: 'easeOutExpo' })
        .add({ targets: '#gw-question', opacity: [0, 1], translateY: [20, 0], duration: 1400, delay: 400 })
        .add({ targets: '#gw-input-wrap', opacity: [0, 1], translateY: [20, 0], duration: 1000 }, '-=800');

    /* Show enter button when name is typed */
    let btnShown = false;
    nameInput.addEventListener('input', () => {
        const name = nameInput.value.trim();
        if (name.length > 0 && !btnShown) {
            btnShown = true;
            anime({
                targets: enterBtn, opacity: [0, 1], translateY: [15, 0], scale: [.9, 1],
                duration: 800, easing: 'easeOutBack',
                begin: () => { enterBtn.style.pointerEvents = 'auto'; }
            });
        } else if (name.length === 0 && btnShown) {
            btnShown = false;
            anime({
                targets: enterBtn, opacity: 0, translateY: 15, scale: .9,
                duration: 400, easing: 'easeInQuad',
                complete: () => { enterBtn.style.pointerEvents = 'none'; }
            });
        }
    });

    /* If saved name exists, show button immediately */
    if (saved && saved.trim().length > 0) {
        btnShown = true;
        enterBtn.style.opacity = '1';
        enterBtn.style.transform = 'translateY(0) scale(1)';
        enterBtn.style.pointerEvents = 'auto';
    }

    /* Enter button click → save + fade out overlay */
    enterBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) return;
        localStorage.setItem('crush_name', name);

        anime({
            targets: gw, opacity: 0, duration: 1200, easing: 'easeInQuad',
            complete: () => {
                gw.classList.add('hidden');
                document.body.classList.remove('no-scroll');
            }
        });
    });

    /* Allow Enter key to submit */
    nameInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && nameInput.value.trim()) enterBtn.click();
    });
})();

/* Helper: get crush name from anywhere */
function getCrushName() {
    return localStorage.getItem('crush_name') || '';
}


/* ═══════════════════════════════════════
   MUSIC
   ═══════════════════════════════════════ */
const audio    = document.getElementById('bgm');
const musicBtn = document.getElementById('music-btn');
let playing = false;

musicBtn.addEventListener('click', () => {
    if (!playing) {
        audio.play();
        showIntroAnim();
    }
});

function showIntroAnim() {
    anime({
        targets: '.title-wrapper',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 2000,
        easing: 'easeOutExpo'
    });
}


/* ═══════════════════════════════════════
   INTERSECTION OBSERVER
   ═══════════════════════════════════════ */
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) triggerSection(e.target.id);
    });
}, { threshold: 0.6 });

document.querySelectorAll('section').forEach(s => obs.observe(s));

function triggerSection(id) {
    if (id === 'intro')         showIntroAnim();
    if (id === 'heart-section') initParticleHeart();
    if (id === 'outro')         triggerOutro();
}


/* ═══════════════════════════════════════
   ENVELOPE
   ═══════════════════════════════════════ */
document.getElementById('envelope').addEventListener('click', () => {
    const isOpen = document.getElementById('envelope').classList.toggle('open');
    const hint   = document.getElementById('click-hint');

    if (isOpen) {
        if (hint) anime({
            targets: hint, opacity: [1, 0], translateY: [0, 10],
            duration: 400, easing: 'easeOutQuad',
            complete: () => hint.style.display = 'none'
        });
        setTimeout(() => {
            anime({
                targets: '#letter-content p',
                opacity: [0, 1], translateX: [-20, 0],
                delay: anime.stagger(200), duration: 800,
                easing: 'easeOutQuad'
            });
        }, 700);
    } else {
        anime.set('#letter-content p', { opacity: 0, translateX: -20 });
        if (hint) {
            hint.style.display = 'flex';
            anime({ targets: hint, opacity: [0, 1], duration: 400 });
        }
    }
});


/* ═══════════════════════════════════════
   PARTICLE HEART (Canvas 60fps)
   ═══════════════════════════════════════ */
let heartInited = false;

function initParticleHeart() {
    if (heartInited) return;
    heartInited = true;

    const section = document.getElementById('heart-section');
    const canvas  = document.getElementById('heart-canvas');
    const ctx     = canvas.getContext('2d');
    const hint    = section.querySelector('.heart-hint');

    /* getBoundingClientRect gives the true rendered size */
    function resize() {
        const rect = section.getBoundingClientRect();
        canvas.width  = Math.round(rect.width);
        canvas.height = Math.round(rect.height);
    }
    resize();
    window.addEventListener('resize', () => { resize(); rebuild(); });

    /* Heart offset slots — mathematical heart curve
       (x²+y²-1)³ - x²y³ ≤ 0,  y flipped so heart points up */
    function heartSlots() {
        const scale = Math.min(canvas.width, canvas.height) * 0.19;
        const slots = [];
        const STEP  = 0.072;
        for (let nx = -1.2; nx <= 1.2; nx += STEP) {
            for (let ny = -1.2; ny <= 1.2; ny += STEP) {
                const v = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * Math.pow(-ny, 3);
                if (v <= 0.014) {
                    const dist = Math.sqrt(nx * nx + ny * ny);
                    slots.push({ ox: nx * scale, oy: ny * scale, dist });
                }
            }
        }
        return slots;
    }

    /* Colour: deep red core → pale pink edge */
    const PAL = ['#ff0035', '#ff1a50', '#ff3366', '#ff6699', '#ff99bb', '#ffcce0'];
    const col = d => PAL[Math.min(PAL.length - 1, Math.floor(d * PAL.length))];

    const N = 900;
    let particles = [];

    function rebuild() {
        const W = canvas.width, H = canvas.height;
        const slots = heartSlots();
        particles = [];
        for (let i = 0; i < N; i++) {
            const s = slots[Math.floor(Math.random() * slots.length)];
            const JITTER = 8;
            particles.push({
                x:  Math.random() * W,
                y:  Math.random() * H,
                vx: (Math.random() - .5) * 1.6,
                vy: (Math.random() - .5) * 1.6,
                ox: s.ox + (Math.random() - .5) * JITTER,
                oy: s.oy + (Math.random() - .5) * JITTER,
                r:  Math.max(0.5, 0.6 + (1 - s.dist) * 1.7),
                color: col(s.dist),
                spd:  0.035 + Math.random() * 0.08
            });
        }
    }
    rebuild();

    /* Mouse position + hover state */
    let mx = canvas.width / 2, my = canvas.height / 2;
    let hovering = false;

    section.addEventListener('mousemove', e => {
        const rect = section.getBoundingClientRect();
        mx = e.clientX - rect.left;
        my = e.clientY - rect.top;
        if (!hovering) {
            hovering = true;
            if (hint) anime({
                targets: hint, opacity: [1, 0], duration: 500,
                easing: 'easeOutQuad', complete: () => hint.style.display = 'none'
            });
        }
    });

    section.addEventListener('mouseleave', () => {
        if (!hovering) return;
        hovering = false;
        particles.forEach(p => {
            const dx = p.x - mx, dy = p.y - my;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const spd = 3 + Math.random() * 5;
            p.vx = (dx / len) * spd + (Math.random() - .5) * 2;
            p.vy = (dy / len) * spd + (Math.random() - .5) * 2;
        });
    });

    /* Touch */
    section.addEventListener('touchmove', e => {
        e.preventDefault();
        const rect = section.getBoundingClientRect();
        mx = e.touches[0].clientX - rect.left;
        my = e.touches[0].clientY - rect.top;
        hovering = true;
    }, { passive: false });
    section.addEventListener('touchend', () => { hovering = false; });

    /* Heartbeat */
    let beatT = 0;

    /* 60 fps render loop */
    (function render() {
        requestAnimationFrame(render);
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        beatT += 0.05;
        const beat = 1
            + 0.13 * Math.max(0, Math.sin(beatT))
            + 0.07 * Math.max(0, Math.sin(beatT - 1.15));

        const heartR = Math.min(W, H) * 0.19 * 1.3;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            if (hovering) {
                const cx = Math.max(heartR, Math.min(mx, W - heartR));
                const cy = Math.max(heartR, Math.min(my, H - heartR));
                const tx = cx + p.ox * beat;
                const ty = cy + p.oy * beat;
                p.x += (tx - p.x) * p.spd;
                p.y += (ty - p.y) * p.spd;
                p.vx *= 0.82;
                p.vy *= 0.82;
            } else {
                p.vx *= 0.993;
                p.vy *= 0.993;
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -8) p.x = W + 8;
                if (p.x > W + 8) p.x = -8;
                if (p.y < -8) p.y = H + 8;
                if (p.y > H + 8) p.y = -8;
            }

            if (p.r > 0) {
                ctx.shadowBlur  = p.r * 9;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
        }

        ctx.shadowBlur = 0;
    })();
}


/* ═══════════════════════════════════════
   OUTRO — Yes / No popup
   ═══════════════════════════════════════ */
let outroDone = false;

function triggerOutro() {
    if (outroDone) return;
    outroDone = true;

    const outro       = document.getElementById('outro');
    const popup       = document.getElementById('outro-popup');
    const btnYes      = document.getElementById('btn-yes');
    const btnNo       = document.getElementById('btn-no');
    const celebration = document.getElementById('outro-celebration');
    const celebHearts = document.getElementById('celeb-hearts');

    /* Falling petals */
    const petalContainer = document.getElementById('outro-petals');
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.classList.add('petal');
        p.style.left = Math.random() * 100 + 'vw';
        const sz = Math.random() * 15 + 10;
        p.style.width = sz + 'px';
        p.style.height = sz + 'px';
        petalContainer.appendChild(p);
        anime({
            targets: p,
            translateY: ['-20px', '100vh'],
            translateX: () => anime.random(-100, 100),
            rotate: () => anime.random(0, 360),
            delay: anime.random(0, 3000),
            duration: anime.random(5000, 8000),
            loop: true, easing: 'linear'
        });
    }

    /* Popup entrance */
    anime({
        targets: popup,
        opacity: [0, 1],
        scale: [.85, 1],
        translateY: [30, 0],
        duration: 1200,
        easing: 'easeOutElastic(1,.75)'
    });

    /* ─── "Không đồng ý" runs away on hover ─── */
    const JUMP = 130;  /* px away from cursor */
    const PAD  = 20;   /* px from popup edges */
    let btnW = 0, btnH = 0, sizeLocked = false;

    /* Popup needs relative positioning so absolute button stays inside */
    popup.style.position = 'relative';
    popup.style.overflow = 'visible';

    function lockSize() {
        if (sizeLocked) return;
        btnW = btnNo.offsetWidth;
        btnH = btnNo.offsetHeight;
        btnNo.style.width  = btnW + 'px';
        btnNo.style.height = btnH + 'px';
        sizeLocked = true;
    }

    function runAway(e) {
        lockSize();

        /* Get cursor position relative to the popup */
        const popRect = popup.getBoundingClientRect();
        let curX, curY;

        if (e.type === 'touchstart' && e.touches && e.touches.length) {
            curX = e.touches[0].clientX - popRect.left;
            curY = e.touches[0].clientY - popRect.top;
        } else if (e.clientX !== undefined) {
            curX = e.clientX - popRect.left;
            curY = e.clientY - popRect.top;
        } else {
            curX = popRect.width / 2;
            curY = popRect.height / 2;
        }

        const pW = popup.offsetWidth;
        const pH = popup.offsetHeight;

        /* Button can move around the popup (including outside its box a bit) */
        const minX = -btnW - PAD;
        const maxX = pW + PAD;
        const minY = -btnH - PAD;
        const maxY = pH + PAD;

        /* Jump 130px away from cursor in random direction */
        let angle = Math.random() * Math.PI * 2;
        let newX  = curX + Math.cos(angle) * JUMP - btnW / 2;
        let newY  = curY + Math.sin(angle) * JUMP - btnH / 2;

        /* If outside zone, flip 180° */
        if (newX < minX || newX > maxX || newY < minY || newY > maxY) {
            angle += Math.PI;
            newX = curX + Math.cos(angle) * JUMP - btnW / 2;
            newY = curY + Math.sin(angle) * JUMP - btnH / 2;
        }

        /* Hard clamp */
        newX = Math.max(minX, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));

        btnNo.style.position = 'absolute';
        btnNo.style.left     = newX + 'px';
        btnNo.style.top      = newY + 'px';
        btnNo.style.zIndex   = '10';
    }

    btnNo.addEventListener('mouseover', runAway);
    btnNo.addEventListener('touchstart', runAway, { passive: true });

    /* ─── "Đồng ý" → celebration! ─── */
    btnYes.addEventListener('click', () => {
        /* Hide popup */
        anime({
            targets: popup,
            opacity: 0,
            scale: .8,
            duration: 500,
            easing: 'easeInQuad',
            complete: () => { popup.style.display = 'none'; }
        });

        /* Hide the runaway button */
        btnNo.style.display = 'none';

        /* Show celebration */
        celebration.classList.remove('hidden');

        /* Spawn floating hearts */
        const heartEmojis = ['❤️', '💕', '💖', '💗', '💓', '💞', '🥰', '😍', '✨'];
        for (let i = 0; i < 50; i++) {
            const h = document.createElement('div');
            h.classList.add('celeb-heart');
            h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
            const sz = Math.random() * 1.5 + 1;
            h.style.cssText = `left:${Math.random() * 100}%;font-size:${sz}rem;animation-duration:${Math.random() * 6 + 4}s;animation-delay:-${Math.random() * 8}s;`;
            celebHearts.appendChild(h);
        }

        /* Animate celebration text */
        anime.timeline({ easing: 'easeOutElastic(1,.6)' })
            .add({
                targets: '#celeb-title',
                opacity: [0, 1],
                scale: [.5, 1],
                duration: 1500,
                delay: 400
            })
            .add({
                targets: '.celeb-sub',
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 1000,
                easing: 'easeOutExpo'
            }, '-=800')
            .add({
                targets: '.restart-btn',
                opacity: [0, 1],
                translateY: [15, 0],
                duration: 800,
                easing: 'easeOutExpo'
            }, '-=500');
    });
}


/* ═══════════════════════════════════════
   BACKGROUND HEARTS
   ═══════════════════════════════════════ */
(function () {
    const c = document.getElementById('particles-js');
    for (let i = 0; i < 20; i++) {
        const h = document.createElement('div');
        h.textContent = '\u2764';
        h.classList.add('heart-particle');
        h.style.cssText = `left:${Math.random() * 100}vw;top:${Math.random() * 100}vh;font-size:${Math.random() * 20 + 10}px;opacity:${Math.random() * .25};`;
        c.appendChild(h);
        anime({
            targets: h,
            translateY: [0, -120],
            opacity: [+h.style.opacity, 0],
            duration: anime.random(3000, 6000),
            loop: true, easing: 'linear'
        });
    }
})();


/* ═══════════════════════════════════════
   BOKEH (Letter section)
   ═══════════════════════════════════════ */
(function () {
    const c = document.getElementById('letter-bokeh-container');
    if (!c) return;
    const colors = [
        'rgba(255,150,180,',
        'rgba(200,100,255,',
        'rgba(255,200,100,',
        'rgba(150,100,255,'
    ];
    for (let i = 0; i < 18; i++) {
        const b = document.createElement('div');
        b.classList.add('letter-bokeh');
        const sz = Math.random() * 60 + 20;
        b.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random() * 100}vw;background:${colors[Math.floor(Math.random() * colors.length)]}${Math.random() * .3 + .2});animation-duration:${Math.random() * 12 + 8}s;animation-delay:-${Math.random() * 15}s;`;
        c.appendChild(b);
    }
})();


/* ═══════════════════════════════════════
   INIT
   ═══════════════════════════════════════ */
showIntroAnim();
