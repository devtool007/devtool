<template>
  <ToolLayout
    title="Image ↔ Base64"
    description="Drag & drop image to convert, or paste string to preview."
    :showAdSlot="false"
  >
    <template #icon><i class="ph-fill ph-image text-primary"></i></template>

    <div
      class="max-w-[1400px] mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-8 h-[calc(100vh-64px)] min-h-[800px]"
    >
      <div class="w-full lg:w-1/2 flex flex-col gap-4 h-full">
        <div
          id="previewContainer"
          class="relative flex-1 bg-card border border-slate-800 rounded-2xl overflow-hidden flex flex-col"
        >
          <div
            id="dropZone"
            :class="[
              'flex-1 m-4 rounded-xl relative flex items-center justify-center cursor-pointer group overflow-hidden',
              { 'drop-zone': !imageInfo.hasImage },
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
              accept="image/*"
              @change="handleFileSelect"
            />

            <div
              v-if="!imageInfo.hasImage"
              id="emptyState"
              class="text-center p-6 transition transform group-hover:scale-105"
            >
              <div
                class="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-primary"
              >
                <i class="ph-duotone ph-image text-4xl"></i>
              </div>
              <h3 class="text-white font-bold text-lg mb-1">Drop Image Here</h3>
              <p class="text-sm text-slate-500">or paste Base64 on the right</p>
              <div class="mt-4 text-xs text-slate-600">
                PNG, JPG, GIF, WEBP, SVG
              </div>
            </div>

            <div
              v-else
              id="imageState"
              class="absolute inset-0 w-full h-full bg-dark checkerboard flex items-center justify-center"
            >
              <img
                :src="currentBase64"
                id="previewImg"
                @load="updateImageDimensions"
                class="max-w-full max-h-full object-contain shadow-2xl"
                alt="Preview"
              />
            </div>
          </div>

          <div
            v-if="imageInfo.hasImage"
            id="imageTools"
            class="h-16 bg-editor border-t border-slate-800 flex items-center justify-between px-6"
          >
            <div class="flex flex-col">
              <div id="imgInfoDim" class="text-white font-bold text-sm">
                {{ imageInfo.dimensions }}
              </div>
              <div id="imgInfoSize" class="text-xs text-slate-500">
                {{ imageInfo.displaySize }}
              </div>
            </div>
            <div class="flex gap-3">
              <button
                @click="clearAll"
                class="p-2 text-slate-400 hover:text-red-400 transition"
                title="Clear"
              >
                <i class="ph-bold ph-trash text-lg"></i>
              </button>
              <button
                @click="downloadImage"
                class="bg-primary hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition"
              >
                <i class="ph-bold ph-download-simple"></i> Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex flex-col gap-4 h-full">
        <div
          class="bg-editor rounded-lg p-1 flex gap-1 border border-slate-800"
        >
          <button
            v-for="tab in formatTabs"
            :key="tab.id"
            @click="switchTab(tab.id)"
            :class="[
              'flex-1 py-2 text-xs font-bold rounded transition',
              currentFormat === tab.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white bg-transparent',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <div
          class="relative flex-1 bg-editor border border-slate-700 rounded-xl overflow-hidden flex flex-col"
        >
          <div class="absolute top-4 right-4 z-10">
            <button
              @click="copyCode"
              id="copyBtn"
              :class="[
                'bg-slate-800/90 hover:bg-primary text-white border hover:border-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition backdrop-blur',
                { 'border-green-500': copySuccess },
              ]"
            >
              <i class="ph-bold ph-copy"></i>
              {{ copySuccess ? "Copied!" : "Copy Code" }}
            </button>
          </div>

          <textarea
            id="codeOutput"
            v-model="codeOutput"
            @input="handleCodePaste"
            class="flex-1 w-full h-full bg-transparent p-6 font-mono text-xs text-slate-300 focus:outline-none resize-none leading-relaxed break-all"
            placeholder="Base64 string will appear here..."
          ></textarea>

          <div
            class="h-8 bg-slate-800 border-t border-slate-700 flex items-center px-4 justify-between text-[10px] text-slate-400"
          >
            <span id="charCount"
              >{{ codeOutput.length.toLocaleString() }} chars</span
            >
            <span>Auto-detects format on paste</span>
          </div>
        </div>

        <div
          class="bg-card border border-slate-800 rounded-xl p-4 flex items-start gap-3"
        >
          <i class="ph-fill ph-info text-primary text-xl mt-0.5"></i>
          <div class="text-sm text-slate-400">
            <p class="mb-1">
              <strong class="text-white">Performance Note:</strong>
            </p>
            <p>
              Base64 strings are ~33% larger than the original file. Large
              images (>5MB) may cause the text area to lag, but the conversion
              will still work.
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #sidebar>
      <div class="w-full lg:w-80 flex flex-col gap-6">
        <div class="bg-card border border-slate-800 rounded-xl p-4">
          <h4 class="font-bold text-white mb-4 text-sm flex items-center gap-2">
            <i class="ph-fill ph-arrows-left-right text-yellow-500"></i> Related
            Tools
          </h4>
          <p class="text-xs text-slate-400 mb-3">
            Need to encode/decode plain text or file hashes?
          </p>
          <NuxtLink
            to="/tools/base64-converter"
            class="block text-center w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition"
          >
            Text Base64 Converter
          </NuxtLink>
        </div>

        <SidebarAd />
      </div>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, reactive } from "vue";
