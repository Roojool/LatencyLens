# LatencyLens on camera

The separate live-check explainer is rendered at `output/embarko/live-motion/latencylens-motion.mp4` and includes synthetic narration, animated illustrations and a selectable caption track. It introduces the live check, the timing spread, the retest and the AI handoff. The diagrams are illustrative. Use the shooting script below for the separate contest version that requires genuine deployment footage.

To reproduce the explainer on Windows, install Pillow and [edge-tts](https://github.com/rany2/edge-tts) in a Python environment, put FFmpeg and ffprobe on PATH, and run `python scripts/render-latency-motion.py` from the repository root. The renderer writes the MP4 and an SRT file under `output/embarko/live-motion`.

**82-second shooting script. Final recording pending.** The entrant’s own narration, genuine Embarko dashboard footage and a physical-phone take are still needed. Rujul is the proposed narrator. Have the actual entrant confirm their name and first-person lines before recording. Keep the cut private pending the organizer’s eligibility decision. [Unsent eligibility draft](EMBARKO-ELIGIBILITY.md)

**The public URL is verified and the claim is complete.** Desktop and emulated-phone checks passed. The entrant confirmed the claim, the temporary banner disappeared, and unauthenticated status returned the documented 404. The existing 1080 × 1920 thumbnail is available as a cover. [Public lab](https://latencylens-congestion-lab.embarko.app) · [Deployment record](EMBARKO-DEPLOYMENT.md) · [Original thumbnail](../output/embarko/latencylens-thumbnail.png) · [Repository copy](assets/embarko-thumbnail.png)

## Script and storyboard

| Master time | Say | Show |
|---|---|---|
| 00:00–00:03 | Fast Wi-Fi. Why did the call freeze? | Open on the **Response time** panel in the dark jade research lab. At **Congested**, frame the moving dots, the two times and the **Simulation** label. Start mid-motion. |
| 00:03–00:16 | I’m Rujul. At our October hack day, we built LatencyLens to understand that wait. Here’s the experiment. All these times are simulated. | Cut to Rujul speaking or use his own voice over the lab title. Show **The Internet Congestion Lab**, then tap **Try the congestion experiment**. Keep the October project credit audible. |
| 00:16–00:29 | Video call starts at 35% load. The slider goes from zero to 100%. Each dot is a request. The idle trip takes 30 milliseconds. | Tap **Reset**. Frame **Video call**, **Gaming**, **Browsing** and **Downloading** together. Point to the load slider at 35%, then frame both animated request lanes. The call shows **Idle reference** at 30 ms and **Under your load** at 55 ms. |
| 00:29–00:39 | I tap Congested. Same call, 95% load, 211 milliseconds. Picture a word waiting behind the photos you’re uploading. | Tap **Congested**. Keep the 95% readout and the two lanes in sequence. Hold long enough to read **30 ms idle**, **211 ms loaded** and **+181 ms**. Use the word and the photo upload as the human-scale example. |
| 00:39–00:53 | Now put Gaming beside the call at the same load. Both gain 181 milliseconds. The game’s round trip is still shorter. I’ll save the PNG so you can read both results together. | Scroll to **Compare and share**. Select **Gaming** opposite **Video call**, leaving load at 95%. Frame the call’s 211 ms and the game’s 196 ms, each with +181 ms added. Tap **Download summary PNG** and open the actual image. Leave its simulation label visible. |
| 00:53–01:06 | To put it online, I used Codex in the terminal. It sent the lab’s source to Embarko’s deployment API. Embarko built the app and returned this public link. | Frame the real, sanitized deploy command and the public result from the saved session if available. Otherwise show the dated deployment record and official API guide with the overlay **Deployment recap**. Cut to the returned address opening the lab. |
| 01:06–01:11 | I claimed the app. Here it is in my Embarko dashboard. | Film the actual claimed app in the entrant’s signed-in dashboard now. Label this **After claim**. Frame the app name and public address. |
| 01:11–01:16 | Same address on my phone. Watch the slider follow my thumb. | Film a physical phone opening the public address in a private tab. Show the address bar and the thumb moving the slider until the result changes. |
| 01:16–01:22 | At full load, which takes longer, browsing or downloading? Try it. | Bring **Browsing** and **Downloading** into view at 100%. Hold the full public address and **#DeployWithEmbarko** on the last frame from 01:18 to 01:22, clear of the captions. |

The times in the experiment are deterministic examples. The animation is slowed for visibility. The shot values above come from the current simulation at 35% and 95% load. Check those values against the build being filmed. [Simulation](../apps/embarko-challenge/src/simulation.ts) · [Controls and lanes](../apps/embarko-challenge/src/main.tsx) · [PNG contents](../apps/embarko-challenge/src/summary.ts)

## Timed captions

Copy this UTF-8 SRT block into the editor. Set the end card to `https://latencylens-congestion-lab.embarko.app` with `#DeployWithEmbarko` on the next line. Leave the bottom caption area free.

```srt
1
00:00:00,000 --> 00:00:03,000
Fast Wi-Fi. Why did the call freeze?

2
00:00:03,000 --> 00:00:07,000
I’m Rujul. At our October hack day,

3
00:00:07,000 --> 00:00:11,000
we built LatencyLens
to understand that wait.

4
00:00:11,000 --> 00:00:16,000
Here’s the experiment.
All these times are simulated.

5
00:00:16,000 --> 00:00:20,000
Video call starts at 35% load.

6
00:00:20,000 --> 00:00:24,000
The slider goes from zero to 100%.

7
00:00:24,000 --> 00:00:29,000
Each dot is a request.
The idle trip takes 30 milliseconds.

8
00:00:29,000 --> 00:00:34,000
I tap Congested. Same call,
95% load, 211 milliseconds.

9
00:00:34,000 --> 00:00:39,000
Picture a word waiting behind
the photos you’re uploading.

10
00:00:39,000 --> 00:00:43,000
Now put Gaming beside the call
at the same load.

11
00:00:43,000 --> 00:00:48,000
Both gain 181 milliseconds.
The game’s round trip is still shorter.

12
00:00:48,000 --> 00:00:53,000
I’ll save the PNG so you can read
both results together.

13
00:00:53,000 --> 00:00:58,000
To put it online, I used Codex
in the terminal.

14
00:00:58,000 --> 00:01:02,000
It sent the lab’s source
to Embarko’s deployment API.

15
00:01:02,000 --> 00:01:06,000
Embarko built the app
and returned this public link.

16
00:01:06,000 --> 00:01:11,000
I claimed the app. Here it is
in my Embarko dashboard.

17
00:01:11,000 --> 00:01:16,000
Same address on my phone.
Watch the slider follow my thumb.

18
00:01:16,000 --> 00:01:22,000
At full load, which takes longer,
browsing or downloading? Try it.
```

## Recording workflow

1. **Prepare the take.** Use the entrant’s own voice and cleared visuals. Set a 9:16 canvas at 1080 × 1920 and 30 fps. Silence notifications, close personal tabs and frame only the relevant window. Record one voice take to the timed script. At phone size, keep labels and numbers readable above the captions.
2. **Capture the app.** The existing silent, 21.87-second browser clip is available for cutaways. Start with the congested opening shot, then reset to the video call at 35% for the walkthrough. Capture any missing controls and open the saved PNG. Verify both rows match the cards and leave time to read them. [Browser B-roll](../output/embarko/latencylens-demo-broll.mp4)
3. **Document the completed deployment.** Use the real Codex terminal/API history or the labeled recap described above. The signed-in dashboard shot can show the current claimed state even if the claim click was never captured. Crop out email, account and workspace details, keys and private claim links. A read-only view supplies this shot. [Deployment record](EMBARKO-DEPLOYMENT.md) · [Embarko deployment guide](https://embarko.ai/docs) · [Organizer’s video brief](https://embarko.ai/challenge)
4. **Get the phone take.** Use a second camera to film the entrant’s thumb and the physical screen. Open the verified address in a private tab, check the title, then move the load slider. Lock focus on the screen so the address and response stay readable. The emulated-phone check is already in the deployment record.
5. **Verify the cut.** Trim waits and retime captions to the entrant’s recorded speech. Export an H.264 MP4 with AAC audio. Watch the entire file with sound, then muted on a phone. Check the 75–85 second runtime, the simulation label, the captured claim evidence and a readable end card. Keep the recording status pending until the actual file passes playback. [Post drafts and evidence checklist](EMBARKO-SUBMISSION.md)

The captured public-site B-roll is available locally at `output/embarko/latencylens-demo-broll.mp4` (21.87 seconds, 1080×1920, 30 fps). The [vertical thumbnail](assets/embarko-thumbnail.png) is tracked with the documentation.
