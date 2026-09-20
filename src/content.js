import govFlexibilityText from "./content/government-flexibility.txt?raw";
import optoelectronicaText from "./content/optoelectronica.txt?raw";
import assessingAgentsText from "./content/assessing-agents.txt?raw";
import privateAssessingAgentsText from "./content/private-assessing-agents.txt?raw";
import mantenerseAbiertoText from "./content/mantenerse-abierto.txt?raw";

/**
 * Parse a text file with `## Section Title` markers into { lead, sections }.
 * Lines before the first `## ` marker become the lead.
 * Each `## ` line starts a new section; everything until the next `## ` or EOF
 * becomes that section's paragraphs.
 *
 * A blank line ends the current paragraph; consecutive non-blank lines join
 * into a single paragraph, keeping the original line breaks intact.
 */
function parseMarkeredSections(text) {
  const lines = text.split(/\r?\n/);

  const lead = [];
  const sections = [];
  let currentSection = null;
  let paragraphOpen = false;

  const target = () => (currentSection ? currentSection.paragraphs : lead);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("## ")) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line.slice(3).trim(),
        paragraphs: [],
      };
      paragraphOpen = false;
      continue;
    }

    if (!line) {
      paragraphOpen = false;
      continue;
    }

    const list = target();
    if (paragraphOpen && list.length > 0) {
      list[list.length - 1] += "\n" + line;
    } else {
      list.push(line);
      paragraphOpen = true;
    }
  }

  // Don't forget the last section.
  if (currentSection) {
    sections.push(currentSection);
  }

  return { lead, sections };
}

export const governmentArticle = parseMarkeredSections(govFlexibilityText);
export const assessingAgentsArticle = parseMarkeredSections(assessingAgentsText);
export const optoelectronicaArticle = parseMarkeredSections(optoelectronicaText);
export const mantenerseAbiertoArticle = parseMarkeredSections(mantenerseAbiertoText);
export { privateAssessingAgentsText };