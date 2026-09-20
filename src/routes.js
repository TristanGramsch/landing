import { governmentArticle, assessingAgentsArticle, optoelectronicaArticle, mantenerseAbiertoArticle, privateAssessingAgentsText } from "./content.js";
import { greeting } from "./lib/greeting.js";

import equipoImageSrc from "./assets/equipo.jpeg";
import instalacionImageSrc from "./assets/instalación.jpeg";
import hanoPngUrl from "./assets/44-hano.png?url";

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

function linkifyText(text) {
  return text.replace(/(https?:\/\/[^\s<>]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

export function homeTemplate() {
  return `
    <main class="home-shell">
      <section class="hero hero-centered" aria-label="Welcome">
        <div class="home-visitors-shell" aria-label="Visitors">
          <span class="visitors-widget">
            <span id="visitors-count" class="visitors-count" aria-live="polite">—</span>
            <span class="visitors-suffix">visitors</span>
          </span>
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
          <p class="lede lede-home">${greeting.lede}</p>

          <section class="bubble-grid" aria-label="Choose a path">
            <button class="bubble" type="button" data-nav="/sociological">
              <span class="bubble-frame">
                <span class="bubble-label">${greeting.bubbles[0]}</span>
              </span>
            </button>
            <button class="bubble" type="button" data-nav="/technological">
              <span class="bubble-frame">
                <span class="bubble-label">${greeting.bubbles[1]}</span>
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
      <section class="bubble-grid triangle" aria-label="Sociological routes">
        <a class="bubble tech-box" href="/sociological/government-flexibility" data-nav>
          <span class="bubble-frame">
            <span class="bubble-label">Government flexibility</span>
          </span>
        </a>
        <a class="bubble tech-box" href="/sociological/assessing-agents" data-nav>
          <span class="bubble-frame">
            <span class="bubble-label">AssessingAgents</span>
          </span>
        </a>
        <a class="bubble tech-box" href="/sociological/mantenerse-abierto" data-nav>
          <span class="bubble-frame">
            <span class="bubble-label">Mantenerse abierto</span>
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

function assessingAgentsArticleTemplate() {
  const lead = assessingAgentsArticle.lead
    .map((p) => `<p class="anim-text">${linkifyText(escapeHtml(p))}</p>`)
    .join("");

  // Insert PDF link between the last two sections (Research → More research).
  const sectionsArr = assessingAgentsArticle.sections;
  const allButLast = sectionsArr.slice(0, -1);
  const lastSection = sectionsArr[sectionsArr.length - 1];

  function renderSection(section) {
    return `
        <h2 class="article-title anim-text">${escapeHtml(section.title)}</h2>
        ${section.paragraphs
          .map((p) => `<p class="anim-text">${linkifyText(escapeHtml(p))}</p>`)
          .join("")}
      `;
  }

  return `
    <article class="article-shell" aria-label="Assessing Agents">
      ${lead}
      ${allButLast.map(renderSection).join("")}
      <p class="pdf-link-wrapper">
        <a href="/sociological/assessing-agents/comparison-report.pdf" target="_blank" rel="noopener" class="pdf-link">View full comparison report (PDF)</a>
      </p>
      ${lastSection ? renderSection(lastSection) : ""}
      <img class="assessing-agents-hano-image" src="${hanoPngUrl}" alt="44 Hano (image)" loading="lazy" />
      <p class="anim-text">${linkifyText(escapeHtml(privateAssessingAgentsText))}</p>
    </article>
  `;
}

export function assessingAgentsUnlockedTemplate() {
  return `
    <main class="section-shell">
      <a class="back-link" href="/sociological" data-nav>&lt; back</a>
      ${assessingAgentsArticleTemplate()}
    </main>
  `;
}

export function assessingAgentsLockedTemplate() {
  return `
    <main class="section-shell">
      <a class="back-link" href="/sociological" data-nav>&lt; back</a>
      ${assessingAgentsArticleTemplate()}
      <div class="assessing-agents-auth-shell">
        <form class="assessing-agents-auth-form" data-assessing-agents-auth="unlock" autocomplete="off">
          <input
            id="assessing-agents-password-input"
            name="password"
            class="assessing-agents-auth-input"
            type="password"
            autocomplete="off"
            spellcheck="false"
            inputmode="text"
          />
        </form>
      </div>
    </main>
  `;
}

function mantenerseAbiertoArticleTemplate() {
  const paragraphs = mantenerseAbiertoArticle.lead
    .map((p) => `<p class="anim-text">${escapeHtml(p)}</p>`)
    .join("");

  return `
    <article class="article-shell" aria-label="Mantenerse abierto">
      ${paragraphs}
    </article>
  `;
}

export function mantenerseAbiertoRouteTemplate() {
  return `
    <main class="section-shell">
      <a class="back-link" href="/sociological" data-nav>&lt; back</a>
      ${mantenerseAbiertoArticleTemplate()}
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
      ${optoelectronicaArticle.lead
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
