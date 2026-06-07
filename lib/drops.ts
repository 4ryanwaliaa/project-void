/**
 * Contents of the EMERGENCY DROP VAULT modal — upcoming / locked product drops.
 * These are teasers, not buyable yet, so they live separately from the catalog.
 */
export interface Drop {
  code: string;
  title: string;
  status: "INCOMING" | "ENCRYPTED" | "SEALED";
  window: string;
  blurb: string;
}

export const DROPS: Drop[] = [
  {
    code: "DROP_07",
    title: "MIDNIGHT GHOST FRAMES",
    status: "INCOMING",
    window: "T-MINUS 12 DAYS",
    blurb:
      "A six-piece set of glow-reactive frames. Charges in daylight, bleeds red after dark.",
  },
  {
    code: "DROP_08",
    title: "█████ COLLAB",
    status: "ENCRYPTED",
    window: "SIGNAL LOCKED",
    blurb:
      "Identity withheld until the vault opens. The biggest name we've touched. Decrypts on drop.",
  },
  {
    code: "DROP_09",
    title: "RONIN — BLACK STEEL",
    status: "SEALED",
    window: "Q3 // 150 UNITS",
    blurb:
      "Hand-forged steel frame edition of CRIMSON RONIN. Serialized. Vault members get first key.",
  },
  {
    code: "ARCHIVE_00",
    title: "THE FIRST WALL",
    status: "SEALED",
    window: "PERMANENT VAULT",
    blurb:
      "Reprints of the original collector wall, exactly as it was found. Rotating availability.",
  },
];
