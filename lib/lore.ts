/**
 * Brand fiction for the product dossier pages. Every piece on the wall has a
 * FIELD LOG (two short transmissions) and a spec sheet. Pure lore — written
 * in-house, no third-party IP text.
 */

export interface SpecRow {
  k: string;
  v: string;
}

export const FRAME_SPECS: SpecRow[] = [
  { k: "FORMAT", v: "A3 ARCHIVAL PRINT · 297 × 420 MM" },
  { k: "FRAME", v: "SHADOW-BOX · BRUSHED BLACK ALUMINIUM · 33 × 45 CM" },
  { k: "STOCK", v: "230 GSM COTTON RAG · MATTE GICLÉE" },
  { k: "GLAZING", v: "MUSEUM NON-GLARE ACRYLIC" },
  { k: "MOUNTING", v: "PRE-STRUNG STEEL WIRE · WALL HOOK INCLUDED" },
  { k: "DISPATCH", v: "SHIPS ACROSS INDIA IN 72H · TRACKED" },
];

export const CHRONO_SPECS: SpecRow[] = [
  { k: "MOVEMENT", v: "EXPOSED 8-WHEEL GEAR TRAIN · MECHANICAL TICK" },
  { k: "DIAL", v: "IVORY ROMAN · OPEN SKELETON WINDOW" },
  { k: "CASE", v: "40 CM · GLOSS BLACK BEZEL · DOMED GLASS" },
  { k: "RIM", v: "SIGNATURE VOID RED BACKLIGHT HALO" },
  { k: "EDITION", v: "1 OF 1 · ENGRAVED · NEVER REPRINTED" },
  { k: "DISPATCH", v: "ARMOURED PACKAGING · SHIPS IN 72H · TRACKED" },
];

/** Two-paragraph FIELD LOG per product slug. */
export const FIELD_LOGS: Record<string, [string, string]> = {
  "give-up": [
    "Recovered from a barracks wall on the eastern front. The words read like surrender — they're the opposite. They were painted above the bunks so every soldier woke up staring at the cost of stopping.",
    "Whoever hung it first never came back for it. The frame still smells faintly of rain. Hang it where you'll see it on the bad mornings; that's what it was built for.",
  ],
  baryon: [
    "Final-form energy study, pulled from a sealed reactor district. The subject burns its own lifespan as fuel — every second of glow on this print is a second somebody chose to spend.",
    "Under low light the ember layer keeps lifting off the stock like it hasn't accepted the print is finished. We framed it in a deep shadow-box to give it room to breathe. It needs it.",
  ],
  "void-signal": [
    "The first broadcast. Before the room, before the collection, there was a 30-second transmission on a dead frequency — just the sigil, the static, and a promise that the void was open for business.",
    "This is that frame, risograph-red on true black, printed from the original master. The house mark of PROJECT VOID. Collectors start here whether they mean to or not.",
  ],
  "crimson-ronin": [
    "Edo-2099 sector sweep, hour zero. One blade, no master, a sun that bleeds neon instead of setting. The city archived him as a threat; we archived him as art. History will decide who filed correctly.",
    "Edition of 300, each numbered and embossed with the VOID mark by hand. When the run sells through, the plate is destroyed on camera. No reprints. No mercy.",
  ],
  "ghost-protocol": [
    "Sector 9 surveillance still, declassified by accident and never reclassified. The city watches everyone — this is the one frame where somebody watched it back.",
    "Monochrome cyber-noir on cotton rag, thin gunmetal frame, museum glazing. It reads quiet on the wall until the lights go out. Then it reads like a warning.",
  ],
  "neon-requiem": [
    "The flagship. A skyline holding a funeral for its own sun — layered foil and spot-gloss catching whatever light your room has left and refusing to give it back.",
    "Edition of 150. The crown of the collection and the piece the room was literally built around. If you only ever extract one artifact from the void, it should be this one.",
  ],
  "gearwork-chrono": [
    "Pulled straight off the room's wall — the actual timepiece that keeps the void on schedule. Eight exposed gears, ivory Roman dial, a tick you can feel in your teeth at 2AM.",
    "There is exactly one. It was never supposed to be for sale, but everything in the void has a price if you stare at it long enough. When it ships, the room learns to live without time.",
  ],
};
