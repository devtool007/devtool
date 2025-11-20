<template>
  <ToolLayout
    title="Hash Generator"
    description="Generate cryptographic hashes (MD5, SHA256...) directly in your browser. No data is sent to any server."
    :showAdSlot="false"
  >
    <template #icon
      ><i class="ph-fill ph-shield-check text-primary"></i
    ></template>

    <div
      class="max-w-[1400px] mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-8"
    >
      <div class="w-full lg:w-5/12 flex flex-col gap-6">
        <div class="bg-card border border-slate-800 rounded-xl p-6 shadow-xl">
          <label class="block text-xs font-bold text-slate-400 uppercase mb-2"
            >Input Text</label
          >
          <textarea
            id="input"
            v-model="inputText"
            @input="generateHashes"
            class="w-full h-48 bg-editor border border-slate-700 rounded-lg p-4 font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none placeholder-slate-600 mb-4"
            placeholder="Type something here to hash..."
          ></textarea>

          <div class="border-t border-slate-700 pt-4">
            <div class="flex justify-between items-center mb-2">
              <label
                class="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"
              >
                Compare with...
                <span
                  class="bg-slate-700 text-[10px] px-1 rounded text-slate-300 font-normal"
                  >Optional</span
                >
              </label>
            </div>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <i class="ph-bold ph-magnifying-glass text-slate-500"></i>
              </div>
              <input
                type="text"
                id="compareInput"
                v-model="compareText"
                @input="checkMatch"
                class="w-full bg-dark border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                placeholder="Paste a hash to check for a match..."
              />
              <div
                v-if="isMatch"
                id="matchBadge"
                class="absolute inset-y-0 right-2 flex items-center"
              >
                <span
                  class="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"
                >
                  <i class="ph-bold ph-check"></i> MATCH
                </span>
              </div>
            </div>
          </div>

          <div class="mt-6 flex gap-2">
            <button
              @click="clearAll"
              class="text-sm text-slate-500 hover:text-white underline decoration-slate-600"
            >
              Clear All
            </button>
          </div>
        </div>

        <article class="prose prose-invert max-w-none text-slate-500 text-sm">
          <p>
            <strong>Security Note:</strong> This tool uses JavaScript to compute
            hashes locally. Your passwords or sensitive data never leave your
            device.
          </p>
        </article>
      </div>

      <div class="w-full lg:w-7/12 flex flex-col gap-4">
        <div
          v-for="algo in ALGORITHMS"
          :key="algo.id"
          :id="`card-${algo.id}`"
          :class="[
            'bg-editor border rounded-xl p-4 hash-row transition duration-300',
            // Default styling based on compare result
            {
              'border-l-4 border-l-primary': algo.isStandard && !algo.isMatched,
            },
            { 'border-slate-800': !algo.isMatched },
            // Matched styling
            { 'border-green-500 bg-green-900/10': algo.isMatched },
            // Copy feedback styling
            { 'bg-slate-700': algo.id === copiedHashId },
          ]"
        >
          <div class="flex justify-between items-center mb-2">
            <span
              class="text-xs font-bold uppercase tracking-wider flex items-center gap-1"
              :class="{
                'text-primary': !algo.isDimmed,
                'text-slate-500': algo.isDimmed,
              }"
            >
              {{ algo.label }}
              <i
                v-if="algo.isStar"
                class="ph-fill ph-star text-yellow-500 text-xs"
              ></i>
            </span>
            <span
              class="text-[10px] text-slate-600 bg-slate-800 px-1 rounded"
              >{{ algo.tag }}</span
            >
          </div>
          <div class="relative">
            <input
              type="text"
              readonly
              :id="`out-${algo.id}`"
              class="w-full bg-transparent font-mono text-sm text-slate-300 focus:outline-none truncate pr-10"
              :value="hashes[algo.id]"
              :class="{
                'text-slate-400':
                  algo.id === 'sha512' || algo.id === 'ripemd160',
              }"
              :style="{ 'font-size': algo.id === 'sha512' ? '12px' : '14px' }"
            />
            <button
              @click="copyHash(algo.id)"
              class="absolute right-0 top-0 text-slate-500 hover:text-white"
            >
              <i class="ph-bold ph-copy"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <template #sidebar>
      <div class="w-full lg:w-80 flex flex-col gap-6">
        <div class="bg-card border border-slate-800 rounded-xl p-4">
          <h4 class="font-bold text-white mb-4 text-sm flex items-center gap-2">
            <i class="ph-fill ph-arrows-left-right text-cyan-500"></i> Other
            Converters
          </h4>
          <p class="text-xs text-slate-400 mb-3">
            Need to encode binary data or convert Unicode?
          </p>
          <NuxtLink
            to="/tools/base64-converter"
            class="block text-center w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition"
          >
            Use Base64 Converter
          </NuxtLink>
        </div>

        <SidebarAd />
      </div>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import CryptoJS from "crypto-js";
