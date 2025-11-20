<template>
  <ToolLayout
    title="SQL Formatter"
    description="Beautify complex SQL queries instantly. Supports MySQL, PostgreSQL, SQL Server and more."
    :showAdSlot="false"
  >
    <template #icon
      ><i class="ph-fill ph-database text-purple-500"></i
    ></template>

    <div
      class="max-w-[1400px] mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6"
    >
      <main class="flex-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 editor-height">
          <div class="flex flex-col h-full">
            <div class="flex justify-between items-center mb-2 px-1">
              <label
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Raw SQL Query</label
              >
              <button
                @click="loadSample"
                class="text-xs text-primary hover:underline cursor-pointer"
              >
                Load Sample
              </button>
            </div>
            <textarea
              id="sqlInput"
              v-model="sqlInput"
              class="flex-1 w-full bg-editor border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="SELECT * FROM users WHERE id = 1..."
            ></textarea>
          </div>

          <div class="flex flex-col h-full">
            <div class="flex justify-between items-center mb-2 px-1">
              <label
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Formatted SQL</label
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
              class="relative flex-1 bg-editor border rounded-lg overflow-hidden"
              :class="{
                'border-red-500': showErrorOverlay,
                'border-slate-700': !showErrorOverlay,
              }"
            >
              <div
                v-if="showErrorOverlay"
                id="errorMsg"
                class="absolute top-0 left-0 right-0 bg-red-900/90 text-red-200 text-xs p-2 border-b border-red-700 z-10"
              >
                {{ errorMsg }}
              </div>

              <pre
                class="w-full h-full p-4 overflow-auto m-0"
              ><code id="sqlOutput" class="language-sql font-mono text-sm">{{ sqlOutput }}</code></pre>
            </div>
          </div>
        </div>

        <article class="mt-12 prose prose-invert max-w-none text-slate-400">
          <h2 class="text-white text-lg font-semibold">About SQL Formatting</h2>
          <p>
            Complex SQL queries can become unreadable very quickly. This tool
            parses your SQL and re-indents it based on the dialect you choose.
          </p>
          <p>
            We support all major databases including <strong>MySQL</strong>,
            <strong>PostgreSQL</strong>, <strong>SQL Server (T-SQL)</strong>,
            and <strong>Oracle (PL/SQL)</strong>.
          </p>
        </article>
      </main>
    </div>
    <template #sidebar>
      <aside class="w-full lg:w-80 flex flex-col gap-6">
        <div
          class="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/20 rounded-xl p-6 text-center"
        >
          <div
            class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30"
          >
            <i class="ph-fill ph-code-block text-white text-2xl"></i>
          </div>
          <h3 class="text-white font-bold mb-2">Learn SQL?</h3>
          <p class="text-sm text-slate-400 mb-4">
            Master advanced SQL queries with our curated cheat sheet.
          </p>
          <button
            class="w-full py-2 bg-white text-dark font-bold rounded hover:bg-slate-200 transition"
          >
            View Cheat Sheet
          </button>
        </div>

        <div class="bg-card border border-slate-800 rounded-xl p-4">
          <h4 class="font-bold text-white mb-4 text-sm">Related Tools</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink
                to="/tools/json-formatter"
                class="text-slate-400 hover:text-primary flex items-center gap-2"
                ><i class="ph-fill ph-brackets-curly"></i> JSON
                Formatter</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/tools/base64-converter"
                class="text-slate-400 hover:text-primary flex items-center gap-2"
                ><i class="ph-fill ph-arrows-left-right"></i> Base64
                Converter</NuxtLink
              >
            </li>
          </ul>
        </div>

        <SidebarAd />
      </aside>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from "vue";
import { format as sqlFormatter } from "sql-formatter"; // <--- 关键修复: 导入 format 函数

// --- Reactive State ---
const sqlInput = ref("");
const sqlOutput = ref("");
const options = reactive({
  dialect: "sql",
  indent: "  ", // 2 spaces
  uppercase: true,
});
const showErrorOverlay = ref(false);
const errorMsg = ref("");

// --- Core Logic ---

function formatSQL() {
  const raw = sqlInput.value;
  if (!raw.trim()) {
    sqlOutput.value = "";
    hideError();
    return;
  }

  try {
    // 使用导入的 sqlFormatter.format
    const formatted = sqlFormatter(raw, {
      language: options.dialect,
      indent: options.indent,
      keywordCase: options.uppercase ? "upper" : "preserve",
    });

    updateOutput(formatted);
    hideError();
  } catch (e) {
    showError("Could not parse SQL: " + e.message);
    updateOutput(raw);
  }
}

function autoFormat() {
  if (sqlInput.value.trim()) {
    formatSQL();
  }
}

function updateOutput(text) {
  sqlOutput.value = text;
  nextTick(() => highlightCode());
}

function highlightCode() {
  if (window.Prism) {
    const element = document.getElementById("sqlOutput");
    if (element) {
      window.Prism.highlightElement(element);
    }
  }
}

function showError(msg) {
  errorMsg.value = msg;
  showErrorOverlay.value = true;
}

function hideError() {
  showErrorOverlay.value = false;
}

// --- Actions ---

function clearAll() {
  sqlInput.value = "";
  sqlOutput.value = "";
  hideError();
}

function loadSample() {
  const sample =
    "select id, name, email, created_at from users where status = 'active' and last_login > '2024-01-01' order by created_at desc limit 10;";
  sqlInput.value = sample;
  formatSQL();
}

function copyOutput() {
  const text = sqlOutput.value;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyBtn");
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="ph-bold ph-check text-green-500"></i> Copied!';
    setTimeout(() => (btn.innerHTML = originalHTML), 2000);
  });
}

// --- Initialization ---
onMounted(() => {
  // Note: The original HTML triggered formatSQL() only on input/change listeners.
  // If you want the sample loaded and formatted on mount, call loadSample() here:
  loadSample();
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

.editor-height {
  height: calc(100vh - 280px);
  min-height: 500px;
}

/* Error Styles */
.bg-red-900\/90 {
  background-color: rgba(153, 27, 27, 0.9);
}
.border-red-700 {
  border-color: #b91c1c;
}
.text-red-200 {
  color: #fecaca;
}

/* General */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #0f172a;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
