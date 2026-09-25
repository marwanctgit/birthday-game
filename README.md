# 🎂 Birthday Game — for Ahyyaa

**Live link:** https://marwanctgit.github.io/birthday-game/

A small birthday adventure for your phone: an intro, four levels, and a final birthday message at the end.

- **Level 1:** "How well do you know us?" quiz. Wrong answers get a teasing reply and she tries again.
- **Level 2:** tap scrambled words into the right sentence. Hint and reset buttons included.
- **Level 3:** open three cards: 💌 Letter, 🎁 Gift and ❤️ Us.
- **Level 4:** tap to unlock the message.
- **Final screen:** "Happy Birthday, My Love ❤️" and the full message.

It's plain HTML, CSS and JavaScript. There's no backend, no tracking and no analytics, and it never contacts another website. Fonts are bundled locally. Her progress is saved only in her own browser, so a reload doesn't lose her place.

```
birthday-game/
├── index.html      page structure
├── config.js       ✏️ ALL the text she reads (edit this one)
├── script.js       game logic (no need to touch)
├── style.css       design (colours are at the top, under :root)
└── assets/
    ├── audio/      the two music-box tracks
    ├── fonts/      bundled fonts
    └── icons/      tab icon
tools/make_music.py generates the music (not needed to run the game)
```

---

## Change the words

Everything she reads is in **`config.js`**:

| What | Where in `config.js` |
|---|---|
| Her name / your name | `girlfriendName`, `myName` |
| Intro lines | `gameData.intro.lines` |
| Quiz questions | `gameData.questions` |
| Scrambled sentence and what it reveals | `gameData.puzzle` |
| Letter / Gift / Us card texts | `gameData.paths` |
| Little notes in the "Us" card | `insideJokes` |
| Final title, message, signature, P.S. | `finalTitle`, `finalMessage`, `signature`, `ps` |

Anywhere in the text you can write `{name}` (her name) or `{myName}` (yours).

**Quiz answers:** `correct: 0` means the first option is right. `correct: [2, 3]` means several are right. `correct: "any"` means every option is right, for trick questions.

**Final message:** a blank line starts a new paragraph. Paragraphs fade in one after another.

**Optional extras** are all off by default. Fill one in to switch it on:

- `specialDates`: shows e.g. "The day we met · … days ago"
- `giftLink`: a button to a voucher or booking
- `finalVideo`: a YouTube link

Photos are switched off. The comment in `config.js` shows how to add them later if you change your mind.

---

## Music

Two original music-box tracks come with the game. They play only after she taps **🔇 Music** (top right), which glows with a small tip on the intro so she notices it.

- `assets/audio/music-box.mp3`: a gentle original melody that loops in the background.
- `assets/audio/happy-birthday.mp3`: a music-box "Happy Birthday" that starts the moment she taps **Unlock my message**, then the loop comes back.

Both were synthesised by `tools/make_music.py` (numpy + ffmpeg). Nothing is copyrighted, and the "Happy Birthday" tune is in the public domain. Music pauses when she leaves the page.

To switch music off, set `music.src` to `""` in `config.js`.

---

## Preview locally

```bash
cd ~/birthday-game
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

| Add to the URL | What it does |
|---|---|
| `?reset` | clears saved progress and starts fresh |
| `?level=quiz` / `puzzle` / `paths` / `unlock` / `final` | jumps straight to that screen |

These work on the live link too. Progress is saved per browser, so your test runs never affect what she sees.

---

## Publish a change

```bash
cd ~/birthday-game
git add -A && git commit -m "Update message" && git push
```

GitHub Pages refreshes within a minute or two. Force-refresh on the phone if you don't see the change.

The repository is **public**, so anyone who finds it on your GitHub profile can read the messages. The page asks search engines not to index it.

**Link preview:** when you send the link in WhatsApp or iMessage, the preview shows *"A little something for you ❤️"*. Change it in `index.html` (`<title>` and `og:title`) if you like.
