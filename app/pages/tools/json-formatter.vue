<template>
  <ToolLayout
    title="JSON Formatter & Validator"
    description="Validate, beautify, minify, and browse complex JSON data support JSON5."
    :showAdSlot="false"
  >
    <template #icon
      ><i class="ph-fill ph-brackets-curly text-blue-500"></i
    ></template>

    <div
      class="max-w-[1400px] mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6"
    >
      <main class="lg:w-full flex-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 editor-height">
          <div class="flex flex-col h-full">
            <div
              class="flex flex-wrap justify-between items-center mb-2 px-1 gap-2"
            >
              <label
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Input JSON</label
              >

              <div class="flex items-center gap-2">
                <button
                  @click="handleUnescape"
                  class="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-primary rounded border border-slate-700 transition"
                  title="Remove backslashes from string"
                >
                  <i class="ph-bold ph-magic-wand"></i> Unescape
                </button>

                <button
                  @click="formatJSON(0)"
                  class="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-primary rounded border border-slate-700 transition"
                  title="Compress to single line"
                >
                  <i class="ph-bold ph-arrows-in-line-horizontal"></i> Minify
                </button>

                <button
                  @click="formatJSON(2)"
                  class="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-primary rounded border border-slate-700 transition"
                  title="Format with indentation"
                >
                  <i class="ph-bold ph-rows"></i> Beautify
                </button>

                <button
                  @click="clearAll"
                  class="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 rounded border border-slate-700 transition"
                  title="Clear all text"
                >
                  <i class="ph-bold ph-trash"></i> Clear
                </button>
              </div>
            </div>

            <div class="relative flex-1">
              <textarea
                id="jsonInput"
                v-model="jsonInput"
                @input="handleInput"
                class="w-full h-full bg-editor border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none placeholder-slate-600 leading-relaxed custom-scrollbar"
                placeholder="Paste your JSON here..."
              ></textarea>
              <div
                v-if="!jsonInput"
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
              >
                <p class="text-slate-600 text-sm mb-2">Paste JSON or</p>
                <button
                  @click="loadSample"
                  class="pointer-events-auto text-primary hover:underline text-sm"
                >
                  Load Sample Data
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-col h-full">
            <div class="flex justify-between items-center mb-2 px-1">
              <div
                class="flex gap-3 bg-card rounded-lg p-1 border border-slate-700/50"
              >
                <button
                  @click="outputView = 'tree'"
                  :class="[
                    'px-3 py-1 text-xs font-bold rounded transition',
                    outputView === 'tree'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-500 hover:text-slate-300',
                  ]"
                  :disabled="!isValidJson"
                >
                  Tree View
                </button>
                <button
                  @click="outputView = 'text'"
                  :class="[
                    'px-3 py-1 text-xs font-bold rounded transition',
                    outputView === 'text'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-500 hover:text-slate-300',
                  ]"
                >
                  Text View
                </button>
              </div>
              <button
                @click="copyOutput"
                id="copyBtn"
                class="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition"
              >
                <i class="ph-bold ph-copy"></i> Copy
              </button>
            </div>

            <div
              class="relative flex-1 bg-editor border rounded-lg overflow-hidden"
              :class="{
                'border-red-500': showError,
                'border-slate-700': !showError,
              }"
            >
              <div
                v-if="showError"
                class="absolute top-0 left-0 right-0 bg-red-900/90 text-red-200 text-xs p-2 border-b border-red-700 z-20 flex items-center gap-2"
              >
                <i class="ph-bold ph-warning-circle"></i> {{ errorMsg }}
              </div>

              <div
                v-if="outputView === 'tree' && isValidJson"
                class="w-full h-full p-4 overflow-auto custom-scrollbar"
              >
                <VueJsonPretty
                  :data="parsedJson"
                  :deep="deep"
                  :showLength="true"
                  :showLine="false"
                  :showDoubleQuotes="true"
                  theme="dark"
                  class="json-tree-theme"
                />
              </div>

              <div
                v-if="outputView === 'tree' && !isValidJson && !showError"
                class="w-full h-full flex flex-col items-center justify-center text-slate-500"
              >
                <i
                  class="ph-duotone ph-tree-structure text-4xl mb-2 opacity-50"
                ></i>
                <span class="text-sm">Valid JSON required for Tree View</span>
              </div>

              <div
                v-show="outputView === 'text'"
                class="w-full h-full relative"
              >
                <pre
                  class="w-full h-full p-4 overflow-auto m-0 custom-scrollbar"
                ><code id="jsonOutput" class="language-json font-mono text-sm">{{ jsonOutput }}</code></pre>
              </div>
            </div>
          </div>
        </div>

        <article class="mt-12 prose prose-invert max-w-none text-slate-400">
          <h2 class="text-white text-lg font-semibold">Features</h2>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <li>
              ✅ <strong>Tree View:</strong> Fold/Expand objects and arrays
              deeply.
            </li>
            <li>
              ✅ <strong>Beautify:</strong> Format with standard indentation.
            </li>
            <li>✅ <strong>Minify:</strong> Compress JSON to a single line.</li>
            <li>
              ✅ <strong>Unescape:</strong> Restore JSON from escaped strings.
            </li>
            <li>
              ✅ <strong>JSON5:</strong> Supports trailing commas and comments.
            </li>
            <li>✅ <strong>Secure:</strong> 100% client-side processing.</li>
          </ul>
        </article>
      </main>
    </div>
    <template #sidebar>
      <aside class="w-full lg:w-80 flex flex-col gap-6">
        <div class="bg-card border border-slate-800 rounded-xl p-4">
          <h4 class="font-bold text-white mb-4 text-sm">Related Tools</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink
                to="/tools/sql-formatter"
                class="text-slate-400 hover:text-primary flex items-center gap-2"
                ><i class="ph-fill ph-database"></i> SQL Formatter</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/tools/json-to-go"
                class="text-slate-400 hover:text-primary flex items-center gap-2"
                ><i class="ph-fill ph-file-code"></i> JSON to Go</NuxtLink
              >
            </li>
          </ul>
        </div>
        <SidebarAd />
      </aside>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from "vue";
