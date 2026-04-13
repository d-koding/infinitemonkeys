const STORY_KEY = "infinite-monkeys-story";
const CONTRIBUTION_KEY = "infinite-monkeys-has-contributed";

const storyForm = document.getElementById("story-form");
const sentenceInput = document.getElementById("sentence-input");
const storyText = document.getElementById("story-text");
const statusMessage = document.getElementById("status-message");

const seedStory = [
  "At dawn, the town discovered that every clock was running five minutes behind the birds.",
  "Nobody panicked until the church bell rang before the rope had even been pulled.",
  "By noon, strangers were finishing each other's thoughts as if the day had already happened once.",
];

function loadStory() {
  const saved = localStorage.getItem(STORY_KEY);

  if (!saved) {
    return seedStory;
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : seedStory;
  } catch {
    return seedStory;
  }
}

let story = loadStory();

function hasContributed() {
  return localStorage.getItem(CONTRIBUTION_KEY) === "true";
}

function persistStory() {
  localStorage.setItem(STORY_KEY, JSON.stringify(story));
}

function normalizeSentence(text) {
  return text.trim().replace(/\s+/g, " ");
}

function isSingleSentence(text) {
  const matches = text.match(/[.!?]+/g) || [];
  return matches.length <= 1;
}

function renderStory() {
  storyText.textContent = story.join(" ");
}

function lockContribution(message) {
  sentenceInput.disabled = true;
  sentenceInput.value = "";
  sentenceInput.placeholder = "Your line is already in the story.";
  storyForm.classList.add("is-locked");
  statusMessage.textContent = message;
}

function focusInput() {
  if (!hasContributed()) {
    sentenceInput.focus();
  }
}

storyForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (hasContributed()) {
    lockContribution("You already used your one line on this device.");
    return;
  }

  const text = normalizeSentence(sentenceInput.value);

  if (!text) {
    statusMessage.textContent = "Type one sentence, then press Enter.";
    return;
  }

  if (!/[.!?]$/.test(text)) {
    statusMessage.textContent = "End your line with a period, question mark, or exclamation point.";
    return;
  }

  if (!isSingleSentence(text)) {
    statusMessage.textContent = "Only one sentence.";
    return;
  }

  story = [...story, text];
  persistStory();
  localStorage.setItem(CONTRIBUTION_KEY, "true");
  renderStory();
  lockContribution("Entered. Your line is permanent here, and this device is done.");
});

sentenceInput.addEventListener("input", () => {
  statusMessage.textContent = "Press Enter to add your line.";
});

renderStory();

if (hasContributed()) {
  lockContribution("You already used your one line on this device.");
} else {
  focusInput();
}
