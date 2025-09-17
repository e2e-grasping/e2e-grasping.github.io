// (function() {
// 	const lightbox = document.getElementById('lightbox');
// 	const body = document.getElementById('lightbox-body');
// 	let METHOD_TOKEN = 0; // invalidate running method animations on mode switch

// 	function openLightboxWithYouTube(url) {
// 		const params = new URLSearchParams({ autoplay: '1', rel: '0', modestbranding: '1' });
// 		const embedUrl = url.replace('watch?v=', 'embed/') + (url.includes('?') ? '&' : '?') + params.toString();
// 		body.innerHTML = '<iframe src="' + embedUrl + '" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
// 		lightbox.classList.add('open');
// 		lightbox.setAttribute('aria-hidden', 'false');
// 	}
// 	function openLightboxWithVideo(src) {
// 		body.innerHTML = '<video src="' + src + '" controls autoplay playsinline></video>';
// 		lightbox.classList.add('open');
// 		lightbox.setAttribute('aria-hidden', 'false');
// 	}
// 	function closeLightbox() {
// 		lightbox.classList.remove('open');
// 		lightbox.setAttribute('aria-hidden', 'true');
// 		body.innerHTML = '';
// 	}
// 	document.addEventListener('click', function(e) {
// 		const link = e.target.closest('a.card');
// 		if (link) {
// 			e.preventDefault();
// 			const type = link.getAttribute('data-video-type') || '';
// 			const href = link.getAttribute('href');
// 			if (/youtube\.com|youtu\.be/.test(href) || type === 'youtube') {
// 				openLightboxWithYouTube(href);
// 			} else if (/\.mp4($|\?)/i.test(href) || type === 'video') {
// 				openLightboxWithVideo(href);
// 			} else {
// 				window.open(href, '_blank');
// 			}
// 		}
// 		if (e.target.hasAttribute('data-close')) {
// 			closeLightbox();
// 		}
// 	});
// 	document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeLightbox(); });

// 	/* Method diagrams */
// 	const DP_COLORS = { sim: '#d5d1f6', rlbuf: '#d7f3df', net: '#f9e5d1', border: '#e5e7eb', packet: '#334155', allreduce: '#e879f9' };
// 	function createSvgEl(s, name, attrs) { const ns = 'http://www.w3.org/2000/svg'; const el = document.createElementNS(ns, name); for (const k in attrs) el.setAttribute(k, attrs[k]); s.appendChild(el); return el; }
// 	function addLabel(s, x, y, text) { return createSvgEl(s, 'text', { x: x, y: y, fill: '#334155', 'font-size': '13', 'font-family': 'Inter, system-ui' }).appendChild(document.createTextNode(text)), s.lastChild; }
// 	function addCenteredLabel(s, cx, cy, text) { const t = createSvgEl(s, 'text', { x: cx, y: cy, fill: '#334155', 'font-size': '13', 'font-family': 'Inter, system-ui', 'text-anchor': 'middle', 'dominant-baseline': 'middle' }); t.textContent = text; return t; }

// 	function animatePacket(s, x1, y1, x2, y2, durationMs, delayMs, color, token) {
// 		const c = createSvgEl(s, 'circle', { cx: x1, cy: y1, r: 5, fill: color || DP_COLORS.packet, opacity: 0.95 });
// 		const start = performance.now() + (delayMs||0);
// 		function step(now) {
// 			if (token !== METHOD_TOKEN) { c.remove(); return; }
// 			if (now < start) { requestAnimationFrame(step); return; }
// 			const t = Math.min(1, (now - start) / durationMs);
// 			c.setAttribute('cx', x1 + (x2 - x1) * t);
// 			c.setAttribute('cy', y1 + (y2 - y1) * t);
// 			if (t < 1) requestAnimationFrame(step); else c.remove();
// 		}
// 		requestAnimationFrame(step);
// 	}

// 	function drawDataParallel(svg, token, animate) {
// 		const s = svg; s.innerHTML = '';
// 		const pad = 40; const gpuW = 220, gpuH = 110, gap = 24; const y = 100;
// 		function rect(x, y, w, h, fill) { return createSvgEl(s, 'rect', { x:x, y:y, width:w, height:h, rx:10, fill: fill, stroke: DP_COLORS.border, 'stroke-width': 1 }); }
// 		const x0 = pad, x1 = x0 + gpuW + gap, x2 = x1 + gpuW + gap, x3 = x2 + gpuW + gap;
// 		const replicas = [x0, x1, x2, x3].map((x, i) => { rect(x, y, gpuW, gpuH, '#ffffff'); rect(x+16, y+10, 188, 28, DP_COLORS.sim); addCenteredLabel(s, x+16+188/2, y+10+28/2, 'Environment'); rect(x+16, y+44, 188, 26, DP_COLORS.rlbuf); addCenteredLabel(s, x+16+188/2, y+44+26/2, 'RL Buffer'); rect(x+16, y+74, 188, 26, DP_COLORS.net); addCenteredLabel(s, x+16+188/2, y+74+26/2, 'Network'); addLabel(s, x, y-12, `GPU ${i}`); return { x, y }; });
// 		const centers = replicas.map((r) => ({ x: r.x + 16 + 188/2, y: r.y + 74 + 26/2 }));
// 		const busY = y + gpuH + 24; const busX1 = Math.min(...centers.map(c => c.x)); const busX2 = Math.max(...centers.map(c => c.x));
// 		const statusLabel = createSvgEl(s, 'text', { x: (busX1 + busX2) / 2, y: busY + 18, fill: '#334155', 'font-size': '13', 'font-family': 'Inter, system-ui', 'text-anchor': 'middle' });
// 		statusLabel.textContent = animate ? 'Step Simulation' : 'All-Reduce';
// 		createSvgEl(s, 'line', { x1: busX1, y1: busY, x2: busX2, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 3, 'stroke-opacity': 0.5 });
// 		centers.forEach((c) => { createSvgEl(s, 'line', { x1: c.x, y1: c.y + 12, x2: c.x, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 2, 'stroke-opacity': 0.35 }); });
// 		if (!animate) return;
// 		function animateUpDown(s, sx, sy, nx, ny, durDown, durUp, delayMs, repeats, token) {
// 			const startAt = performance.now() + (delayMs||0); const dot = createSvgEl(s, 'circle', { cx: sx, cy: sy, r: 5, fill: DP_COLORS.packet, opacity: 0.95 });
// 			function lerp(a,b,t){ return a+(b-a)*t; }
// 			function run(now){ if (token !== METHOD_TOKEN) { dot.remove(); return; } if (now < startAt) { requestAnimationFrame(run); return; } const t1 = Math.min(1, (now - startAt) / durDown); dot.setAttribute('cx', lerp(sx, nx, t1)); dot.setAttribute('cy', lerp(sy, ny, t1)); if (t1 < 1) { requestAnimationFrame(run); return; } dot.setAttribute('fill', '#7c78ea'); const backStart = performance.now(); function back(now2){ if (token !== METHOD_TOKEN) { dot.remove(); return; } const t2 = Math.min(1, (now2 - backStart) / durUp); dot.setAttribute('cx', lerp(nx, sx, t2)); dot.setAttribute('cy', lerp(ny, sy, t2)); if (t2 < 1) { requestAnimationFrame(back); return; } dot.remove(); if (repeats > 1) { setTimeout(() => { if (token !== METHOD_TOKEN) return; animateUpDown(s, sx, sy, nx, ny, durDown, durUp, 0, repeats-1, token); }, 120); } } requestAnimationFrame(back); } requestAnimationFrame(run); }
// 		const downDur = 588, upDur = 588;
// 		replicas.forEach((r) => { const sx = r.x + 16 + 188/2, sy = r.y + 10 + 28/2; const nx = r.x + 16 + 188/2, ny = r.y + 74 + 26/2; animateUpDown(s, sx, sy, nx, ny, 588, 588, 0, 3, token); });
// 		const totalCycle = (downDur + upDur) * 3; setTimeout(() => { if (token !== METHOD_TOKEN) return; 
// 			statusLabel.textContent = 'All-Reduce';
// 			const taps = centers.map(c => c.x);
// 			for (let i = 0; i < taps.length; i++) {
// 				const a = taps[i];
// 				const b = taps[(i + 1) % taps.length];
// 				const toIdx = (i + 1) % centers.length;
// 				const fromIdx = i;
// 				// forward around the ring (a -> b)
// 				const delayFwd = 80*i;
// 				animatePacket(s, a, busY, b, busY, 900, delayFwd, DP_COLORS.allreduce, token);
// 				// then up the vertical tap at b to the bottom of Network block
// 				setTimeout(() => { if (token !== METHOD_TOKEN) return; animatePacket(s, b, busY, b, centers[toIdx].y + 12, 300, 0, DP_COLORS.allreduce, token); }, delayFwd + 900 + 40);
// 				// backward around the ring (b -> a)
// 				const delayBack = 80*i + 220;
// 				animatePacket(s, b, busY, a, busY, 900, delayBack, DP_COLORS.allreduce, token);
// 				// then up the vertical tap at a
// 				setTimeout(() => { if (token !== METHOD_TOKEN) return; animatePacket(s, a, busY, a, centers[fromIdx].y + 12, 300, 0, DP_COLORS.allreduce, token); }, delayBack + 900 + 40);
// 			}
// 		}, totalCycle + 120);
// 	}

