// avatar-builder.js — Build Me avatar creator
(function () {
    // ── Outfit palettes ───────────────────────────────────────────
    const OUTFIT = [
        { shirt: '#4A90D9', pants: '#555', sleeve: '#4A90D9' },                        // 0 Casual
        { shirt: '#2a2a2a', pants: '#1a1a1a', sleeve: '#2a2a2a', tie: '#B22222' },     // 1 Formal
        { shirt: '#3666b0', pants: '#2a4f9a', sleeve: '#3666b0', belt: '#1a1a1a' },    // 2 Police
        { shirt: '#ddd8c4', pants: '#5C3A1F', sleeve: '#ddd8c4', apron: '#c8b87e' },   // 3 Artist
        { shirt: '#F5C200', pants: '#CC6600', sleeve: '#F5C200', belt: '#333' }        // 4 Firefighter
    ];

    const PRESETS = [
        { label: 'Police',      skin: '#F4C08A', hairStyle: 1, hairColor: '#1a1a1a', faceStyle: 0, outfitStyle: 2, addonStyle: 1 },
        { label: 'Artist',      skin: '#D4935A', hairStyle: 3, hairColor: '#5C3317', faceStyle: 2, outfitStyle: 3, addonStyle: 0 },
        { label: 'Firefighter', skin: '#F4C08A', hairStyle: 1, hairColor: '#2C1810', faceStyle: 0, outfitStyle: 4, addonStyle: 1 },
        { label: 'Student',     skin: '#D4935A', hairStyle: 2, hairColor: '#CC0000', faceStyle: 0, outfitStyle: 0, addonStyle: 2 },
        { label: 'Formal',      skin: '#6B3A1F', hairStyle: 1, hairColor: '#1a1a1a', faceStyle: 0, outfitStyle: 1, addonStyle: 0 },
    ];

    const DEFAULTS = { skin: '#F4C08A', hairStyle: 1, hairColor: '#2C1810', faceStyle: 0, outfitStyle: 0, addonStyle: 0 };

    let state = Object.assign({}, DEFAULTS);
    let mainCanvas = null;
    let activePanel = 'outfit';
    let drawMode = false, painting = false;
    let drawOverlay = null, drawCtx = null;
    let drawColor = '#e74c3c', drawSize = 5;

    // ── Drawing helpers ────────────────────────────────────────────
    function rrect(c, x, y, w, h, r, fill) {
        c.beginPath();
        c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.arcTo(x + w, y, x + w, y + r, r);
        c.lineTo(x + w, y + h - r); c.arcTo(x + w, y + h, x + w - r, y + h, r);
        c.lineTo(x + r, y + h); c.arcTo(x, y + h, x, y + h - r, r);
        c.lineTo(x, y + r); c.arcTo(x, y, x + r, y, r);
        c.closePath(); c.fillStyle = fill; c.fill();
    }
    function el(c, cx, cy, rx, ry, fill) {
        c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        c.fillStyle = fill; c.fill();
    }

    // ── Layer: Body + outfit ───────────────────────────────────────
    function drawBody(c, skin, oc, outfitStyle) {
        // Skin: ears (behind head)
        el(c,62,80,12,15,skin); el(c,158,80,12,15,skin);

        // Skin legs — drawn FIRST so pants render on top
        c.fillStyle = skin;
        c.beginPath(); c.moveTo(76,278); c.bezierCurveTo(68,330,64,365,62,385); c.lineTo(88,385); c.bezierCurveTo(89,365,93,330,97,278); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(123,278); c.bezierCurveTo(127,330,131,365,133,385); c.lineTo(159,385); c.bezierCurveTo(156,365,150,330,146,278); c.closePath(); c.fill();

        // Pants — drawn ON TOP of skin legs
        c.fillStyle = oc.pants;
        c.beginPath(); c.moveTo(72,280); c.bezierCurveTo(64,325,60,360,58,382); c.lineTo(92,382); c.bezierCurveTo(93,360,96,325,100,280); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(120,280); c.bezierCurveTo(124,325,130,360,132,382); c.lineTo(166,382); c.bezierCurveTo(162,360,155,325,148,280); c.closePath(); c.fill();
        rrect(c, 72,276,74,18,6, oc.pants);
        if (oc.belt) { rrect(c,60,268,100,12,4,oc.belt); rrect(c,102,270,16,8,2,'#888'); }

        // Arms (skin)
        c.fillStyle = skin;
        c.beginPath(); c.moveTo(62,148); c.bezierCurveTo(36,188,18,232,14,272); c.bezierCurveTo(18,278,30,278,34,272); c.bezierCurveTo(36,234,52,192,72,158); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(158,148); c.bezierCurveTo(184,188,202,232,206,272); c.bezierCurveTo(202,278,190,278,186,272); c.bezierCurveTo(184,234,168,192,148,158); c.closePath(); c.fill();
        el(c,21,277,14,10,skin); el(c,199,277,14,10,skin);

        // Neck
        rrect(c,97,118,26,22,5,skin);

        // Shirt body
        c.fillStyle = oc.shirt;
        c.beginPath(); c.moveTo(62,136); c.bezierCurveTo(50,185,48,242,50,280); c.lineTo(170,280); c.bezierCurveTo(172,242,170,185,158,136); c.closePath(); c.fill();

        // Short sleeves
        c.fillStyle = oc.sleeve;
        c.beginPath(); c.moveTo(63,146); c.bezierCurveTo(44,164,38,192,40,208); c.bezierCurveTo(48,213,58,210,62,203); c.bezierCurveTo(62,190,66,167,74,152); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(157,146); c.bezierCurveTo(176,164,182,192,180,208); c.bezierCurveTo(172,213,162,210,158,203); c.bezierCurveTo(158,190,154,167,146,152); c.closePath(); c.fill();

        // Outfit-specific details
        if (outfitStyle === 1) {
            // Formal: lapels + tie
            c.fillStyle = '#1a1a1a';
            c.beginPath(); c.moveTo(90,138); c.lineTo(104,162); c.lineTo(62,212); c.lineTo(50,182); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(130,138); c.lineTo(116,162); c.lineTo(158,212); c.lineTo(170,182); c.closePath(); c.fill();
            c.fillStyle = oc.tie;
            c.beginPath(); c.moveTo(104,140); c.lineTo(116,140); c.lineTo(119,190); c.lineTo(110,204); c.lineTo(101,190); c.closePath(); c.fill();
            c.fillRect(108,202,4,14);
        } else if (outfitStyle === 2) {
            // Police: badge + buttons
            el(c,84,167,11,11,'#FFD700'); el(c,84,167,7,7,'#B8860B'); el(c,84,167,3,3,'#FFD700');
            for (let i = 0; i < 5; i++) el(c,110,148+i*12,3,3,'#FFD700');
        } else if (outfitStyle === 3) {
            // Artist: striped shirt + apron + paint splatters
            c.strokeStyle = '#B0A88A'; c.lineWidth = 3;
            for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(62+i*8,138); c.lineTo(76+i*6,280); c.stroke(); }
            c.fillStyle = oc.apron;
            c.beginPath(); c.moveTo(88,150); c.lineTo(132,150); c.lineTo(140,280); c.lineTo(80,280); c.closePath(); c.fill();
            [['#E74C3C',95,190],['#3498DB',120,215],['#F1C40F',103,246],['#27AE60',126,178]].forEach(([col,sx,sy]) => {
                c.beginPath(); c.ellipse(sx,sy,7,5,0.8,0,Math.PI*2); c.fillStyle = col; c.fill();
            });
        } else if (outfitStyle === 4) {
            // Firefighter: reflective stripes + zipper
            c.fillStyle = 'rgba(255,255,60,0.78)';
            c.fillRect(52,207,116,11); c.fillRect(52,232,116,11);
            c.strokeStyle = '#333'; c.lineWidth = 3.5;
            c.beginPath(); c.moveTo(110,138); c.lineTo(110,280); c.stroke();
        }

        // Head (drawn on top of shirt collar)
        c.beginPath(); c.ellipse(110,72,46,50,0,0,Math.PI*2); c.fillStyle = skin; c.fill();

        // Feet
        el(c,72,386,22,11,skin); el(c,148,386,22,11,skin);
    }

    // ── Layer: Face ────────────────────────────────────────────────
    function drawFace(c, faceStyle) {
        // White of eyes
        el(c,90,72,12,10,'#fff'); el(c,130,72,12,10,'#fff');

        if (faceStyle === 1) {
            // Sunglasses
            rrect(c,74,64,34,20,7,'rgba(0,0,0,0.85)'); rrect(c,112,64,34,20,7,'rgba(0,0,0,0.85)');
            c.strokeStyle='#111'; c.lineWidth=3;
            c.beginPath(); c.moveTo(108,74); c.lineTo(112,74); c.stroke();
            c.beginPath(); c.moveTo(74,72); c.lineTo(64,70); c.stroke();
            c.beginPath(); c.moveTo(146,72); c.lineTo(156,70); c.stroke();
        } else if (faceStyle === 2) {
            // Glasses
            c.strokeStyle='#555'; c.lineWidth=2.5;
            c.beginPath(); c.ellipse(90,72,16,12,0,0,Math.PI*2); c.stroke();
            c.beginPath(); c.ellipse(130,72,16,12,0,0,Math.PI*2); c.stroke();
            c.beginPath(); c.moveTo(106,72); c.lineTo(114,72); c.stroke();
            c.beginPath(); c.moveTo(74,70); c.lineTo(64,68); c.stroke();
            c.beginPath(); c.moveTo(146,70); c.lineTo(156,68); c.stroke();
            el(c,90,72,5,6,'#2C2C2C'); el(c,130,72,5,6,'#2C2C2C');
        } else {
            // Default pupils
            el(c,90,72,7,8,'#2C2C2C'); el(c,130,72,7,8,'#2C2C2C');
            el(c,93,68,3,3,'#fff'); el(c,133,68,3,3,'#fff');
        }

        // Eyebrows
        c.strokeStyle='#4a3728'; c.lineWidth=3.5; c.lineCap='round';
        const browY = faceStyle === 3 ? 52 : 58;
        c.beginPath(); c.moveTo(78,browY+4); c.quadraticCurveTo(90,browY,102,browY+4); c.stroke();
        c.beginPath(); c.moveTo(118,browY+4); c.quadraticCurveTo(130,browY,142,browY+4); c.stroke();

        // Nose
        c.strokeStyle='#C17F50'; c.lineWidth=2; c.lineCap='round';
        c.beginPath(); c.moveTo(108,80); c.lineTo(104,91); c.lineTo(116,91); c.stroke();

        // Mouth
        c.strokeStyle='#A0522D'; c.lineWidth=2.5; c.lineCap='round';
        if (faceStyle === 3) {
            c.beginPath(); c.ellipse(110,100,11,14,0,0,Math.PI*2); c.fillStyle='#C0392B'; c.fill();
        } else if (faceStyle === 0 || faceStyle === 1) {
            c.beginPath(); c.arc(110,90,17,0.15,Math.PI-0.15); c.stroke();
        } else {
            c.beginPath(); c.moveTo(97,98); c.lineTo(123,98); c.stroke();
        }

        // Cheeks
        el(c,78,93,15,9,'rgba(230,100,80,0.18)'); el(c,142,93,15,9,'rgba(230,100,80,0.18)');
    }

    // ── Layer: Hair ────────────────────────────────────────────────
    function drawHair(c, style, color) {
        if (style === 0) return;
        // Clip OUT the face oval so hair never paints over facial features
        c.save();
        c.beginPath();
        c.rect(0, 0, 220, 400);                         // full canvas
        c.ellipse(110, 75, 38, 43, 0, 0, Math.PI * 2); // face oval subtracted
        c.clip('evenodd');
        c.fillStyle = color;
        if (style === 1) {
            c.beginPath(); c.arc(110,72,50,Math.PI,0); c.bezierCurveTo(162,96,158,122,148,128); c.lineTo(72,128); c.bezierCurveTo(62,122,58,96,60,72); c.closePath(); c.fill();
        } else if (style === 2) {
            c.beginPath(); c.moveTo(70,96);
            [[72,74],[82,50],[98,36],[110,28],[122,36],[138,50],[148,74],[150,96]].forEach(([bx,by]) => c.lineTo(bx,by));
            c.bezierCurveTo(152,110,68,110,70,96); c.closePath(); c.fill();
        } else if (style === 3) {
            // Long: left side
            c.beginPath(); c.arc(110,72,50,Math.PI,0); c.bezierCurveTo(162,96,172,188,168,232); c.lineTo(158,230); c.bezierCurveTo(150,188,148,104,62,72); c.closePath(); c.fill();
            // Right side
            c.beginPath(); c.moveTo(160,72); c.arc(110,72,50,0,Math.PI); c.bezierCurveTo(58,96,48,188,52,232); c.lineTo(62,230); c.bezierCurveTo(60,188,68,104,160,72); c.closePath(); c.fill();
        } else if (style === 4) {
            // Ponytail = bob + strand
            c.beginPath(); c.arc(110,72,50,Math.PI,0); c.bezierCurveTo(162,96,158,122,148,128); c.lineTo(72,128); c.bezierCurveTo(62,122,58,96,60,72); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(158,96); c.bezierCurveTo(186,110,194,152,174,174); c.lineTo(164,164); c.bezierCurveTo(180,144,172,110,150,100); c.closePath(); c.fill();
            el(c,154,98,10,6,'#E74C3C');
        }
        c.restore(); // remove face-oval clip
    }

    // ── Layer: Add-ons ─────────────────────────────────────────────
    function drawAddon(c, style, oc) {
        if (style === 0) return;
        if (style === 1) {
            const cap = oc ? oc.shirt : '#2C2C2C';
            c.beginPath(); c.ellipse(110,28,64,13,0,0,Math.PI*2); c.fillStyle=cap; c.fill();
            rrect(c,62,-22,96,56,10,cap);
            c.fillStyle='rgba(255,255,255,0.3)'; c.fillRect(62,28,96,7);
        } else if (style === 2) {
            rrect(c,136,148,46,88,10,'#E74C3C'); rrect(c,144,194,30,32,5,'#C0392B');
            c.strokeStyle='#C0392B'; c.lineWidth=6; c.lineCap='round';
            c.beginPath(); c.moveTo(150,148); c.bezierCurveTo(144,164,140,198,142,220); c.stroke();
        } else if (style === 3) {
            el(c,110,132,30,14,'#E74C3C');
            c.fillStyle='#E74C3C'; c.fillRect(116,130,22,46); el(c,128,176,11,11,'#E74C3C');
            c.strokeStyle='#fff'; c.lineWidth=2;
            c.beginPath(); c.moveTo(116,141); c.lineTo(138,141); c.stroke();
            c.beginPath(); c.moveTo(116,153); c.lineTo(138,153); c.stroke();
        }
    }

    // ── Redraw ─────────────────────────────────────────────────────
    function redraw(targetCanvas, targetState) {
        const cvs = targetCanvas || mainCanvas;
        if (!cvs) return;
        const c = cvs.getContext('2d');
        if (!c) return;

        const prevState = state;
        if (targetState) state = targetState;

        c.clearRect(0, 0, cvs.width, cvs.height);
        const oc = OUTFIT[state.outfitStyle] || OUTFIT[0];
        drawBody(c, state.skin, oc, state.outfitStyle);
        drawHair(c, state.hairStyle, state.hairColor);  // hair before face
        drawFace(c, state.faceStyle);                   // face always on top of hair
        drawAddon(c, state.addonStyle, oc);

        state = prevState;
    }

    // ── Options panel ──────────────────────────────────────────────
    const PANEL_OPTS = {
        hair:   [{ v:0, l:'Bald' }, { v:1, l:'Bob' }, { v:2, l:'Curly' }, { v:3, l:'Long' }, { v:4, l:'Ponytail' }],
        face:   [{ v:0, l:'Happy' }, { v:1, l:'Cool' }, { v:2, l:'Glasses' }, { v:3, l:'Surprise' }],
        outfit: [{ v:0, l:'Casual' }, { v:1, l:'Formal' }, { v:2, l:'Police' }, { v:3, l:'Artist' }, { v:4, l:'Firefighter' }],
        addon:  [{ v:0, l:'None' }, { v:1, l:'Hat' }, { v:2, l:'Backpack' }, { v:3, l:'Scarf' }]
    };
    const PANEL_KEY = { hair:'hairStyle', face:'faceStyle', outfit:'outfitStyle', addon:'addonStyle' };

    function makeColorRow(label, active, colors, cls, onChange) {
        const row = document.createElement('div');
        row.className = 'bm-color-row';
        const lbl = document.createElement('span'); lbl.className = 'bm-color-label'; lbl.textContent = label;
        row.appendChild(lbl);
        colors.forEach(([col, name]) => {
            const btn = document.createElement('button');
            btn.className = cls + (active === col ? ' bm-active' : '');
            btn.style.background = col; btn.title = name;
            btn.addEventListener('click', () => { row.querySelectorAll('.'+cls).forEach(b=>b.classList.remove('bm-active')); btn.classList.add('bm-active'); onChange(col); });
            row.appendChild(btn);
        });
        return row;
    }

    function renderOptionsPanel(panel) {
        const el = document.getElementById('bmOptionsPanel');
        if (!el) return;
        el.innerHTML = '';
        if (panel === 'hair') {
            el.appendChild(makeColorRow('Color:', state.hairColor,
                [['#2C1810','Dark Brown'],['#A0622A','Brown'],['#D4A017','Blonde'],['#CC0000','Red'],['#888','Grey'],['#111','Black']],
                'bm-color-dot', c => { state.hairColor = c; redraw(); }));
        }
        el.appendChild(makeColorRow('Skin:', state.skin,
            [['#F4C08A','Light'],['#D4935A','Medium'],['#A0622A','Tan'],['#6B3A1F','Dark']],
            'bm-skin-dot', c => { state.skin = c; redraw(); }));
        const opts = PANEL_OPTS[panel];
        const key = PANEL_KEY[panel];
        if (opts) {
            const row = document.createElement('div'); row.className = 'bm-opt-row';
            opts.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'bm-opt-btn' + (state[key] === opt.v ? ' bm-active' : '');
                btn.textContent = opt.l;
                btn.addEventListener('click', () => { state[key] = opt.v; row.querySelectorAll('.bm-opt-btn').forEach(b=>b.classList.remove('bm-active')); btn.classList.add('bm-active'); redraw(); });
                row.appendChild(btn);
            });
            el.appendChild(row);
        }
    }

    function renderPresets() {
        const panel = document.getElementById('bmPresetsPanel');
        if (!panel) return;
        panel.innerHTML = '';
        PRESETS.forEach(preset => {
            const card = document.createElement('div'); card.className = 'bm-preset-card';
            const pc = document.createElement('canvas'); pc.width = 220; pc.height = 400;
            pc.style.cssText = 'width:80px;height:auto;display:block;';
            const { label: _, ...ps } = preset;
            redraw(pc, ps);
            const lbl = document.createElement('div'); lbl.className = 'bm-preset-label'; lbl.textContent = preset.label;
            card.appendChild(pc); card.appendChild(lbl);
            card.addEventListener('click', () => {
                Object.assign(state, ps); redraw(); renderOptionsPanel(activePanel);
                panel.querySelectorAll('.bm-preset-card').forEach(c => c.classList.remove('bm-selected'));
                card.classList.add('bm-selected');
            });
            panel.appendChild(card);
        });
    }

    // ── Draw-mode overlay ──────────────────────────────────────────
    function initDrawOverlay() {
        const wrap = document.getElementById('bmCanvasWrap');
        if (!wrap || drawOverlay) return;
        drawOverlay = document.createElement('canvas');
        drawOverlay.id = 'bmDrawOverlay';
        drawOverlay.width = 220; drawOverlay.height = 400;
        drawOverlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;cursor:crosshair;border-radius:10px;';
        drawCtx = drawOverlay.getContext('2d');
        wrap.style.position = 'relative';
        wrap.appendChild(drawOverlay);

        function pos(e) {
            const r = drawOverlay.getBoundingClientRect();
            const src = e.touches ? e.touches[0] : e;
            return [(src.clientX - r.left) * (220 / r.width), (src.clientY - r.top) * (400 / r.height)];
        }
        function startStroke(e) { painting = true; drawCtx.beginPath(); const [px,py] = pos(e); drawCtx.moveTo(px,py); e.preventDefault(); }
        function moveStroke(e) {
            if (!painting) return;
            const [px,py] = pos(e);
            drawCtx.lineTo(px,py); drawCtx.strokeStyle = drawColor; drawCtx.lineWidth = drawSize; drawCtx.lineCap = 'round'; drawCtx.lineJoin = 'round'; drawCtx.stroke();
            drawCtx.beginPath(); drawCtx.moveTo(px,py); e.preventDefault();
        }
        function endStroke() { painting = false; }
        drawOverlay.addEventListener('mousedown', startStroke);
        drawOverlay.addEventListener('mousemove', moveStroke);
        drawOverlay.addEventListener('mouseup', endStroke);
        drawOverlay.addEventListener('mouseleave', endStroke);
        drawOverlay.addEventListener('touchstart', startStroke, { passive: false });
        drawOverlay.addEventListener('touchmove', moveStroke, { passive: false });
        drawOverlay.addEventListener('touchend', endStroke);
    }

    function enterDrawMode() {
        drawMode = true; initDrawOverlay();
        if (drawOverlay) drawOverlay.style.display = '';
        const tb = document.getElementById('bmDrawToolbar'); if (tb) tb.hidden = false;
        const op = document.getElementById('bmOptionsPanel'); if (op) op.style.display = 'none';
    }
    function exitDrawMode() {
        drawMode = false;
        if (drawOverlay) drawOverlay.style.display = 'none';
        const tb = document.getElementById('bmDrawToolbar'); if (tb) tb.hidden = true;
        const op = document.getElementById('bmOptionsPanel'); if (op) op.style.display = '';
    }

    // ── Save ───────────────────────────────────────────────────────
    function saveAvatar() {
        if (!mainCanvas) return;
        // Flatten: avatar + freehand drawing
        const out = document.createElement('canvas'); out.width = 220; out.height = 400;
        const octx = out.getContext('2d');
        octx.drawImage(mainCanvas, 0, 0);
        if (drawOverlay) octx.drawImage(drawOverlay, 0, 0);
        const dataUrl = out.toDataURL('image/png');
        localStorage.setItem('fw_profile', dataUrl);
        document.querySelectorAll('.profile-thumb').forEach(thumb => {
            thumb.innerHTML = '';
            const img = document.createElement('img'); img.src = dataUrl; img.alt = 'Avatar';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit';
            thumb.appendChild(img);
        });
        closeAvatarBuilder();
    }

    // ── Modal open / close ─────────────────────────────────────────
    function openAvatarBuilder() {
        const modal = document.getElementById('buildMeModal');
        if (!modal) return;
        mainCanvas = document.getElementById('bmCanvas');
        if (!mainCanvas) return;
        state = Object.assign({}, DEFAULTS);
        drawOverlay = null; drawMode = false;
        activePanel = 'outfit';
        modal.hidden = false;
        modal.querySelectorAll('.bm-left-btn').forEach(b => b.classList.toggle('bm-active', b.dataset.panel === activePanel));
        renderOptionsPanel(activePanel);
        renderPresets();
        redraw();
        exitDrawMode();
    }

    function closeAvatarBuilder() {
        const modal = document.getElementById('buildMeModal');
        if (modal) modal.hidden = true;
    }

    // ── Init ───────────────────────────────────────────────────────
    function init() {
        document.querySelectorAll('.bm-left-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.panel === 'draw') {
                    enterDrawMode();
                    document.querySelectorAll('.bm-left-btn').forEach(b => b.classList.remove('bm-active'));
                    btn.classList.add('bm-active');
                } else {
                    exitDrawMode();
                    activePanel = btn.dataset.panel;
                    document.querySelectorAll('.bm-left-btn').forEach(b => b.classList.remove('bm-active'));
                    btn.classList.add('bm-active');
                    renderOptionsPanel(activePanel);
                }
            });
        });

        const closeBtn = document.getElementById('buildMeClose');
        if (closeBtn) closeBtn.addEventListener('click', closeAvatarBuilder);

        const saveBtn = document.getElementById('buildMeSave');
        if (saveBtn) saveBtn.addEventListener('click', saveAvatar);

        const modalEl = document.getElementById('buildMeModal');
        if (modalEl) modalEl.addEventListener('click', e => { if (e.target === modalEl) closeAvatarBuilder(); });

        const exitDraw = document.getElementById('bmExitDraw');
        if (exitDraw) exitDraw.addEventListener('click', exitDrawMode);

        const clearDraw = document.getElementById('bmClearDraw');
        if (clearDraw) clearDraw.addEventListener('click', () => { if (drawCtx) drawCtx.clearRect(0,0,220,400); });

        const colorPick = document.getElementById('bmDrawColor');
        if (colorPick) colorPick.addEventListener('input', e => { drawColor = e.target.value; });

        const sizePick = document.getElementById('bmDrawSize');
        if (sizePick) sizePick.addEventListener('input', e => { drawSize = +e.target.value; });

        // Wire Create New ME → open builder (replaces any existing click handler)
        const createMeBtn = document.getElementById('create-me-btn');
        if (createMeBtn) {
            const fresh = createMeBtn.cloneNode(true);
            createMeBtn.parentNode.replaceChild(fresh, createMeBtn);
            fresh.addEventListener('click', openAvatarBuilder);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.openAvatarBuilder = openAvatarBuilder;
})();
