"""Generates the game's two music-box tracks (needs numpy + ffmpeg).

    python3 tools/make_music.py

Writes:
  assets/audio/music-box.mp3       an original, gentle loop (~60 s)
  assets/audio/happy-birthday.mp3  a music-box "Happy Birthday" (public domain tune)

Everything is synthesised here, so there are no copyright worries.
"""
import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "audio")
rng = np.random.default_rng(7)

NOTE = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5,
        "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}


def freq(name):
    midi = 12 * (int(name[-1]) + 1) + NOTE[name[:-1]]
    return 440.0 * 2 ** ((midi - 69) / 12)


def tine(f, amp):
    """One plucked music-box tine: quick attack, long bell-like decay."""
    tau = float(np.clip(1.8 * (523.25 / f) ** 0.6, 0.45, 3.0))
    t = np.arange(int(SR * min(tau * 6, 8))) / SR
    body = (np.sin(2 * np.pi * f * t)
            + 0.22 * np.exp(-t / (tau * 0.45)) * np.sin(2 * np.pi * 2 * f * t + 0.3)
            + 0.10 * np.exp(-t / (tau * 0.20)) * np.sin(2 * np.pi * 3 * f * t + 1.1)
            + 0.05 * np.exp(-t / (tau * 0.08)) * np.sin(2 * np.pi * 5.4 * f * t))
    return amp * body * (1 - np.exp(-t / 0.002)) * np.exp(-t / tau)


def render(events, seconds):
    buf = np.zeros(int(SR * (seconds + 8)))
    for start, name, amp in events:
        wave_ = tine(freq(name), amp * rng.uniform(0.9, 1.04))
        i = int(start * SR)
        buf[i:i + len(wave_)] += wave_[:len(buf) - i]
    return buf


def fftconv(x, h):
    n = len(x) + len(h) - 1
    size = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(h, size), size)[:len(x)]


def reverb_ir(seed):
    r = np.random.default_rng(seed)
    t = np.arange(int(SR * 2.6)) / SR
    ir = r.standard_normal(len(t)) * np.exp(-t / 0.55)
    spec = np.fft.rfft(ir)
    f = np.fft.rfftfreq(len(ir), 1 / SR)
    ir = np.fft.irfft(spec / (1 + (f / 3500) ** 2), len(ir))   # soften the highs
    ir[:int(0.012 * SR)] = 0                                  # 12 ms pre-delay
    return ir / np.sqrt(np.sum(ir ** 2))


def finish(dry, seconds, loop):
    wet = 0.30
    left = dry + wet * fftconv(dry, reverb_ir(1))
    right = dry + wet * fftconv(dry, reverb_ir(2))
    stereo = np.stack([left, right], axis=1)
    end = int(SR * seconds)
    if loop:
        tail = stereo[end:]
        stereo = stereo[:end].copy()
        stereo[:len(tail)] += tail[:end]            # fold the tail back so the loop is seamless
    else:
        stereo = stereo[:end]
    fade = int(SR * 0.02)
    stereo[:fade] *= np.linspace(0, 1, fade)[:, None]
    stereo[-fade:] *= np.linspace(1, 0, fade)[:, None]
    return stereo * (0.70 / np.max(np.abs(stereo)))   # peak at about -3 dB


def save_mp3(stereo, name):
    os.makedirs(OUT, exist_ok=True)
    pcm = (np.clip(stereo, -1, 1) * 32767).astype("<i2")
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        with wave.open(tmp.name, "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())
    path = os.path.join(OUT, name)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp.name,
                    "-codec:a", "libmp3lame", "-b:a", "96k", path], check=True)
    os.unlink(tmp.name)
    print(f"{path}: {len(stereo) / SR:.1f} s, {os.path.getsize(path) // 1024} KB")


