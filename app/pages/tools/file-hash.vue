<template>
  <ToolLayout
    title="File Hash Calculator"
    description="Calculate file hashes (MD5, SHA1, SHA256, SHA512) online. 100% Client-side processing for large files."
    :showAdSlot="false"
  >
    <template #icon><i class="ph-fill ph-file-lock text-primary"></i></template>

    <div
      class="max-w-[1400px] mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-8"
    >
      <div class="w-full lg:w-5/12 flex flex-col gap-6">
        <div
          id="dropZone"
          :class="[
            'drop-zone rounded-2xl p-8 text-center cursor-pointer transition h-64 flex flex-col items-center justify-center group',
            { dragover: isDragging },
          ]"
          @click="$refs.fileInput.click()"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleFileDrop"
        >
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            @change="handleFileSelect"
          />

          <div
            v-if="!currentFile"
            id="uploadPrompt"
            class="flex flex-col items-center pointer-events-none transition transform group-hover:scale-105"
          >
            <div
              class="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-primary"
            >
              <i class="ph-duotone ph-upload-simple text-3xl"></i>
            </div>
            <h3 class="text-white font-bold text-lg mb-1">
              Click or Drop file here
            </h3>
            <p class="text-sm text-slate-500">
              Supports large files (ISO, ZIP, EXE)
            </p>
          </div>

          <div v-else id="fileInfo" class="w-full">
            <div
              class="flex items-center gap-3 bg-slate-800 p-3 rounded-lg mb-4 text-left"
            >
              <i class="ph-fill ph-file text-2xl text-primary"></i>
              <div class="overflow-hidden">
                <div
                  id="fileName"
                  class="text-white font-bold truncate text-sm"
                >
                  {{ currentFile.name }}
                </div>
                <div id="fileSize" class="text-xs text-slate-500">
                  {{ formatSize(currentFile.size) }}
                </div>
              </div>
            </div>
            <div class="w-full bg-slate-700 rounded-full h-2.5 mb-1">
              <div
                id="progressBar"
                class="bg-primary h-2.5 rounded-full transition-all duration-100"
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-slate-400">
              <span
                id="statusText"
                :class="{ 'text-green-400': status === 'Completed!' }"
                >{{ status }}</span
              >
              <span id="progressText">{{ progress }}%</span>
            </div>
          </div>
        </div>

        <div class="bg-card border border-slate-800 rounded-xl p-6">
          <label
            class="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-2"
          >
            Verify Checksum
          </label>
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <i class="ph-bold ph-check-square text-slate-500"></i>
            </div>
            <input
              type="text"
              v-model="compareHash"
              @input="checkMatch"
              class="w-full bg-editor border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition placeholder-slate-600 hash-input"
              placeholder="Paste any hash here to verify match..."
            />
          </div>

          <div
            v-if="matchResult === 'match'"
            id="matchAlert"
            class="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"
          >
            <i class="ph-fill ph-check-circle text-lg"></i> Match Found!
          </div>
          <div
            v-else-if="matchResult === 'no_match'"
            id="noMatchAlert"
            class="mt-3 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
          >
            <i class="ph-fill ph-x-circle text-lg"></i> No Match Found.
          </div>
        </div>
      </div>

      <div class="w-full lg:w-7/12 flex flex-col gap-3">
        <div
          v-for="algo in ALGORITHMS"
          :key="algo.id"
          :class="[
            'hash-card bg-editor border rounded-xl p-4 transition',
            { 'border-l-4 border-l-primary': algo.isStandard },
            { 'border-primary/50': algo.id === highlightedHashId },
            { 'bg-green-900/20 border-green-500': algo.id === matchedHashId },
            algo.id !== matchedHashId ? 'hover:border-primary/50' : '',
          ]"
        >
          <div class="flex justify-between items-center mb-1">
            <span
              :class="[
                'text-xs font-bold uppercase',
                algo.isStandard ? 'text-white' : 'text-slate-400',
              ]"
            >
              {{ algo.label }}
              <span
                v-if="algo.isStandard"
                class="text-[10px] bg-primary/20 text-primary px-1.5 rounded"
                >STANDARD</span
              >
            </span>
            <button
              @click="copyHash(algo.id)"
              class="text-slate-500 hover:text-white text-xs"
            >
              <i class="ph-bold ph-copy"></i>
            </button>
          </div>
          <input
            type="text"
            readonly
            :id="`out-${algo.id}`"
            class="hash-input w-full bg-transparent text-sm text-slate-300 focus:outline-none truncate"
            placeholder="..."
            :value="hashes[algo.id]"
          />
        </div>
      </div>
    </div>

    <template #sidebar>
      <div class="w-full lg:w-80 flex flex-col gap-6">
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
            to="/tools/uuid-generator"
            class="block text-center w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition"
          >
            Open UUID Generator
          </NuxtLink>
        </div>

        <SidebarAd />
      </div>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, reactive } from "vue";
// 导入需要的模块
import CryptoJS from "crypto-js";
// 假设 SidebarAd 已安装并可以导入
import SidebarAd from "~/components/SidebarAd.vue";
// 假设 NuxtLink 是全局可用的或已导入

// --- Constants ---
const ALGORITHMS = [
  { id: "md5", label: "MD5", isStandard: false },
  { id: "sha1", label: "SHA-1", isStandard: false },
  { id: "sha224", label: "SHA-224", isStandard: false },
  { id: "sha256", label: "SHA-256", isStandard: true },
  { id: "sha384", label: "SHA-384", isStandard: false },
  { id: "sha512", label: "SHA-512", isStandard: false },
];