// 假设 SidebarAd 已安装并可以导入
import SidebarAd from "~/components/SidebarAd.vue";
// 假设 NuxtLink 是全局可用的或已导入

// --- Constants ---
const ALGORITHMS_CFG = [
  {
    id: "md5",
    label: "MD5",
    tag: "128-bit",
    hashFn: CryptoJS.MD5,
    isStandard: false,
  },
  {
    id: "sha1",
    label: "SHA-1",
    tag: "160-bit",
    hashFn: CryptoJS.SHA1,
    isStandard: false,
  },
  {
    id: "sha256",
    label: "SHA-256",
    tag: "Standard",
    hashFn: CryptoJS.SHA256,
    isStandard: true,
    isStar: true,
  },
  {
    id: "sha512",
    label: "SHA-512",
    tag: "High Security",
    hashFn: CryptoJS.SHA512,
    isStandard: false,
  },
  {
    id: "ripemd160",
    label: "RIPEMD-160",
    tag: "160-bit",
    hashFn: CryptoJS.RIPEMD160,
    isStandard: false,
    isDimmed: true,
  },
];

// --- Reactive State ---
const inputText = ref("");
const compareText = ref("");
const hashes = reactive(
  ALGORITHMS_CFG.reduce((acc, algo) => {
    acc[algo.id] = "";
    return acc;
  }, {})
);
const isMatch = ref(false);
const copiedHashId = ref(null);

// --- Computed Algorithm List (for UI binding) ---
const ALGORITHMS = computed(() => {
  return ALGORITHMS_CFG.map((algo) => ({
    ...algo,
    isMatched: algo.id === matchedAlgoId.value,
    isDimmed: algo.id === "ripemd160" ? true : false,
  }));
});

const matchedAlgoId = computed(() => {
  if (!isMatch.value) return null;
  const target = compareText.value.trim().toLowerCase();

  for (const algo of ALGORITHMS_CFG) {
    const hashVal = hashes[algo.id];
    if (hashVal === target) {
      return algo.id;
    }
  }
  return null;
});

// --- Core Logic ---

/**
 * Generates all hashes based on the current input text.
 */
function generateHashes() {
  const text = inputText.value;

  for (const algo of ALGORITHMS_CFG) {
    if (!text) {
      hashes[algo.id] = "";
    } else {
      // CryptoJS output is WordArray, need toString() to get Hex
      hashes[algo.id] = algo.hashFn(text).toString();
    }
  }
  checkMatch();
}

/**
 * Compares the output hashes against the compareText input.
 */
function checkMatch() {
  const target = compareText.value.trim().toLowerCase();

  // Reset match state
  isMatch.value = false;

  if (!target) return;

  // Check if the target hash matches any generated hash
  for (const algo of ALGORITHMS_CFG) {
    const hashVal = hashes[algo.id];
    if (hashVal && hashVal === target) {
      isMatch.value = true;
      return;
    }
  }
}

/**
 * Copies the hash value to the clipboard and provides visual feedback.
 * @param {string} id - The algorithm ID (e.g., 'md5').
 */
function copyHash(id) {
  const val = hashes[id];
  if (!val) return;

  navigator.clipboard.writeText(val).then(() => {
    // Simple visual feedback: flash background
    copiedHashId.value = id;
    setTimeout(() => {
      copiedHashId.value = null;
    }, 200);
  });
}

/**
 * Clears all inputs and resets the state.
 */
function clearAll() {
  inputText.value = "";
  compareText.value = "";
  generateHashes(); // This will clear the hashes as input is empty
  isMatch.value = false;
}
</script>

<style scoped>
/* Scoped styles adapted from the HTML file */
.text-primary {
  color: #10b981;
} /* Emerald-500 */
.bg-dark {
  background-color: #0f172a;
}
.bg-card {
  background-color: #1e293b;
}
.bg-editor {
  background-color: #111827;
}

/* Hash row styling for interactivity and match feedback */
.hash-row {
  transition: all 0.2s;
}
.hash-row:hover:not(.border-green-500) {
  background-color: #1e293b;
} /* Subtle hover */

/* Match Colors */
.border-green-500 {
  border-color: #10b981;
}
.bg-green-500\/20 {
  background-color: rgba(16, 185, 129, 0.2);
}
.text-green-400 {
  color: #4ade80;
}

.bg-green-900\/10 {
  background-color: rgba(6, 95, 76, 0.1);
} /* Darker background for matched row */
</style>
