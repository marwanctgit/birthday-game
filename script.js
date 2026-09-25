/* ==========================================================================
   Birthday Game — game logic
   All the words, photos and settings live in config.js; you shouldn't
   need to edit this file to personalise the game.
   ========================================================================== */

(function () {
    "use strict";

    var cfg = typeof birthdayConfig !== "undefined" ? birthdayConfig : {};
    var game = typeof gameData !== "undefined" ? gameData : {};

    var SCREENS = ["intro", "quiz", "puzzle", "paths", "unlock", "final"];
    var LEVELS = ["quiz", "puzzle", "paths", "unlock"];
    var PATH_KEYS = ["letter", "gift", "us"];
    var STORAGE_KEY = "birthday-game-progress-v1";
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------------------------------------------------------- helpers */

    function $(id) { return document.getElementById(id); }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = text;
        return node;
    }

    // Replaces {name} and {myName} in any config text.
    function fmt(text) {
        if (text === undefined || text === null) return "";
        return String(text)
            .replace(/\{name\}/g, cfg.girlfriendName || "")
            .replace(/\{myName\}/g, cfg.myName || "");
    }

    function pick(value) {
        if (Array.isArray(value)) return value[Math.floor(Math.random() * value.length)];
        return value;
    }

    function shuffle(list) {
        var a = list.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function wait(ms) { return reducedMotion ? Math.min(ms, 150) : ms; }

    // Turns a multi-line config message into paragraphs. Blank lines split
    // paragraphs; single line breaks are kept. Indentation is ignored.
    function renderParagraphs(container, text) {
        container.textContent = "";
        var blocks = fmt(text).split("\n").map(function (l) { return l.trim(); }).join("\n")
            .split(/\n{2,}/).map(function (b) { return b.trim(); }).filter(Boolean);
        blocks.forEach(function (block, i) {
            var p = el("p");
            p.style.setProperty("--i", i);
            block.split("\n").forEach(function (line, j) {
                if (j) p.appendChild(document.createElement("br"));
                p.appendChild(document.createTextNode(line));
            });
            container.appendChild(p);
        });
        return blocks.length;
    }

    var toastTimer;
    function toast(message, ms) {
        var t = $("toast");
        t.textContent = message;
        t.classList.add("is-on");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, ms || 2600);
    }

    function restartAnimation(node) {
        node.style.animation = "none";
        void node.offsetWidth;
        node.style.animation = "";
    }

    function centerOf(node) {
        var r = node.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    /* --------------------------------------------------------------- progress
       Saved in this browser only (localStorage) so a reload doesn't lose her
       place. Nothing is ever sent anywhere. */

    function freshState() {
        return { screen: "intro", quizIndex: 0, puzzleSolved: false, opened: [] };
    }

    function loadState() {
        var s = freshState();
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            if (saved && SCREENS.indexOf(saved.screen) !== -1) {
                s.screen = saved.screen;
                s.quizIndex = Math.max(0, parseInt(saved.quizIndex, 10) || 0);
                s.puzzleSolved = saved.puzzleSolved === true;
                s.opened = Array.isArray(saved.opened)
                    ? saved.opened.filter(function (k) { return PATH_KEYS.indexOf(k) !== -1; })
                    : [];
            }
        } catch (e) { /* storage blocked or corrupt: start fresh */ }
        return s;
    }

    function saveState() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    }

    function resetState() {
        state = freshState();
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    }

    var state = loadState();

    /* --------------------------------------------------------------- confetti */

    var confetti = (function () {
        var canvas = $("confetti");
        var ctx = canvas.getContext("2d");
        var COLORS = ["#ffd6dc", "#f5a9b8", "#f3cf94", "#fff4ef", "#e98fa1", "#d8b8ff"];
        var parts = [];
        var running = false;
        var rainUntil = 0;
        var last = 0;
        var W = 0, H = 0;

        function resize() {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener("resize", resize);

        function start() {
            if (running) return;
            running = true;
            last = performance.now();
            requestAnimationFrame(tick);
        }

        function particle(x, y, vx, vy, opts) {
            return {
                x: x, y: y, vx: vx, vy: vy,
                size: (opts.size || 7) * (0.7 + Math.random() * 0.8),
                rot: Math.random() * Math.PI * 2,
                vr: (Math.random() - 0.5) * 0.3,
                color: pick(COLORS),
                shape: pick(opts.shapes || ["heart", "rect", "rect", "circle"]),
                gravity: opts.gravity === undefined ? 0.2 : opts.gravity,
                drag: opts.drag || 0.985,
                sway: opts.sway || 0,
                life: 0,
                ttl: (opts.ttl || 110) * (0.7 + Math.random() * 0.6)
            };
        }

        function burst(x, y, opts) {
            opts = opts || {};
            var count = opts.count || 80;
            if (reducedMotion) count = Math.min(count, 14);
            var power = opts.power || 9;
            for (var i = 0; i < count; i++) {
                var a = Math.random() * Math.PI * 2;
                var s = power * (0.3 + Math.random() * 0.7);
                parts.push(particle(x, y, Math.cos(a) * s, Math.sin(a) * s - power * 0.4, opts));
            }
            start();
        }

        function rain(ms) {
            if (reducedMotion) return;
            rainUntil = performance.now() + ms;
            start();
        }

        function drawHeart(s) {
            ctx.beginPath();
            ctx.moveTo(0, s * 0.35);
            ctx.bezierCurveTo(-s * 0.9, -s * 0.2, -s * 0.45, -s * 0.85, 0, -s * 0.3);
            ctx.bezierCurveTo(s * 0.45, -s * 0.85, s * 0.9, -s * 0.2, 0, s * 0.35);
            ctx.fill();
        }

        function tick(now) {
            var dt = Math.min((now - last) / 16.67, 3);
            last = now;

            if (now < rainUntil && parts.length < 220) {
                for (var r = 0; r < 2; r++) {
                    parts.push(particle(Math.random() * W, -20, (Math.random() - 0.5) * 1.2, 1 + Math.random() * 2,
                        { gravity: 0.03, drag: 0.995, sway: 0.6, ttl: 420, size: 8, shapes: ["heart", "heart", "rect", "circle"] }));
                }
            }

            ctx.clearRect(0, 0, W, H);
            for (var i = parts.length - 1; i >= 0; i--) {
                var p = parts[i];
                p.life += dt;
                p.vx *= Math.pow(p.drag, dt);
                p.vy = p.vy * Math.pow(p.drag, dt) + p.gravity * dt;
                p.x += (p.vx + Math.sin((p.life + i) * 0.05) * p.sway) * dt;
                p.y += p.vy * dt;
                p.rot += p.vr * dt;
                if (p.life > p.ttl || p.y > H + 40) { parts.splice(i, 1); continue; }

                ctx.save();
                ctx.globalAlpha = Math.min(1, (p.ttl - p.life) / (p.ttl * 0.3));
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = p.color;
                if (p.shape === "heart") drawHeart(p.size * 1.6);
                else if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2); ctx.fill(); }
                else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                ctx.restore();
            }

            if (parts.length || now < rainUntil) {
                requestAnimationFrame(tick);
            } else {
                running = false;
                ctx.clearRect(0, 0, W, H);
            }
        }

        return { burst: burst, rain: rain };
    })();

    /* ------------------------------------------------------------ background */

    function buildSky() {
        var sky = $("sky");
        var small = window.innerWidth < 600;
        var i, node;
        for (i = 0; i < (small ? 26 : 44); i++) {
            node = el("span", "star");
            var size = 1 + Math.random() * 2;
            node.style.width = node.style.height = size + "px";
            node.style.left = Math.random() * 100 + "%";
            node.style.top = Math.random() * 70 + "%";
            node.style.setProperty("--dur", (3 + Math.random() * 4) + "s");
            node.style.setProperty("--delay", (-Math.random() * 6) + "s");
            sky.appendChild(node);
        }
        for (i = 0; i < (small ? 9 : 14); i++) {
            node = el("span", "float-heart");
            node.style.left = Math.random() * 100 + "%";
            node.style.setProperty("--size", (10 + Math.random() * 18) + "px");
            node.style.setProperty("--dur", (16 + Math.random() * 14) + "s");
            node.style.setProperty("--delay", (-Math.random() * 30) + "s");
            node.style.setProperty("--sway", ((Math.random() - 0.5) * 80) + "px");
            node.style.setProperty("--alpha", (0.18 + Math.random() * 0.3).toFixed(2));
            sky.appendChild(node);
        }
    }

    /* ------------------------------------------------------------- navigation */

    var current = null;
    var setup = {};
    var enter = {};

    function go(name) {
        var next = $("screen-" + name);
        var prev = current ? $("screen-" + current) : null;
        if (!next || prev === next) return;

        closeModal(true);
        current = name;
        if (name !== "intro") { state.screen = name; saveState(); }
        updateProgress(name);
        setup[name]();

        function show() {
            next.classList.add("is-active");
            window.scrollTo(0, 0);
            if (enter[name]) enter[name]();
        }

        if (prev) {
            prev.classList.remove("is-active");
            prev.classList.add("is-leaving");
            setTimeout(function () {
                prev.classList.remove("is-leaving");
                show();
            }, wait(340));
        } else {
            show();
        }
    }

    function updateProgress(name) {
        var bar = $("progress");
        var level = LEVELS.indexOf(name);
        bar.hidden = level === -1;
        Array.prototype.forEach.call(bar.children, function (li, i) {
            li.classList.toggle("is-done", i < level);
        });
    }

    function markLevelDone(name) {
        var li = $("progress").children[LEVELS.indexOf(name)];
        if (li) li.classList.add("is-done");
    }

    // Staggered fade-in lines, used on the intro and unlock screens.
    function renderLines(container, lines, startDelay, step) {
        container.textContent = "";
        (lines || []).forEach(function (line, i) {
            var p = el("p", "intro-line", fmt(line));
            p.style.animationDelay = (startDelay + i * step) + "s";
            container.appendChild(p);
        });
        return startDelay + (lines || []).length * step;
    }

    /* ------------------------------------------------------------------ intro */

    var introTimer;
    var intro = game.intro || {};

    setup.intro = function () {
        var total = renderLines($("introLines"), intro.lines, 0.3, 1.1);
        var resuming = state.screen !== "intro";
        $("startBtn").textContent = resuming ? "Continue where you left off ✨" : fmt(intro.button || "Start →");
        $("restartBtn").hidden = !resuming;

        var actions = $("introActions");
        actions.classList.remove("is-on");
        clearTimeout(introTimer);
        introTimer = setTimeout(function () { actions.classList.add("is-on"); }, wait((total + 0.3) * 1000));
    };

    // Tapping during the intro skips straight to the button.
    $("screen-intro").addEventListener("click", function (e) {
        if (e.target.closest("button")) return;
        Array.prototype.forEach.call($("introLines").children, function (p) { p.style.animationDelay = "0s"; });
        clearTimeout(introTimer);
        $("introActions").classList.add("is-on");
    });

    $("startBtn").addEventListener("click", function () {
        go(state.screen !== "intro" ? state.screen : "quiz");
    });

    $("restartBtn").addEventListener("click", function () {
        resetState();
        go("quiz");
    });

    /* ------------------------------------------------------- level 1: quiz */

    var questions = (game.questions || []).filter(function (q) {
        return q && q.question && Array.isArray(q.options) && q.options.length;
    });
    var quizLocked = false;

    function isRight(q, index) {
        if (q.correct === "any") return true;
        if (Array.isArray(q.correct)) return q.correct.indexOf(index) !== -1;
        return q.correct === index;
    }

    function renderQuestion() {
        var q = questions[state.quizIndex];
        quizLocked = false;
        $("quizDone").hidden = true;
        $("quizBody").hidden = false;
        $("quizContinue").hidden = true;
        $("quizCounter").textContent = "Question " + (state.quizIndex + 1) + " of " + questions.length;

        var photo = $("quizPhoto");
        photo.hidden = true;
        photo.onload = function () { photo.hidden = false; };
        photo.onerror = function () { photo.hidden = true; };
        if (q.photo) photo.src = q.photo; else photo.removeAttribute("src");

        $("quizQuestion").textContent = fmt(q.question);
        var fb = $("quizFeedback");
        fb.textContent = "";
        fb.className = "feedback";

        var box = $("quizOptions");
        box.textContent = "";
        box.classList.remove("is-locked");
        q.options.forEach(function (text, i) {
            var btn = el("button", "option", fmt(text));
            btn.type = "button";
            btn.style.animationDelay = (i * 70) + "ms";
            btn.addEventListener("click", function () { answer(btn, i); });
            box.appendChild(btn);
        });
    }

    function answer(btn, index) {
        if (quizLocked) return;
        var q = questions[state.quizIndex];
        var fb = $("quizFeedback");

        if (isRight(q, index)) {
            quizLocked = true;
            btn.classList.add("is-right");
            $("quizOptions").classList.add("is-locked");
            fb.className = "feedback is-right";
            fb.textContent = fmt(pick(q.rightReply) || "Yes! ❤️");
            var c = centerOf(btn);
            confetti.burst(c.x, c.y, { count: 28, power: 6, shapes: ["heart"], ttl: 70 });

            state.quizIndex++;
            saveState();
            var cont = $("quizContinue");
            cont.textContent = state.quizIndex < questions.length ? "Next question →" : "Continue →";
            cont.hidden = false;
        } else {
            btn.classList.add("is-wrong");
            btn.disabled = true;
            fb.className = "feedback is-wrong";
            fb.textContent = fmt(pick(q.wrongReply) || "Not quite... try again 😏");
        }
        restartAnimation(fb);
    }

    function showQuizDone() {
        var done = game.quizComplete || {};
        $("quizBody").hidden = true;
        $("quizCounter").textContent = "Complete";
        $("quizDoneTitle").textContent = fmt(done.title || "You know us so well 🥹");
        $("quizDoneText").textContent = fmt(done.text || "");
        $("quizNext").textContent = fmt(done.button || "Next level →");
        $("quizDone").hidden = false;
        markLevelDone("quiz");
    }

    setup.quiz = function () {
        if (state.quizIndex >= questions.length) showQuizDone();
        else renderQuestion();
    };

    $("quizContinue").addEventListener("click", function () {
        if (state.quizIndex < questions.length) {
            renderQuestion();
        } else {
            showQuizDone();
            var c = centerOf($("quizDoneTitle"));
            confetti.burst(c.x, c.y, { count: 70 });
        }
    });

    $("quizNext").addEventListener("click", function () { go("puzzle"); });

    /* ----------------------------------------------------- level 2: puzzle */

    var puzzle = game.puzzle || {};
    var words = String(puzzle.sentence || "").trim().split(/\s+/).filter(Boolean);
    var placed = [];        // indexes into `words`, in the order she tapped them
    var poolChips = {};     // word index -> chip in the pool
    var puzzleBusy = false;

    function norm(w) { return w.toLowerCase(); }

    function correctPrefix() {
        var n = 0;
        while (n < placed.length && norm(words[placed[n]]) === norm(words[n])) n++;
        return n;
    }

    function setPuzzleFeedback(text, kind) {
        var fb = $("puzzleFeedback");
        fb.className = "feedback" + (kind ? " is-" + kind : "");
        fb.textContent = text;
        restartAnimation(fb);
    }

    function place(k, restoring) {
        if (puzzleBusy || placed.indexOf(k) !== -1) return;
        placed.push(k);
        poolChips[k].classList.add("is-used");
        var chip = el("button", "chip", words[k]);
        chip.type = "button";
        chip.dataset.k = k;
        chip.addEventListener("click", function () { unplace(k); });
        $("puzzleAnswer").appendChild(chip);
        if (restoring) return;
        setPuzzleFeedback("");
        if (placed.length === words.length) checkPuzzle();
    }

    function unplace(k) {
        if (puzzleBusy) return;
        var pos = placed.indexOf(k);
        if (pos === -1) return;
        placed.splice(pos, 1);
        poolChips[k].classList.remove("is-used");
        var chip = $("puzzleAnswer").querySelector('[data-k="' + k + '"]');
        if (chip) chip.remove();
    }

    function returnFrom(position) {
        placed.slice(position).forEach(function (k) { unplace(k); });
    }

    function checkPuzzle() {
        var good = correctPrefix();
        if (good === words.length) { solvePuzzle(); return; }

        var answerBox = $("puzzleAnswer");
        answerBox.classList.remove("is-wrong");
        void answerBox.offsetWidth;
        answerBox.classList.add("is-wrong");
        setPuzzleFeedback(good === 0
            ? "Hmm, not quite... try a different first word 💭"
            : "So close! The first " + (good === 1 ? "word is" : good + " words are") + " right ✨", "wrong");

        puzzleBusy = true;
        setTimeout(function () {
            puzzleBusy = false;
            answerBox.classList.remove("is-wrong");
            returnFrom(good);
        }, wait(900));
    }

    function hint() {
        if (puzzleBusy || $("puzzleAnswer").classList.contains("is-solved")) return;
        var good = correctPrefix();
        returnFrom(good);
        var needed = norm(words[good]);
        for (var k = 0; k < words.length; k++) {
            if (placed.indexOf(k) === -1 && norm(words[k]) === needed) {
                place(k);
                break;
            }
        }
        if (placed.length < words.length) setPuzzleFeedback("Here's a little help 💡");
    }

    function solvePuzzle() {
        state.puzzleSolved = true;
        saveState();
        showPuzzleSolved(true);
    }

    function showPuzzleSolved(celebrate) {
        var answerBox = $("puzzleAnswer");
        answerBox.classList.add("is-solved");
        Array.prototype.forEach.call(answerBox.children, function (chip, i) { chip.style.setProperty("--i", i); });
        $("puzzlePool").hidden = true;
        $("puzzleTools").hidden = true;
        $("puzzleSub").textContent = "You did it ✨";
        setPuzzleFeedback("");
        $("puzzleReveal").textContent = fmt(puzzle.reveal || "");
        $("puzzleNext").textContent = fmt(puzzle.button || "Next level →");
        $("puzzleDone").hidden = false;
        markLevelDone("puzzle");
        if (celebrate) {
            var c = centerOf(answerBox);
            confetti.burst(c.x, c.y, { count: 90 });
        }
    }

    setup.puzzle = function () {
        var answerBox = $("puzzleAnswer");
        var pool = $("puzzlePool");
        answerBox.textContent = "";
        answerBox.className = "answer";
        pool.textContent = "";
        pool.hidden = false;
        $("puzzleTools").hidden = false;
        $("puzzleDone").hidden = true;
        $("puzzleSub").textContent = "Tap the words to build the sentence. Tap a word again to send it back.";
        setPuzzleFeedback("");
        placed = [];
        poolChips = {};
        puzzleBusy = false;

        if (!words.length) { showPuzzleSolved(false); return; }

        var order = words.map(function (_, i) { return i; });
        var shuffled = order;
        for (var tries = 0; tries < 20 && words.length > 1; tries++) {
            shuffled = shuffle(order);
            if (shuffled.some(function (k, i) { return norm(words[k]) !== norm(words[i]); })) break;
        }
        shuffled.forEach(function (k) {
            var chip = el("button", "chip", words[k]);
            chip.type = "button";
            chip.addEventListener("click", function () { place(k); });
            poolChips[k] = chip;
            pool.appendChild(chip);
        });

        if (state.puzzleSolved) {
            words.forEach(function (_, k) { place(k, true); });
            showPuzzleSolved(false);
        }
    };

    $("puzzleHint").addEventListener("click", hint);
    $("puzzleReset").addEventListener("click", function () { returnFrom(0); setPuzzleFeedback(""); });
    $("puzzleNext").addEventListener("click", function () { go("paths"); });

    /* ------------------------------------------------ level 3: choose a path */

    var paths = game.paths || {};
    var modalTimers = [];
    var modalReturnFocus = null;

    function allPathsOpened() {
        return PATH_KEYS.every(function (k) { return state.opened.indexOf(k) !== -1; });
    }

    function updatePathsDone(celebrate) {
        var all = allPathsOpened();
        var n = state.opened.length;
        $("pathsSub").textContent = all
            ? "You found everything 💫"
            : n ? n + " of 3 opened. Keep going..." : "Open all three. Each one hides something.";
        $("pathsDoneText").textContent = fmt(paths.allOpened || "");
        $("pathsNext").textContent = fmt(paths.button || "Continue →");
        var wasHidden = $("pathsDone").hidden;
        $("pathsDone").hidden = !all;
        if (all) markLevelDone("paths");
        if (all && wasHidden && celebrate) {
            var c = centerOf($("pathsNext"));
            confetti.burst(c.x, c.y, { count: 60, power: 7 });
        }
    }

    setup.paths = function () {
        var box = $("paths");
        box.textContent = "";
        PATH_KEYS.forEach(function (key) {
            var p = paths[key] || {};
            var card = el("button", "path-card");
            card.type = "button";
            card.dataset.key = key;
            card.appendChild(el("span", "path-icon", p.icon || "✨"));
            card.appendChild(el("span", "path-label", fmt(p.label || key)));
            if (state.opened.indexOf(key) !== -1) card.classList.add("is-opened");
            card.addEventListener("click", function () { openPath(key, card); });
            box.appendChild(card);
        });
        updatePathsDone(false);
    };

    function later(fn, ms) { modalTimers.push(setTimeout(fn, wait(ms))); }

    function openPath(key, card) {
        var p = paths[key] || {};
        var scene = $("modalScene");
        var content = $("modalContent");
        var extra = $("modalExtra");

        modalTimers.forEach(clearTimeout);
        modalTimers = [];
        scene.textContent = "";
        scene.hidden = false;
        extra.textContent = "";
        content.classList.remove("is-on");
        $("modalTitle").textContent = fmt(p.title || p.label || "");
        renderParagraphs($("modalText"), p.message || "");

        if (key === "letter") {
            var env = el("div", "envelope");
            ["envelope-back", "envelope-paper", "envelope-front", "envelope-flap"].forEach(function (c) { env.appendChild(el("div", c)); });
            env.appendChild(el("div", "envelope-seal", "♥"));
            scene.appendChild(env);
            later(function () { env.classList.add("is-open"); }, 500);
            later(function () { content.classList.add("is-on"); }, 1500);
        } else if (key === "gift") {
            var gift = el("div", "giftbox");
            gift.appendChild(el("div", "giftbox-base"));
            gift.appendChild(el("div", "giftbox-lid"));
            scene.appendChild(gift);
            later(function () {
                gift.classList.add("is-open");
                var c = centerOf(gift);
                confetti.burst(c.x, c.y - 30, { count: 50, power: 7, shapes: ["rect", "circle", "heart"] });
            }, 1500);
            later(function () { content.classList.add("is-on"); }, 1900);
        } else {
            var hasPhotos = (cfg.photos || []).some(function (ph) { return ph && ph.src; });
            if (hasPhotos) {
                scene.hidden = true;
            } else {
                // No photos: your two initials meet in the middle with a heart.
                var us = el("div", "us-scene");
                us.appendChild(el("span", "us-initial us-initial--me", initial(cfg.myName)));
                us.appendChild(el("span", "us-heart"));
                us.appendChild(el("span", "us-initial us-initial--you", initial(cfg.girlfriendName)));
                scene.appendChild(us);
            }
            buildUsExtras(extra);
            later(function () { content.classList.add("is-on"); }, hasPhotos ? 100 : 700);
        }

        modalReturnFocus = card;
        $("modal").hidden = false;
        document.body.classList.add("is-locked");
        $("modal").querySelector(".modal-close").focus({ preventScroll: true });

        if (state.opened.indexOf(key) === -1) {
            state.opened.push(key);
            saveState();
        }
        card.classList.add("is-opened");
    }

    function initial(name) {
        var first = String(name || "").trim().charAt(0);
        return first ? first.toUpperCase() : "♥";
    }

    function buildUsExtras(container) {
        var photos = (cfg.photos || []).filter(function (ph) { return ph && ph.src; });
        if (photos.length) {
            var grid = el("div", "polaroids");
            photos.forEach(function (ph, i) {
                var fig = el("figure", "polaroid");
                fig.style.setProperty("--tilt", ((i % 2 ? 1 : -1) * (1.5 + Math.random() * 2.5)).toFixed(1) + "deg");
                fig.style.setProperty("--i", i);
                var img = el("img");
                img.alt = fmt(ph.caption || "");
                img.loading = "lazy";
                img.onerror = function () { img.replaceWith(el("div", "photo-missing", "❤")); };
                img.src = ph.src;
                fig.appendChild(img);
                if (ph.caption) fig.appendChild(el("figcaption", "", fmt(ph.caption)));
                grid.appendChild(fig);
            });
            container.appendChild(grid);
        }

        var jokes = (cfg.insideJokes || []).filter(Boolean);
        if (jokes.length) {
            var notes = el("ul", "notes");
            jokes.forEach(function (j, i) {
                var li = el("li", "", fmt(j));
                li.style.setProperty("--tilt", ((i % 2 ? 1 : -1) * (1 + Math.random() * 2)).toFixed(1) + "deg");
                li.style.setProperty("--i", i);
                notes.appendChild(li);
            });
            container.appendChild(notes);
        }
    }

    function closeModal(silent) {
        var modal = $("modal");
        if (modal.hidden) return;
        modalTimers.forEach(clearTimeout);
        modalTimers = [];
        modal.hidden = true;
        document.body.classList.remove("is-locked");
        if (silent) return;
        if (modalReturnFocus) modalReturnFocus.focus({ preventScroll: true });
        updatePathsDone(true);
    }

    $("modal").addEventListener("click", function (e) {
        if (e.target.closest("[data-close]")) closeModal();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeModal();
    });
    $("pathsNext").addEventListener("click", function () { go("unlock"); });

    /* ------------------------------------------------- level 4: the unlock */

    var unlock = game.unlock || {};

    setup.unlock = function () {
        renderLines($("unlockLines"), unlock.lines, 0.3, 1.2);
        var lock = $("lock");
        lock.className = "lock";
        var btn = $("unlockBtn");
        btn.disabled = false;
        btn.textContent = fmt(unlock.button || "Unlock ❤️");
    };

    $("unlockBtn").addEventListener("click", function () {
        var btn = this;
        var lock = $("lock");
        btn.disabled = true;
        lock.classList.add("is-shaking");
        setTimeout(function () {
            lock.classList.remove("is-shaking");
            lock.classList.add("is-open");
        }, wait(550));
        setTimeout(function () {
            var c = centerOf(lock);
            lock.classList.add("is-gone");
            var flash = $("flash");
            flash.classList.remove("is-on");
            void flash.offsetWidth;
            flash.classList.add("is-on");
            confetti.burst(c.x, c.y, { count: 170, power: 13 });
        }, wait(1150));
        setTimeout(function () { markLevelDone("unlock"); go("final"); }, wait(1900));
    });

    /* ------------------------------------------------------ the final screen */

    function formatDate(d) {
        try {
            return d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
        } catch (e) {
            return d.toDateString();
        }
    }

    function buildDates() {
        var list = $("dates");
        list.textContent = "";
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        (cfg.specialDates || []).forEach(function (item) {
            var m = item && /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(item.date || "").trim());
            if (!m) return;
            var d = new Date(+m[1], +m[2] - 1, +m[3]);
            if (isNaN(d)) return;
            var days = Math.round((today - d) / 86400000);
            var ago = days === 0 ? "today" : days > 0
                ? days.toLocaleString() + (days === 1 ? " day ago" : " days ago")
                : "in " + (-days).toLocaleString() + (days === -1 ? " day" : " days");
            var li = el("li");
            li.appendChild(el("strong", "", fmt(item.label || "")));
            li.appendChild(el("span", "", formatDate(d) + " · " + ago));
            list.appendChild(li);
        });
        list.hidden = !list.children.length;
    }

    function buildVideo() {
        var box = $("finalVideo");
        box.textContent = "";
        box.hidden = true;
        var src = String(cfg.finalVideo || "").trim();
        if (!src) return;

        var yt = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(src);
        if (yt) {
            var frame = el("iframe");
            frame.src = "https://www.youtube-nocookie.com/embed/" + yt[1] + "?rel=0&playsinline=1";
            frame.title = "Video";
            frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
            frame.allowFullscreen = true;
            frame.loading = "lazy";
            box.appendChild(frame);
            box.hidden = false;
            return;
        }

        var video = el("video");
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.onerror = function () { box.hidden = true; };
        video.addEventListener("loadedmetadata", function () { box.hidden = false; });
        video.src = src;
        box.appendChild(video);
    }

    setup.final = function () {
        $("finalTitle").textContent = fmt(cfg.finalTitle || "Happy Birthday ❤️");
        var sub = fmt(cfg.finalSubtitle || "");
        $("finalSubtitle").textContent = sub;
        $("finalSubtitle").hidden = !sub;

        var wrap = $("finalPhotoWrap");
        var photo = $("finalPhoto");
        wrap.hidden = true;
        photo.onload = function () { wrap.hidden = false; };
        photo.onerror = function () { wrap.hidden = true; };
        if (cfg.finalPhoto) photo.src = cfg.finalPhoto; else photo.removeAttribute("src");

        var count = renderParagraphs($("finalMessage"), cfg.finalMessage || "");
        $("finalMessage").hidden = !count;
        $("signature").textContent = fmt(cfg.signature || "");
        document.querySelector(".final").style.setProperty("--delay", (1.4 + count * 0.9 + 0.2) + "s");

        buildDates();
        buildVideo();

        var gift = cfg.giftLink || {};
        var link = $("giftLink");
        link.hidden = !gift.url;
        if (gift.url) {
            link.href = gift.url;
            link.textContent = fmt(gift.label || "Open your gift 🎁");
        }

        var ps = fmt(cfg.ps || "");
        $("ps").textContent = ps;
        $("ps").hidden = !ps;
    };

    enter.final = function () {
        confetti.rain(4500);
    };

    $("finalTitle").addEventListener("click", function () {
        var c = centerOf(this);
        confetti.burst(c.x, c.y, { count: 90, power: 10 });
    });

    $("replayBtn").addEventListener("click", function () {
        resetState();
        go("intro");
    });

    /* ------------------------------------------------------------------ music
       Never autoplays. The button only appears if the song file exists. */

    (function setupMusic() {
        var music = cfg.music || {};
        var src = String(music.src || "").trim();
        var audio = $("bgMusic");
        var btn = $("musicToggle");
        if (!src) return;

        function setOn(on) {
            btn.setAttribute("aria-pressed", on ? "true" : "false");
            btn.querySelector(".music-icon").textContent = on ? "🔊" : "🔇";
            btn.setAttribute("aria-label", on ? "Turn music off" : "Turn music on");
        }
        setOn(false);

        audio.src = src;
        var vol = parseFloat(music.volume);
        if (!isNaN(vol)) audio.volume = Math.max(0, Math.min(1, vol));

        audio.addEventListener("error", function () {
            btn.hidden = true;
            setOn(false);
        });

        if (/^https?:$/.test(location.protocol) && window.fetch) {
            fetch(src, { method: "HEAD", cache: "no-store" })
                .then(function (r) { if (r.ok || r.status === 405) btn.hidden = false; })
                .catch(function () { /* no song: keep the button hidden */ });
        } else {
            audio.preload = "metadata";
            audio.addEventListener("loadedmetadata", function () { btn.hidden = false; }, { once: true });
            audio.load();
        }

        btn.addEventListener("click", function () {
            if (audio.paused) {
                var playing = audio.play();
                setOn(true);
                if (playing && playing.catch) {
                    playing.catch(function () {
                        setOn(false);
                        toast("The song couldn't play 😢");
                    });
                }
            } else {
                audio.pause();
                setOn(false);
            }
        });
    })();

    /* ------------------------------------------------------------------ start */

    buildSky();

    // Handy while editing: add ?reset to the URL to clear saved progress,
    // or ?level=puzzle (quiz / puzzle / paths / unlock / final) to jump ahead.
    var params = new URLSearchParams(location.search);
    if (params.has("reset")) resetState();
    var jump = params.get("level");
    if (params.has("reset") || jump) {
        try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) { /* ignore */ }
    }

    var isLocal = location.protocol === "file:" || /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname);
    if (isLocal && /HER NAME/.test(JSON.stringify(cfg))) {
        setTimeout(function () { toast("✏️ Reminder: put her name in config.js", 4000); }, 1200);
    }

    go(SCREENS.indexOf(jump) > 0 ? jump : "intro");
})();
