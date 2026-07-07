import govFlexibilityText from "./content/government-flexibility.txt?raw";
import optoelectronicaText from "./content/optoelectronica.txt?raw";
import assessingAgentsText from "./content/assessing-agents.txt?raw";
import privateAssessingAgentsText from "./content/private-assessing-agents.txt?raw";

/**
 * Parse a text file with `## Section Title` markers into { lead, sections }.
 * Lines before the first `## ` marker become the lead.
 * Each `## ` line starts a new section; everything until the next `## ` or EOF
 * becomes that section's paragraphs.
 */
function parseMarkeredSections(text) {
  const lines = text.split(/\r?\n/);

  const lead = [];
  const sections = [];
  let currentSection = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("## ")) {
      // Push the previous section if one was being collected.
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line.slice(3).trim(),
        paragraphs: [],
      };
      continue;
    }

    if (!line) continue; // skip blank lines

    if (currentSection) {
      currentSection.paragraphs.push(line);
    } else {
      lead.push(line);
    }
  }

  // Don't forget the last section.
  if (currentSection) {
    sections.push(currentSection);
  }

  return { lead, sections };
}

function parseOptoelectronica(text) {
  const paragraphs = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return { paragraphs };
}

export const governmentArticle = parseMarkeredSections(govFlexibilityText);
export const optoelectronicaArticle = parseOptoelectronica(optoelectronicaText);
export { assessingAgentsText, privateAssessingAgentsText };