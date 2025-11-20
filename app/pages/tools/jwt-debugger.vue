<template>
  <ToolLayout
    title="JWT Debugger"
    description="Paste your token below. Algorithm is detected automatically."
    :showAdSlot="false"
  >
    <template #icon
      ><i class="ph-fill ph-identification-badge text-pink-500"></i
    ></template>

    <div
      class="max-w-[1400px] mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-8"
    >
      <div class="w-full lg:w-5/12 flex flex-col gap-4">
        <div
          class="flex-1 bg-editor border border-slate-700 rounded-xl flex flex-col overflow-hidden shadow-2xl"
        >
          <div
            class="bg-slate-800/50 px-4 py-2 border-b border-slate-700 flex justify-between items-center"
          >
            <span class="text-xs font-bold text-slate-400 uppercase"
              >Encoded Token</span
            >
            <div class="flex gap-2">
              <button
                @click="pasteToken"
                class="text-xs text-primary hover:text-blue-400"
              >
                Paste
              </button>
              <button
                @click="clearAll"
                class="text-xs text-red-400 hover:text-red-300"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            id="jwtInput"
            v-model="jwtInput"
            @input="processJWT"
            class="flex-1 w-full h-[500px] bg-transparent p-6 font-mono text-lg text-slate-300 focus:outline-none resize-none leading-relaxed break-all"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          ></textarea>
        </div>

        <div
          v-if="verificationStatus.show"
          id="verificationStatus"
          :class="[
            'p-4 rounded-lg border flex items-center gap-3 transition-all',
            verificationStatus.isValid
              ? 'bg-green-900/20 border-green-500/50 text-green-400'
              : 'bg-red-900/20 border-red-500/50 text-red-400',
          ]"
        >
          <i
            :class="[
              'ph-fill text-xl',
              verificationStatus.isValid ? 'ph-check-circle' : 'ph-x-circle',
            ]"
          ></i>
          <span class="font-bold">{{ verificationStatus.message }}</span>
        </div>
      </div>

      <div class="w-full lg:w-7/12 flex flex-col gap-6">
        <div class="bg-card border border-slate-800 rounded-xl overflow-hidden">
          <div
            class="px-4 py-2 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center"
          >
            <div class="flex items-center">
              <span class="dot bg-jwtHeader"></span>
              <span class="text-xs font-bold text-slate-300 uppercase"
                >Header</span
              >
              <span class="ml-2 text-[10px] text-slate-500"
                >Algorithm & Token Type</span
              >
            </div>
          </div>
          <pre
            class="m-0 p-4 bg-editor"
          ><code id="outputHeader" class="language-json">{{ outputHeader }}</code></pre>
        </div>

        <div class="bg-card border border-slate-800 rounded-xl overflow-hidden">
          <div
            class="px-4 py-2 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center"
          >
            <div class="flex items-center">
              <span class="dot bg-jwtPayload"></span>
              <span class="text-xs font-bold text-slate-300 uppercase"
                >Payload</span
              >
              <span class="ml-2 text-[10px] text-slate-500">Data</span>
            </div>
          </div>
          <pre
            class="m-0 p-4 bg-editor"
          ><code id="outputPayload" class="language-json">{{ outputPayload }}</code></pre>

          <div
            v-if="timeTips.show"
            id="timeTips"
            class="px-4 py-2 bg-slate-800/50 text-xs text-slate-500 border-t border-slate-800"
            v-html="timeTips.html"
          ></div>
        </div>

        <div class="bg-card border border-slate-800 rounded-xl overflow-hidden">
          <div
            class="px-4 py-2 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center"
          >
            <div class="flex items-center">
              <span class="dot bg-jwtSig"></span>
              <span class="text-xs font-bold text-slate-300 uppercase"
                >Verify Signature</span
              >
            </div>
          </div>

          <div class="p-6 flex flex-col gap-4">
            <div class="font-mono text-sm text-jwtSig break-all opacity-80">
              HMACSHA256(<br />
              &nbsp;&nbsp;base64UrlEncode(header) + "." +<br />
              &nbsp;&nbsp;base64UrlEncode(payload),<br />
              &nbsp;&nbsp;<span class="bg-slate-700 px-1 text-white rounded"
                >your-256-bit-secret</span
              ><br />
              )
            </div>

            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <i class="ph-bold ph-key text-slate-500"></i>
              </div>
              <input
                type="text"
                id="secretInput"
                v-model="secretInput"
                @input="processJWT"
                class="w-full bg-dark border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-jwtSig/50 transition placeholder-slate-600"
                placeholder="Enter your secret key to verify..."
              />
            </div>

            <div class="flex items-center gap-2 text-xs text-slate-500">
              <i class="ph-fill ph-shield-check text-green-500"></i>
              <span
                >Secure: The verification happens locally in your browser.</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #sidebar>
      <div class="w-full lg:w-80 flex flex-col gap-6">
        <div class="bg-card border border-slate-800 rounded-xl p-4">
          <h4 class="font-bold text-white mb-4 text-sm flex items-center gap-2">
            <i class="ph-fill ph-shield-check text-green-500"></i> Security
            Tools
          </h4>
          <p class="text-xs text-slate-400 mb-3">
            Need to generate cryptographic hashes (MD5, SHA256) or Base64?
          </p>
          <NuxtLink
            to="/tools/hash-generator"
            class="block text-center w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition mt-2"
          >
            Open Hash Generator
          </NuxtLink>
        </div>

        <SidebarAd />
      </div>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from "vue";
