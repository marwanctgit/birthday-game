# 🎂 Birthday Game

A small birthday adventure for your phone: an intro, four levels, and a final birthday message at the end.

- **Level 1:** "How well do you know us?" quiz. Wrong answers get a teasing reply and she tries again.
- **Level 2:** tap scrambled words into the right sentence. Hint and reset buttons included.
- **Level 3:** open three cards: 💌 Letter, 🎁 Gift and ❤️ Us (photos and inside jokes).
- **Level 4:** tap to unlock the message.
- **Final screen:** "Happy Birthday" with your message, photo, special dates, video and gift link.

It's plain HTML, CSS and JavaScript. There's no backend, no tracking and no analytics, and it never contacts another website. Fonts are bundled locally. Her progress is saved only in her own browser, so a reload doesn't lose her place.

```
birthday-game/
├── index.html      page structure
├── config.js       ✏️ ALL your text, photos, dates, music (edit this one)
├── script.js       game logic (no need to touch)
├── style.css       design (colours are at the top, under :root)
└── assets/
    ├── images/     your photos
    ├── audio/      your song
    ├── fonts/      bundled fonts
    └── icons/      tab icon
```

---

## 1. Run it locally

Opening `index.html` by double-clicking works. A small local server is closer to how GitHub Pages behaves:

```bash
cd ~/birthday-game
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

To try it on your phone, connect the phone to the same Wi-Fi, run `python3 -m http.server 8000 --bind 0.0.0.0`, and open `http://<your-computer's-IP>:8000` on the phone.

**Handy while editing:**

| Add to the URL | What it does |
|---|---|
| `?reset` | clears saved progress and starts fresh |
| `?level=quiz` / `puzzle` / `paths` / `unlock` / `final` | jumps straight to that screen |

For example, <http://localhost:8000/?level=final> previews the final screen.

When you run it locally, a small reminder pops up while `config.js` still says `HER NAME`. It never appears on the live site.

---

## 2. Her name (and yours)

In `config.js`:

```js
girlfriendName: "HER NAME",
myName: "Marwan",
```

Anywhere in `config.js` you can write `{name}` or `{myName}` and it's filled in automatically, e.g. `finalSubtitle: "for {name}"`.

---

## 3. Quiz questions

In `config.js`, under `gameData.questions`:

```js
{
    question: "What is one thing I always do that makes you laugh?",
    options: ["My terrible jokes 🙈", "My dance moves 💃", "My voice notes 🎙️", "All of the above"],
    correct: 3,                                // first option is 0
    rightReply: "Exactly. I'm hilarious 😌",
    wrongReply: ["Close! 😏", "Try again 😄"],  // a list = picked at random
    photo: "assets/images/q1.jpg",             // optional
},
```

- `correct: 2` means one right answer (counting from 0).
- `correct: [0, 2]` means several answers are right.
- `correct: "any"` means every answer is right, good for trick questions like "Who fell in love first?"

Add or remove as many questions as you like. The "Question 1 of N" counter updates itself.

**The scrambled sentence (Level 2):** change `gameData.puzzle.sentence` and `reveal`. Keep the sentence to 5–9 words so it fits on a phone.

**The three cards (Level 3):** edit `gameData.paths.letter`, `.gift` and `.us`.

---

## 4. Photos

1. Put your photos in `assets/images/`.
2. List them in `config.js`:

```js
finalPhoto: "assets/images/final.jpg",     // above the final message

photos: [                                   // the "❤️ Us" card
    { src: "assets/images/photo1.jpg", caption: "Our first photo together" },
    { src: "assets/images/photo2.jpg", caption: "That day we couldn't stop laughing" },
],
```

- A missing photo in the "Us" card shows a soft heart placeholder. A missing `finalPhoto` is simply hidden.
- File names are **case-sensitive** on GitHub Pages: `Photo1.JPG` ≠ `photo1.jpg`.
- Phone photos are often 3–5 MB, so shrink them to about 1200 px wide first. It will load much faster on mobile data.

`insideJokes` shows as little sticky notes in the same card.

---

## 5. The final message

In `config.js`:

```js
finalTitle: "Happy Birthday, My Love ❤️",

finalMessage: `
    I wish I could be there beside you today.
    Even though we're far apart, I wanted to create a little place that belongs only to us.

    Thank you for being you.
`,

signature: "Always yours,\n{myName}",
```

A blank line starts a new paragraph. Paragraphs fade in one after another. Indentation doesn't matter.

**Optional extras on the final screen:**

```js
specialDates: [
    { label: "The day we met", date: "2024-02-14" },   // shows "… days ago", counted live
],
finalVideo: "https://www.youtube.com/watch?v=...",      // or "assets/video/us.mp4"
giftLink: { url: "https://...", label: "Open your real gift 🎁" },
```

Leave any of them empty (`""` or `[]`) and it simply doesn't appear. YouTube videos use YouTube's privacy-enhanced embed.

---

## 6. Music

1. Put an `.mp3` in `assets/audio/` named `song.mp3`, or change `music.src` in `config.js`.
2. That's it. A 🔇 **Music** button appears in the top-right corner.

Music **never autoplays**. Phones block that anyway, so she turns it on herself. Without a song file, the button stays hidden and everything else works normally.

---

## 7. Put it online with GitHub Pages

> ⚠️ **Privacy first.** A GitHub Pages site is public: anyone with the link can open it. On a free GitHub account the repository must also be **public** for Pages to work, so your photos and messages will be visible on your GitHub profile too. The page tells search engines not to index it (`noindex`), but that's only a request. If that's a concern, keep private photos out of it, or use a private repo with GitHub Pro (the *site* is still public by link, but the *source* isn't).

1. Create a repository on your personal account at <https://github.com/new>:
   - Owner: **marwanctgit**
   - Name: `birthday-game`
   - Don't add a README or .gitignore (this project already has them).
2. Push the project:

   ```bash
   cd ~/birthday-game
   git remote add origin https://github.com/marwanctgit/birthday-game.git
   git remote -v            # double-check it says marwanctgit/birthday-game
   git push -u origin main
   ```

3. On GitHub, open the repo → **Settings** → **Pages**.
   Under **Build and deployment**, pick **Deploy from a branch** → `main` / `/ (root)` → **Save**.
4. After a minute or two it's live at:
   **https://marwanctgit.github.io/birthday-game/**

To update it later, edit `config.js`, then:

```bash
git add -A && git commit -m "Update message" && git push
```

GitHub Pages refreshes within a minute or two. Force-refresh on the phone if you don't see the change.

**Link preview:** when you send the link in WhatsApp or iMessage, the preview shows the page title *"A little something for you ❤️"*. Change it in `index.html` (`<title>` and `og:title`) if you want something else.

---

## ✅ Checklist before you send it

- [ ] `girlfriendName` set (the local reminder toast is gone)
- [ ] Quiz questions and answers are yours
- [ ] Puzzle sentence and reveal
- [ ] Letter and gift card texts
- [ ] Photos added (or `photos: []` / `finalPhoto: ""` to hide them)
- [ ] Inside jokes, or `insideJokes: []`
- [ ] Final message and signature
- [ ] Played it once start to finish **on your own phone** (add `?reset` to the link to replay from the start)

Progress is saved per browser, so your test runs never affect what she sees. She starts fresh on her phone.
