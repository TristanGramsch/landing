export function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function typeInto(element, text, speed) {
  element.textContent = "";

  for (const character of text) {
    element.textContent += character;
    await sleep(speed);
  }
}