// 	function drawDisaggregated(svg, token, animate) {
// 		const s = svg; s.innerHTML=''; const pad = 40; const gpuW = 220; const gpuH = 110; const gap = 24; const yRow = 120;
// 		function rect(x, y, w, h, fill) { return createSvgEl(s, 'rect', { x:x, y:y, width:w, height:h, rx:10, fill: fill, stroke: DP_COLORS.border, 'stroke-width': 1 }); }
// 		const x0 = pad, x1 = x0 + gpuW + gap, x2 = x1 + gpuW + gap, x3 = x2 + gpuW + gap;
// 		[x0, x1, x2].forEach((x, i) => { rect(x, yRow, gpuW, gpuH, '#ffffff'); rect(x+16, yRow+10, 188, 90, DP_COLORS.sim); addCenteredLabel(s, x+16+188/2, yRow+10+90/2, 'Environment'); addLabel(s, x, yRow-12, `Sim GPU ${i}`); });
// 		rect(x3, yRow, gpuW, gpuH, '#ffffff'); const NET_H = 36, BUF_H = 36; const net = rect(x3+16, yRow+16, 188, NET_H, DP_COLORS.net); addCenteredLabel(s, x3+16+188/2, yRow+16+NET_H/2, 'Network'); const buf = rect(x3+16, yRow+60, 188, BUF_H, DP_COLORS.rlbuf); addCenteredLabel(s, x3+16+188/2, yRow+60+BUF_H/2, 'RL Buffer'); addLabel(s, x3, yRow-12, 'RL GPU');
// 		const centersEnv = [x0, x1, x2].map((x) => ({ x: x + 16 + 188/2, y: yRow + 10 + 90/2 })); const centerNet = { x: x3 + 16 + 188/2, y: yRow + 16 + NET_H/2 };
// 		const tapsX = [...centersEnv.map(c => c.x), centerNet.x]; const busY = yRow + gpuH + 24; const busX1 = Math.min(...tapsX); const busX2 = Math.max(...tapsX);
// 		createSvgEl(s, 'line', { x1: busX1, y1: busY, x2: busX2, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 3, 'stroke-opacity': 0.5 });
// 		// Vertical taps that touch the bottom edges of the blocks
// 		const envBottomY = yRow + 10 + 90; // bottom edge of Environment blocks
// 		const netBottomY = yRow + 16 + NET_H; // bottom edge of Network block
// 		const rlTopY = yRow + 60; // top edge of RL Buffer
// 		const rlBottomY = yRow + 60 + BUF_H; // bottom edge of RL Buffer
// 		centersEnv.forEach((c) => { createSvgEl(s, 'line', { x1: c.x, y1: envBottomY, x2: c.x, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 2, 'stroke-opacity': 0.35 }); });
// 		// Split RL GPU tap around buffer
// 		createSvgEl(s, 'line', { x1: centerNet.x, y1: netBottomY, x2: centerNet.x, y2: rlTopY, stroke: DP_COLORS.allreduce, 'stroke-width': 2, 'stroke-opacity': 0.35 });
// 		createSvgEl(s, 'line', { x1: centerNet.x, y1: rlBottomY, x2: centerNet.x, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 2, 'stroke-opacity': 0.35 });
// 		if (!animate) return;
// 		function animateMove(dot, from, to, dur, cb) { const start = performance.now(); function step(now) { if (token !== METHOD_TOKEN) { dot.remove(); return; } const t = Math.min(1, (now - start) / dur); dot.setAttribute('cx', from.x + (to.x - from.x) * t); dot.setAttribute('cy', from.y + (to.y - from.y) * t); if (t < 1) requestAnimationFrame(step); else cb && cb(); } requestAnimationFrame(step); }
// 		function animatePath(dot, p1, p3, durV, durH, done) { animateMove(dot, p1, { x: p1.x, y: busY }, durV, () => animateMove(dot, { x: p1.x, y: busY }, { x: p3.x, y: busY }, durH, () => animateMove(dot, { x: p3.x, y: busY }, p3, durV, done))); }
// 		const durV = 364, durH = 448;
// 		function runBarrierRounds(round, maxRounds) { if (token !== METHOD_TOKEN) return; if (round >= maxRounds) return; let remainingFwd = centersEnv.length; centersEnv.forEach((src) => { const dot = createSvgEl(s, 'circle', { cx: src.x, cy: src.y, r: 5, fill: DP_COLORS.packet, opacity: 0.95 }); animatePath(dot, src, centerNet, durV, durH, () => { dot.remove(); if (--remainingFwd === 0) phaseBack(); }); }); function phaseBack() { if (token !== METHOD_TOKEN) return; let remainingBack = centersEnv.length; centersEnv.forEach((dst) => { const dot = createSvgEl(s, 'circle', { cx: centerNet.x, cy: centerNet.y, r: 5, fill: '#7c78ea', opacity: 0.95 }); animatePath(dot, centerNet, dst, durV, durH, () => { dot.remove(); if (--remainingBack === 0) setTimeout(() => runBarrierRounds(round+1, maxRounds), 160); }); }); } }
// 		runBarrierRounds(0, 3);
// 	}

// 	function setupMethod() {
// 		const svgDP = document.getElementById('svg-data-parallel');
// 		const svgDG = document.getElementById('svg-disaggregated');
// 		if (!svgDP || !svgDG) return;
// 		let mode = 'data-parallel';
// 		const buttons = document.querySelectorAll('.method-controls .btn');
// 		function show(m) {
// 			mode = m; METHOD_TOKEN++;
// 			if (mode === 'data-parallel') { svgDP.innerHTML = ''; drawDataParallel(svgDP, METHOD_TOKEN, true); }
// 			else { svgDG.innerHTML = ''; drawDisaggregated(svgDG, METHOD_TOKEN, true); }
// 		}
// 		buttons.forEach(b => b.addEventListener('click', () => show(b.getAttribute('data-mode'))));
// 		// Render static diagrams initially (both visible, no animation)
// 		svgDP.hidden = false; svgDG.hidden = false;
// 		drawDataParallel(svgDP, METHOD_TOKEN, false);
// 		drawDisaggregated(svgDG, METHOD_TOKEN, false);
// 	}

