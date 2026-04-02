/**
 * Lightweight character-level text splitting utility.
 * Replaces GSAP's paid SplitText plugin.
 */

export function splitTextToChars(element: HTMLElement): HTMLSpanElement[] {
  const text = element.textContent || "";
  element.textContent = "";
  element.setAttribute("aria-label", text);

  const chars: HTMLSpanElement[] = [];

  for (const char of text) {
    const span = document.createElement("span");
    span.style.display = "inline-block";
    span.style.willChange = "transform, opacity";

    if (char === " ") {
      span.innerHTML = "&nbsp;";
    } else {
      span.textContent = char;
    }

    span.setAttribute("aria-hidden", "true");
    element.appendChild(span);
    chars.push(span);
  }

  return chars;
}

/**
 * Split text into words, preserving each word as a span.
 * Useful for About section where we need word-level + char-level control.
 */
export function splitTextToWords(element: HTMLElement): HTMLSpanElement[] {
  const text = element.textContent || "";
  element.textContent = "";
  element.setAttribute("aria-label", text);

  const words: HTMLSpanElement[] = [];
  const parts = text.split(/(\s+)/);

  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      const space = document.createElement("span");
      space.innerHTML = "&nbsp;";
      space.style.display = "inline-block";
      element.appendChild(space);
      continue;
    }

    const wordSpan = document.createElement("span");
    wordSpan.style.display = "inline-block";
    wordSpan.style.willChange = "transform, opacity";
    wordSpan.textContent = part;
    wordSpan.setAttribute("aria-hidden", "true");
    element.appendChild(wordSpan);
    words.push(wordSpan);
  }

  return words;
}

/**
 * Split text into words, then each word into chars.
 * Returns { words, chars } for flexible animation control.
 */
export function splitTextToWordsAndChars(element: HTMLElement): {
  words: HTMLSpanElement[];
  chars: HTMLSpanElement[];
} {
  const text = element.textContent || "";
  element.textContent = "";
  element.setAttribute("aria-label", text);

  const words: HTMLSpanElement[] = [];
  const chars: HTMLSpanElement[] = [];
  const parts = text.split(/(\s+)/);

  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      const space = document.createElement("span");
      space.innerHTML = "&nbsp;";
      space.style.display = "inline-block";
      element.appendChild(space);
      continue;
    }

    const wordSpan = document.createElement("span");
    wordSpan.style.display = "inline-block";
    wordSpan.style.overflow = "hidden";

    for (const char of part) {
      const charSpan = document.createElement("span");
      charSpan.style.display = "inline-block";
      charSpan.style.willChange = "transform, opacity";
      charSpan.textContent = char;
      charSpan.setAttribute("aria-hidden", "true");
      wordSpan.appendChild(charSpan);
      chars.push(charSpan);
    }

    element.appendChild(wordSpan);
    words.push(wordSpan);
  }

  return { words, chars };
}
