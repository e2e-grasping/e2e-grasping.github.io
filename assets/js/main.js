(function() {
	const lightbox = document.getElementById('lightbox');
	const body = document.getElementById('lightbox-body');
	let METHOD_TOKEN = 0; // invalidate running method animations on mode switch

	function openLightboxWithYouTube(url) {
		const params = new URLSearchParams({ autoplay: '1', rel: '0', modestbranding: '1' });
		const embedUrl = url.replace('watch?v=', 'embed/') + (url.includes('?') ? '&' : '?') + params.toString();
		body.innerHTML = '<iframe src="' + embedUrl + '" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
		lightbox.classList.add('open');
		lightbox.setAttribute('aria-hidden', 'false');
	}
	function openLightboxWithVideo(src) {
		body.innerHTML = '<video src="' + src + '" controls autoplay playsinline></video>';
		lightbox.classList.add('open');
		lightbox.setAttribute('aria-hidden', 'false');
	}
	function closeLightbox() {
		lightbox.classList.remove('open');
		lightbox.setAttribute('aria-hidden', 'true');
		body.innerHTML = '';
	}
	document.addEventListener('click', function(e) {
		const link = e.target.closest('a.card');
		if (link) {
			e.preventDefault();
			const type = link.getAttribute('data-video-type') || '';
			const href = link.getAttribute('href');
			if (/youtube\.com|youtu\.be/.test(href) || type === 'youtube') {
				openLightboxWithYouTube(href);
			} else if (/\.mp4($|\?)/i.test(href) || type === 'video') {
				openLightboxWithVideo(href);
			} else {
				window.open(href, '_blank');
			}
		}
		if (e.target.hasAttribute('data-close')) {
			closeLightbox();
		}
	});
	document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeLightbox(); });

	/* Method diagrams */
	const DP_COLORS = { sim: '#d5d1f6', rlbuf: '#d7f3df', net: '#f9e5d1', border: '#e5e7eb', packet: '#334155', allreduce: '#e879f9' };
	function createSvgEl(s, name, attrs) { const ns = 'http://www.w3.org/2000/svg'; const el = document.createElementNS(ns, name); for (const k in attrs) el.setAttribute(k, attrs[k]); s.appendChild(el); return el; }
	function addLabel(s, x, y, text) { return createSvgEl(s, 'text', { x: x, y: y, fill: '#334155', 'font-size': '13', 'font-family': 'Inter, system-ui' }).appendChild(document.createTextNode(text)), s.lastChild; }
	function animatePacket(s, x1, y1, x2, y2, durationMs, delayMs, color, token) {
		const c = createSvgEl(s, 'circle', { cx: x1, cy: y1, r: 5, fill: color || DP_COLORS.packet, opacity: 0.95 });
		const start = performance.now() + (delayMs||0);
		function step(now) {
			if (token !== METHOD_TOKEN) { c.remove(); return; }
			if (now < start) { requestAnimationFrame(step); return; }
			const t = Math.min(1, (now - start) / durationMs);
			c.setAttribute('cx', x1 + (x2 - x1) * t);
			c.setAttribute('cy', y1 + (y2 - y1) * t);
			if (t < 1) requestAnimationFrame(step); else c.remove();
		}
		requestAnimationFrame(step);
	}

	function drawDataParallel(svg, token, animate) {
		const s = svg; s.innerHTML = '';
		const pad = 40; const gpuW = 220, gpuH = 110, gap = 24; const y = 200;
		function rect(x, y, w, h, fill) { return createSvgEl(s, 'rect', { x:x, y:y, width:w, height:h, rx:10, fill: fill, stroke: DP_COLORS.border, 'stroke-width': 1 }); }
		const x0 = pad, x1 = x0 + gpuW + gap, x2 = x1 + gpuW + gap, x3 = x2 + gpuW + gap;
		const replicas = [x0, x1, x2, x3].map((x, i) => { rect(x, y, gpuW, gpuH, '#ffffff'); rect(x+16, y+10, 188, 28, DP_COLORS.sim); addLabel(s, x+24, y+28, 'Environment'); rect(x+16, y+44, 188, 26, DP_COLORS.rlbuf); addLabel(s, x+24, y+60, 'RL Buffer'); rect(x+16, y+74, 188, 26, DP_COLORS.net); addLabel(s, x+24, y+92, 'Network'); addLabel(s, x, y-12, `GPU ${i}`); return { x, y }; });
		const centers = replicas.map((r) => ({ x: r.x + 16 + 188/2, y: r.y + 74 + 26/2 }));
		const busY = y + gpuH + 24; const busX1 = Math.min(...centers.map(c => c.x)); const busX2 = Math.max(...centers.map(c => c.x));
		createSvgEl(s, 'line', { x1: busX1, y1: busY, x2: busX2, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 3, 'stroke-opacity': 0.5 });
		centers.forEach((c) => { createSvgEl(s, 'line', { x1: c.x, y1: c.y + 12, x2: c.x, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 2, 'stroke-opacity': 0.35 }); });
		createSvgEl(s, 'text', { x: (busX1 + busX2) / 2, y: busY + 18, fill: '#334155', 'font-size': '13', 'font-family': 'Inter, system-ui', 'text-anchor': 'middle' }).textContent = 'All-Reduce';
		if (!animate) return;
		function animateUpDown(s, sx, sy, nx, ny, durDown, durUp, delayMs, repeats, token) {
			const startAt = performance.now() + (delayMs||0); const dot = createSvgEl(s, 'circle', { cx: sx, cy: sy, r: 5, fill: DP_COLORS.packet, opacity: 0.95 });
			function lerp(a,b,t){ return a+(b-a)*t; }
			function run(now){ if (token !== METHOD_TOKEN) { dot.remove(); return; } if (now < startAt) { requestAnimationFrame(run); return; } const t1 = Math.min(1, (now - startAt) / durDown); dot.setAttribute('cx', lerp(sx, nx, t1)); dot.setAttribute('cy', lerp(sy, ny, t1)); if (t1 < 1) { requestAnimationFrame(run); return; } dot.setAttribute('fill', '#7c78ea'); const backStart = performance.now(); function back(now2){ if (token !== METHOD_TOKEN) { dot.remove(); return; } const t2 = Math.min(1, (now2 - backStart) / durUp); dot.setAttribute('cx', lerp(nx, sx, t2)); dot.setAttribute('cy', lerp(ny, sy, t2)); if (t2 < 1) { requestAnimationFrame(back); return; } dot.remove(); if (repeats > 1) { setTimeout(() => { if (token !== METHOD_TOKEN) return; animateUpDown(s, sx, sy, nx, ny, durDown, durUp, 0, repeats-1, token); }, 120); } } requestAnimationFrame(back); } requestAnimationFrame(run); }
		const downDur = 588, upDur = 588;
		replicas.forEach((r) => { const sx = r.x + 16 + 188/2, sy = r.y + 10 + 28/2; const nx = r.x + 16 + 188/2, ny = r.y + 74 + 26/2; animateUpDown(s, sx, sy, nx, ny, 588, 588, 0, 3, token); });
		const totalCycle = (downDur + upDur) * 3; setTimeout(() => { if (token !== METHOD_TOKEN) return; 
			const taps = centers.map(c => c.x);
			for (let i = 0; i < taps.length; i++) {
				const a = taps[i];
				const b = taps[(i + 1) % taps.length];
				const toIdx = (i + 1) % centers.length;
				const fromIdx = i;
				// forward around the ring (a -> b)
				const delayFwd = 80*i;
				animatePacket(s, a, busY, b, busY, 900, delayFwd, DP_COLORS.allreduce, token);
				// then up the vertical tap at b to the bottom of Network block
				setTimeout(() => { if (token !== METHOD_TOKEN) return; animatePacket(s, b, busY, b, centers[toIdx].y + 12, 300, 0, DP_COLORS.allreduce, token); }, delayFwd + 900 + 40);
				// backward around the ring (b -> a)
				const delayBack = 80*i + 220;
				animatePacket(s, b, busY, a, busY, 900, delayBack, DP_COLORS.allreduce, token);
				// then up the vertical tap at a
				setTimeout(() => { if (token !== METHOD_TOKEN) return; animatePacket(s, a, busY, a, centers[fromIdx].y + 12, 300, 0, DP_COLORS.allreduce, token); }, delayBack + 900 + 40);
			}
		}, totalCycle + 120);
	}

	function drawDisaggregated(svg, token, animate) {
		const s = svg; s.innerHTML=''; const pad = 40; const gpuW = 220; const gpuH = 110; const gap = 24; const yRow = 200;
		function rect(x, y, w, h, fill) { return createSvgEl(s, 'rect', { x:x, y:y, width:w, height:h, rx:10, fill: fill, stroke: DP_COLORS.border, 'stroke-width': 1 }); }
		const x0 = pad, x1 = x0 + gpuW + gap, x2 = x1 + gpuW + gap, x3 = x2 + gpuW + gap;
		[x0, x1, x2].forEach((x, i) => { rect(x, yRow, gpuW, gpuH, '#ffffff'); rect(x+16, yRow+10, 188, 90, DP_COLORS.sim); addLabel(s, x+24, yRow+58, 'Environment'); addLabel(s, x, yRow-12, `Sim GPU ${i}`); });
		rect(x3, yRow, gpuW, gpuH, '#ffffff'); const net = rect(x3+16, yRow+16, 188, 30, DP_COLORS.net); addLabel(s, x3+24, yRow+36, 'Network'); const buf = rect(x3+16, yRow+60, 188, 30, DP_COLORS.rlbuf); addLabel(s, x3+24, yRow+80, 'RL Buffer'); addLabel(s, x3, yRow-12, 'RL GPU');
		const centersEnv = [x0, x1, x2].map((x) => ({ x: x + 16 + 188/2, y: yRow + 10 + 90/2 })); const centerNet = { x: x3 + 16 + 188/2, y: yRow + 16 + 30/2 };
		const tapsX = [...centersEnv.map(c => c.x), centerNet.x]; const busY = yRow + gpuH + 24; const busX1 = Math.min(...tapsX); const busX2 = Math.max(...tapsX);
		createSvgEl(s, 'line', { x1: busX1, y1: busY, x2: busX2, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 3, 'stroke-opacity': 0.5 });
		// Vertical taps that touch the bottom edges of the blocks
		const envBottomY = yRow + 10 + 90; // bottom edge of Environment blocks
		const netBottomY = yRow + 16 + 30; // bottom edge of Network block
		centersEnv.forEach((c) => { createSvgEl(s, 'line', { x1: c.x, y1: envBottomY, x2: c.x, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 2, 'stroke-opacity': 0.35 }); });
		createSvgEl(s, 'line', { x1: centerNet.x, y1: netBottomY, x2: centerNet.x, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 2, 'stroke-opacity': 0.35 });
		if (!animate) return;
		function animateMove(dot, from, to, dur, cb) { const start = performance.now(); function step(now) { if (token !== METHOD_TOKEN) { dot.remove(); return; } const t = Math.min(1, (now - start) / dur); dot.setAttribute('cx', from.x + (to.x - from.x) * t); dot.setAttribute('cy', from.y + (to.y - from.y) * t); if (t < 1) requestAnimationFrame(step); else cb && cb(); } requestAnimationFrame(step); }
		function animatePath(dot, p1, p3, durV, durH, done) { animateMove(dot, p1, { x: p1.x, y: busY }, durV, () => animateMove(dot, { x: p1.x, y: busY }, { x: p3.x, y: busY }, durH, () => animateMove(dot, { x: p3.x, y: busY }, p3, durV, done))); }
		const durV = 364, durH = 448;
		function runBarrierRounds(round, maxRounds) { if (token !== METHOD_TOKEN) return; if (round >= maxRounds) return; let remainingFwd = centersEnv.length; centersEnv.forEach((src) => { const dot = createSvgEl(s, 'circle', { cx: src.x, cy: src.y, r: 5, fill: DP_COLORS.packet, opacity: 0.95 }); animatePath(dot, src, centerNet, durV, durH, () => { dot.remove(); if (--remainingFwd === 0) phaseBack(); }); }); function phaseBack() { if (token !== METHOD_TOKEN) return; let remainingBack = centersEnv.length; centersEnv.forEach((dst) => { const dot = createSvgEl(s, 'circle', { cx: centerNet.x, cy: centerNet.y, r: 5, fill: '#7c78ea', opacity: 0.95 }); animatePath(dot, centerNet, dst, durV, durH, () => { dot.remove(); if (--remainingBack === 0) setTimeout(() => runBarrierRounds(round+1, maxRounds), 160); }); }); } }
		runBarrierRounds(0, 3);
	}

	function setupMethod() {
		const svgDP = document.getElementById('svg-data-parallel');
		const svgDG = document.getElementById('svg-disaggregated');
		if (!svgDP || !svgDG) return;
		let mode = 'data-parallel';
		const buttons = document.querySelectorAll('.method-controls .btn');
		function show(m) {
			mode = m; METHOD_TOKEN++;
			if (mode === 'data-parallel') { svgDP.innerHTML = ''; drawDataParallel(svgDP, METHOD_TOKEN, true); }
			else { svgDG.innerHTML = ''; drawDisaggregated(svgDG, METHOD_TOKEN, true); }
		}
		buttons.forEach(b => b.addEventListener('click', () => show(b.getAttribute('data-mode'))));
		// Render static diagrams initially (both visible, no animation)
		svgDP.hidden = false; svgDG.hidden = false;
		drawDataParallel(svgDP, METHOD_TOKEN, false);
		drawDisaggregated(svgDG, METHOD_TOKEN, false);
	}
	if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', setupMethod); } else { setupMethod(); }
})(); 