(() => {
  "use strict";

  const targetPrayers = ["sabah", "podne", "ikindija", "aksam", "jacija"];

  const normalizeLabel = (label) =>
    label
      .trim()
      .toLocaleLowerCase("bs")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const findPrayerCards = () => {
    const cards = new Map();

    document.querySelectorAll("h2.name").forEach((heading) => {
      let prayer = normalizeLabel(heading.textContent);
      if (prayer === "zora") prayer = "sabah";

      const card = heading.parentElement;
      if (prayer === "izlazak sunca") {
        card?.classList.add("savaktija-sunrise-card");
        return;
      }

      if (!targetPrayers.includes(prayer)) return;

      const timestamp = card?.querySelector(".time")?.textContent.trim();
      if (!timestamp || !/^\d{1,2}:\d{2}$/.test(timestamp)) return;

      cards.set(prayer, card);
    });

    return cards;
  };

  const switchPrayerCardPositions = (cards) => {
    const prayerCards = targetPrayers.map((prayer) => cards.get(prayer));
    const parent = prayerCards[0].parentElement;
    if (!parent || prayerCards.some((card) => card.parentElement !== parent)) return;

    const children = [...parent.children];
    const originalRects = new Map(
      prayerCards.map((card) => [card, card.getBoundingClientRect()]),
    );
    const prayerIndexes = children
      .map((child, index) => (prayerCards.includes(child) ? index : -1))
      .filter((index) => index !== -1);
    const reorderedPrayerCards = [...prayerCards].reverse();

    prayerIndexes.forEach((index, position) => {
      children[index] = reorderedPrayerCards[position];
    });
    children.forEach((child) => parent.appendChild(child));

    prayerCards.forEach((card) => {
      const previous = originalRects.get(card);
      const current = card.getBoundingClientRect();
      const offsetX = previous.left - current.left;
      const offsetY = previous.top - current.top;
      if (offsetX === 0 && offsetY === 0) return;

      card.animate(
        [
          { transform: `translate(${offsetX}px, ${offsetY}px)` },
          { transform: "translate(0, 0)" },
        ],
        { duration: 700, easing: "ease-in-out" },
      );
    });
  };

  const animatePrayerCards = async () => {
    const cards = findPrayerCards();
    if (targetPrayers.some((prayer) => !cards.has(prayer))) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      switchPrayerCardPositions(cards);
      return;
    }

    const prayerCards = targetPrayers.map((prayer) => cards.get(prayer));
    const firstRect = prayerCards[0].getBoundingClientRect();
    const cup = document.createElement("span");
    cup.setAttribute("aria-hidden", "true");
    cup.textContent = "☕";
    cup.className = "savaktija-cup";
    document.body.appendChild(cup);

    const keyframes = [
      {
        transform: `translate3d(${firstRect.left + firstRect.width / 2 - 24}px, ${firstRect.top - 64}px, 0) rotate(-12deg)`,
        offset: 0,
      },
    ];

    prayerCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const x = rect.left + rect.width / 2 - 24;
      const y = rect.top + rect.height / 2 - 24;
      const landingOffset = (index * 2 + 1) / (prayerCards.length * 2);
      const holdOffset = (index * 2 + 2) / (prayerCards.length * 2);

      keyframes.push(
        { transform: `translate3d(${x}px, ${y - 12}px, 0) rotate(12deg) scale(1.12)`, offset: landingOffset },
        { transform: `translate3d(${x}px, ${y}px, 0) rotate(0deg) scale(1)`, offset: holdOffset },
      );

      card.animate(
        [
          { transform: "translateY(0) scale(1)", boxShadow: "0 0 0 0 rgba(45, 160, 100, 0)" },
          { transform: "translateY(-6px) scale(1.03)", boxShadow: "0 8px 24px rgba(45, 160, 100, 0.35)" },
          { transform: "translateY(0) scale(1)", boxShadow: "0 0 0 0 rgba(45, 160, 100, 0)" },
        ],
        {
          duration: 650,
          delay: index * 480,
          easing: "ease-in-out",
        },
      );
    });

    const cupAnimation = cup.animate(keyframes, {
      duration: prayerCards.length * 480,
      easing: "ease-in-out",
    });
    await cupAnimation.finished;
    cup.remove();
    switchPrayerCardPositions(cards);
  };

  const showStartDialog = () => {
    if (document.getElementById("savaktija-switcharoo-dialog")) return;

    const dialog = document.createElement("dialog");
    dialog.id = "savaktija-switcharoo-dialog";
    dialog.setAttribute("aria-labelledby", "savaktija-switcharoo-title");
    dialog.setAttribute("aria-describedby", "savaktija-switcharoo-description");
    const title = document.createElement("h2");
    title.id = "savaktija-switcharoo-title";
    title.textContent = "Ready for a switcharoo?";

    const description = document.createElement("p");
    description.id = "savaktija-switcharoo-description";
    description.textContent =
      "Start the cup's tour of the prayer cards, then watch them switch positions.";

    const actions = document.createElement("div");
    actions.className = "savaktija-dialog-actions";

    const cancelButton = document.createElement("button");
    cancelButton.className = "savaktija-dialog-cancel";
    cancelButton.type = "button";
    cancelButton.textContent = "Not now";

    const startButton = document.createElement("button");
    startButton.className = "savaktija-dialog-start";
    startButton.type = "button";
    startButton.textContent = "Start switcharoo";

    actions.append(cancelButton, startButton);
    dialog.append(title, description, actions);
    document.body.appendChild(dialog);

    cancelButton.addEventListener("click", () => {
      dialog.close();
    });
    startButton.addEventListener("click", () => {
      dialog.close();
      void animatePrayerCards();
    });
    dialog.showModal();
  };

  const initialCards = findPrayerCards();
  if (targetPrayers.every((prayer) => initialCards.has(prayer))) {
    showStartDialog();
  } else {
    const observer = new MutationObserver(() => {
      const cards = findPrayerCards();
      if (targetPrayers.some((prayer) => !cards.has(prayer))) return;

      observer.disconnect();
      window.clearTimeout(timeoutId);
      showStartDialog();
    });
    const timeoutId = window.setTimeout(() => observer.disconnect(), 15000);

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
})();
