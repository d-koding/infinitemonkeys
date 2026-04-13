const CONTRIBUTION_KEY = "infinite-monkeys-has-contributed";
const DEFAULT_STATUS = "Press Enter to add your line.";
const APP_CONFIG = window.APP_CONFIG || {};

const storyForm = document.getElementById("story-form");
const sentenceInput = document.getElementById("sentence-input");
const storyText = document.getElementById("story-text");
const statusMessage = document.getElementById("status-message");

const seedStory = [];
const onlineStoryConfigured =
  typeof APP_CONFIG.supabaseUrl === "string" &&
  typeof APP_CONFIG.supabaseAnonKey === "string" &&
  APP_CONFIG.supabaseUrl.length > 0 &&
  APP_CONFIG.supabaseAnonKey.length > 0 &&
  !APP_CONFIG.supabaseUrl.includes("YOUR_") &&
  !APP_CONFIG.supabaseAnonKey.includes("YOUR_");

let story = seedStory;

function hasContributed() {
  return localStorage.getItem(CONTRIBUTION_KEY) === "true";
}

function setStatus(message) {
  statusMessage.textContent = message;
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

function setInputEnabled(enabled) {
  sentenceInput.disabled = !enabled;
}

function lockContribution(message, keepValue = false, placeholder = "Your line is already in the story.") {
  setInputEnabled(false);
  if (!keepValue) {
    sentenceInput.value = "";
  }
  sentenceInput.placeholder = placeholder;
  storyForm.classList.add("is-locked");
  setStatus(message);
}

function unlockContribution() {
  storyForm.classList.remove("is-locked");
  sentenceInput.placeholder = "";
  setInputEnabled(true);
}

function focusInput() {
  if (!hasContributed()) {
    sentenceInput.focus();
  }
}

function getSupabaseHeaders(extraHeaders = {}) {
  return {
    apikey: APP_CONFIG.supabaseAnonKey,
    Authorization: `Bearer ${APP_CONFIG.supabaseAnonKey}`,
    ...extraHeaders,
  };
}

async function loadStory() {
  if (!onlineStoryConfigured) {
    throw new Error("Missing Supabase config.");
  }

  const response = await fetch(
    `${APP_CONFIG.supabaseUrl}/rest/v1/story_lines?select=text&order=created_at.asc,id.asc`,
    {
      headers: getSupabaseHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`Unable to load story (${response.status}).`);
  }

  const rows = await response.json();
  return rows
    .map((row) => (typeof row.text === "string" ? row.text.trim() : ""))
    .filter(Boolean);
}

async function addStoryLine(text) {
  if (!onlineStoryConfigured) {
    throw new Error("Missing Supabase config.");
  }

  const response = await fetch(`${APP_CONFIG.supabaseUrl}/rest/v1/story_lines`, {
    method: "POST",
    headers: getSupabaseHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify([{ text }]),
  });

  if (!response.ok) {
    throw new Error(`Unable to save line (${response.status}).`);
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
    setStatus("Type one sentence, then press Enter.");
    return;
  }

  if (!/[.!?]$/.test(text)) {
    setStatus("End your line with a period, question mark, or exclamation point.");
    return;
  }

  if (!isSingleSentence(text)) {
    setStatus("Only one sentence.");
    return;
  }

  setInputEnabled(false);
  setStatus("Adding your line to the story...");

  addStoryLine(text)
    .then(() => loadStory())
    .then((nextStory) => {
      story = nextStory;
      renderStory();
      localStorage.setItem(CONTRIBUTION_KEY, "true");
      lockContribution("Entered. Your line is permanent here, and this device is done.");
    })
    .catch((error) => {
      unlockContribution();
      sentenceInput.focus();
      setStatus(error.message || "Could not save your line right now.");
    });
});

sentenceInput.addEventListener("input", () => {
  setStatus(DEFAULT_STATUS);
});

async function initializeApp() {
  setInputEnabled(false);
  setStatus("Loading story...");

  if (!onlineStoryConfigured) {
    renderStory();
    lockContribution(
      "Add your Supabase settings in config.js to turn on shared persistence.",
      true,
      "Add Supabase settings to enable the live story."
    );
    return;
  }

  try {
    story = await loadStory();
    renderStory();

    if (hasContributed()) {
      lockContribution("You already used your one line on this device.");
      return;
    }

    unlockContribution();
    setStatus(DEFAULT_STATUS);
    focusInput();
  } catch (error) {
    renderStory();
    lockContribution(
      error.message || "Could not connect to the story service.",
      true,
      "The live story is unavailable right now."
    );
  }
}

initializeApp();