// 	/* Results chart loader */
// 	function splitCSVLine(line, delim) {
// 		const out = []; let field = ''; let inQuotes = false;
// 		for (let i=0;i<line.length;i++) {
// 			const c = line[i];
// 			if (c === '"') {
// 				if (inQuotes && i+1 < line.length && line[i+1] === '"') { field += '"'; i++; }
// 				else { inQuotes = !inQuotes; }
// 				continue;
// 			}
// 			if (c === delim && !inQuotes) { out.push(field); field = ''; continue; }
// 			field += c;
// 		}
// 		out.push(field);
// 		return out.map(v => v.trim());
// 	}
// 	function detectDelimiter(headerLine) {
// 		const candidates = [',','\t',';','|'];
// 		let best = ',', bestCount = 0;
// 		for (const d of candidates) {
// 			// Use quote-aware splitting to count fields reliably
// 			const count = splitCSVLine(headerLine, d).length;
// 			if (count > bestCount) { best = d; bestCount = count; }
// 		}
// 		return best;
// 	}
// 	function stripBOM(s) { return s.replace(/^\uFEFF/, ''); }
// 	function splitCsvRecords(text) {
// 		const records = [];
// 		let cur = '';
// 		let inQuotes = false;
// 		for (let i=0;i<text.length;i++) {
// 			const ch = text[i];
// 			if (ch === '"') {
// 				// handle escaped quotes inside quoted fields
// 				if (inQuotes && i+1 < text.length && text[i+1] === '"') { cur += '""'; i++; continue; }
// 				inQuotes = !inQuotes; cur += '"'; continue;
// 			}
// 			if (ch === '\n') {
// 				if (inQuotes) { cur += '\n'; }
// 				else { records.push(cur.replace(/\r$/, '')); cur = ''; }
// 				continue;
// 			}
// 			cur += ch;
// 		}
// 		if (cur.length) records.push(cur.replace(/\r$/, ''));
// 		return records;
// 	}
// 	function parseSimpleCSV(text) {
// 		const lines = splitCsvRecords(stripBOM(text).trim());
// 		if (!lines.length) return null;
// 		const delim = detectDelimiter(lines[0]);
// 		const headerRaw = splitCSVLine(lines[0], delim);
// 		const headerNorm = headerRaw.map(h => h.replace(/^"|"$/g,'').trim());
// 		const stepIdx = findStepCol(headerNorm) !== -1 ? findStepCol(headerNorm) : 0;
// 		function findMetricIndex(cols, patterns) {
// 			const lower = cols.map(c => c.toLowerCase());
// 			for (const p of patterns) {
// 				const idx = lower.findIndex(h => h.includes(p));
// 				if (idx !== -1) return idx;
// 			}
// 			return -1;
// 		}
// 		let depthIdx = findMetricIndex(headerNorm, ['depth','vision','rgb','disagg','teacher depth','depth teacher','success_depth','depth_mean','depth mean','in_success_region_depth']);
// 		let stateIdx = findMetricIndex(headerNorm, ['state','proprio','teacher state','state teacher','success_state','state_mean','state mean']);
// 		// If neither found, try auto-picking two most numeric columns (excluding step)
// 		if (depthIdx === -1 && stateIdx === -1) {
// 			const numCounts = new Array(headerNorm.length).fill(0);
// 			const limit = Math.min(lines.length, 200);
// 			for (let i=1;i<limit;i++) {
// 				const parts = splitCSVLine(lines[i], delim);
// 				for (let c=0;c<parts.length;c++) {
// 					if (c === stepIdx) continue;
// 					const v = Number(String(parts[c] || '').replace(/%/g,'').trim());
// 					if (Number.isFinite(v)) numCounts[c]++;
// 				}
// 			}
// 			const candidates = numCounts
// 				.map((count, idx) => ({ idx, count }))
// 				.filter(o => o.idx !== stepIdx)
// 				.sort((a,b) => b.count - a.count);
// 			if (candidates.length) depthIdx = candidates[0].idx;
// 			if (candidates.length > 1) stateIdx = candidates[1].idx;
// 		}
// 		const x = [], yd = [], ys = [], ydStd = [], ysStd = [];
// 		for (let i=1;i<lines.length;i++) {
// 			const parts = splitCSVLine(lines[i], delim);
// 			if (parts.length < 2) continue;
// 			const num = (v) => Number(String(v || '').replace(/%/g,'').trim());
// 			x.push(num(parts[Math.min(stepIdx, parts.length-1)]));
// 			if (depthIdx >= 0 && depthIdx < parts.length) yd.push(num(parts[depthIdx]));
// 			if (stateIdx >= 0 && stateIdx < parts.length) ys.push(num(parts[stateIdx]));
// 			// std columns optional: try common suffixes if present
// 			const lower = headerNorm.map(h => h.toLowerCase());
// 			const dStdIdx = lower.findIndex(h => h.includes('depth_std') || h.includes('depth std'));
// 			const sStdIdx = lower.findIndex(h => h.includes('state_std') || h.includes('state std'));
// 			if (dStdIdx !== -1 && dStdIdx < parts.length) ydStd.push(num(parts[dStdIdx]));
// 			if (sStdIdx !== -1 && sStdIdx < parts.length) ysStd.push(num(parts[sStdIdx]));
// 		}
// 		return { x, yd, ys, ydStd: ydStd.length? ydStd : null, ysStd: ysStd.length? ysStd : null };
// 	}
// 	function parseWithNamedCols(text, stepName, depthName, stateName) {
// 		const lines = splitCsvRecords(stripBOM(text).trim());
// 		if (!lines.length) return null;
// 		const delim = detectDelimiter(lines[0]);
// 		const headerRaw = splitCSVLine(lines[0], delim).map(h => h.replace(/^"|"$/g,''));
// 		const lower = headerRaw.map(h => h.toLowerCase());
// 		const idxStep = lower.indexOf(stepName.toLowerCase());
// 		const idxDepth = lower.indexOf(depthName.toLowerCase());
// 		const idxState = lower.indexOf(stateName.toLowerCase());
// 		if (idxStep === -1 || idxDepth === -1 || idxState === -1) return null;
// 		const num = (v) => Number(String(v || '').replace(/%/g,'').trim());
// 		const x = [], yd = [], ys = [];
// 		for (let i=1;i<lines.length;i++) {
// 			const parts = splitCSVLine(lines[i], delim);
// 			if (parts.length <= Math.max(idxStep, idxDepth, idxState)) continue;
// 			x.push(num(parts[idxStep]));
// 			yd.push(num(parts[idxDepth]));
// 			ys.push(num(parts[idxState]));
// 		}
// 		return { x, yd, ys };
// 	}
// 	function findStepCol(cols) {
// 		const cands = ["Step","_step","step","global_step","steps","iteration","iter","epoch","timestep"];
// 		const lower = cols.map(c => c.toLowerCase());
// 		for (const c of cands) { const i = lower.indexOf(c.toLowerCase()); if (i !== -1) return i; }
// 		return -1;
// 	}
// 	function parseWandbCSV(text) {
// 		const lines = splitCsvRecords(stripBOM(text).trim());
// 		if (!lines.length) return null;
// 		const delim = detectDelimiter(lines[0]);
// 		const headerRaw = splitCSVLine(lines[0], delim);
// 		const header = headerRaw.map(h => h.replace(/^"|"$/g,'').trim());
// 		const stepIdx = findStepCol(header);
// 		const runMap = {};
// 		for (let c=0;c<header.length;c++) {
// 			const name = header[c];
// 			const nameLC = name.toLowerCase();
// 			function add(run, key) { runMap[run] = runMap[run] || {}; runMap[run][key] = c; }
// 			if (nameLC.endsWith(' - in_success_region')) {
// 				add(name.slice(0, -' - in_success_region'.length), 'mean');
// 			  } else if (
// 				nameLC.endsWith(' - in_success_region__min') ||
// 				name.endsWith(' - in_success_region__MIN')
// 			  ) {
// 				add(name.slice(0, -' - in_success_region__min'.length), 'min');
// 			  } else if (
// 				nameLC.endsWith(' - in_success_region__max') ||
// 				name.endsWith(' - in_success_region__MAX')
// 			  ) {
// 				add(name.slice(0, -' - in_success_region__max'.length), 'max');
// 			  }
			
			
// 		}
// 		const depthRuns = [], stateRuns = [];
// 		for (const run in runMap) {
// 		const low = run.toLowerCase();
// 		// Match Python: "disagg" => vision-based teacher line,
// 		// everything else => state-based teacher line.
// 		if (low.includes('disagg')) depthRuns.push(runMap[run]);
// 		else stateRuns.push(runMap[run]);
// 		}
// 		// for (const run in runMap) {
// 		// 	const low = run.toLowerCase();
// 		// 	if (low.includes('depth') || low.includes('vision') || low.includes('rgb') || low.includes('disagg') || low.includes('deep')) depthRuns.push(runMap[run]);
// 		// 	else if (low.includes('state') || low.includes('proprio')) stateRuns.push(runMap[run]);
// 		// 	else depthRuns.push(runMap[run]);
// 		// }
// 		if (!depthRuns.length && !stateRuns.length) return null;
// 		const x = [], yd = [], ys = [];
// 		for (let i=1;i<lines.length;i++) {
// 			const parts = splitCSVLine(lines[i], delim);
// 			if (!parts.length) continue;
// 			const num = (v) => Number(String(v || '').replace(/%/g,'').trim());
// 			const step = (stepIdx !== -1 && stepIdx < parts.length) ? num(parts[stepIdx]) : (i - 1);
// 			let dVals = [], sVals = [];
// 			for (const r of depthRuns) { const idx = r.mean; if (idx != null && idx < parts.length) { const v = num(parts[idx]); if (!Number.isNaN(v)) dVals.push(v); } }
// 			for (const r of stateRuns) { const idx = r.mean; if (idx != null && idx < parts.length) { const v = num(parts[idx]); if (!Number.isNaN(v)) sVals.push(v); } }
// 							if (dVals.length || sVals.length) {
// 					x.push(step);
// 					yd.push(dVals.length ? dVals.reduce((a,b)=>a+b,0)/dVals.length*100 : NaN);
// 					ys.push(sVals.length ? sVals.reduce((a,b)=>a+b,0)/sVals.length*100 : NaN);
// 				}
// 			}
// 			return { x, yd, ys };
// 		}
// 	function ema(series, s) {
// 		if (!s || s <= 0) return series.slice();
// 		const out = new Array(series.length); let last = NaN;
// 		for (let i=0;i<series.length;i++) {
// 			const v = series[i];
// 			if (Number.isNaN(v)) { out[i] = last; continue; }
// 			out[i] = Number.isNaN(last) ? v : s*last + (1-s)*v; last = out[i];
// 		}
// 		return out;
// 	}
// 	function downsampleStride(x, y, maxPoints) {
// 		const n = Math.min(x.length, y.length);
// 		if (n <= maxPoints) return { x: x.slice(0, n), y: y.slice(0, n) };
// 		const stride = Math.ceil(n / maxPoints);
// 		const xd = [], yd = [];
// 		for (let i=0;i<n;i+=stride) { xd.push(x[i]); yd.push(y[i]); }
// 		return { x: xd, y: yd };
// 	}
// 	function renderLineChart(svg, data) {
// 		const s = svg; s.innerHTML='';
// 		const W = 900, H = 260; const m = { l: 48, r: 14, t: 8, b: 28 };
// 		const innerW = W - m.l - m.r, innerH = H - m.t - m.b;
// 		// filter to finite pairs
// 		function finitePairs(x, y) {
// 			const fx = [], fy = [];
// 			for (let i=0;i<Math.min(x.length, y.length);i++) {
// 				const xv = x[i], yv = y[i];
// 				if (Number.isFinite(xv) && Number.isFinite(yv)) { fx.push(xv); fy.push(yv); }
// 			}
// 			return { x: fx, y: fy };
// 		}
// 		const dDepth = finitePairs(data.xd || [], data.yd || []);
// 		const dState = finitePairs(data.xs || [], data.ys || []);
// 		if (dDepth.x.length === 0 && dState.x.length === 0) {
// 			addLabel(s, 24, 24, 'No valid numeric points found in CSV');
// 			return;
// 		}
// 		const allX = [].concat(dDepth.x, dState.x);
// 		const allY = [].concat(dDepth.y, dState.y);
// 		const xmin = Math.min(...allX);
// 		const xmax = Math.max(...allX);
// 		const ymin = Math.min(...allY);
// 		const ymax = Math.max(...allY);
// 		function sx(v) { return m.l + (v - xmin) * innerW / (xmax - xmin || 1); }
// 		function sy(v) { return m.t + innerH - (v - ymin) * innerH / (ymax - ymin || 1); }
// 		// axes
// 		createSvgEl(s, 'line', { x1: m.l, y1: m.t, x2: m.l, y2: m.t+innerH, stroke: '#cbd5e1', 'stroke-width': 1, 'stroke-opacity': 0.6 });
// 		createSvgEl(s, 'line', { x1: m.l, y1: m.t+innerH, x2: m.l+innerW, y2: m.t+innerH, stroke: '#cbd5e1', 'stroke-width': 1, 'stroke-opacity': 0.6 });
// 		// grid (light)
// 		for (let i=1;i<=4;i++) {
// 			const yy = m.t + innerH - (i*innerH/5);
// 			createSvgEl(s, 'line', { x1: m.l, y1: yy, x2: m.l+innerW, y2: yy, stroke: '#e2e8f0', 'stroke-width': 1, 'stroke-opacity': 0.4 });
// 		}
// 		function pathFrom(xa, ya) {
// 			if (xa.length === 0) return '';
// 			let d = '';
// 			for (let i=0;i<xa.length;i++) {
// 				const px = sx(xa[i]), py = sy(ya[i]);
// 				d += (i===0? 'M' : 'L') + px + ' ' + py + ' ';
// 			}
// 			return d;
// 		}
// 		const pathDepth = pathFrom(dDepth.x, dDepth.y);
// 		const pathState = pathFrom(dState.x, dState.y);
// 		if (pathDepth) createSvgEl(s, 'path', { d: pathDepth, fill: 'none', stroke: '#16a34a', 'stroke-width': 2 });
// 		if (pathState) createSvgEl(s, 'path', { d: pathState, fill: 'none', stroke: '#f59e0b', 'stroke-width': 2 });
// 		// legend
// 		createSvgEl(s, 'rect', { x: W-180, y: m.t+8, width: 8, height: 8, fill: '#16a34a' });
// 		addLabel(s, W-166, m.t+16, 'Depth teacher');
// 		createSvgEl(s, 'rect', { x: W-180, y: m.t+28, width: 8, height: 8, fill: '#f59e0b' });
// 		addLabel(s, W-166, m.t+36, 'State teacher');
// 	}
// 	async function setupResultsChart() {
// 		const svg = document.getElementById('chart-sim-depth-vs-state');
// 		if (!svg) return;
// 		try {
// 			const src = svg.getAttribute('data-src') || 'assets/data/sim_depth_vs_state.csv';
// 			const smooth = parseFloat(svg.getAttribute('data-smooth') || '0');
// 			const stepCol = svg.getAttribute('data-step');
// 			const depthCol = svg.getAttribute('data-depth');
// 			const stateCol = svg.getAttribute('data-state');
// 			const debug = svg.getAttribute('data-debug') === '1';
// 			const res = await fetch(src, { cache: 'no-store' });
// 			if (!res.ok) throw new Error('not found');
// 			const text = await res.text();
// 			let parsed = null;
// 			if (stepCol && depthCol && stateCol) parsed = parseWithNamedCols(text, stepCol, depthCol, stateCol);
// 			if (!parsed || (!parsed.yd?.length && !parsed.ys?.length)) parsed = parseSimpleCSV(text);
// 			if (!parsed || (!parsed.yd?.length && !parsed.ys?.length)) parsed = parseWandbCSV(text);
// 			if (!parsed || (!parsed.yd?.length && !parsed.ys?.length)) throw new Error('empty');
// 			// optional smoothing (W&B-like EMA)
// 			// const ydSm = ema(parsed.yd, smooth);
// 			// const ysSm = ema(parsed.ys, smooth);
// 			const ydSm = ema(parsed.yd, smooth).map(v => Number.isFinite(v) ? v * 100 : v);
// 			const ysSm = ema(parsed.ys, smooth).map(v => Number.isFinite(v) ? v * 100 : v);
// 			// fallback: if step is non-numeric, use index
// 			let steps = parsed.x.slice(0, Math.max(ydSm.length, ysSm.length));
// 			const hasFiniteStep = steps.some(v => Number.isFinite(v));
// 			if (!hasFiniteStep) steps = Array.from({ length: Math.max(ydSm.length, ysSm.length) }, (_, i) => i);
// 			const dsDepth = downsampleStride(steps, ydSm, 800);
// 			const dsState = downsampleStride(steps, ysSm, 800);
// 			renderLineChart(svg, { xd: dsDepth.x, yd: dsDepth.y, xs: dsState.x, ys: dsState.y });
// 			if (debug) console.log('Parsed points:', { depth: dsDepth.x.length, state: dsState.x.length }, 'Example steps:', steps.slice(0,5));
// 		} catch (e) {
// 			// Placeholder message
// 			svg.innerHTML = '';
// 			addLabel(svg, 24, 24, 'Set data-src on the SVG to your CSV or place one at assets/data/sim_depth_vs_state.csv. Supported: step,depth,state or W&B in_success_region columns. Optional: data-smooth="0.9"');
// 		}
// 	}

