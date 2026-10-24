# Savaktija

A Chromium extension project for Chrome and Brave that adds enhancements to [vaktija.ba](https://vaktija.ba/).

## Load the extension in Chrome or Brave

1. Open `chrome://extensions` in Chrome or `brave://extensions` in Brave.
2. Turn on **Developer mode**.
3. Select **Load unpacked**.
4. Choose this project folder.
5. Open or refresh vaktija.ba to run the content script.

## Prepare a Chrome Web Store release

Run the packaging script from PowerShell:

```powershell
.\package-release.ps1
```

It creates a versioned ZIP in `dist/` (currently `savaktija-1.0.zip`),
containing only the manifest, content script, stylesheet, and required icons.
Upload that ZIP in the Chrome Web Store Developer Dashboard. Brave users can
install the published Chrome Web Store listing or load the same
Chromium-compatible extension.

Suggested store listing:

- **Name:** Savaktija
- **Short description:** A playful cup animation and prayer-card shuffle for vaktija.ba.
- **Single purpose:** An optional animation that reverses the display order of
  prayer-time cards on vaktija.ba.
- **Privacy practices:** No user data is collected, stored, or transmitted.
  See [PRIVACY.md](./PRIVACY.md).

Before submitting, create a developer account, provide any requested
registration and contact details, add at least one current screenshot of the
extension running on vaktija.ba, and complete the store's privacy and
permissions disclosures. The store listing and publication are completed in
the publisher dashboard, not by this local project.

The content script entrypoint is `savaktija.js`. It finds the Sabah (shown as
“Zora” on vaktija.ba), Podne, Ikindija, Akšam, and Jacija cards when each has a
timestamp. A centered dialog offers **Start switcharoo**; after you start, a
floating cup lands on each card, then the five cards switch positions into
reverse order with an animation. Prayer labels and times stay together, and the
sunrise card is left in its original position. The animation respects the system
reduced-motion preference. The extension requests no extra permissions and only
runs on vaktija.ba pages.


