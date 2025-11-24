<template>
  <ToolLayout
    title="URL Encoder / Decoder"
    description="Convert characters into a format that can be transmitted over the Internet."
    :showAdSlot="false"
  >
    <template #icon><i class="ph-fill ph-link text-accent"></i></template>

    <div
      class="max-w-[1400px] mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6"
    >
      <main class="flex-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 editor-height">
          <div class="flex flex-col h-full relative gap-2">
            <div class="flex justify-between items-center px-1">
              <label
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Input Text</label
              >
              <button
                @click="pasteInput"
                class="text-xs text-accent hover:underline cursor-pointer"
              >
                Paste
              </button>
            </div>

            <textarea
              id="input"
              v-model="input"
              class="flex-1 w-full bg-editor border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none placeholder-slate-600"
              placeholder="Paste URL or text here..."
            ></textarea>

            <div class="flex gap-3 pt-2">
              <button
                @click="process('encode')"
                class="flex-1 bg-accent hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <i class="ph-bold ph-arrow-right"></i> Encode
              </button>
              <button
                @click="process('decode')"
                class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <i class="ph-bold ph-arrow-left"></i> Decode
              </button>
            </div>
          </div>

          <div class="flex flex-col h-full gap-2">
            <div class="flex justify-between items-center px-1">
              <label
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Result</label
              >
              <button
                @click="copyOutput"
                id="copyBtn"
                class="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition"
              >
                <i class="ph-bold ph-copy"></i> Copy
              </button>
            </div>

            <div
              class="relative flex-1 bg-editor border border-slate-700 rounded-lg overflow-hidden"
            >
              <textarea
                id="output"
                v-model="output"
                readonly
                class="w-full h-full bg-transparent p-4 font-mono text-sm text-cyan-400 focus:outline-none resize-none placeholder-slate-700"
                placeholder="Result will appear here..."
              ></textarea>

              <div
                v-if="showError"
                id="errorOverlay"
                class="absolute inset-0 bg-dark/80 flex items-center justify-center backdrop-blur-sm"
              >
                <div
                  class="bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3"
                >
                  <i class="ph-fill ph-warning-circle text-xl"></i>
                  <span id="errorMsg">Malformed URI sequence</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <article class="mt-12 prose prose-invert max-w-none text-slate-400">
          <h2 class="text-white text-lg font-semibold">
            URL Encoding Explained
          </h2>
          <p>
            URL encoding (also known as percent-encoding) is a mechanism for
            encoding information in a Uniform Resource Identifier (URI).
          </p>
          <p>
            Characters that are not allowed in a URL (like spaces,
            <code>&</code>, <code>?</code>, or non-ASCII characters) must be
            translated into a safe format. For example, a space becomes
            <code>%20</code>.
          </p>
        </article>
      </main>
    </div>
    <template #sidebar>
      <aside class="w-full lg:w-80 flex flex-col gap-6">
        <div class="bg-card border border-slate-800 rounded-xl p-4">
          <h4 class="font-bold text-white mb-4 text-sm flex items-center gap-2">
            <i class="ph-fill ph-arrows-left-right text-yellow-500"></i>
            Related Tool
          </h4>
          <p class="text-xs text-slate-400 mb-3">
            Working with Data URIs or Basic Auth? Use Base64 instead.
          </p>
          <NuxtLink
            to="/tools/base64-converter"
            class="block text-center w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition"
            >Open Base64 Converter</NuxtLink
          >
        </div>

        <SidebarAd />
      </aside>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref } from "vue";

// --- Reactive State ---
const input = ref("");
const output = ref("");
const showError = ref(false);

// --- Core Logic ---

function process(mode) {
  showError.value = false;

  const raw = input.value;
  if (!raw) {
    output.value = "";
    return;
  }

  try {
    let result = "";
    if (mode === "encode") {
      // Encode logic
      result = encodeURIComponent(raw)
        .replace(/'/g, "%27")
        .replace(/"/g, "%22");
    } else {
      // Decode logic
      result = decodeURIComponent(raw.replace(/\+/g, " "));
    }

    output.value = result;
  } catch (e) {
    if (mode === "decode") {
      showError.value = true;
      output.value = "";
    } else {
      output.value = "Error: " + e.message;
    }
  }
}

// --- UI Actions ---

const clearAll = () => {
  input.value = "";
  output.value = "";
  showError.value = false;
};

const pasteInput = async () => {
  try {
    input.value = await navigator.clipboard.readText();
    // Optional: Auto-process on paste if desired, defaulting to encode
    // process('encode');
  } catch (e) {
    console.error("Clipboard paste failed", e);
  }
};

const copyOutput = () => {
  const text = output.value;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyBtn");
    if (btn) {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="ph-bold ph-check text-green-400"></i> Copied';
      setTimeout(() => (btn.innerHTML = originalHTML), 2000);
    }
  });
};
</script>

<style scoped>
.text-primary {
  color: #3b82f6;
}
.text-accent {
  color: #06b6d4;
}
.bg-accent {
  background-color: #06b6d4;
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

.editor-height {
  height: calc(100vh - 280px);
  min-height: 450px;
}
.text-cyan-400 {
  color: #22d3ee;
}
.text-green-400 {
  color: #4ade80;
}

/* Error Styles */
.bg-red-900\/20 {
  background-color: rgba(153, 27, 27, 0.2);
}
.border-red-500\/50 {
  border-color: rgba(239, 68, 68, 0.5);
}
.text-red-200 {
  color: #fecaca;
}
</style>
