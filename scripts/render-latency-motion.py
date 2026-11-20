"""Render the vertical LatencyLens explainer with Pillow, edge-tts and FFmpeg."""
import asyncio
import math
import os
from pathlib import Path
import subprocess

import edge_tts
from PIL import Image, ImageDraw, ImageFont

OUT = Path("output/embarko/live-motion").resolve()
SIZE = (540, 960)
FPS = 30
MINT = "#c4fb89"
WHITE = "#eff3e7"
MUTED = "#b1c1b6"
LINE = "#38524a"
BEATS = [
    ("THE SYMPTOM", "Fast internet.\nWhy the lag?", "A fast download can still come with a frozen call. When responses have to wait, even a fast connection can feel slow."),
    ("THE LIVE CHECK", "Catch it\nin the act.", "Open Latency Lens while the slowdown is happening and run the live check. It sends six tiny requests to this site, one at a time."),
    ("THE RESULT", "Look at the\nspread.", "The median shows a typical response in this run. The spread shows how far apart the fastest and slowest responses were. Large swings give you something to investigate."),
    ("THE EXPERIMENT", "Change\none thing.", "Pause a large upload or move closer to your Wi-Fi router. Pick one change at a time. Then retest, so you can compare results instead of guessing."),
    ("AI TROUBLESHOOTING", "Take the numbers\nwith you.", "Want another suggestion? Copy the timing summary into your AI assistant. Ask for one safe change to try, then check whether it helped."),
    ("LATENCYLENS", "Check. Change.\nRetest.", "These are browser response times to one site. They can help you investigate a slowdown. Open Latency Lens next time the lag starts."),
]


def ffprobe(path):
    text = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(path),
    ], text=True)
    return float(text.strip())


def font(name, size):
    return ImageFont.truetype(str(Path(os.environ["WINDIR"]) / "Fonts" / name), size)


TITLE = font("georgia.ttf", 57)
LABEL = font("consola.ttf", 17)
CAPTION = font("segoeui.ttf", 23)


def draw_frame(index, elapsed, duration, total_fraction):
    label, title, _ = BEATS[index]
    image = Image.new("RGB", SIZE, "#101916")
    draw = ImageDraw.Draw(image)
    rise = round(34 * (1 - min(1, elapsed / 0.7)) ** 3)
    draw.text((39, 84), "LATENCYLENS   /   CONNECTION LAB", font=LABEL, fill=MINT)
    draw.line((39, 130, 501, 130), fill=LINE)
    draw.text((39, 167 + rise), label, font=LABEL, fill=MUTED)
    lines = title.splitlines()
    draw.text((36, 198 + rise), lines[0], font=TITLE, fill=WHITE)
    draw.text((36, 266 + rise), lines[1], font=TITLE, fill=MINT)
    draw.rounded_rectangle((39, 400, 501, 735), radius=20, fill="#14241e", outline=LINE)
    for x in range(70, 500, 28):
        draw.line((x, 429, x, 706), fill="#20382d")
    for y in range(434, 710, 28):
        draw.line((65, y, 475, y), fill="#20382d")
    if index == 0:
        lanes = [("Download", 1.4), ("Response under load", 3.4)]
    elif index == 1:
        lanes = [("Browser request", 1.6), ("Site response", 1.6)]
    elif index == 2:
        lanes = [("Fastest response", 1.2), ("Slowest response", 3.2)]
    elif index == 3:
        lanes = [("Before a change", 3.0), ("Retest", 1.8)]
    else:
        lanes = [("Check", 1.8), ("Retest", 1.8)]
    for row, (lane, travel) in enumerate(lanes):
        y = 513 + row * 119
        draw.text((68, y - 45), lane, font=CAPTION, fill=WHITE)
        draw.line((72, y, 469, y), fill=LINE, width=3)
        for packet in range(3):
            x = 72 + round(397 * ((elapsed / travel + packet / 3) % 1))
            draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill=MINT if row else "#a2c9bb")
    draw.text((69, 688), "ILLUSTRATION • NO MEASURED VALUES", font=LABEL, fill=MUTED)
    link = "latencylens-congestion-lab.embarko.app"
    draw.text((39, 796), link, font=LABEL, fill=MINT)
    draw.text((39, 845), f"{index + 1:02} / {len(BEATS):02}", font=LABEL, fill=MUTED)
    draw.line((39, 891, 501, 891), fill=LINE, width=3)
    draw.line((39, 891, 39 + round(462 * total_fraction), 891), fill=MINT, width=3)
    return image


async def narration():
    for index, (_, _, copy) in enumerate(BEATS):
        target = OUT / f"voice-{index}.mp3"
        if not target.exists() or target.stat().st_size == 0:
            await edge_tts.Communicate(copy, "en-US-AvaNeural", rate="-4%").save(str(target))


def stamp(seconds):
    ms = round(seconds * 1000)
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    asyncio.run(narration())
    offset = 0.0
    captions = []
    for index, (_, _, copy) in enumerate(BEATS):
        voice = OUT / f"voice-{index}.mp3"
        duration = ffprobe(voice) + 0.55
        frames = math.ceil(duration * FPS)
        for number, sentence in enumerate(copy.rstrip(".").split(". ")):
            preceding = len(" ".join(copy.rstrip(".").split(". ")[:number]))
            start = offset + (duration - .55) * preceding / len(copy)
            end = offset + (duration - .55) * (preceding + len(sentence) + 1) / len(copy)
            captions.append(f"{len(captions)+1}\n{stamp(start)} --> {stamp(end)}\n{sentence}.\n")
        command = [
            "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pixel_format", "rgb24",
            "-video_size", "540x960", "-framerate", str(FPS), "-i", "-", "-i", str(voice),
            "-af", "apad,loudnorm=I=-16:TP=-1.5:LRA=9", "-shortest", "-vf",
            "scale=1080:1920:flags=lanczos", "-c:v", "libx264", "-preset", "fast",
            "-crf", "19", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
            str(OUT / f"scene-{index}.mp4"),
        ]
        with subprocess.Popen(command, stdin=subprocess.PIPE) as render:
            for frame in range(frames):
                fraction = (index + frame / frames) / len(BEATS)
                render.stdin.write(draw_frame(index, frame / FPS, duration, fraction).tobytes())
            render.stdin.close()
            if render.wait():
                raise RuntimeError("FFmpeg scene render failed")
        offset += frames / FPS
    (OUT / "captions.srt").write_text("\n".join(captions), encoding="utf-8")
    (OUT / "scenes.txt").write_text("".join(f"file scene-{i}.mp4\n" for i in range(len(BEATS))), encoding="utf-8")
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "1", "-i",
        str(OUT / "scenes.txt"), "-i", str(OUT / "captions.srt"),
        "-map", "0:v", "-map", "0:a", "-map", "1:s", "-c:v", "copy", "-c:a", "copy",
        "-c:s", "mov_text", "-movflags", "+faststart", str(OUT / "latencylens-motion.mp4"),
    ], check=True)


if __name__ == "__main__":
    main()
