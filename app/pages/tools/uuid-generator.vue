<template>
  <ToolLayout
    title="UUID Generator (v4)"
    description="Generate secure, random Version 4 UUIDs (Universally Unique Identifiers) directly in your browser."
    :showAdSlot="false"
  >
    <template #icon
      ><div class="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
        <i class="ph-fill ph-fingerprint text-3xl"></i></div
    ></template>

    <div
      class="max-w-[1400px] mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-8"
    >
      <main class="flex-1">
        <div
          class="bg-card border border-slate-800 rounded-xl p-6 mb-6 shadow-xl shadow-black/20"
        >
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end"
          >
            <div class="col-span-1 lg:col-span-2">
              <div class="flex justify-between mb-2">
                <label class="font-bold text-white text-sm">Quantity</label>
                <span
                  id="rangeValue"
                  class="text-primary font-mono font-bold"
                  >{{ options.quantity }}</span
                >
              </div>
              <input
                type="range"
                id="quantity"
                min="1"
                max="1000"
                v-model.number="options.quantity"
                @input="generate"
                class="w-full mb-2"
              />
            </div>

            <div class="flex flex-col gap-3">
              <label
                class="flex items-center gap-2 cursor-pointer select-none group"
              >
                <div class="relative">
                  <input
                    type="checkbox"
                    id="hyphens"
                    v-model="options.hyphens"
                    @change="generate"
                    checked
                    class="sr-only peer"
                  />
                  <div
                    class="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"
                  ></div>
                </div>
                <span
                  class="text-sm text-slate-300 group-hover:text-white transition"
                  >Hyphens ( - )</span
                >
              </label>

              <label
                class="flex items-center gap-2 cursor-pointer select-none group"
              >
                <div class="relative">
                  <input
                    type="checkbox"
                    id="uppercase"
                    v-model="options.uppercase"
                    @change="generate"
                    class="sr-only peer"
                  />
                  <div
                    class="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"
                  ></div>
                </div>
                <span
                  class="text-sm text-slate-300 group-hover:text-white transition"
                  >Uppercase</span
                >
              </label>
            </div>

            <div>
              <button
                @click="generate"
                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <i class="ph-bold ph-arrows-clockwise"></i> Generate
              </button>
            </div>
          </div>
        </div>

        <div class="relative">
          <div class="flex justify-between items-center mb-2 px-1">
            <label
              class="text-xs font-bold text-slate-500 uppercase tracking-wider"
              >Result</label
            >
            <div class="flex gap-3">
              <button
                @click="copyResult"
                id="copyBtn"
                class="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition"
              >
                <i class="ph-bold ph-copy"></i> Copy To Clipboard
              </button>
            </div>
          </div>

          <textarea
            id="output"
            readonly
            v-model="output"
            class="result-box w-full bg-editor border border-slate-700 rounded-xl p-6 font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y leading-loose text-lg"
          ></textarea>

          <div
            id="toast"
            :class="[
              'fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl transition-opacity duration-300 pointer-events-none flex items-center gap-2',
              { 'opacity-100': copied, 'opacity-0': !copied },
            ]"
          >
            <i class="ph-bold ph-check-circle text-xl"></i>
            <span class="font-medium">Copied to clipboard!</span>
          </div>
        </div>

        <article
          class="mt-16 prose prose-invert max-w-none text-slate-400 border-t border-slate-800 pt-10"
        >
          <h2 class="text-white">What is a UUID?</h2>
          <p>
            A <strong>UUID (Universally Unique Identifier)</strong> is a 128-bit
            number used to uniquely identify information in computer systems.
            The probability of generating a duplicate UUID is so close to zero
            that it is negligible.
          </p>

          <h3 class="text-white">Why use Version 4?</h3>
          <p>
            There are different versions of UUIDs. <strong>Version 4</strong> is
            completely random (unlike v1 which is time-based). This makes it
            perfect for generating non-guessable IDs for database keys, session
            tokens, or file names.
          </p>
        </article>
      </main>
    </div>
    <template #sidebar>
      <aside class="w-full lg:w-80 flex flex-col gap-6">
        <div
          class="bg-card border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center min-h-[250px]"
        >
          <span class="text-xs font-bold text-slate-600 uppercase mb-2"
            >Advertisement</span
          >
          <div class="text-slate-500 text-sm">
            <i class="ph-duotone ph-rocket text-4xl mb-2"></i><br />
            Deploy your Apps<br />on Vercel
          </div>
        </div>

        <div class="bg-card border border-slate-800 rounded-xl p-5">
          <h4 class="font-bold text-white mb-4 text-sm flex items-center gap-2">
            <i class="ph-fill ph-wrench text-primary"></i> Developer Tools
          </h4>
          <div class="flex flex-col gap-3">
            <NuxtLink
              to="/tools/json-formatter"
              class="group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition"
            >
              <div
                class="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center text-blue-400 group-hover:text-blue-300"
              >
                <i class="ph-fill ph-file-code"></i>
              </div>
              <div>
                <div
                  class="text-sm font-medium text-slate-300 group-hover:text-white"
                >
                  JSON Formatter
                </div>
                <div class="text-xs text-slate-500">Validator & Beautifier</div>
              </div>
            </NuxtLink>
            <NuxtLink
              to="/tools/sql-formatter"
              class="group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition"
            >
              <div
                class="w-8 h-8 bg-purple-500/10 rounded flex items-center justify-center text-purple-400 group-hover:text-purple-300"
              >
                <i class="ph-fill ph-database"></i>
              </div>
              <div>
                <div
                  class="text-sm font-medium text-slate-300 group-hover:text-white"
                >
                  SQL Formatter
                </div>
                <div class="text-xs text-slate-500">MySQL & PostgreSQL</div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <SidebarAd />
      </aside>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
// Assuming SidebarAd, NuxtLink, ToolLayout are available

// --- Reactive State ---
const options = reactive({
  quantity: 1,
  hyphens: true,
  uppercase: false,
});
const output = ref("");
const copied = ref(false);

// --- Core Logic ---

// Fallback for UUID generation (similar to HTML but ensuring security)
function fallbackUuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

// Core algorithm: Generates v4 UUID using crypto.randomUUID or a secure fallback
function uuidv4() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return fallbackUuidv4();
}

function generate() {
  const count = options.quantity;
  const useHyphens = options.hyphens;
  const useUpper = options.uppercase;

  let results = [];

  // Ensure we run the loop synchronously for the count
  for (let i = 0; i < count; i++) {
    let uuid = uuidv4();

    if (!useHyphens) {
      uuid = uuid.replace(/-/g, "");
    }
    if (useUpper) {
      uuid = uuid.toUpperCase();
    }
    results.push(uuid);
  }

  output.value = results.join("\n");
}

// --- Actions ---

function copyResult() {
  const text = output.value;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
}

// --- Initialization ---

onMounted(() => {
  // Init: Set initial quantity and generate one UUID
  options.quantity = 1;
  generate();
});
</script>

<style scoped>
/* Custom Range Slider Styles (Adapted from HTML) */
input[type="range"] {
  -webkit-appearance: none;
  background: transparent;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  margin-top: -6px;
  cursor: pointer;
}
input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #334155;
  border-radius: 2px;
}

/* Base colors */
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

/* Result Area Height */
.result-box {
  min-height: 400px;
  max-height: 70vh;
}
.leading-loose {
  line-height: 2;
}
</style>