// --- Reactive State ---
const currentFile = ref(null);
const isDragging = ref(false);
const progress = ref(0);
const status = ref("Awaiting file...");
const compareHash = ref("");
const matchResult = ref(null); // 'match', 'no_match', or null
const matchedHashId = ref(null);
const highlightedHashId = ref(null); // For copy feedback

// Stores the calculated hashes
const hashes = reactive(
  ALGORITHMS.reduce((acc, algo) => {
    acc[algo.id] = "";
    return acc;
  }, {})
);

// --- File Handling & Processing ---

const handleFileDrop = (e) => {
  isDragging.value = false;
  if (e.dataTransfer.files.length) {
    processFile(e.dataTransfer.files[0]);
  }
};

const handleFileSelect = (e) => {
  if (e.target.files.length) {
    processFile(e.target.files[0]);
  }
};

const processFile = (file) => {
  if (!CryptoJS || !CryptoJS.algo) {
    status.value = "Error: CryptoJS library failed to initialize.";
    return;
  }

  currentFile.value = file;
  progress.value = 0;
  status.value = "Initializing...";
  resetHashInputs();
  checkMatch();

  const chunkSize = 1024 * 1024 * 2; // 2MB chunks
  let offset = 0;

  const algos = {};
  algos.md5 = CryptoJS.algo.MD5.create();
  algos.sha1 = CryptoJS.algo.SHA1.create();
  algos.sha224 = CryptoJS.algo.SHA224.create();
  algos.sha256 = CryptoJS.algo.SHA256.create();
  algos.sha384 = CryptoJS.algo.SHA384.create();
  algos.sha512 = CryptoJS.algo.SHA512.create();

  const reader = new FileReader();

  reader.onload = function (e) {
    if (e.target.error) {
      status.value = "Error reading file";
      return;
    }

    status.value = "Processing...";

    const wordArr = CryptoJS.lib.WordArray.create(e.target.result);

    Object.values(algos).forEach((algo) => algo.update(wordArr));

    offset += e.target.result.byteLength;

    const percent = Math.min(100, Math.round((offset / file.size) * 100));
    progress.value = percent;

    if (offset < file.size) {
      readNextChunk();
    } else {
      finalize(algos);
    }
  };

  reader.onerror = function () {
    status.value = "Error reading file";
  };

  function readNextChunk() {
    const slice = file.slice(offset, offset + chunkSize);
    reader.readAsArrayBuffer(slice);
  }

  function finalize(algos) {
    status.value = "Finalizing...";

    setTimeout(() => {
      hashes.md5 = algos.md5.finalize().toString();
      hashes.sha1 = algos.sha1.finalize().toString();
      hashes.sha224 = algos.sha224.finalize().toString();
      hashes.sha256 = algos.sha256.finalize().toString();
      hashes.sha384 = algos.sha384.finalize().toString();
      hashes.sha512 = algos.sha512.finalize().toString();

      status.value = "Completed!";
      checkMatch();
    }, 50);
  }

  readNextChunk();
};

// --- Utility Functions ---

const formatSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const resetHashInputs = () => {
  ALGORITHMS.forEach((algo) => {
    hashes[algo.id] = "Calculating...";
  });
  matchedHashId.value = null;
  matchResult.value = null;
  highlightedHashId.value = null;
};

// --- Copy and Compare Logic ---

const copyHash = (id) => {
  const val = hashes[id];
  if (!val || val.includes("Calc")) return;

  navigator.clipboard.writeText(val);

  highlightedHashId.value = id;
  setTimeout(() => {
    highlightedHashId.value = null;
  }, 300);
};

const checkMatch = () => {
  const target = compareHash.value.trim().toLowerCase();
  matchResult.value = null;
  matchedHashId.value = null;

  if (!target) return;

  let found = false;

  for (const algo of ALGORITHMS) {
    const val = hashes[algo.id].toLowerCase();

    if (val && !val.includes("calc")) {
      if (val === target) {
        matchedHashId.value = algo.id;
        matchResult.value = "match";
        found = true;
        break;
      }
    }
  }

  if (!found && status.value === "Completed!") {
    matchResult.value = "no_match";
  }
};
</script>

<style scoped>
/* Scoped styles adapted from the HTML file */
.text-primary {
  color: #8b5cf6;
} /* Violet-500 */
.bg-dark {
  background-color: #0f172a;
}
.bg-card {
  background-color: #1e293b;
}
.bg-editor {
  background-color: #111827;
}

/* Sidebar colors */
.bg-indigo-500\/20 {
  background-color: rgba(99, 102, 241, 0.2);
}
.text-indigo-400 {
  color: #818cf8;
}

.drop-zone {
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23475569FF' stroke-width='2' stroke-dasharray='12%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
}
.drop-zone.dragover {
  background-color: rgba(139, 92, 246, 0.1);
  border-color: #8b5cf6;
  background-image: none;
  border: 2px dashed #8b5cf6;
}

.hash-input {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Match and No-Match colors */
.bg-green-500\/10 {
  background-color: rgba(34, 197, 94, 0.1);
}
.border-green-500\/20 {
  border-color: rgba(34, 197, 94, 0.2);
}
.text-green-400 {
  color: #4ade80;
}

.bg-red-500\/10 {
  background-color: rgba(239, 68, 68, 0.1);
}
.border-red-500\/20 {
  border-color: rgba(239, 68, 68, 0.2);
}
.text-red-400 {
  color: #f87171;
}

.border-primary {
  border-color: #8b5cf6;
}
.bg-green-900\/20 {
  background-color: rgba(6, 78, 59, 0.2);
}
.border-green-500 {
  border-color: #10b981;
}
.bg-primary\/20 {
  background-color: rgba(139, 92, 246, 0.2);
}
</style>