// 假设 SidebarAd 已安装并可以导入
// import SidebarAd from "~/components/SidebarAd.vue";
// 假设 NuxtLink 是全局可用的或已导入

// --- Constants ---
const formatTabs = [
  { id: "raw", label: "Raw Base64" },
  { id: "html", label: "<img/> Tag" },
  { id: "css", label: "CSS Background" },
];

// --- Reactive State ---
const currentBase64 = ref("");
const codeOutput = ref("");
const currentFormat = ref("raw"); // raw, html, css
const currentMime = ref("image/png"); // Guessed or detected MIME type
const isDragging = ref(false);
const copySuccess = ref(false);

const imageInfo = reactive({
  dimensions: "0 x 0",
  displaySize: "0 KB",
  hasImage: false,
  bytes: 0,
});

// --- Core Logic: Image -> Base64 ---

const handleFileDrop = (e) => {
  isDragging.value = false;
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
};

const handleFileSelect = (e) => {
  if (e.target.files.length) handleFile(e.target.files[0]);
};

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    currentBase64.value = e.target.result;
    currentMime.value = file.type;

    imageInfo.hasImage = true;
    imageInfo.bytes = file.size;

    updateCodeOutput();
    updateImageInfo(file.size);
  };
  reader.readAsDataURL(file);
}

// --- Core Logic: Base64 -> Image (Paste) ---

let pasteTimeout;
const handleCodePaste = () => {
  clearTimeout(pasteTimeout);
  pasteTimeout = setTimeout(() => {
    let val = codeOutput.value.trim();
    if (!val) {
      clearAll();
      return;
    }

    // 1. Strip HTML/CSS wrappers
    if (val.includes('src="')) {
      const match = val.match(/src="([^"]+)"/);
      if (match) val = match[1];
    } else if (val.includes("url(")) {
      const match = val.match(/url\(['"]?([^'"\)]+)['"]?\)/);
      if (match) val = match[1];
    }

    // 2. Add header if missing
    if (!val.startsWith("data:image")) {
      // Guess PNG if header is missing
      val = "data:image/png;base64," + val;
    }

    currentBase64.value = val;
    imageInfo.hasImage = true;

    // Update stats and dimensions (if successfully loaded by the browser)
    updateImageInfo();
  }, 500);
};

// --- UI / Stats Helpers ---

function updateImageDimensions(event) {
  const img = event.target;
  imageInfo.dimensions = `${img.naturalWidth} x ${img.naturalHeight}`;
}