# ------------------------------------------------------------------ the loop
def music_box_loop():
    beat = 60 / 72
    chords = {
        "C": ["C3", "G3", "C4", "E4", "G4"],
        "Am": ["A2", "E3", "A3", "C4", "E4"],
        "F": ["F2", "C3", "F3", "A3", "C4"],
        "G": ["G2", "D3", "G3", "B3", "D4"],
    }
    bars = [
        ("C", []),                                                  # intro
        ("C", [("E5", 1.5), ("D5", .5), ("C5", 1), ("E5", 1)]),     # phrase A
        ("Am", [("A5", 2), ("G5", 1), ("E5", 1)]),
        ("F", [("F5", 1.5), ("E5", .5), ("D5", 1), ("C5", 1)]),
        ("G", [("D5", 3), ("B4", 1)]),
        ("C", [("E5", 1.5), ("D5", .5), ("C5", 1), ("E5", 1)]),
        ("Am", [("A5", 1), ("C6", 1), ("B5", 1), ("A5", 1)]),
        ("F|G", [("A5", 1), ("G5", 1), ("F5", 1), ("D5", 1)]),
        ("C", [("C5", 3), (None, 1)]),
        ("Am", [("C6", 1.5), ("B5", .5), ("A5", 1), ("E5", 1)]),    # phrase B
        ("F", [("F5", 1.5), ("G5", .5), ("A5", 1), ("C6", 1)]),
        ("C", [("G5", 2), ("E5", 1), ("G5", 1)]),
        ("G", [("D5", 2), ("B4", 1), ("D5", 1)]),
        ("Am", [("C6", 1), ("B5", 1), ("A5", 1), ("C6", 1)]),
        ("F", [("A5", 2), ("F5", 1), ("A5", 1)]),
        ("G", [("G5", 1.5), ("F5", .5), ("D5", 1), ("B4", 1)]),
        ("end", [("C5", 4)]),
        ("rest", []),
    ]
    events = []
    pattern = [0, 1, 2, 3, 4, 3, 2, 1]
    for b, (chord, melody) in enumerate(bars):
        t0 = b * 4 * beat
        if chord == "end":
            for k, n in enumerate(chords["C"]):
                events.append((t0 + k * 0.06, n, 0.2))
        elif chord != "rest":
            halves = chord.split("|")
            for i in range(8):
                tones = chords[halves[0] if len(halves) == 1 or i < 4 else halves[1]]
                idx = pattern[i] if len(halves) == 1 else pattern[i % 4]
                events.append((t0 + i * beat / 2, tones[idx], 0.30 if i in (0, 4) and idx == 0 else 0.17))
        phrase_b = b >= 9
        t = t0
        for name, length in melody:
            if name:
                events.append((t, name, 0.5))
                if phrase_b:
                    events.append((t, name[:-1] + str(int(name[-1]) + 1), 0.13))   # octave sparkle
            t += length * beat
    seconds = len(bars) * 4 * beat
    return finish(render(events, seconds), seconds, loop=True)


# -------------------------------------------------------- happy birthday
def happy_birthday():
    base = 60 / 96

    def at(beat):                      # gentle slow-down over the last two bars
        if beat <= 19:
            return beat * base
        if beat <= 22:
            return 19 * base + (beat - 19) * base * 1.15
        return 19 * base + 3 * base * 1.15 + (beat - 22) * base * 1.3

    melody = [(0, "G5"), (.75, "G5"), (1, "A5"), (2, "G5"), (3, "C6"), (4, "B5"),
              (6, "G5"), (6.75, "G5"), (7, "A5"), (8, "G5"), (9, "D6"), (10, "C6"),
              (12, "G5"), (12.75, "G5"), (13, "G6"), (14, "E6"), (15, "C6"), (16, "B5"), (17, "A5"),
              (18, "F6"), (18.75, "F6"), (19, "E6"), (20, "C6"), (21, "D6"), (22, "C6")]
    # (beat, bass, chord tones for the "oom-pah-pah")
    harmony = [(1, "C3", ["E4", "G4"]), (4, "G2", ["B3", "D4"]), (7, "G2", ["B3", "F4"]),
               (10, "C3", ["E4", "G4"]), (13, "C3", ["E4", "Bb4"]), (16, "F2", ["A3", "C4"])]
    events = [(at(b), n, 0.5) for b, n in melody]
    for b, bass, tones in harmony:
        events.append((at(b), bass, 0.3))
        for off in (1, 2):
            for n in tones:
                events.append((at(b + off), n, 0.11))
    events += [(at(19), "C3", 0.3), (at(20), "E4", 0.11), (at(20), "G4", 0.11),
               (at(21), "G2", 0.25), (at(21), "B3", 0.11), (at(21), "F4", 0.11)]
    for k, n in enumerate(["C3", "G3", "C4", "E4", "G4"]):           # rolled final chord
        events.append((at(22) + k * 0.05, n, 0.22))
    events.append((at(22), "C7", 0.08))
    seconds = at(25) + 3.2
    return finish(render(events, seconds), seconds, loop=False)


if __name__ == "__main__":
    save_mp3(music_box_loop(), "music-box.mp3")
    save_mp3(happy_birthday(), "happy-birthday.mp3")
