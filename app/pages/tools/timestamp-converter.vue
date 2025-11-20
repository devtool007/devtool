<template>
  <ToolLayout
    title="Unix Timestamp Converter"
    description="Convert Unix Timestamp to Date and vice versa. Supports Seconds, Milliseconds, and relative time."
    :showAdSlot="false"
  >
    <template #icon
      ><i class="ph-fill ph-clock-counter-clockwise text-primary"></i
    ></template>

    <div class="max-w-[1400px] mx-auto w-full px-4 py-8">
      <section
        class="bg-card border border-slate-800 rounded-2xl p-8 text-center mb-10 relative overflow-hidden shadow-2xl shadow-black/20"
      >
        <div
          class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
        ></div>

        <h2
          class="text-slate-500 uppercase text-xs font-bold tracking-widest mb-4"
        >
          Current Unix Epoch Time
        </h2>

        <div
          class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8"
        >
          <div class="relative group">
            <div
              id="currentTimestamp"
              @click="copyCurrent"
              class="text-5xl md:text-7xl font-bold text-white font-mono-nums tracking-tight cursor-pointer select-all"
            >
              {{ currentTimestamp }}
            </div>
            <div class="text-xs text-slate-500 mt-2">
              <span id="currentModeText">{{
                showMillis ? "Milliseconds" : "Seconds"
              }}</span>
              (<span
                class="text-primary cursor-pointer hover:underline"
                @click="toggleMode"
                >Switch to
                <span id="switchText">{{
                  showMillis ? "Seconds" : "Milliseconds"
                }}</span></span
              >)
            </div>
          </div>

          <div class="flex gap-2">
            <button
              id="btnPause"
              @click="toggleTimer"
              :class="[
                'p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700',
                { 'bg-red-900/50': isPaused },
              ]"
              :title="isPaused ? 'Play' : 'Pause'"
            >
              <i :class="['ph-fill', isPaused ? 'ph-play' : 'ph-pause']"></i>
            </button>
            <button
              @click="copyCurrent"
              class="p-3 rounded-full bg-primary hover:bg-amber-600 text-white transition shadow-lg shadow-amber-500/20"
              title="Copy"
            >
              <i class="ph-bold ph-copy"></i>
            </button>
          </div>
        </div>
      </section>

      <div class="flex flex-col lg:flex-row gap-8">
        <main class="flex-1 flex flex-col gap-8">
          <div class="bg-card border border-slate-800 rounded-xl p-6">
            <h3
              class="text-lg font-bold text-white mb-4 flex items-center gap-2"
            >
              <i class="ph-fill ph-clock-counter-clockwise text-primary"></i>
              Timestamp to Date
            </h3>

            <div class="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                id="tsInput"
                v-model="tsInput"
                @input="convertTsToDate"
                class="flex-1 bg-editor border border-slate-700 rounded-lg p-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. 1672531200"
              />
              <button
                @click="convertTsToDate"
                class="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-lg transition"
              >
                Convert
              </button>
            </div>

            <div
              class="bg-editor rounded-lg border border-slate-800 overflow-hidden"
            >
              <table class="w-full text-sm text-left">
                <tbody class="divide-y divide-slate-800">
                  <tr>
                    <td class="p-3 text-slate-500 font-medium w-32">
                      GMT / UTC
                    </td>
                    <td class="p-3 text-white font-mono select-all" id="resUtc">
                      {{ tsToDateResult.utc }}
                    </td>
                  </tr>
                  <tr>
                    <td class="p-3 text-slate-500 font-medium">
                      Your Timezone
                    </td>
                    <td
                      class="p-3 text-white font-mono select-all font-bold"
                      id="resLocal"
                    >
                      {{ tsToDateResult.local }}
                    </td>
                  </tr>
                  <tr>
                    <td class="p-3 text-slate-500 font-medium">Relative</td>
                    <td class="p-3 text-primary select-all" id="resRelative">
                      {{ tsToDateResult.relative }}
                    </td>
                  </tr>
                  <tr>
                    <td class="p-3 text-slate-500 font-medium">ISO 8601</td>
                    <td
                      class="p-3 text-slate-400 font-mono select-all"
                      id="resIso"
                    >
                      {{ tsToDateResult.iso }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="bg-card border border-slate-800 rounded-xl p-6">
            <h3
              class="text-lg font-bold text-white mb-4 flex items-center gap-2"
            >
              <i class="ph-fill ph-calendar-blank text-blue-400"></i>
              Date to Timestamp
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <input
                type="datetime-local"
                id="dateInput"
                v-model="dateInput"
                class="sm:col-span-2 bg-editor border border-slate-700 rounded-lg p-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />

              <button
                @click="convertDateToTs"
                class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg transition"
              >
                Convert
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-editor border border-slate-800 rounded-lg p-4">
                <div class="text-xs text-slate-500 uppercase mb-1">
                  Timestamp (Seconds)
                </div>
                <div class="flex justify-between items-center">
                  <div
                    class="text-white font-mono text-lg select-all"
                    id="resTsSec"
                  >
                    {{ dateToTsResult.sec }}
                  </div>
                  <button
                    @click="copyText('sec')"
                    class="text-slate-500 hover:text-white"
                  >
                    <i class="ph-bold ph-copy"></i>
                  </button>
                </div>
              </div>
              <div class="bg-editor border border-slate-800 rounded-lg p-4">
                <div class="text-xs text-slate-500 uppercase mb-1">
                  Timestamp (Milliseconds)
                </div>
                <div class="flex justify-between items-center">
                  <div
                    class="text-white font-mono text-lg select-all"
                    id="resTsMs"
                  >
                    {{ dateToTsResult.ms }}
                  </div>
                  <button
                    @click="copyText('ms')"
                    class="text-slate-500 hover:text-white"
                  >
                    <i class="ph-bold ph-copy"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    <template #sidebar>
      <aside class="w-full lg:w-80 flex flex-col gap-6">
        <div class="bg-card border border-slate-800 rounded-xl p-5">
          <h4 class="font-bold text-white mb-4 text-sm flex items-center gap-2">
            <i class="ph-fill ph-student text-primary"></i> Cheat Sheet
          </h4>
          <table class="w-full text-xs text-left text-slate-400">
            <tbody class="divide-y divide-slate-800">
              <tr>
                <td class="py-2">1 Minute</td>
                <td class="py-2 text-right font-mono text-white">60 s</td>
              </tr>
              <tr>
                <td class="py-2">1 Hour</td>
                <td class="py-2 text-right font-mono text-white">3,600 s</td>
              </tr>
              <tr>
                <td class="py-2">1 Day</td>
                <td class="py-2 text-right font-mono text-white">86,400 s</td>
              </tr>
              <tr>
                <td class="py-2">1 Week</td>
                <td class="py-2 text-right font-mono text-white">604,800 s</td>
              </tr>
              <tr>
                <td class="py-2">1 Month (30.44d)</td>
                <td class="py-2 text-right font-mono text-white">
                  2,629,743 s
                </td>
              </tr>
              <tr>
                <td class="py-2">1 Year (365.24d)</td>
                <td class="py-2 text-right font-mono text-white">
                  31,556,926 s
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="prose prose-invert max-w-none text-xs text-slate-500">
          <p>
            The <strong>Unix timestamp</strong> tracks time as a running total
            of seconds. This count starts at the Unix Epoch on January 1st, 1970
            at UTC. Therefore, the unix time stamp is merely the number of
            seconds between a particular date and the Unix Epoch.
          </p>
        </div>

        <div class="bg-card border border-slate-800 rounded-xl p-4">
          <h4 class="font-bold text-white mb-4 text-sm flex items-center gap-2">
            <i class="ph-fill ph-lock-key text-teal-400"></i> Other Tools
          </h4>
          <p class="text-xs text-slate-400 mb-3">
            Need a secure, random password?
          </p>
          <NuxtLink
            to="/tools/password-generator"
            class="block text-center w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition mt-2"
          >
            Password Generator
          </NuxtLink>
        </div>

        <SidebarAd />
      </aside>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
// Assuming SidebarAd, NuxtLink are available
// import SidebarAd from "~/components/SidebarAd.vue";
// import ToolLayout from "~/components/ToolLayout.vue";

// --- Reactive State ---
const currentTimestamp = ref("Loading...");
const isPaused = ref(false);
const showMillis = ref(false);

const tsInput = ref("");
const dateInput = ref(""); // Bound to datetime-local

const tsToDateResult = reactive({
  utc: "-",
  local: "-",
  relative: "-",
  iso: "-",
});

const dateToTsResult = reactive({
  sec: "-",
  ms: "-",
});

let intervalId;

// --- Clock Logic ---

function updateClock() {
  if (isPaused.value) return;
  const now = new Date();

  // FIX: Removed .toLocaleString() to prevent unwanted thousands separators
  if (showMillis.value) {
    currentTimestamp.value = now.getTime().toString();
  } else {
    currentTimestamp.value = Math.floor(now.getTime() / 1000).toString();
  }
}

function toggleTimer() {
  isPaused.value = !isPaused.value;
  // Resume ticking immediately if unpaused
  if (!isPaused.value) {
    clearInterval(intervalId);
    startClock();
  }
}

function toggleMode() {
  showMillis.value = !showMillis.value;
  // Reset interval frequency
  clearInterval(intervalId);
  startClock();
}

function startClock() {
  updateClock();
  const interval = showMillis.value ? 50 : 1000;
  intervalId = setInterval(updateClock, interval);
}

// --- Conversion Logic ---

function convertTsToDate() {
  let input = tsInput.value.trim();
  if (!input) return;

  // Clean input
  input = input.replace(/,/g, "");

  let ts = parseInt(input);
  if (isNaN(ts)) {
    tsToDateResult.local = "Invalid Date";
    return;
  }

  // Auto-detect seconds vs milliseconds (Heuristic: > 11 digits means milliseconds)
  let isMs = input.length > 11;

  let date;
  if (isMs) {
    date = new Date(ts);
  } else {
    date = new Date(ts * 1000);
  }

  // Render
  tsToDateResult.utc = date.toUTCString();
  tsToDateResult.local = date.toLocaleString();
  tsToDateResult.iso = date.toISOString();
  tsToDateResult.relative = getRelativeTime(date);
}

function convertDateToTs() {
  const input = dateInput.value;
  if (!input) {
    dateToTsResult.sec = "-";
    dateToTsResult.ms = "-";
    return;
  }

  const date = new Date(input);
  const ms = date.getTime();
  const sec = Math.floor(ms / 1000);

  // FIX: Use toString() to avoid locale formatting in the output displays
  dateToTsResult.ms = ms.toString();
  dateToTsResult.sec = sec.toString();
}

// Helper: Relative Time (e.g., "2 hours ago")
function getRelativeTime(date) {
  // Check if Intl.RelativeTimeFormat is supported (standard in modern browsers)
  if (typeof Intl.RelativeTimeFormat === "undefined") {
    return "Browser update required for relative time.";
  }

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const now = new Date();
  const diffInSeconds = (date.getTime() - now.getTime()) / 1000;

  const absDiff = Math.abs(diffInSeconds);

  if (absDiff < 60) return rtf.format(Math.round(diffInSeconds), "second");
  if (absDiff < 3600)
    return rtf.format(Math.round(diffInSeconds / 60), "minute");
  if (absDiff < 86400)
    return rtf.format(Math.round(diffInSeconds / 3600), "hour");
  if (absDiff < 2592000)
    return rtf.format(Math.round(diffInSeconds / 86400), "day");
  if (absDiff < 31536000)
    return rtf.format(Math.round(diffInSeconds / 2592000), "month");
  return rtf.format(Math.round(diffInSeconds / 31536000), "year");
}

// --- Actions ---

function copyCurrent() {
  // FIX: copyCurrent now copies the raw number from the currentTimestamp ref
  navigator.clipboard.writeText(currentTimestamp.value.replace(/,/g, ""));
}

function copyText(type) {
  let val = "";
  if (type === "sec") val = dateToTsResult.sec;
  else if (type === "ms") val = dateToTsResult.ms;

  // FIX: copyText copies the raw number (no commas)
  if (val !== "-") navigator.clipboard.writeText(val.replace(/,/g, ""));
}

// --- Initialization ---

onMounted(() => {
  // Init: Set Date Input to current local time (formatted for datetime-local)
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  dateInput.value = now.toISOString().slice(0, 16);

  startClock();
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
/* Scoped styles adapted from the HTML file */
.text-primary {
  color: #f59e0b;
} /* Amber-500 */
.bg-dark {
  background-color: #0f172a;
}
.bg-card {
  background-color: #1e293b;
}
.bg-editor {
  background-color: #111827;
}

/* Font Fix */
.font-mono-nums {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
</style>
