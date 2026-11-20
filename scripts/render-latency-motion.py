"""Render the vertical LatencyLens explainer with Pillow, edge-tts and FFmpeg."""
import asyncio
import math
import os
from pathlib import Path
import subprocess

import edge_tts
from PIL import Image, ImageDraw, ImageFont

OUT = Path("output/embarko/live-motion-v2").resolve()
SIZE = (540, 960)
FPS = 30
MINT = "#c4fb89"
WHITE = "#eff3e7"
MUTED = "#b1c1b6"
LINE = "#38524a"
BEATS = [
    ("THE SYMPTOM", "Fast internet.\nFrozen call?", "Your download's flying. And then... the call freezes. If a reply has to wait behind other traffic, even a fast connection can feel slow."),
    ("THE LIVE CHECK", "Catch it\nin the act.", "Next time it happens, open Latency Lens and run the live check. It sends six tiny requests to this site. One at a time."),
    ("THE RESULT", "Look at the\nspread.", "Here's how to read it. The median is a typical response time. Spread is the gap between the quickest reply and the slowest. A wide gap gives you something to investigate."),
    ("THE EXPERIMENT", "Change\none thing.", "Say there's an upload running. Pause it. Then run the check again. Compare the two runs before you change anything else."),
    ("AI TROUBLESHOOTING", "Stuck? Get a\nsecond opinion.", "Still stuck? Copy both runs into your AI assistant. Ask for one safe change you can try. Then test it yourself."),
    ("LATENCYLENS", "Check. Change.\nRetest.", "This is a check to one website. It gives you a clue, and a way to tell if a change might have helped. Try it next time the lag starts."),
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


def ease(value):
    return 1 - (1 - min(1, max(0, value))) ** 3


def scene_graphic(draw, index, elapsed, duration):
    progress = ease(elapsed / 1.1)
    if index == 0:
        draw.text((63, 431), "DOWNLOAD TRAFFIC", font=LABEL, fill=MUTED)
        for item in range(6):
            x = 62 + (elapsed * 115 + item * 76) % 400
            draw.rounded_rectangle((x, 485, x + 31, 517), 8, fill=LINE)
        draw.line((63, 562, 476, 562), fill=LINE)
        draw.text((63, 584), "CALL REPLY", font=LABEL, fill=MUTED)
        x = 75 + int(270 * ease(elapsed / 3.4))
        draw.line((74, 637, 465, 637), fill=LINE, width=3)
        draw.ellipse((x - 8, 629, x + 8, 645), fill=MINT)
        draw.line((361, 621, 361, 653), fill="#f4cd83", width=3)
        draw.text((374, 625), "WAIT", font=LABEL, fill="#f4cd83")
    elif index == 1:
        draw.text((63, 432), "BROWSER", font=LABEL, fill=WHITE)
        draw.text((400, 432), "SITE", font=LABEL, fill=WHITE)
        for row in range(6):
            y = 480 + row * 35
            draw.line((70, y, 470, y), fill=LINE, width=2)
            trip = min(1, max(0, (elapsed - row * 0.8) / 0.8))
            if trip:
                x = 70 + 400 * (1 - abs(2 * trip - 1))
                draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill=MINT)
                if trip == 1:
                    draw.text((480, y - 10), "✓", font=CAPTION, fill=MINT)
    elif index == 2:
        draw.text((63, 433), "SIX EXAMPLE RESPONSES", font=LABEL, fill=MUTED)
        for i, endpoint in enumerate((152, 175, 208, 242, 296, 456)):
            y = 470 + i * 26
            x = 67 + (endpoint - 67) * ease((elapsed - i * .15) / .8)
            draw.line((67, y, x, y), fill=MINT if i in (2, 3) else LINE, width=7)
        if elapsed > 1.25:
            draw.line((225, 455, 225, 611), fill=MINT, width=2)
            draw.text((237, 454), "MEDIAN", font=LABEL, fill=MINT)
        if elapsed > 2:
            draw.line((152, 641, 456, 641), fill="#f4cd83", width=2)
            for x in (152, 456):
                draw.line((x, 634, x, 648), fill="#f4cd83", width=2)
            draw.text((277, 653), "SPREAD", font=LABEL, fill="#f4cd83")
    elif index == 3:
        for i, (label, width) in enumerate((("FIRST CHECK", 357), ("AFTER PAUSING AN UPLOAD", 190))):
            y = 450 + i * 120
            draw.text((64, y), label, font=LABEL, fill=MUTED)
            fill = ease((elapsed - i * 1.3) / .9)
            draw.rounded_rectangle((64, y + 38, 476, y + 79), 12, fill="#20382d")
            if fill > .02:
                draw.rounded_rectangle((64, y + 38, 64 + width * fill, y + 79), 10, fill=MINT if i else LINE)
    elif index == 4:
        draw.rounded_rectangle((64, 435, 424, 504), 14, fill="#20382d")
        draw.text((81, 456), "Copy both timing runs", font=CAPTION, fill=WHITE)
        draw.line((270, 514, 270, 546), fill=MINT, width=3)
        x = 82 + round((1 - progress) * 20)
        draw.rounded_rectangle((x, 553, 476, 658), 14, fill=LINE)
        draw.text((x + 15, 572), "Ask for one safe change.", font=CAPTION, fill=WHITE)
        draw.text((x + 15, 610), "Test it before deciding.", font=CAPTION, fill=MINT)
    else:
        for index, step in enumerate(("Run the live check", "Try one change", "Compare a retest")):
            y = 451 + index * 76
            if elapsed >= index * .48:
                draw.ellipse((65, y, 97, y + 32), fill=MINT)
                draw.text((76, y + 6), str(index + 1), font=LABEL, fill="#101916")
                draw.text((115, y), step, font=CAPTION, fill=WHITE)


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
    scene_graphic(draw, index, elapsed, duration)
    if index in (0, 2, 3):
        draw.text((69, 697), "ILLUSTRATION / NO MEASURED VALUES", font=LABEL, fill=MUTED)
    link = "latencylens-congestion-lab.embarko.app"
    draw.text((39, 796), link, font=LABEL, fill=MINT)
    draw.text((39, 845), f"{index + 1:02} / {len(BEATS):02}", font=LABEL, fill=MUTED)
    draw.line((39, 891, 501, 891), fill=LINE, width=3)
    draw.line((39, 891, 39 + round(462 * total_fraction), 891), fill=MINT, width=3)
    visibility = min(ease(elapsed / .32), ease((duration - elapsed) / .43))
    if index == 0:
        visibility = ease((duration - elapsed) / .43)
    return Image.blend(Image.new("RGB", SIZE, "#101916"), image, visibility)


async def narration():
    for index, (_, _, copy) in enumerate(BEATS):
        target = OUT / f"voice-{index}.mp3"
        if not target.exists() or target.stat().st_size == 0:
            await edge_tts.Communicate(copy, "en-US-AvaNeural", rate="-8%").save(str(target))


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
        duration = ffprobe(voice) + 0.95
        frames = math.ceil(duration * FPS)
        for number, sentence in enumerate(copy.rstrip(".").replace("... ", "… ").split(". ")):
            preceding = len(" ".join(copy.rstrip(".").replace("... ", "… ").split(". ")[:number]))
            start = offset + .24 + (duration - .95) * preceding / len(copy)
            end = offset + .24 + (duration - .95) * (preceding + len(sentence) + 1) / len(copy)
            captions.append(f"{len(captions)+1}\n{stamp(start)} --> {stamp(end)}\n{sentence}.\n")
        command = [
            "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pixel_format", "rgb24",
            "-video_size", "540x960", "-framerate", str(FPS), "-i", "-", "-i", str(voice),
            "-af", "adelay=240,apad,loudnorm=I=-16:TP=-1.5:LRA=9", "-shortest", "-vf",
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
