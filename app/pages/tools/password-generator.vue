<template>
  <ToolLayout
    title="Password Generator"
    description="Generate secure, random passwords locally. Your secrets never leave this browser."
    :showAdSlot="false"
  >
    <template #icon><i class="ph-fill ph-lock-key text-primary"></i></template>

    <div
      class="max-w-[1400px] mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-8"
    >
      <main class="flex-1 flex flex-col gap-6">
        <div
          class="bg-card border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden group"
        >
          <div
            id="strengthLine"
            class="absolute top-0 left-0 h-1 strength-bar"
            :style="{
              width: `${strengthPercent}%`,
              backgroundColor: strengthColor,
            }"
          ></div>

          <div class="relative">
            <input
              type="text"
              id="passwordOutput"
              readonly
              class="w-full bg-transparent text-4xl md:text-5xl font-mono font-bold text-white text-center focus:outline-none truncate tracking-wider py-4"
              :value="passwordOutput"
            />

            <button
              @click="copyPassword"
              class="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-primary transition shadow-lg border border-slate-700 group-hover:scale-110"
            >
              <i
                :class="[
                  'ph-bold text-xl',
                  copied ? 'ph-check text-primary' : 'ph-copy',
                ]"
                id="copyIcon"
              ></i>
            </button>
          </div>

          <div class="text-center mt-4">
            <span
              id="crackTime"
              class="text-sm font-bold bg-slate-800/50 px-3 py-1 rounded-full"
              :style="{ color: strengthColor }"
              >{{ crackTimeText }}</span
            >
          </div>
        </div>

        <div class="bg-card border border-slate-800 rounded-xl p-6">
          <div class="mb-8">
            <div class="flex justify-between items-end mb-4">
              <label class="font-bold text-white">Password Length</label>
              <span
                id="lengthVal"
                class="text-3xl font-bold text-primary font-mono"
                >{{ options.length }}</span
              >
            </div>
            <input
              type="range"
              id="lengthRange"
              min="6"
              max="64"
              v-model.number="options.length"
              @input="generate"
              class="w-full"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <label
              class="flex items-center justify-between p-3 bg-editor border border-slate-700 rounded-lg cursor-pointer hover:border-primary transition group"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white font-bold"
                >
                  A
                </div>
                <span class="text-sm text-slate-300 group-hover:text-white"
                  >Uppercase</span
                >
              </div>
              <input
                type="checkbox"
                id="optUpper"
                v-model="options.upper"
                @change="generate"
                class="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary focus:ring-0"
              />
            </label>

            <label
              class="flex items-center justify-between p-3 bg-editor border border-slate-700 rounded-lg cursor-pointer hover:border-primary transition group"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white font-bold"
                >
                  a
                </div>
                <span class="text-sm text-slate-300 group-hover:text-white"
                  >Lowercase</span
                >
              </div>
              <input
                type="checkbox"
                id="optLower"
                v-model="options.lower"
                @change="generate"
                class="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary focus:ring-0"
              />
            </label>

            <label
              class="flex items-center justify-between p-3 bg-editor border border-slate-700 rounded-lg cursor-pointer hover:border-primary transition group"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white font-bold"
                >
                  1
                </div>
                <span class="text-sm text-slate-300 group-hover:text-white"
                  >Numbers</span
                >
              </div>
              <input
                type="checkbox"
                id="optNumber"
                v-model="options.number"
                @change="generate"
                class="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary focus:ring-0"
              />
            </label>

            <label
              class="flex items-center justify-between p-3 bg-editor border border-slate-700 rounded-lg cursor-pointer hover:border-primary transition group"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white font-bold"
                >
                  @
                </div>
                <span class="text-sm text-slate-300 group-hover:text-white"
                  >Symbols</span
                >
              </div>
              <input
                type="checkbox"
                id="optSymbol"
                v-model="options.symbol"
                @change="generate"
                class="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary focus:ring-0"
              />
            </label>
          </div>

          <div class="pt-4 border-t border-slate-700">
            <label
              class="flex items-center gap-2 cursor-pointer select-none w-max"
            >
              <div class="relative">
                <input
                  type="checkbox"
                  id="optEasyRead"
                  v-model="options.easyRead"
                  @change="generate"
                  class="sr-only peer"
                />
                <div
                  class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"
                ></div>
              </div>
              <span class="text-sm text-slate-400"
                >Easy to read (No I, l, 1, O, 0)</span
              >
            </label>
          </div>

          <button
            @click="generate"
            class="w-full mt-6 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-teal-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <i class="ph-bold ph-arrows-clockwise"></i> Generate New Password
          </button>
        </div>
      </main>
    </div>
    <template #sidebar>
      <aside class="w-full lg:w-80 flex flex-col gap-6">
        <div
          class="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-5 text-center"
        >
          <i class="ph-duotone ph-shield-check text-4xl text-primary mb-2"></i>
          <h4 class="font-bold text-white mb-1">Forget Passwords?</h4>
          <p class="text-xs text-slate-400 mb-4">
            Stop memorizing. Use a secure password manager.
          </p>
          <button
            class="w-full py-2 bg-white text-dark font-bold text-xs rounded hover:bg-slate-200 transition"
          >
            Best Password Manager
          </button>
        </div>
        <SidebarAd />
        <div class="bg-card border border-slate-800 rounded-xl p-5 flex-1">
          <div class="flex justify-between items-center mb-4">
            <h4 class="font-bold text-white text-sm flex items-center gap-2">
              <i class="ph-fill ph-clock-counter-clockwise"></i> History
            </h4>
            <button
              @click="clearHistory"
              class="text-xs text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          </div>

          <div
            id="historyList"
            class="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-1"
          >
            <div
              v-if="historyList.length === 0"
              class="text-xs text-slate-500 text-center py-4"
            >
              Generated passwords will appear here.
            </div>
            <div
              v-for="(pwd, index) in historyList"
              :key="index"
              class="fade-in flex items-center justify-between bg-editor p-2 rounded border border-slate-700 group"
            >
              <div class="font-mono text-sm text-slate-300 truncate w-48">
                {{ pwd }}
              </div>
              <button
                @click="copyHistoryItem(pwd)"
                class="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition"
              >
                <i class="ph-bold ph-copy"></i>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
