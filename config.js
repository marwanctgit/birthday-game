/* ==========================================================================
   ✏️  EDIT THIS FILE TO CHANGE ANYTHING SHE READS
   --------------------------------------------------------------------------
   Everything she reads lives here — you never need to touch script.js.

   • Anywhere in the text you can write {name} (her name) or {myName} (yours).
   • Leave a value as "" (empty) or [] to hide that feature completely.
   ========================================================================== */

const birthdayConfig = {
    girlfriendName: "Ahyyaa",
    myName: "Marwan",

    // Final screen
    finalTitle: "Happy Birthday, My Love ❤️",
    finalSubtitle: "for {name}",

    // Blank lines start a new paragraph. Indentation doesn't matter.
    finalMessage: `
        I wish I could be there beside you today.
        Even though we're far apart, I wanted to create a little place that belongs only to us.

        Today the whole world celebrates the day you were born, but I think I'm the one who got the real gift: you. Out of everyone in this world, I somehow get to love you, and I will never stop being grateful for that.

        If I could give you just one thing this birthday, it would be the chance to see yourself through my eyes. Then you'd finally understand how beautiful you are, inside and out, and how much brighter everything is simply because you're in it.

        I hope this year is gentle with you. I hope it brings you every dream you've been quietly holding onto, endless reasons to smile, and so much love that you never once doubt how special you are.

        And I promise you this: one day I won't be sending you birthday wishes from miles away. I'll be right there beside you, holding you close, singing terribly, watching you blow out your candles, and falling for you all over again.

        Until that day comes, know that you are loved more than words, or this little game, could ever say.

        Happy Birthday, my love. ❤️
    `,

    signature: "Always yours,\n{myName}",

    // Small line at the very bottom of the final screen.
    ps: "P.S. Tap the title for more confetti 🎉",

    // Photos are turned off. (To add some later: put files in assets/images/
    // and list them like { src: "assets/images/us.jpg", caption: "..." }.)
    finalPhoto: "",
    photos: [],

    // Little notes shown in the "❤️ Us" card.
    insideJokes: [
        "Your smile, even through a screen 📱",
        "The way you make the distance feel small 🌍",
        "Your laugh 😄",
        "How you make bad days better 🌤️",
        "Talking to you about nothing for hours 🌙",
        "Just... you ❤️",
    ],

    // Shown on the final screen with a live "days ago" count. Format "YYYY-MM-DD".
    specialDates: [
        // { label: "The day we met", date: "2024-02-14" },
    ],

    // Optional video on the final screen (a file path or a YouTube link).
    finalVideo: "",

    // Optional gift button on the final screen (e.g. a voucher or booking link).
    giftLink: {
        url: "",
        label: "Open your real gift 🎁",
    },

    // Music never autoplays: she turns it on with the 🔇 Music button.
    // Both tracks are original music-box recordings made for this game
    // (tools/make_music.py). Set src to "" to switch music off.
    music: {
        src: "assets/audio/music-box.mp3",          // loops softly in the background
        finale: "assets/audio/happy-birthday.mp3",   // plays when she unlocks the message
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
       Wrong answers never end the game — she just tries again. */
    questions: [
        {
            question: "What's my favourite notification?",
            options: ["A message from you 💬", "Low battery warning 🔋", "My food delivery arriving 🍕", "My 6am alarm ⏰"],
            correct: 0,
            rightReply: "Obviously. My phone lights up and so do I 😌",
            wrongReply: ["Excuse me?! Try again 😤", "Wrong! Think harder, cutie 😏"],
        },
        {
            question: "How much do I miss you right now?",
            options: ["A little 🤏", "A normal amount 🙂", "Way more than I'll ever admit 🙈", "More than the distance between us 🌍"],
            correct: [2, 3],
            rightReply: "Exactly that. Don't tell anyone 🤫❤️",
            wrongReply: ["A LITTLE?! Try again 😤", "Not even close. Aim higher 📈"],
        },
        {
            question: "Who's the cutest person in this relationship?",
            options: ["{myName} 🙋‍♂️", "{name} 🙋‍♀️", "It's a tie 🤝"],
            correct: 1,
            rightReply: "Correct. And honestly, it's not even close 😍",
            wrongReply: ["Sweet, but wrong 😌 Try again", "Nope. The answer is obvious 👀", "No ties allowed. Try again 😏"],
        },
        {
            question: "Who fell in love first?",
            options: ["{name} 🙋‍♀️", "{myName} 🙋‍♂️", "We'll never agree on this 😂"],
            correct: "any",
            rightReply: "Trick question. It was me. But I'll let you believe whatever you want 😌❤️",
        },
        {
            question: "What's the first thing I'll do when I see you again?",
            options: ["Hug you and not let go 🫂", "Tell you that you look tired 😴", "Check my phone 📱", "Complain about the traffic 🚗"],
            correct: 0,
            rightReply: "And I mean it. You're not escaping for a while 🫶",
            wrongReply: ["Wow. That's what you think of me? 😂 Try again", "Never! Try again 😤"],
        },
    ],
    quizComplete: {
        title: "You know us so well 🥹",
        text: "Level 1 complete. I'm impressed... but not surprised.",
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
                My dearest {name},

                Some days the distance between us feels impossibly big. Then I hear your voice, or see your name light up my phone, and suddenly you feel close enough to touch.

                I don't think you realise how much you mean to me. You're the first thing I think about when I wake up and the last thing on my mind before I sleep. When something good happens, you're the one I want to tell. When things get hard, you're the one who makes everything feel okay again.

                Thank you for loving me across all these miles. For your patience, your warmth, and for choosing us, every single day.

                I can't wait for the day "goodnight" doesn't come through a screen, when I can just hold your hand and never have to let go.

                Until then, remember this: wherever you are, my heart is right there with you.

                Yours, always and completely,
                {myName} ❤️
            `,
        },
        gift: {
            icon: "🎁",
            label: "Gift",
            title: "A tiny gift",
            message: `
                Your real surprise is waiting at the very end...

                But for now, here's a coupon: one very long hug, redeemable the next time I see you. No expiry date. 🎀
            `,
        },
        us: {
            icon: "❤️",
            label: "Us",
            title: "Us",
            message: "A few of my favourite things about you...",
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