import Prism from "prismjs";
import JSON5 from "json5";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

// --- Reactive State ---
const jsonInput = ref("");
const jsonOutput = ref("");
const parsedJson = ref({});
const isValidJson = ref(false);
const showError = ref(false);
const errorMsg = ref("");
const outputView = ref("text");
const deep = ref(2);

// --- Core Logic ---

function handleInput() {
  const raw = jsonInput.value.trim();
  if (!raw) {
    isValidJson.value = false;
    return;
  }

  try {
    const obj = JSON5.parse(raw);
    parsedJson.value = obj;
    isValidJson.value = true;
    hideError();

    if (outputView.value === "text") {
      jsonOutput.value = JSON.stringify(obj, null, 2);
      nextTick(() => highlightCode());
    }
  } catch (e) {
    isValidJson.value = false;
    // Silent fail on real-time input
  }
}

/**
 * Format / Minify Logic
 * indent: 2 (Beautify), 0 (Minify)
 */
function formatJSON(indent) {
  const raw = jsonInput.value.trim();
  if (!raw) return;

  hideError();

  try {
    const obj = JSON5.parse(raw);
    parsedJson.value = obj;
    isValidJson.value = true;

    const formatted = JSON.stringify(obj, null, indent);
    jsonOutput.value = formatted;

    // Switch to text view to show result
    outputView.value = "text";

    nextTick(() => highlightCode());
  } catch (e) {
    displayError(e.message);
  }
}

/**
 * Unescape Logic
 */
function handleUnescape() {
  const raw = jsonInput.value.trim();
  if (!raw) return;

  try {
    let unescaped = "";
    if (raw.startsWith('"') && raw.endsWith('"')) {
      unescaped = JSON.parse(raw);
    } else {
      unescaped = raw.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }

    jsonInput.value =
      typeof unescaped === "string" ? unescaped : JSON.stringify(unescaped);
    handleInput();
    formatJSON(2);
  } catch (e) {
    displayError("Failed to unescape: Invalid format");
  }
}

function highlightCode() {
  if (window.Prism) {
    const element = document.getElementById("jsonOutput");
    if (element) Prism.highlightElement(element);
  }
}

// --- Error Handling ---

function displayError(msg) {
  errorMsg.value = msg;
  showError.value = true;
}

function hideError() {
  errorMsg.value = "";
  showError.value = false;
}

// --- Actions ---

function clearAll() {
  jsonInput.value = "";
  jsonOutput.value = "";
  parsedJson.value = {};
  isValidJson.value = false;
  hideError();
}

function loadSample() {
  const sample = `{
    "project": "DevTool",
    "actions": [
        "Minify", 
        "Unescape",
        "Clear" 
    ],
    "nested": {
        "a": 1,
        "b": { "c": 2 }
    },
    "escaped_example": "{\\"inner\\": \\"value\\"}",
    "active": true
}`;
  jsonInput.value = sample;
  handleInput();
  outputView.value = "tree";
}

function copyOutput() {
  const text = isValidJson.value
    ? outputView.value === "text"
      ? jsonOutput.value
      : JSON.stringify(parsedJson.value, null, 2)
    : jsonOutput.value;

  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyBtn");
    if (btn) {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="ph-bold ph-check text-green-500"></i> Copied!';
      setTimeout(() => (btn.innerHTML = originalHTML), 2000);
    }
  });
}

watch(outputView, (newVal) => {
  if (newVal === "text" && isValidJson.value) {
    if (!jsonOutput.value) {
      jsonOutput.value = JSON.stringify(parsedJson.value, null, 2);
    }
    nextTick(() => highlightCode());
  }
});

onMounted(() => {
  loadSample();
});
</script>

<style scoped>
/* Scoped Colors */
.text-primary {
  color: #3b82f6;
}
.bg-dark {
  background-color: #0f172a;
}
.bg-card {
  background-color: #1e293b;
}
.bg-editor {
  background-color: #111827;
}

/* Editor Height */
.editor-height {
  height: calc(100vh - 240px);
  min-height: 500px;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* VueJsonPretty Dark Theme Overrides */
:deep(.vjs-tree) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
  color: #e2e8f0;
}
:deep(.vjs-key) {
  color: #93c5fd !important;
}
:deep(.vjs-value) {
  color: #86efac !important;
}
:deep(.vjs-value-number) {
  color: #fca5a5 !important;
}
:deep(.vjs-value-boolean) {
  color: #fcd34d !important;
}
:deep(.vjs-value-null) {
  color: #94a3b8 !important;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
