import { governmentArticle, optoelectronicaArticle, dittoPitch80Text } from "./content.js";

import equipoImageSrc from "./assets/equipo.jpeg";
import instalacionImageSrc from "./assets/instalación.jpeg";

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

export function homeTemplate() {
  return `
    <main class="home-shell">
      <section class="hero hero-centered" aria-label="Welcome">
        <div class="home-visitors-shell" aria-label="Visitors">
          <h2 class="visitors-header visitors-widget is-loading" aria-label="Visitors">
            <span id="visitors-count" class="visitors-count" aria-live="polite">—</span>
            <span class="visitors-suffix visitors-suffix--header">visitors</span>
          </h2>
          <div
            id="visitors-fireworks"
            class="visitors-fireworks"
            aria-hidden="true"
          ></div>
        </div>

        <h1 class="hero-title">
          <span id="home-hello-text"></span
          ><span id="home-hello-cursor" class="cursor is-hidden">_</span>
        </h1>

        <div class="home-paths" aria-label="Choose a path">
          <p class="lede lede-home">Choose a path of your interest.</p>

          <section class="bubble-grid" aria-label="Choose a path">
            <button class="bubble" type="button" data-nav="/sociological">
              <span class="bubble-frame">
                <span class="bubble-label">Sociological</span>
              </span>
            </button>
            <button class="bubble" type="button" data-nav="/technological">
              <span class="bubble-frame">
                <span class="bubble-label">Technological</span>
              </span>
            </button>
          </section>
        </div>
      </section>
    </main>
  `;
}

export function sociologicalTemplate() {
  return `
    <main class="home-shell">
      <a class="back-link" href="/" data-nav>&lt; back</a>
      <section class="bubble-grid" aria-label="Sociological routes">
        <a class="bubble tech-box" href="/sociological/government-flexibility" data-nav>
          <span class="bubble-frame">
            <span class="bubble-label">Government flexibility</span>
          </span>
        </a>
        <a class="bubble tech-box" href="/sociological/ditto-pitch-80" data-nav>
          <span class="bubble-frame">
            <span class="bubble-label">Ditto-Pitch-80</span>
          </span>
        </a>
      </section>
    </main>
  `;
}

function governmentFlexibilityArticleTemplate() {
  const lead = governmentArticle.lead
    .map((p) => `<p class="anim-text">${escapeHtml(p)}</p>`)
    .join("");

  const sections = governmentArticle.sections
    .map(
      (section) => `
        <h2 class="article-title anim-text">${escapeHtml(section.title)}</h2>
        ${section.paragraphs
          .map((p) => `<p class="anim-text">${escapeHtml(p)}</p>`)
          .join("")}
      `,
    )
    .join("");

  return `
    <article class="article-shell" aria-label="Government flexibility">
      ${lead}
      ${sections}
    </article>
  `;
}

export function governmentFlexibilityRouteTemplate() {
  return `
    <main class="section-shell">
      <a class="back-link" href="/sociological" data-nav>&lt; back</a>
      ${governmentFlexibilityArticleTemplate()}
    </main>
  `;
}

export function dittoPitch80UnlockedTemplate() {
  return `
    <main class="section-shell">
      <a class="back-link" href="/sociological" data-nav>&lt; back</a>
      <article class="article-shell" aria-label="Ditto-Pitch-80">
        <div class="tech-content">
          <pre class="anim-text">${escapeHtml(dittoPitch80Text)}</pre>
        </div>
      </article>
    </main>
  `;
}

export function dittoPitch80LockedTemplate() {
  return `
    <main class="section-shell">
      <a class="back-link" href="/sociological" data-nav>&lt; back</a>
      <article class="article-shell" aria-label="Ditto-Pitch-80 (locked)">
        <div class="ditto-auth-shell">
          <form class="ditto-auth-form" data-ditto-auth="unlock" autocomplete="off">
            <input
              id="ditto-password-input"
              name="password"
              class="ditto-auth-input"
              type="password"
              autocomplete="off"
              spellcheck="false"
              inputmode="text"
            />
          </form>
        </div>
      </article>
    </main>
  `;
}

export function technologicalTemplate() {
  return `
    <main class="home-shell">
      <a class="back-link" href="/" data-nav>&lt; back</a>
      <section class="bubble-grid" aria-label="Technological routes">
        <a class="bubble tech-box" href="/technological/optoelectronica" data-nav>
          <span class="bubble-frame">
            <span class="bubble-label">Optoelectrónica Icalma</span>
          </span>
        </a>
        <a class="bubble tech-box" href="/technological/system-health" data-nav>
          <span class="bubble-frame">
            <span class="bubble-label">System Health</span>
          </span>
        </a>
      </section>
    </main>
  `;
}

function optoelectronicaArticleTemplate() {
  return `
    <article class="article-shell" aria-label="Optoelectronica">
      ${optoelectronicaArticle.paragraphs
        .map((p) => `<p class="anim-text">${escapeHtml(p)}</p>`)
        .join("")}

      <section class="article-images" aria-label="Photos">
        <figure class="article-figure">
          <img
            src="${equipoImageSrc}"
            alt="Equipo de Optoelectrónica"
            loading="lazy"
          />
          <figcaption>Equipo de trabajo en Optoelectrónica.</figcaption>
        </figure>

        <figure class="article-figure">
          <img
            src="${instalacionImageSrc}"
            alt="Instalación del panel"
            loading="lazy"
          />
          <figcaption>Instalación del panel y montaje del sistema.</figcaption>
        </figure>
      </section>
    </article>
  `;
}

export function optoelectronicaTemplate() {
  return `
    <main class="section-shell">
      <a class="back-link" href="/technological" data-nav>&lt; back</a>
      ${optoelectronicaArticleTemplate()}
    </main>
  `;
}

export function systemHealthTemplate() {
  return `
    <main class="section-shell">
      <a class="back-link" href="/technological" data-nav>&lt; back</a>
      <article class="article-shell" aria-label="System Health Log">
        <div id="health-prompt"></div>
        <div id="health-cursor" class="cursor is-hidden">_</div>
        <div id="health-log-content" class="health-log-content anim-text"></div>
      </article>
    </main>
  `;
}

export function notFoundTemplate() {
  return `
    <main class="section-shell">
      <a class="back-link" href="/" data-nav>&lt; back</a>
      <section class="hero section-hero">
        <h1 class="section-title">404</h1>
        <p class="lede">This route does not exist.</p>
      </section>
    </main>
  `;
}