// 假设 PrismJS, SidebarAd, ToolLayout, NuxtLink 均已导入

// --- Reactive State ---
const jwtInput = ref("");
const secretInput = ref("");
const outputHeader = ref("{}");
const outputPayload = ref("{}");

const timeTips = reactive({
  show: false,
  html: "",
});

const verificationStatus = reactive({
  show: false,
  isValid: false,
  message: "",
});

// --- Base64 / Utility Functions (Adapted from HTML) ---

function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  try {
    return decodeURIComponent(escape(window.atob(str)));
  } catch (e) {
    return null;
  }
}

function base64UrlEncode(buffer) {
  // Helper to convert ArrayBuffer to Base64Url string
  const signatureArray = Array.from(new Uint8Array(buffer));
  return btoa(String.fromCharCode.apply(null, signatureArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function resetOutputs() {
  outputHeader.value = "{}";
  outputPayload.value = "{}";
  timeTips.show = false;
  verificationStatus.show = false;
}

// --- Core Logic: JWT Processing ---

function processJWT() {
  const token = jwtInput.value.trim();
  verificationStatus.show = false;

  if (!token) {
    resetOutputs();
    return;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    outputHeader.value = JSON.stringify("Invalid Token Structure", null, 2);
    outputPayload.value = JSON.stringify(
      "Wait for 3 parts (Header.Payload.Signature)",
      null,
      2
    );
    nextTick(() => highlightCode());
    return;
  }

  // 1. Decode Header
  const headerStr = base64UrlDecode(parts[0]);
  let algo = "Unknown";
  if (headerStr) {
    try {
      const headerObj = JSON.parse(headerStr);
      outputHeader.value = JSON.stringify(headerObj, null, 2);
      algo = headerObj.alg || "Unknown";
    } catch {
      outputHeader.value = JSON.stringify("Invalid Header JSON", null, 2);
    }
  }

  // 2. Decode Payload
  const payloadStr = base64UrlDecode(parts[1]);
  if (payloadStr) {
    try {
      const payloadObj = JSON.parse(payloadStr);
      outputPayload.value = JSON.stringify(payloadObj, null, 2);

      // Time Tips
      let tips = [];
      if (payloadObj.iat)
        tips.push(
          `Issued at: ${new Date(payloadObj.iat * 1000).toLocaleString()}`
        );
      if (payloadObj.exp)
        tips.push(
          `Expires: ${new Date(payloadObj.exp * 1000).toLocaleString()}`
        );

      if (tips.length > 0) {
        timeTips.html = tips.join("<br>");
        timeTips.show = true;
      } else {
        timeTips.show = false;
      }
    } catch {
      outputPayload.value = JSON.stringify("Invalid Payload JSON", null, 2);
    }
  }

  // 3. Highlight Code
  nextTick(() => highlightCode());

  // 4. Verify Signature (Only for HS256 using Web Crypto API)
  if (
    secretInput.value &&
    algo === "HS256" &&
    window.crypto &&
    window.crypto.subtle
  ) {
    verifySignature(parts[0], parts[1], parts[2], secretInput.value);
  } else if (secretInput.value && algo !== "HS256") {
    showStatus(
      false,
      `Verification skipped: Algorithm '${algo}' not supported by local debugger.`
    );
  } else if (!secretInput.value && token.length > 0 && parts.length === 3) {
    showStatus(false, "Enter a secret key to attempt verification.");
  }
}

// 辅助：高亮代码
function highlightCode() {
  if (window.Prism) {
    const headerEl = document.getElementById("outputHeader");
    const payloadEl = document.getElementById("outputPayload");
    if (headerEl) window.Prism.highlightElement(headerEl);
    if (payloadEl) window.Prism.highlightElement(payloadEl);
  }
}

// 核心：Web Crypto API 验证签名
async function verifySignature(headerB64, payloadB64, signatureB64, secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const keyData = encoder.encode(secret);

  try {
    // 导入 Key
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      true,
      ["verify"] // Use 'verify' operation here
    );

    // 验证
    const signatureBuffer = base64UrlDecode(signatureB64);

    // Convert Base64Url decoded string back to Uint8Array for comparison
    const signatureUint8Array = new Uint8Array(signatureBuffer.length);
    for (let i = 0; i < signatureBuffer.length; i++) {
      signatureUint8Array[i] = signatureBuffer.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureUint8Array,
      data
    );

    if (isValid) {
      showStatus(true, "Signature Verified");
    } else {
      showStatus(false, "Invalid Signature");
    }
  } catch (e) {
    console.error("Verification failed:", e);
    showStatus(false, "Verification Failed (Key Error or Invalid Algo)");
  }
}

function showStatus(isValid, message) {
  verificationStatus.show = true;
  verificationStatus.isValid = isValid;
  verificationStatus.message = message;
}

// --- Actions ---

function clearAll() {
  jwtInput.value = "";
  secretInput.value = "";
  resetOutputs();
}

function pasteToken() {
  navigator.clipboard.readText().then((text) => {
    jwtInput.value = text;
    processJWT();
  });
}

// 初始化
onMounted(() => {
  // 预加载一个示例 Token (Secret: 'secret')
  const sample =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  jwtInput.value = sample;
  secretInput.value = "secret"; // 预填密码方便用户看到绿色的 Verified
  processJWT();
});
</script>

<style scoped>
/* Scoped styles adapted from the HTML file */
.text-primary {
  color: #3b82f6;
} /* Blue-500 */
.bg-dark {
  background-color: #0f172a;
}
.bg-card {
  background-color: #1e293b;
}
.bg-editor {
  background-color: #111827;
}

/* JWT Colors */
.bg-jwtHeader {
  background-color: #fb7185;
} /* Rose-400 */
.bg-jwtPayload {
  background-color: #c084fc;
} /* Purple-400 */
.bg-jwtSig {
  background-color: #60a5fa;
} /* Blue-400 */
.text-jwtSig {
  color: #60a5fa;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}

/* Status Colors */
.bg-green-900\/20 {
  background-color: rgba(6, 78, 59, 0.2);
}
.border-green-500\/50 {
  border-color: rgba(16, 185, 129, 0.5);
}
.text-green-400 {
  color: #4ade80;
}

.bg-red-900\/20 {
  background-color: rgba(153, 27, 27, 0.2);
}
.border-red-500\/50 {
  border-color: rgba(239, 68, 68, 0.5);
}
.text-red-400 {
  color: #f87171;
}
</style>