// 	if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => { setupMethod(); setupResultsChart(); }); }
// 	else { setupMethod(); setupResultsChart(); }
// })(); 

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
	function addCenteredLabel(s, cx, cy, text) { const t = createSvgEl(s, 'text', { x: cx, y: cy, fill: '#334155', 'font-size': '13', 'font-family': 'Inter, system-ui', 'text-anchor': 'middle', 'dominant-baseline': 'middle' }); t.textContent = text; return t; }

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
		const pad = 40; const gpuW = 220, gpuH = 110, gap = 24; const y = 100;
		function rect(x, y, w, h, fill) { return createSvgEl(s, 'rect', { x:x, y:y, width:w, height:h, rx:10, fill: fill, stroke: DP_COLORS.border, 'stroke-width': 1 }); }
		const x0 = pad, x1 = x0 + gpuW + gap, x2 = x1 + gpuW + gap, x3 = x2 + gpuW + gap;
		const replicas = [x0, x1, x2, x3].map((x, i) => { rect(x, y, gpuW, gpuH, '#ffffff'); rect(x+16, y+10, 188, 28, DP_COLORS.sim); addCenteredLabel(s, x+16+188/2, y+10+28/2, 'Environment'); rect(x+16, y+44, 188, 26, DP_COLORS.rlbuf); addCenteredLabel(s, x+16+188/2, y+44+26/2, 'RL Buffer'); rect(x+16, y+74, 188, 26, DP_COLORS.net); addCenteredLabel(s, x+16+188/2, y+74+26/2, 'Network'); addLabel(s, x, y-12, `GPU ${i}`); return { x, y }; });
		const centers = replicas.map((r) => ({ x: r.x + 16 + 188/2, y: r.y + 74 + 26/2 }));
		const busY = y + gpuH + 24; const busX1 = Math.min(...centers.map(c => c.x)); const busX2 = Math.max(...centers.map(c => c.x));
		const statusLabel = createSvgEl(s, 'text', { x: (busX1 + busX2) / 2, y: busY + 18, fill: '#334155', 'font-size': '13', 'font-family': 'Inter, system-ui', 'text-anchor': 'middle' });
		statusLabel.textContent = animate ? 'Step Simulation' : 'All-Reduce';
		createSvgEl(s, 'line', { x1: busX1, y1: busY, x2: busX2, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 3, 'stroke-opacity': 0.5 });
		centers.forEach((c) => { createSvgEl(s, 'line', { x1: c.x, y1: c.y + 12, x2: c.x, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 2, 'stroke-opacity': 0.35 }); });
		if (!animate) return;
		function animateUpDown(s, sx, sy, nx, ny, durDown, durUp, delayMs, repeats, token) {
			const startAt = performance.now() + (delayMs||0); const dot = createSvgEl(s, 'circle', { cx: sx, cy: sy, r: 5, fill: DP_COLORS.packet, opacity: 0.95 });
			function lerp(a,b,t){ return a+(b-a)*t; }
			function run(now){ if (token !== METHOD_TOKEN) { dot.remove(); return; } if (now < startAt) { requestAnimationFrame(run); return; } const t1 = Math.min(1, (now - startAt) / durDown); dot.setAttribute('cx', lerp(sx, nx, t1)); dot.setAttribute('cy', lerp(sy, ny, t1)); if (t1 < 1) { requestAnimationFrame(run); return; } dot.setAttribute('fill', '#7c78ea'); const backStart = performance.now(); function back(now2){ if (token !== METHOD_TOKEN) { dot.remove(); return; } const t2 = Math.min(1, (now2 - backStart) / durUp); dot.setAttribute('cx', lerp(nx, sx, t2)); dot.setAttribute('cy', lerp(ny, sy, t2)); if (t2 < 1) { requestAnimationFrame(back); return; } dot.remove(); if (repeats > 1) { setTimeout(() => { if (token !== METHOD_TOKEN) return; animateUpDown(s, sx, sy, nx, ny, durDown, durUp, 0, repeats-1, token); }, 120); } } requestAnimationFrame(back); } requestAnimationFrame(run); }
		const downDur = 588, upDur = 588;
		replicas.forEach((r) => { const sx = r.x + 16 + 188/2, sy = r.y + 10 + 28/2; const nx = r.x + 16 + 188/2, ny = r.y + 74 + 26/2; animateUpDown(s, sx, sy, nx, ny, 588, 588, 0, 3, token); });
		const totalCycle = (downDur + upDur) * 3; setTimeout(() => { if (token !== METHOD_TOKEN) return; 
			statusLabel.textContent = 'All-Reduce';
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
		const s = svg; s.innerHTML=''; const pad = 40; const gpuW = 220; const gpuH = 110; const gap = 24; const yRow = 120;
		function rect(x, y, w, h, fill) { return createSvgEl(s, 'rect', { x:x, y:y, width:w, height:h, rx:10, fill: fill, stroke: DP_COLORS.border, 'stroke-width': 1 }); }
		const x0 = pad, x1 = x0 + gpuW + gap, x2 = x1 + gpuW + gap, x3 = x2 + gpuW + gap;
		[x0, x1, x2].forEach((x, i) => { rect(x, yRow, gpuW, gpuH, '#ffffff'); rect(x+16, yRow+10, 188, 90, DP_COLORS.sim); addCenteredLabel(s, x+16+188/2, yRow+10+90/2, 'Environment'); addLabel(s, x, yRow-12, `Sim GPU ${i}`); });
		rect(x3, yRow, gpuW, gpuH, '#ffffff'); const NET_H = 36, BUF_H = 36; const net = rect(x3+16, yRow+16, 188, NET_H, DP_COLORS.net); addCenteredLabel(s, x3+16+188/2, yRow+16+NET_H/2, 'Network'); const buf = rect(x3+16, yRow+60, 188, BUF_H, DP_COLORS.rlbuf); addCenteredLabel(s, x3+16+188/2, yRow+60+BUF_H/2, 'RL Buffer'); addLabel(s, x3, yRow-12, 'RL GPU');
		const centersEnv = [x0, x1, x2].map((x) => ({ x: x + 16 + 188/2, y: yRow + 10 + 90/2 })); const centerNet = { x: x3 + 16 + 188/2, y: yRow + 16 + NET_H/2 };
		const tapsX = [...centersEnv.map(c => c.x), centerNet.x]; const busY = yRow + gpuH + 24; const busX1 = Math.min(...tapsX); const busX2 = Math.max(...tapsX);
		createSvgEl(s, 'line', { x1: busX1, y1: busY, x2: busX2, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 3, 'stroke-opacity': 0.5 });
		// Vertical taps that touch the bottom edges of the blocks
		const envBottomY = yRow + 10 + 90; // bottom edge of Environment blocks
		const netBottomY = yRow + 16 + NET_H; // bottom edge of Network block
		const rlTopY = yRow + 60; // top edge of RL Buffer
		const rlBottomY = yRow + 60 + BUF_H; // bottom edge of RL Buffer
		centersEnv.forEach((c) => { createSvgEl(s, 'line', { x1: c.x, y1: envBottomY, x2: c.x, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 2, 'stroke-opacity': 0.35 }); });
		// Split RL GPU tap around buffer
		createSvgEl(s, 'line', { x1: centerNet.x, y1: netBottomY, x2: centerNet.x, y2: rlTopY, stroke: DP_COLORS.allreduce, 'stroke-width': 2, 'stroke-opacity': 0.35 });
		createSvgEl(s, 'line', { x1: centerNet.x, y1: rlBottomY, x2: centerNet.x, y2: busY, stroke: DP_COLORS.allreduce, 'stroke-width': 2, 'stroke-opacity': 0.35 });
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

	/* Results chart loader */
	function splitCSVLine(line, delim) {
		const out = []; let field = ''; let inQuotes = false;
		for (let i=0;i<line.length;i++) {
			const c = line[i];
			if (c === '"') {
				if (inQuotes && i+1 < line.length && line[i+1] === '"') { field += '"'; i++; }
				else { inQuotes = !inQuotes; }
				continue;
			}
			if (c === delim && !inQuotes) { out.push(field); field = ''; continue; }
			field += c;
		}
		out.push(field);
		return out.map(v => v.trim());
	}
	function detectDelimiter(headerLine) {
		const candidates = [',','\t',';','|'];
		let best = ',', bestCount = 0;
		for (const d of candidates) {
			// Use quote-aware splitting to count fields reliably
			const count = splitCSVLine(headerLine, d).length;
			if (count > bestCount) { best = d; bestCount = count; }
		}
		return best;
	}
	function stripBOM(s) { return s.replace(/^\uFEFF/, ''); }
	function splitCsvRecords(text) {
		const records = [];
		let cur = '';
		let inQuotes = false;
		for (let i=0;i<text.length;i++) {
			const ch = text[i];
			if (ch === '"') {
				// handle escaped quotes inside quoted fields
				if (inQuotes && i+1 < text.length && text[i+1] === '"') { cur += '""'; i++; continue; }
				inQuotes = !inQuotes; cur += '"'; continue;
			}
			if (ch === '\n') {
				if (inQuotes) { cur += '\n'; }
				else { records.push(cur.replace(/\r$/, '')); cur = ''; }
				continue;
			}
			cur += ch;
		}
		if (cur.length) records.push(cur.replace(/\r$/, ''));
		return records;
	}
	function parseSimpleCSV(text) {
		const lines = splitCsvRecords(stripBOM(text).trim());
		if (!lines.length) return null;
		const delim = detectDelimiter(lines[0]);
		const headerRaw = splitCSVLine(lines[0], delim);
		const headerNorm = headerRaw.map(h => h.replace(/^"|"$/g,'').trim());
		const stepIdx = findStepCol(headerNorm) !== -1 ? findStepCol(headerNorm) : 0;
		function findMetricIndex(cols, patterns) {
			const lower = cols.map(c => c.toLowerCase());
			for (const p of patterns) {
				const idx = lower.findIndex(h => h.includes(p));
				if (idx !== -1) return idx;
			}
			return -1;
		}
		let depthIdx = findMetricIndex(headerNorm, ['depth','vision','rgb','disagg','teacher depth','depth teacher','success_depth','depth_mean','depth mean','in_success_region_depth']);
		let stateIdx = findMetricIndex(headerNorm, ['state','proprio','teacher state','state teacher','success_state','state_mean','state mean']);
		// If neither found, try auto-picking two most numeric columns (excluding step)
		if (depthIdx === -1 && stateIdx === -1) {
			const numCounts = new Array(headerNorm.length).fill(0);
			const limit = Math.min(lines.length, 200);
			for (let i=1;i<limit;i++) {
				const parts = splitCSVLine(lines[i], delim);
				for (let c=0;c<parts.length;c++) {
					if (c === stepIdx) continue;
					const v = Number(String(parts[c] || '').replace(/%/g,'').trim());
					if (Number.isFinite(v)) numCounts[c]++;
				}
			}
			const candidates = numCounts
				.map((count, idx) => ({ idx, count }))
				.filter(o => o.idx !== stepIdx)
				.sort((a,b) => b.count - a.count);
			if (candidates.length) depthIdx = candidates[0].idx;
			if (candidates.length > 1) stateIdx = candidates[1].idx;
		}
		const x = [], yd = [], ys = [], ydStd = [], ysStd = [];
		for (let i=1;i<lines.length;i++) {
			const parts = splitCSVLine(lines[i], delim);
			if (parts.length < 2) continue;
			const num = (v) => Number(String(v || '').replace(/%/g,'').trim());
			x.push(num(parts[Math.min(stepIdx, parts.length-1)]));
			if (depthIdx >= 0 && depthIdx < parts.length) yd.push(num(parts[depthIdx]));
			if (stateIdx >= 0 && stateIdx < parts.length) ys.push(num(parts[stateIdx]));
			// std columns optional: try common suffixes if present
			const lower = headerNorm.map(h => h.toLowerCase());
			const dStdIdx = lower.findIndex(h => h.includes('depth_std') || h.includes('depth std'));
			const sStdIdx = lower.findIndex(h => h.includes('state_std') || h.includes('state std'));
			if (dStdIdx !== -1 && dStdIdx < parts.length) ydStd.push(num(parts[dStdIdx]));
			if (sStdIdx !== -1 && sStdIdx < parts.length) ysStd.push(num(parts[sStdIdx]));
		}
		return { x, yd, ys, ydStd: ydStd.length? ydStd : null, ysStd: ysStd.length? ysStd : null };
	}
	function parseWithNamedCols(text, stepName, depthName, stateName) {
		const lines = splitCsvRecords(stripBOM(text).trim());
		if (!lines.length) return null;
		const delim = detectDelimiter(lines[0]);
		const headerRaw = splitCSVLine(lines[0], delim).map(h => h.replace(/^"|"$/g,''));
		const lower = headerRaw.map(h => h.toLowerCase());
		const idxStep = lower.indexOf(stepName.toLowerCase());
		const idxDepth = lower.indexOf(depthName.toLowerCase());
		const idxState = lower.indexOf(stateName.toLowerCase());
		if (idxStep === -1 || idxDepth === -1 || idxState === -1) return null;
		const num = (v) => Number(String(v || '').replace(/%/g,'').trim());
		const x = [], yd = [], ys = [];
		for (let i=1;i<lines.length;i++) {
			const parts = splitCSVLine(lines[i], delim);
			if (parts.length <= Math.max(idxStep, idxDepth, idxState)) continue;
			x.push(num(parts[idxStep]));
			yd.push(num(parts[idxDepth]));
			ys.push(num(parts[idxState]));
		}
		return { x, yd, ys };
	}
	function findStepCol(cols) {
		const cands = ["Step","_step","step","global_step","steps","iteration","iter","epoch","timestep"];
		const lower = cols.map(c => c.toLowerCase());
		for (const c of cands) { const i = lower.indexOf(c.toLowerCase()); if (i !== -1) return i; }
		return -1;
	}

	// Fixed W&B CSV parser
	function parseWandbCSV(text) {
		const lines = splitCsvRecords(stripBOM(text).trim());
		if (!lines.length) return null;
		const delim = detectDelimiter(lines[0]);
		const headerRaw = splitCSVLine(lines[0], delim);
		const header = headerRaw.map(h => h.replace(/^"|"$/g,'').trim());
		const stepIdx = findStepCol(header);
		
		// Build run map - collect all runs with their mean/min/max columns
		const runMap = {};
		for (let c = 0; c < header.length; c++) {
			const name = header[c];
			
			// Look for W&B export pattern: "runname - in_success_region" with optional __MIN/__MAX
			if (name.endsWith(' - in_success_region')) {
				const runName = name.slice(0, -' - in_success_region'.length);
				if (!runMap[runName]) runMap[runName] = {};
				runMap[runName].mean = c;
			} else if (name.endsWith(' - in_success_region__MIN')) {
				const runName = name.slice(0, -' - in_success_region__MIN'.length);
				if (!runMap[runName]) runMap[runName] = {};
				runMap[runName].min = c;
			} else if (name.endsWith(' - in_success_region__MAX')) {
				const runName = name.slice(0, -' - in_success_region__MAX'.length);
				if (!runMap[runName]) runMap[runName] = {};
				runMap[runName].max = c;
			}
		}
		
		// Separate runs into vision-based (disagg) and state-based
		const visionRuns = [];
		const stateRuns = [];
		
		for (const [runName, columns] of Object.entries(runMap)) {
			// Only include runs that have at least a mean column
			if (!columns.mean) continue;
			
			const runLower = runName.toLowerCase();
			// Match Python logic: "disagg" => vision-based teacher line
			if (runLower.includes('disagg')) {
				visionRuns.push(columns);
			} else {
				stateRuns.push(columns);
			}
		}
		
		if (visionRuns.length === 0 && stateRuns.length === 0) return null;
		
		// Parse data rows and compute averages
		const x = [], yd = [], ys = [];
		
		for (let i = 1; i < lines.length; i++) {
			const parts = splitCSVLine(lines[i], delim);
			if (parts.length === 0) continue;
			
			const num = (v) => {
				if (v === null || v === undefined || v === '') return NaN;
				const cleaned = String(v).replace(/%/g, '').trim();
				return Number(cleaned);
			};
			
			// Get step value
			const step = (stepIdx !== -1 && stepIdx < parts.length) ? num(parts[stepIdx]) : (i - 1);
			
			// Collect values for vision runs (depth/disagg)
			const visionValues = [];
			for (const run of visionRuns) {
				if (run.mean < parts.length) {
					const v = num(parts[run.mean]);
					if (Number.isFinite(v)) visionValues.push(v);
				}
			}
			
			// Collect values for state runs
			const stateValues = [];
			for (const run of stateRuns) {
				if (run.mean < parts.length) {
					const v = num(parts[run.mean]);
					if (Number.isFinite(v)) stateValues.push(v);
				}
			}
			
			// Only add this row if we have at least one valid value
			if (visionValues.length > 0 || stateValues.length > 0) {
				x.push(step);
				
				// Average vision values (convert to percentage)
				if (visionValues.length > 0) {
					const avgVision = visionValues.reduce((a, b) => a + b, 0) / visionValues.length;
					yd.push(avgVision * 100); // Convert to percentage like Python
				} else {
					yd.push(NaN);
				}
				
				// Average state values (convert to percentage)
				if (stateValues.length > 0) {
					const avgState = stateValues.reduce((a, b) => a + b, 0) / stateValues.length;
					ys.push(avgState * 100); // Convert to percentage like Python
				} else {
					ys.push(NaN);
				}
			}
		}
		
		console.log('W&B CSV parsed:', {
			totalRuns: Object.keys(runMap).length,
			visionRuns: visionRuns.length,
			stateRuns: stateRuns.length,
			dataPoints: x.length,
			sampleHeader: header.slice(0, 5),
			sampleRunNames: Object.keys(runMap).slice(0, 3)
		});
		
		return { x, yd, ys };
	}

	function ema(series, s) {
		if (!s || s <= 0) return series.slice();
		const out = new Array(series.length); 
		let last = NaN;
		for (let i = 0; i < series.length; i++) {
			const v = series[i];
			if (Number.isNaN(v)) { 
				out[i] = last; 
				continue; 
			}
			out[i] = Number.isNaN(last) ? v : s * last + (1 - s) * v; 
			last = out[i];
		}
		return out;
	}

	function downsampleStride(x, y, maxPoints) {
		const n = Math.min(x.length, y.length);
		if (n <= maxPoints) return { x: x.slice(0, n), y: y.slice(0, n) };
		const stride = Math.ceil(n / maxPoints);
		const xd = [], yd = [];
		for (let i = 0; i < n; i += stride) { 
			xd.push(x[i]); 
			yd.push(y[i]); 
		}
		return { x: xd, y: yd };
	}

	function renderLineChart(svg, data) {
		const s = svg; s.innerHTML = '';
		const W = 900, H = 260; 
		const m = { l: 60, r: 24, t: 20, b: 40 }; // Increased margins for labels
		const innerW = W - m.l - m.r, innerH = H - m.t - m.b;
		
		// Filter to finite pairs
		function finitePairs(x, y) {
			const fx = [], fy = [];
			for (let i = 0; i < Math.min(x.length, y.length); i++) {
				const xv = x[i], yv = y[i];
				if (Number.isFinite(xv) && Number.isFinite(yv)) { 
					fx.push(xv); 
					fy.push(yv); 
				}
			}
			return { x: fx, y: fy };
		}
		
		const dVision = finitePairs(data.xd || [], data.yd || []);
		const dState = finitePairs(data.xs || [], data.ys || []);
		
		if (dVision.x.length === 0 && dState.x.length === 0) {
			addLabel(s, 24, 24, 'No valid numeric points found in CSV');
			return;
		}
		
		const allX = [].concat(dVision.x, dState.x);
		const allY = [].concat(dVision.y, dState.y);
		const xmin = Math.min(...allX);
		const xmax = Math.max(...allX);
		const ymin = Math.min(0, Math.min(...allY)); // Start y-axis at 0
		const ymax = Math.max(100, Math.max(...allY)); // Ensure y-axis goes to 100%
		
		function sx(v) { return m.l + (v - xmin) * innerW / (xmax - xmin || 1); }
		function sy(v) { return m.t + innerH - (v - ymin) * innerH / (ymax - ymin || 1); }
		
		// Chart background
		createSvgEl(s, 'rect', { x: 0, y: 0, width: W, height: H, fill: '#ffffff' });
		
		// Axes
		createSvgEl(s, 'line', { 
			x1: m.l, y1: m.t, x2: m.l, y2: m.t + innerH, 
			stroke: '#374151', 'stroke-width': 2 
		});
		createSvgEl(s, 'line', { 
			x1: m.l, y1: m.t + innerH, x2: m.l + innerW, y2: m.t + innerH, 
			stroke: '#374151', 'stroke-width': 2 
		});
		
		// Grid lines
		for (let i = 1; i <= 4; i++) {
			const yy = m.t + innerH - (i * innerH / 5);
			createSvgEl(s, 'line', { 
				x1: m.l, y1: yy, x2: m.l + innerW, y2: yy, 
				stroke: '#e5e7eb', 'stroke-width': 1, 'stroke-opacity': 0.5 
			});
			
			// Y-axis labels
			const yValue = ymin + (i * (ymax - ymin) / 5);
			addLabel(s, m.l - 8, yy + 4, yValue.toFixed(0) + '%');
		}
		
		// X-axis labels
		for (let i = 0; i <= 4; i++) {
			const xx = m.l + (i * innerW / 4);
			const xValue = xmin + (i * (xmax - xmin) / 4);
			addLabel(s, xx - 10, m.t + innerH + 20, xValue.toFixed(0));
		}
		
		function pathFrom(xa, ya) {
			if (xa.length === 0) return '';
			let d = '';
			for (let i = 0; i < xa.length; i++) {
				const px = sx(xa[i]), py = sy(ya[i]);
				d += (i === 0 ? 'M' : 'L') + px + ' ' + py + ' ';
			}
			return d;
		}
		
		const pathVision = pathFrom(dVision.x, dVision.y);
		const pathState = pathFrom(dState.x, dState.y);
		
		// Draw lines with colors matching Python script
		if (pathVision) {
			createSvgEl(s, 'path', { 
				d: pathVision, fill: 'none', 
				stroke: '#1f77b4', 'stroke-width': 3 // Blue for vision-based
			});
		}
		if (pathState) {
			createSvgEl(s, 'path', { 
				d: pathState, fill: 'none', 
				stroke: '#d62728', 'stroke-width': 3 // Red for state-based
			});
		}
		
		// Axis labels
		addLabel(s, m.l + innerW / 2 - 20, H - 5, 'Training Steps');
		
		// Y-axis label (rotated)
		const yLabelGroup = createSvgEl(s, 'g', { transform: `translate(15, ${m.t + innerH / 2})` });
		const yLabel = createSvgEl(yLabelGroup, 'text', { 
			fill: '#374151', 'font-size': '14', 'font-family': 'Inter, system-ui', 
			'text-anchor': 'middle', transform: 'rotate(-90)' 
		});
		yLabel.textContent = '% in success region';
		
		// Title
		addLabel(s, W / 2 - 150, 15, 'Performance of Vision-based vs State-based Teachers');
		
		// Legend
		const legendY = m.t + 8;
		if (pathVision) {
			createSvgEl(s, 'line', { 
				x1: W - 200, y1: legendY, x2: W - 180, y2: legendY, 
				stroke: '#1f77b4', 'stroke-width': 3 
			});
			addLabel(s, W - 175, legendY + 4, 'Vision-based teacher');
		}
		if (pathState) {
			createSvgEl(s, 'line', { 
				x1: W - 200, y1: legendY + 20, x2: W - 180, y2: legendY + 20, 
				stroke: '#d62728', 'stroke-width': 3 
			});
			addLabel(s, W - 175, legendY + 24, 'State-based teacher');
		}
	}

	async function setupResultsChart() {
		const svg = document.getElementById('chart-sim-depth-vs-state');
		if (!svg) return;
		
		// If the chart element is an IMG, set src only if provided via data-src or missing.
		if (svg.tagName && svg.tagName.toLowerCase() === 'img') {
			const current = svg.getAttribute('src');
			const ds = svg.getAttribute('data-src');
			const imgSrc = ds || current || 'assets/img/sim_depth_vs_state.png';
			if (!current || ds) svg.setAttribute('src', imgSrc);
			return;
		}
		try {
			const src = svg.getAttribute('data-src') || 'assets/data/sim_depth_vs_state.csv';
			const smooth = parseFloat(svg.getAttribute('data-smooth') || '0.95'); // Default to 0.95 like Python
			const stepCol = svg.getAttribute('data-step');
			const depthCol = svg.getAttribute('data-depth');
			const stateCol = svg.getAttribute('data-state');
			const debug = svg.getAttribute('data-debug') === '1';
			const res = await fetch(src, { cache: 'no-store' });
			if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
			const text = await res.text();
			
			let parsed = null;
			if (stepCol && depthCol && stateCol) {
				parsed = parseWithNamedCols(text, stepCol, depthCol, stateCol);
			}
			
			if (!parsed || (!parsed.yd?.some(v => Number.isFinite(v)) && !parsed.ys?.some(v => Number.isFinite(v)))) {
				parsed = parseWandbCSV(text);
			}
			
			if (!parsed || (!parsed.yd?.some(v => Number.isFinite(v)) && !parsed.ys?.some(v => Number.isFinite(v)))) {
				parsed = parseSimpleCSV(text);
			}
			
			if (!parsed || (!parsed.yd?.some(v => Number.isFinite(v)) && !parsed.ys?.some(v => Number.isFinite(v)))) {
				throw new Error('No valid data found in CSV');
			}
			
			// Apply EMA smoothing like W&B
			const ydSm = ema(parsed.yd || [], smooth);
			const ysSm = ema(parsed.ys || [], smooth);
			
			// Use step data or generate indices
			let steps = parsed.x?.slice(0, Math.max(ydSm.length, ysSm.length)) || [];
			if (steps.length === 0 || !steps.some(v => Number.isFinite(v))) {
				steps = Array.from({ length: Math.max(ydSm.length, ysSm.length) }, (_, i) => i);
			}
			
			// Downsample for performance
			const dsVision = downsampleStride(steps, ydSm, 800);
			const dsState = downsampleStride(steps, ysSm, 800);
			
			renderLineChart(svg, { 
				xd: dsVision.x, yd: dsVision.y, 
				xs: dsState.x, ys: dsState.y 
			});
			
			if (debug) {
				console.log('Chart rendered successfully:', {
					visionPoints: dsVision.x.length,
					statePoints: dsState.x.length,
					smoothing: smooth,
					sampleSteps: steps.slice(0, 5),
					sampleVision: ydSm.slice(0, 5),
					sampleState: ysSm.slice(0, 5)
				});
			}
			
		} catch (e) {
			console.error('Chart loading failed:', e);
			svg.innerHTML = '';
			addLabel(svg, 24, 24, `Error loading chart: ${e.message}`);
			addLabel(svg, 24, 44, 'Please check your CSV file format and data-src attribute.');
		}
	}

	if (document.readyState === 'loading') { 
		document.addEventListener('DOMContentLoaded', () => { 
			setupMethod(); 
			setupResultsChart(); 
		}); 
	} else { 
		setupMethod(); 
		setupResultsChart(); 
	}
})();