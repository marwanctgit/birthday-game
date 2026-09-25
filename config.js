/* ==========================================================================
   ✏️  EDIT THIS FILE TO MAKE THE GAME YOURS
   --------------------------------------------------------------------------
   Everything she reads lives here — you never need to touch script.js.

   • Anywhere in the text you can write {name} (her name) or {myName} (yours).
   • Image / audio / video paths are relative to this folder,
     e.g. "assets/images/us-at-the-beach.jpg".
   • Leave a value as "" (empty) to hide that feature completely.
   • Missing files are fine: a missing photo shows a soft placeholder,
     missing music simply hides the music button.
   ========================================================================== */

const birthdayConfig = {
    girlfriendName: "HER NAME",
    myName: "Marwan",

    // Final screen
    finalTitle: "Happy Birthday, My Love ❤️",
    finalSubtitle: "for {name}",

    // Blank lines start a new paragraph. Indentation doesn't matter.
    finalMessage: `
        I wish I could be there beside you today.
        Even though we're far apart, I wanted to create a little place that belongs only to us.

        Thank you for being you.

        Happy Birthday, my love. ❤️
    `,

    signature: "Always yours,\n{myName}",

    // Optional small line at the very bottom of the final screen.
    ps: "P.S. Tap the title for more confetti 🎉",

    // One photo shown above the final message ("" = none).
    finalPhoto: "assets/images/final.jpg",

    // Photos for the "❤️ Us" card. Add as many as you like.
    photos: [
        { src: "assets/images/photo1.jpg", caption: "Our first photo together" },
        { src: "assets/images/photo2.jpg", caption: "That day we couldn't stop laughing" },
        { src: "assets/images/photo3.jpg", caption: "My favourite picture of you" },
    ],

    // Little sticky notes shown in the "❤️ Us" card.
    insideJokes: [
        "\"Five more minutes\" 😴",
        "The famous voice-note saga 🎙️",
        "You know exactly what this one means 😂",
    ],

    // Shown on the final screen with a live "days ago" count.
    // Date format: "YYYY-MM-DD"
    specialDates: [
        // { label: "The day we met", date: "2024-02-14" },
        // { label: "Our first call", date: "2024-03-01" },
    ],

    // Optional video on the final screen: a file (assets/video/our-video.mp4)
    // or a YouTube link (https://www.youtube.com/watch?v=...).
    finalVideo: "",

    // Optional gift button on the final screen (e.g. a voucher or booking link).
    giftLink: {
        url: "",
        label: "Open your real gift 🎁",
    },

    // Background music. Put an .mp3 in assets/audio/ and point to it here.
    // Music never autoplays — she turns it on with the 🔊 button.
    music: {
        src: "assets/audio/song.mp3",
        volume: 0.6,
    },
};

const gameData = {
    intro: {
        lines: [
            "Hey you... ❤️",
            "I made something for you.",
            "But there's a little challenge...",
            "You have to unlock your birthday surprise.",
        ],
        button: "Start the adventure →",
    },

    /* ---------------- LEVEL 1 — How well do you know us? ----------------
       correct:  the index of the right option (first option = 0),
                 a list of indexes if several are right, e.g. [0, 2],
                 or "any" if every answer is right.
       rightReply / wrongReply: a sentence, or a list to pick from at random.
       photo:    optional image shown above the question.
       Wrong answers never end the game — she just tries again. */
    questions: [
        {
            question: "What is one thing I always do that makes you laugh?",
            options: ["My terrible jokes 🙈", "My dance moves 💃", "My voice notes 🎙️", "All of the above, obviously"],
            correct: 3,
            rightReply: "Exactly. I'm hilarious, you're welcome 😌",
            wrongReply: ["Hmm... that's only part of it 😏", "Close! But think bigger 😄"],
        },
        {
            question: "If I could teleport right now, where would I go?",
            options: ["Right next to you 🫶", "A beach at sunset 🌅", "Our favourite café ☕", "The moon 🌙"],
            correct: 0,
            rightReply: "Always. Anywhere, as long as it's next to you ❤️",
            wrongReply: ["Nice... but not without you 🙃", "Try again — think closer 👀"],
        },
        {
            question: "Who fell in love first?",
            options: ["Me 🙋‍♂️", "You 🙋‍♀️", "We'll never agree on this 😂"],
            correct: "any",
            rightReply: "Trick question. It was me. But I'll let you believe whatever you want 😌❤️",
        },
        {
            question: "What do I think every time your name lights up my phone?",
            options: ["\"Finally!\" 😍", "\"Uh oh, what did I do?\" 😅", "\"My favourite person\" ❤️", "\"Maybe later\" 😴"],
            correct: [0, 2],
            rightReply: "Every single time 🥹",
            wrongReply: ["Excuse me?! Never 😤", "Wrong! Try again, cutie 😏"],
        },
    ],
    quizComplete: {
        title: "You know us so well 🥹",
        text: "Level 1 complete. Ready for the next one?",
        button: "Next level →",
    },

    /* ---------------- LEVEL 2 — The scrambled sentence ----------------
       She taps the words into the right order. Keep it to 5–9 words
       so it fits nicely on a phone. */
    puzzle: {
        sentence: "Every little memory with you is special",
        reveal: "...and I can't wait to make a million more with you. ✨",
        button: "Next level →",
    },

    /* ---------------- LEVEL 3 — Choose your path ----------------
       She opens all three cards before moving on. */
    paths: {
        letter: {
            icon: "💌",
            label: "Letter",
            title: "A little letter",
            message: `
                If you're reading this, it means you've been paying attention. 😌

                I just wanted to say: you make ordinary days feel like something worth remembering.
            `,
        },
        gift: {
            icon: "🎁",
            label: "Gift",
            title: "A tiny gift",
            message: `
                Your real surprise is waiting at the very end...

                But for now, here's a lifetime supply of my terrible jokes. No returns accepted. 🎀
            `,
        },
        us: {
            icon: "❤️",
            label: "Us",
            title: "Us",
            message: "A few of my favourite moments...",
        },
        allOpened: "Now there's only one thing left...",
        button: "Go to the final level →",
    },

    /* ---------------- LEVEL 4 — The final unlock ---------------- */
    unlock: {
        lines: ["You've made it this far...", "One last thing."],
        button: "Unlock my message ❤️",
    },
};
