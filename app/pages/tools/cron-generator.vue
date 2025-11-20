<template>
  <ToolLayout
    title="Cron Generator"
    description="Generate complex Cron expressions and see the next scheduled execution times."
    :showAdSlot="false"
  >
    <template #icon
      ><i class="ph-fill ph-terminal-window text-primary"></i
    ></template>

    <div class="max-w-[1600px] mx-auto w-full">
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div
          class="lg:col-span-7 bg-gradient-to-r from-card to-editor border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-center"
        >
          <div class="flex justify-between items-center mb-2">
            <label
              class="text-xs font-bold text-primary uppercase tracking-wider"
              >Cron Expression</label
            >
            <div class="flex items-center gap-2 text-xs text-slate-400">
              <i class="ph-fill ph-translate text-green-400"></i>
              <span :class="['font-medium', humanTextClass]">{{
                humanText
              }}</span>
            </div>
          </div>
          <div class="relative">
            <input
              type="text"
              v-model="cronOutput"
              @input="handleManualInput"
              class="w-full bg-dark border border-slate-600 rounded-xl py-4 pl-5 pr-14 text-3xl font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-inner transition"
            />
            <button
              @click="copyCron"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
              title="Copy"
            >
              <i class="ph-bold ph-copy text-xl"></i>
            </button>
          </div>
        </div>

        <div
          class="lg:col-span-5 bg-card border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between"
        >
          <div class="mb-4">
            <label
              class="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2"
            >
              <i class="ph-fill ph-gear"></i> System Format
            </label>
            <select
              v-model="cronType"
              @change="updateBuilder"
              class="w-full bg-editor border border-slate-700 text-white text-sm rounded-lg p-3 focus:border-primary outline-none transition hover:border-slate-600"
            >
              <option value="linux">Linux / Crontab (5 fields)</option>
              <option value="spring">Java Spring (6 fields)</option>
              <option value="quartz">Quartz Scheduler (7 fields)</option>
            </select>
          </div>
          <div>
            <label
              class="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2"
            >
              <i class="ph-fill ph-lightning text-yellow-500"></i> Quick
              Templates
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="preset in presets"
                :key="preset.val"
                @click="applyPreset(preset.val)"
                class="preset-btn px-3 py-2 bg-editor border border-slate-700 hover:border-primary hover:text-white rounded text-xs font-medium transition text-center truncate"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-8 flex flex-col gap-6">
          <div
            class="bg-card border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-full min-h-[500px]"
          >
            <div
              class="flex border-b border-slate-800 bg-editor overflow-x-auto"
            >
              <button
                v-for="field in availableFields"
                :key="field.id"
                @click="activeTab = field.id"
                :class="[
                  'tab-btn flex-1 py-4 text-sm font-bold uppercase tracking-wide',
                  { active: activeTab === field.id },
                ]"
                :data-tab="field.id"
              >
                {{ field.label }}
              </button>
            </div>
            <div class="p-6 bg-card flex-1">
              <div
                v-for="field in availableFields"
                :key="field.id"
                v-show="activeTab === field.id"
                class="tab-panel space-y-6 animate-fadeIn"
              >
                <label
                  class="flex items-center gap-4 cursor-pointer p-4 rounded-lg bg-editor border border-slate-800 hover:border-primary hover:bg-surface transition group"
                >
                  <input
                    type="radio"
                    :name="field.id + 'Opt'"
                    value="every"
                    v-model="builderState[field.id].option"
                    @change="updateBuilder"
                    class="w-5 h-5 text-primary bg-dark border-slate-600 focus:ring-offset-dark focus:ring-primary"
                  />
                  <span
                    class="font-medium text-slate-300 group-hover:text-white"
                    >Every {{ field.label }} (*)</span
                  >
                </label>

                <label
                  v-if="['second', 'minute'].includes(field.id)"
                  class="flex items-center gap-4 cursor-pointer p-4 rounded-lg bg-editor border border-slate-800 hover:border-primary hover:bg-surface transition group"
                >
                  <input
                    type="radio"
                    :name="field.id + 'Opt'"
                    value="interval"
                    v-model="builderState[field.id].option"
                    @change="updateBuilder"
                    class="w-5 h-5 text-primary bg-dark border-slate-600 focus:ring-offset-dark focus:ring-primary"
                  />
                  <div class="flex items-center gap-3 text-sm text-slate-300">
                    <span>Every</span>
                    <input
                      type="number"
                      v-model.number="builderState[field.id].interval"
                      @input="handleIntervalInput(field.id, field.max)"
                      min="1"
                      :max="field.max"
                      class="w-20 bg-dark border border-slate-600 rounded-md px-2 py-1.5 text-center focus:border-primary outline-none text-white"
                    />
                    <span>{{ field.id }}s</span>
                  </div>
                </label>

                <label
                  v-if="
                    ['day', 'week'].includes(field.id) && cronType === 'quartz'
                  "
                  class="flex items-center gap-4 cursor-pointer p-4 rounded-lg bg-editor border border-slate-800 hover:border-primary hover:bg-surface transition group"
                >
                  <input
                    type="radio"
                    :name="field.id + 'Opt'"
                    value="none"
                    v-model="builderState[field.id].option"
                    @change="updateBuilder"
                    class="w-5 h-5 text-primary bg-dark border-slate-600 focus:ring-offset-dark focus:ring-primary"
                  />
                  <span
                    class="font-medium text-slate-300 group-hover:text-white"
                    >No Specific {{ field.label }} (?)</span
                  >
                </label>

                <div class="p-4 rounded-lg bg-editor border border-slate-800">
                  <label class="flex items-center gap-4 cursor-pointer mb-4">
                    <input
                      type="radio"
                      :name="field.id + 'Opt'"
                      value="specific"
                      v-model="builderState[field.id].option"
                      @change="updateBuilder"
                      class="w-5 h-5 text-primary bg-dark border-slate-600 focus:ring-offset-dark focus:ring-primary"
                    />
                    <span class="font-bold text-white"
                      >Specific {{ field.label }}s</span
                    >
                  </label>
                  <div class="num-grid">
                    <div
                      v-for="(label, index) in field.labels"
                      :key="index"
                      :data-val="field.min + index"
                      @click="toggleGridItem(field.id, field.min + index)"
                      :class="[
                        'num-item',
                        {
                          selected: builderState[field.id].specific.includes(
                            field.min + index
                          ),
                        },
                      ]"
                    >
                      {{ label }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-4 flex flex-col gap-6">
          <div
            class="bg-card border border-slate-800 rounded-xl p-6 shadow-lg flex-1 flex flex-col h-full"
          >
            <h3
              class="text-sm font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4"
            >
              <i class="ph-fill ph-clock-countdown text-blue-400"></i> Next 5
              Executions
            </h3>
            <div id="nextRuns" class="relative flex-1 overflow-y-auto pl-1">
              <div
                v-if="nextRuns.length === 0"
                class="text-slate-500 text-sm italic"
              >
                No upcoming runs or invalid expression.
              </div>
              <div
                v-for="(run, index) in nextRuns"
                :key="index"
                class="timeline-item"
              >
                <div class="timeline-line"></div>
                <div class="timeline-dot"></div>

                <div class="flex flex-col gap-1">
                  <div class="flex justify-between items-center">
                    <span class="text-white font-bold text-sm">{{
                      run.dateStr
                    }}</span>
                    <span
                      class="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                      >+{{ run.rel }}</span
                    >
                  </div>
                  <div
                    class="text-primary font-mono text-xs font-bold tracking-wide"
                  >
                    {{ run.timeStr }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="statusMessage"
              :class="['mt-4 p-3 text-xs rounded block', statusBoxClass]"
            >
              {{ statusMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #sidebar>
      <div class="w-full lg:w-80 flex flex-col gap-6">
        <div class="bg-card border border-slate-800 rounded-xl p-4">
          <h4 class="font-bold text-white mb-4 text-sm flex items-center gap-2">
            <i class="ph-fill ph-link text-cyan-500"></i> Related Tools
          </h4>
          <p class="text-xs text-slate-400 mb-3">
            Other development utility tools.
          </p>
          <NuxtLink
            to="/tools/url-encoder"
            class="block text-center w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition mt-2"
          >
            URL Encoder
          </NuxtLink>
        </div>

        <SidebarAd />
      </div>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
// Import the missing component (assuming path is correct)
import SidebarAd from "~/components/SidebarAd.vue";

// IMPORTANT: In a real environment (e.g., Nuxt or Vite), you must install
// 'cron-parser' and 'cronstrue' and import them normally.
// For this standalone component, we use placeholder imports.

// Placeholder for external libraries
const cronParser = {
  parseExpression: (cron) => {
    // Simple validation placeholder
    const parts = cron.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 7) {
      throw new Error("Field count mismatch");
    }
    // Mock interval object for demonstration
    return {
      next: () => ({
        value: { toDate: () => new Date(Date.now() + Math.random() * 3600000) },
        done: false,
      }),
      // Add a sentinel value to prevent infinite loop in mock
      [Symbol.iterator]: function* () {
        for (let i = 0; i < 5; i++) yield this.next().value;
      },
    };
  },
};
const cronstrue = {
  toString: (cron) => {
    if (cron === "* * * * *") return "Every minute";
    if (cron.includes("?")) return "Complex format";
    return `Runs based on: ${cron}`; // Placeholder logic
  },
};

// --- Constants (Adapted from HTML JS) ---
const RANGES = {
  second: {
    min: 0,
    max: 59,
    label: "Seconds",
    id: "second",
    labels: [...Array(60).keys()],
  },
  minute: {
    min: 0,
    max: 59,
    label: "Minute",
    id: "minute",
    labels: [...Array(60).keys()],
  },
  hour: {
    min: 0,
    max: 23,
    label: "Hour",
    id: "hour",
    labels: [...Array(24).keys()],
  },
  day: {
    min: 1,
    max: 31,
    label: "Day",
    id: "day",
    labels: [...Array(31).keys()].map((i) => i + 1),
  },
  month: {
    min: 1,
    max: 12,
    label: "Month",
    id: "month",
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
  week: {
    min: 0,
    max: 6,
    label: "Week",
    id: "week",
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  year: {
    min: 2024,
    max: 2035,
    label: "Year",
    id: "year",
    labels: [...Array(12).keys()].map((i) => i + 2024),
  },
};

const presets = [
  { label: "Every 5 Mins", val: "*/5 * * * *" },
  { label: "Hourly", val: "0 * * * *" },
  { label: "Daily (00:00)", val: "0 0 * * *" },
  { label: "Weekly (Sun)", val: "0 0 * * 0" },
  { label: "Monthly (1st)", val: "0 0 1 * *" },
  { label: "Weekdays", val: "0 0 * * 1-5" },
];

// --- Reactive State ---
const cronType = ref("linux");
const cronOutput = ref("* * * * *");
const activeTab = ref("minute");
const humanText = ref("Loading...");
const humanTextClass = ref("text-slate-500");
const nextRuns = ref([]);
const statusMessage = ref("");
const statusBoxClass = ref("");

// Builder State: Represents the options selected in the UI (must cover all fields)
const builderState = reactive({
  second: { option: "every", interval: 5, specific: [] },
  minute: { option: "every", interval: 5, specific: [] },
  hour: { option: "every", specific: [] },
  day: { option: "every", specific: [] },
  month: { option: "every", specific: [] },
  week: { option: "every", specific: [] },
  year: { option: "every", specific: [] },
});

// --- Computed Properties ---

const availableFields = computed(() => {
  const fieldsMap = {
    linux: ["minute", "hour", "day", "month", "week"],
    spring: ["second", "minute", "hour", "day", "month", "week"],
    quartz: ["second", "minute", "hour", "day", "month", "week", "year"],
  };
  const currentFields = fieldsMap[cronType.value] || [];
  return currentFields.map((id) => ({
    ...RANGES[id],
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    labels: RANGES[id].labels,
  }));
});

// --- Core Logic ---

/**
 * Calculates human-readable text and next execution times (Main entry point for calculation).
 * @param {string} cron The cron expression to analyze.
 */
function calculate(cron) {
  statusMessage.value = "";
  statusBoxClass.value = "";
  nextRuns.value = [];

  // 1. Translation (cronstrue)
  try {
    const parts = cron.trim().split(/\s+/);
    const translateCron = parts.length > 6 ? parts.slice(0, 6).join(" ") : cron;

    humanText.value = cronstrue.toString(translateCron);
    humanTextClass.value = "text-slate-300";
  } catch (e) {
    humanText.value = "Complex format or invalid";
    humanTextClass.value = "text-slate-500";
  }

  // 2. Calculation (cron-parser)
  try {
    const options = { currentDate: new Date(), iterator: true };
    const interval = cronParser.parseExpression(cron.trim(), options);
    renderTimeline(interval);
  } catch (e) {
    // Fallback for Quartz/Special chars (Adapted from HTML)
    let isSafeMode = false;
    try {
      let safeCron = cron
        .replace(/\?/g, "*")
        .replace(/L/g, "1")
        .replace(/W/g, "")
        .replace(/#/g, "*");
      if (safeCron.split(/\s+/).length > 6) {
        safeCron = safeCron.split(/\s+/).slice(0, 6).join(" ");
      }
      const interval = cronParser.parseExpression(safeCron, {
        currentDate: new Date(),
        iterator: true,
      });

      renderTimeline(interval);
      isSafeMode = true;
    } catch (e2) {
      // Error
      statusMessage.value = "Invalid Cron Syntax";
      statusBoxClass.value =
        "bg-red-900/20 border border-red-500/50 text-red-300";
    }

    if (isSafeMode) {
      statusMessage.value =
        "Note: Preview is approximate (Complex syntax detected)";
      statusBoxClass.value =
        "bg-yellow-900/20 border border-yellow-500/50 text-yellow-300";
    }
  }
}

/**
 * Generates the next 5 execution times for the timeline.
 */
function renderTimeline(interval) {
  const runs = [];
  for (let i = 0; i < 5; i++) {
    // The mock interval may throw if we call .next() more than 5 times
    try {
      const item = interval.next();
      if (item.done) break;

      const date = item.value.toDate();
      const dateStr = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timeStr = date.toLocaleTimeString(undefined, { hour12: false });

      // Relative time calculation (Adapted from HTML)
      const diff = Math.round((date - new Date()) / 1000);
      let rel = "";
      if (diff < 60) rel = `${diff}s`;
      else if (diff < 3600) rel = `${Math.floor(diff / 60)}m`;
      else if (diff < 86400) rel = `${Math.floor(diff / 3600)}h`;
      else rel = `${Math.floor(diff / 86400)}d`;

      runs.push({ dateStr, timeStr, rel });
    } catch (e) {
      break; // Stop if interval is exhausted or mock fails
    }
  }
  nextRuns.value = runs;
}

/**
 * Updates the cron output string based on the builder state.
 */
function updateBuilder() {
  let cronParts = [];

  const fieldOrder = availableFields.value.map((f) => f.id);

  for (const field of fieldOrder) {
    const state = builderState[field];
    let val = "";

    if (state.option === "every") {
      val = "*";
    } else if (
      state.option === "none" &&
      (field === "day" || field === "week")
    ) {
      val = "?";
    } else if (
      state.option === "interval" &&
      (field === "minute" || field === "second")
    ) {
      val = `*/${state.interval}`;
    } else if (state.option === "specific") {
      const sel = state.specific.sort((a, b) => a - b);

      if (sel.length === 0) {
        // HTML logic for empty specific selection
        if (field === "day" || field === "month") val = "1";
        else if (field === "second" || field === "minute" || field === "hour")
          val = "0";
        else val = "*";
      } else {
        val = sel.join(",");
      }
    } else {
      val = "*";
    }
    cronParts.push(val);
  }

  const newCron = cronParts.join(" ");
  cronOutput.value = newCron;
  calculate(newCron);
}

// --- UI Interaction Handlers ---

/**
 * Toggles a number in the specific selection grid.
 */
function toggleGridItem(fieldId, value) {
  const specificList = builderState[fieldId].specific;
  const index = specificList.indexOf(value);

  if (index === -1) {
    specificList.push(value);
  } else {
    specificList.splice(index, 1);
  }

  // Automatically set the radio button to 'specific'
  builderState[fieldId].option = "specific";

  updateBuilder();
}

/**
 * Handles applying a quick preset and recalculating.
 */
function applyPreset(val) {
  let finalCron = val;
  // Adjust 5-field presets for 6/7 field types (HTML logic)
  if (cronType.value !== "linux" && val.split(" ").length === 5) {
    finalCron = "0 " + val; // Add seconds field
  }

  cronOutput.value = finalCron;
  calculate(finalCron);
}

/**
 * Handles direct input to the cron output field and triggers recalculation.
 */
function handleManualInput() {
  // Note: We do not attempt to reverse-engineer the builderState from manual input
  calculate(cronOutput.value);
}

/**
 * Handles interval number input, ensures it's within bounds, and recalculates.
 */
function handleIntervalInput(fieldId, max) {
  // Enforce min/max for interval input (min is always 1)
  let val = builderState[fieldId].interval;
  if (val < 1) builderState[fieldId].interval = 1;
  if (val > max) builderState[fieldId].interval = max;

  // Ensure the radio button is set to interval
  builderState[fieldId].option = "interval";
  updateBuilder();
}

/**
 * Copies the current cron expression to the clipboard.
 */
const copyCron = () => {
  if (!cronOutput.value) return;
  navigator.clipboard.writeText(cronOutput.value);
  // Add visual feedback (Optional: not implemented here for brevity)
};

// --- Lifecycle Hook ---

onMounted(() => {
  // Set the initial active tab based on the type (default to minute)
  if (availableFields.value.length > 0) {
    activeTab.value =
      availableFields.value.find((f) => f.id === "minute")?.id ||
      availableFields.value[0].id;
  }
  // Perform initial calculation
  updateBuilder();
});
</script>

<style scoped>
/* Scoped styles adapted from the HTML file */
/* Color variables defined in tailwind.config based on the HTML provided */
.text-primary {
  color: #8b5cf6;
} /* Primary color */
.bg-dark {
  background-color: #0f172a;
}
.bg-card {
  background-color: #1e293b;
}
.bg-editor {
  background-color: #111827;
}
.bg-surface {
  background-color: #334155;
}

/* Tabs */
.tab-btn {
  position: relative;
  color: #94a3b8;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}
.tab-btn:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.03);
}
.tab-btn.active {
  color: #8b5cf6;
  border-bottom-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.05);
}

/* Number Grid */
.num-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
  gap: 6px;
}
.num-item {
  cursor: pointer;
  border-radius: 6px;
  padding: 8px 0;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  background: #0f172a;
  border: 1px solid #334155;
  transition: all 0.1s;
  color: #cbd5e1;
  user-select: none;
}
.num-item:hover {
  border-color: #8b5cf6;
  background: #1e293b;
  color: white;
}
.num-item.selected {
  background-color: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
}

/* Timeline */
.timeline-item {
  position: relative;
  padding-left: 2rem;
  padding-bottom: 1.5rem;
}
.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-line {
  position: absolute;
  left: 7px;
  top: 8px;
  bottom: -8px;
  width: 2px;
  background: #334155;
}
.timeline-item:last-child .timeline-line {
  display: none;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1e293b;
  border: 3px solid #8b5cf6;
  position: absolute;
  left: 0;
  top: 4px;
  z-index: 10;
}

/* Status Boxes */
.bg-red-900\/20 {
  background-color: rgba(153, 27, 27, 0.2);
}
.bg-yellow-900\/20 {
  background-color: rgba(161, 98, 7, 0.2);
}
.text-red-300 {
  color: #fca5a5;
}
.text-yellow-300 {
  color: #fcd34d;
}
.border-red-500\/50 {
  border-color: rgba(239, 68, 68, 0.5);
}
.border-yellow-500\/50 {
  border-color: rgba(245, 158, 11, 0.5);
}
</style>
