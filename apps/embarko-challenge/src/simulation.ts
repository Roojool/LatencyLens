// Each baseline is a synthetic round-trip time in milliseconds for the example path.
export const scenarios = [
  {
    id: "video-call",
    label: "Video call",
    baseline: 30,
    description: "When a photo upload fills the outgoing queue, speech packets can wait behind it. The other person may hear your reply late.",
    advice: "Pause a photo or cloud upload during a call and check whether the delay between speakers eases.",
  },
  {
    id: "gaming",
    label: "Gaming",
    baseline: 15,
    description: "A nearby game server has a short round trip. A download on the same link can make the next game update wait.",
    advice: "Note the game's ping during a download. If you manage a router with Smart Queue Management (SQM), turn it on and check the ping again under the same load.",
  },
  {
    id: "browsing",
    label: "Browsing",
    baseline: 40,
    description: "A page may need one response before it can request the next file. Extra waiting on each round trip can delay when the page appears.",
    advice: "In your browser's Network panel, disable the cache and reload the same page during a download and again after pausing it. Compare the first request's waiting time.",
  },
  {
    id: "downloading",
    label: "Downloading",
    baseline: 60,
    description: "A file transfer can keep moving quickly while a new request waits behind the file's packets. Both share the same incoming link.",
    advice: "Set a speed limit in your download app and keep the transfer running. Open a web page and compare its response with the limit on and off.",
  },
];

function describeQueue(added: number) {
  if (added === 0) return "No added delay";
  if (added < 25) return "Short queue";
  if (added < 100) return "Queue building";
  return "Long queue";
}

export function simulate(scenarioId?: unknown, load?: unknown) {
  const scenario = scenarios.find(({ id }) => id === scenarioId) ?? scenarios[0];
  const value = typeof load === "string" && load.trim() !== "" ? Number(load) : load;
  const percent = typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(100, Math.round(value)))
    : 35;

  const { baseline } = scenario;
  // The queue adds 50 ms at half load and 200 ms at full load, before the cap.
  const loaded = Math.min(250, baseline + Math.round(percent ** 2 / 50));
  const added = loaded - baseline;
  return { scenario, load: percent, baseline, loaded, added, indicator: describeQueue(added) };
}