function updateImageInfo(sizeBytes = imageInfo.bytes) {
  let finalSizeBytes = sizeBytes;

  // Estimate size from Base64 if file bytes are not available (i.e., pasted)
  if (!finalSizeBytes && currentBase64.value) {
    const base64Part = currentBase64.value.split(",")[1] || currentBase64.value;
    const base64Length = base64Part.length;
    // Base64 to binary size estimation (approx)
    const padding =
      base64Part.charAt(base64Length - 1) === "="
        ? base64Part.charAt(base64Length - 2) === "="
          ? 2
          : 1
        : 0;
    finalSizeBytes = Math.round(base64Length * 0.75 - padding);
  }

  imageInfo.bytes = finalSizeBytes;

  let sizeStr = "";
  if (finalSizeBytes < 1024) sizeStr = finalSizeBytes + " B";
  else if (finalSizeBytes < 1024 * 1024)
    sizeStr = (finalSizeBytes / 1024).toFixed(1) + " KB";
  else sizeStr = (finalSizeBytes / (1024 * 1024)).toFixed(2) + " MB";

  imageInfo.displaySize = sizeStr;
}

function updateCodeOutput() {
  if (!currentBase64.value) {
    codeOutput.value = "";
    return;
  }

  const base64Data = currentBase64.value;
  let output = "";

  if (currentFormat.value === "raw") {
    // Remove data:image/xxx;base64, prefix for Raw
    output = base64Data.split(",")[1] || base64Data;
  } else if (currentFormat.value === "html") {
    output = `<img src="${base64Data}" alt="image" />`;
  } else if (currentFormat.value === "css") {
    output = `background-image: url('${base64Data}');`;
  }

  codeOutput.value = output;
}

const switchTab = (format) => {
  currentFormat.value = format;
  updateCodeOutput();
};

// --- Actions ---

function clearAll() {
  currentBase64.value = "";
  codeOutput.value = "";

  // Reset image info
  imageInfo.hasImage = false;
  imageInfo.dimensions = "0 x 0";
  imageInfo.displaySize = "0 KB";
  imageInfo.bytes = 0;

  // Clear file input cache
  if (document.getElementById("fileInput")) {
    document.getElementById("fileInput").value = "";
  }
}

function downloadImage() {
  if (!currentBase64.value) return;
  const link = document.createElement("a");
  link.href = currentBase64.value;

  // Guess extension based on MIME type
  let ext = "png";
  if (currentBase64.value.includes("image/jpeg")) ext = "jpg";
  else if (currentBase64.value.includes("image/gif")) ext = "gif";
  else if (currentBase64.value.includes("image/webp")) ext = "webp";
  else if (currentBase64.value.includes("image/svg")) ext = "svg";

  link.download = `image-converted.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function copyCode() {
  const val = codeOutput.value;
  if (!val) return;

  navigator.clipboard.writeText(val).then(() => {
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  });
}
</script>

<style scoped>
/* Scoped styles adapted from the HTML file */
.text-primary {
  color: #ec4899;
} /* Pink-500 */
.bg-dark {
  background-color: #0f172a;
}
.bg-card {
  background-color: #1e293b;
}
.bg-editor {
  background-color: #111827;
}

/* Drop Zone Styles */
.drop-zone {
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23475569FF' stroke-width='2' stroke-dasharray='12%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
}
.drop-zone.dragover {
  background-color: rgba(236, 72, 153, 0.1);
  border-color: #ec4899;
  background-image: none;
  border: 2px dashed #ec4899;
}

/* Checkerboard for transparency preview */
.checkerboard {
  background-color: #1e293b;
  background-image: linear-gradient(45deg, #334155 25%, transparent 25%),
    linear-gradient(-45deg, #334155 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #334155 75%),
    linear-gradient(-45deg, transparent 75%, #334155 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

/* Fix height calculation to adapt to Vue component structure */
.h-\[calc\(100vh-64px\)\] {
  height: calc(
    100vh - 64px - 4rem
  ); /* Deduct nav height (64px) and some padding/margin */
}
</style>
