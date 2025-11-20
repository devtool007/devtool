<template>
  <ToolLayout
    title="Base64 Converter"
    description="Encode and decode text data securely. UTF-8 supported."
    :showAdSlot="false"
  >
    <template #icon
      ><i class="ph-fill ph-arrows-left-right text-yellow-500"></i
    ></template>

    <div
      class="max-w-[1400px] mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6"
    >
      <main class="flex-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 editor-height">
          <div class="flex flex-col h-full relative">
            <div class="flex justify-between items-center mb-2 px-1">
              <label
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Plain Text / Source</label
              >
              <button
                @click="pasteInput"
                class="text-xs text-primary hover:underline cursor-pointer"
              >
                Paste
              </button>
            </div>
            <textarea
              id="input"
              v-model="input"
              @input="handleInput"
              :placeholder="
                mode === 'encode'
                  ? 'Type or paste plain text here...'
                  : 'Paste Base64 string here...'
              "
              class="flex-1 w-full bg-editor border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none placeholder-slate-600"
            ></textarea>

            <div
              id="modeIndicator"
              :class="[
                'absolute top-10 right-4 text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 pointer-events-none transition duration-500',
                { 'opacity-100': isConverting, 'opacity-0': !isConverting },
              ]"
            >
              {{ mode === "encode" ? "Encoding..." : "Decoding..." }}
            </div>
          </div>

          <div class="flex flex-col h-full">
            <div class="flex justify-between items-center mb-2 px-1">
              <label
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Base64 Result</label
              >
              <div class="flex gap-3">
                <button
                  @click="copyOutput"
                  id="copyBtn"
                  class="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition"
                >
                  <i class="ph-bold ph-copy"></i> Copy Result
                </button>
              </div>
            </div>

            <div
              class="relative flex-1 bg-editor border border-slate-700 rounded-lg overflow-hidden"
            >
              <textarea
                id="output"
                v-model="output"
                readonly
                :class="[
                  'w-full h-full bg-transparent p-4 font-mono text-sm focus:outline-none resize-none placeholder-slate-700',
                  mode === 'encode' ? 'text-green-400' : 'text-slate-300',
                ]"
                placeholder="Result will appear here..."
              ></textarea>

              <div
                v-if="showErrorOverlay"
                id="errorOverlay"
                class="absolute inset-0 bg-dark/80 flex items-center justify-center backdrop-blur-sm"
              >
                <div
                  class="bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3"
                >
                  <i class="ph-fill ph-warning-circle text-xl"></i>
                  <span id="errorMsg">{{ errorMessage }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <article class="mt-12 prose prose-invert max-w-none text-slate-400">
          <h2 class="text-white text-lg font-semibold">
            How does Base64 work?
          </h2>
          <p>
            Base64 is a group of binary-to-text encoding schemes that represent
            binary data in an ASCII string format. It is commonly used when
            there is a need to encode binary data that needs to be stored and
            transferred over media that are designed to deal with textual data.
          </p>
          <p>
            <strong>UTF-8 Support:</strong> Most online tools fail when encoding
            Chinese characters or Emojis. DevTool.com correctly handles UTF-8
            multi-byte characters, ensuring your data is never corrupted.
          </p>
        </article>
      </main>
    </div>
    <template #sidebar>
      <aside class="w-full lg:w-80 flex flex-col gap-6">
        <div
          class="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 bg-indigo-500/20 rounded text-indigo-400">
              <i class="ph-fill ph-fingerprint text-xl"></i>
            </div>
            <h3 class="text-white font-bold text-sm">Need Test Data?</h3>
          </div>
          <p class="text-xs text-slate-400 mb-4">
            Generate bulk UUIDs for your database testing.
          </p>
          <NuxtLink
            to="uuid-generator.html"
            class="block text-center w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition"
            >Open UUID Generator</NuxtLink
          >
        </div>

        <SidebarAd />
      </aside>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref } from "vue";
// Assuming these are globally available or imported in your framework setup
// import ToolLayout from "~/components/ToolLayout.vue";
// import SidebarAd from "~/components/SidebarAd.vue";

const input = ref("");
const output = ref("");
const mode = ref("encode"); // 'encode' or 'decode'
const liveMode = ref(false);
const urlSafe = ref(false);
const showErrorOverlay = ref(false);
const errorMessage = ref("Invalid Base64 string");
const isConverting = ref(false);

/**
 * Core Base64 Encoding with UTF-8 support using built-in browser functions.
 */
function utf8_to_b64(str) {
  // window.btoa / window.atob are generally available in browser environments
  return window.btoa(unescape(encodeURIComponent(str)));
}

/**
 * Core Base64 Decoding with UTF-8 support.
 */
function b64_to_utf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

/**
 * Main conversion handler.
 * @param {string} action - 'encode' or 'decode'. If undefined, uses current mode.
 */
const process = (action) => {
  if (action) mode.value = action;
  showErrorOverlay.value = false;

  const raw = input.value;
  if (!raw) {
    output.value = "";
    return;
  }

  try {
    let result = "";

    if (mode.value === "encode") {
      result = utf8_to_b64(raw);

      // Handle URL Safe Encoding (Base64URL)
      if (urlSafe.value) {
        result = result
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");
      }
    } else {
      // Decode
      let inputStr = raw.trim();

      // Auto-detect or force URL Safe decoding
      if (urlSafe.value || inputStr.includes("-") || inputStr.includes("_")) {
        inputStr = inputStr.replace(/-/g, "+").replace(/_/g, "/");
        // Pad for standard Base64 decoding if necessary
        while (inputStr.length % 4) {
          inputStr += "=";
        }
      }
      result = b64_to_utf8(inputStr);
    }

    output.value = result;

    // Live Mode Indicator feedback
    if (liveMode.value) {
      isConverting.value = true;
      setTimeout(() => (isConverting.value = false), 500);
    }
  } catch (e) {
    if (mode.value === "decode") {
      errorMessage.value = "Invalid Base64 string";
      output.value = "";
      showErrorOverlay.value = true;
    } else {
      output.value = "Error: " + e.message;
    }
  }
};

/**
 * Handles input event for live conversion mode.
 */
const handleInput = () => {
  if (liveMode.value) {
    process();
  }
};

/**
 * Clears both input and output fields.
 */
const clearAll = () => {
  input.value = "";
  output.value = "";
  showErrorOverlay.value = false;
};

/**
 * Pastes clipboard content into the input and triggers conversion.
 */
const pasteInput = async () => {
  try {
    input.value = await navigator.clipboard.readText();
    process();
  } catch (e) {
    // Handle clipboard read error silently
  }
};

/**
 * Copies the output content to the clipboard and provides visual feedback.
 */
const copyOutput = () => {
  const text = output.value;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    // Find the button reference (assuming a utility for finding element refs)
    const copyBtn = document.getElementById("copyBtn");
    if (copyBtn) {
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML =
        '<i class="ph-bold ph-check text-green-400"></i> Copied';
      setTimeout(() => (copyBtn.innerHTML = originalHTML), 2000);
    }
  });
};
</script>

<style scoped>
/* Scoped styles adapted from the HTML file */
.editor-height {
  height: calc(100vh - 280px);
  min-height: 450px;
}
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

/* Status Boxes */
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