// Assuming SidebarAd is imported

// --- Constants ---
const CHARS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  number: "0123456789",
  symbol: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
};
const AMBIGUOUS = /[Il1O0]/g;

// --- Reactive State ---
const passwordOutput = ref("Generating...");
const options = reactive({
  length: 16,
  upper: true,
  lower: true,
  number: true,
  symbol: true,
  easyRead: false,
});
const historyList = ref([]);
const copied = ref(false); // Copy button state

// Strength Indicators
const strengthPercent = ref(25);
const strengthColor = ref("#ef4444");
const crackTimeText = ref("Calculating...");

// --- Core Logic ---

function getPool() {
  let pool = "";
  if (options.upper) pool += CHARS.upper;
  if (options.lower) pool += CHARS.lower;
  if (options.number) pool += CHARS.number;
  if (options.symbol) pool += CHARS.symbol;

  if (options.easyRead) {
    // Note: The original JS uses a regex to remove ambiguous chars from the pool string itself.
    pool = pool.replace(AMBIGUOUS, "");
  }
  return pool;
}

function generate() {
  const len = options.length;
  const pool = getPool();

  // At least one option must be selected
  if (!pool || pool.length === 0) {
    passwordOutput.value = "Select options!";
    crackTimeText.value = "Error";
    calculateStrength("");
    return;
  }

  let password = "";
  // Use Web Crypto API for secure random generation
  const randomValues = new Uint32Array(len);

  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomValues);
  } else {
    // Fallback if crypto API is unavailable (less secure)
    for (let i = 0; i < len; i++) {
      randomValues[i] = Math.floor(Math.random() * 4294967295); // Max value of Uint32
    }
  }

  for (let i = 0; i < len; i++) {
    password += pool[randomValues[i] % pool.length];
  }

  passwordOutput.value = password;

  calculateStrength(password);
  addToHistory(password);
}

// Simple Heuristic Strength Meter (Adapted from HTML JS)
function calculateStrength(pwd) {
  let strength = 0;
  if (pwd.length > 8) strength += 1;
  if (pwd.length > 12) strength += 1;
  if (pwd.length >= 16) strength += 1;
  if (/[A-Z]/.test(pwd)) strength += 1;
  if (/[0-9]/.test(pwd)) strength += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;

  // Max score approx 6
  let percent = Math.min(100, (strength / 6) * 100);
  let color = "#ef4444"; // Red
  let text = "Calculating...";
  let crackText = "Calculating...";

  if (percent > 40) {
    color = "#f59e0b";
    text = "Medium";
  } // Orange
  if (percent > 70) {
    color = "#14b8a6";
    text = "Strong";
  } // Teal
  if (percent > 90) {
    color = "#10b981";
    text = "Uncrackable";
  } // Green

  // Fun text estimation
  if (strength < 3) crackText = "Instantly crackable 😱";
  else if (strength < 5) crackText = "Crackable in days 😬";
  else if (strength < 6) crackText = "Centuries to crack 🛡️";
  else crackText = "Millions of years to crack 🚀";

  strengthPercent.value = percent;
  strengthColor.value = color;
  crackTimeText.value = crackText;
}

function addToHistory(pwd) {
  // Use unshift to add to the beginning (mimics prepend)
  historyList.value.unshift(pwd);

  // Limit history to 10
  if (historyList.value.length > 10) {
    historyList.value.pop();
  }
}

function clearHistory() {
  historyList.value = [];
}

function copyPassword() {
  const val = passwordOutput.value;
  if (!val || val.includes("Select")) return;

  navigator.clipboard.writeText(val).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1500);
  });
}

function copyHistoryItem(pwd) {
  navigator.clipboard.writeText(pwd);
}

// --- Initialization ---
onMounted(() => {
  generate();
});
</script>
