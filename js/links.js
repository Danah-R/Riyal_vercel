/* ==========================================================================
   RIYAL — LINKS
   The one place to edit every URL on the site.

   • Leave a value as "" and its button shows "Coming soon" (and isn't clickable).
   • Paste a URL and the button becomes a real link — no other change needed.
   • Each key matches a data-link="…" attribute in index.html.

   To add a NEW link button:
     1. Add a key below, e.g.   playStore: "https://play.google.com/…",
     2. In index.html, copy an existing <li> in the #links section and change
        data-link="…" to your new key (and the label text).
   ========================================================================== */
window.RIYAL_LINKS = {
  app:            "",   // ← "Try Riyal": web app / TestFlight / Play Store URL
  demo:           "",   // ← "Watch the demo": YouTube / Loom / Drive URL

  github:         "https://github.com/Riyal-project/Riyal",
  readme:         "https://github.com/Riyal-project/Riyal#readme",

  linkedinDanah:  "https://www.linkedin.com/in/danah-altamimi-b2912141a",
  linkedinFulwah: "https://www.linkedin.com/in/fulwah-alyahya-7037a9293"
};
