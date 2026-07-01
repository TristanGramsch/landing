import govFlexibilityText from "./content/government-flexibility.txt?raw";
import optoelectronicaText from "./content/optoelectronica.txt?raw";
import assessingAgentsText from "./content/assessing-agents.txt?raw";
import privateAssessingAgentsText from "./content/private-assessing-agents.txt?raw";

const GOVERNMENT_TITLE_PAIN_POINTS =
  "The pains of inflexibility at local public health";
const GOVERNMENT_TITLE_INCENTIVIZE =
  "Incentivizing flexibility at local public health";

function parseGovernmentFlexibility(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const idx1 = lines.indexOf(GOVERNMENT_TITLE_PAIN_POINTS);
  const idx2 = lines.indexOf(GOVERNMENT_TITLE_INCENTIVIZE);

  if (idx1 === -1 || idx2 === -1 || idx2 <= idx1) {
    return {
      lead: lines,
      sections: [],
    };
  }

  return {
    lead: lines.slice(0, idx1),
    sections: [
      {
        title: GOVERNMENT_TITLE_PAIN_POINTS,
        paragraphs: lines.slice(idx1 + 1, idx2),
      },
      {
        title: GOVERNMENT_TITLE_INCENTIVIZE,
        paragraphs: lines.slice(idx2 + 1),
      },
    ],
  };
}

function parseOptoelectronica(text) {
  const paragraphs = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return { paragraphs };
}

export const governmentArticle = parseGovernmentFlexibility(govFlexibilityText);
export const optoelectronicaArticle = parseOptoelectronica(optoelectronicaText);
export { assessingAgentsText, privateAssessingAgentsText };
