<template>
  <ToolLayout
    title="JSON to Go"
    description="Generate Go Structs from JSON instantly."
    :showAdSlot="false"
  >
    <template #icon><i class="ph-fill ph-file-code text-primary"></i></template>

    <div
      class="max-w-[1400px] mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6"
    >
      <div class="w-full lg:w-1/2 flex flex-col gap-4">
        <div
          class="flex-1 bg-editor border border-slate-700 rounded-xl p-4 flex flex-col relative editor-height"
        >
          <div class="flex justify-between items-center mb-2">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >JSON Input</label
            >
            <button
              @click="formatJsonInput"
              class="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <i class="ph-bold ph-magic-wand"></i> Format
            </button>
          </div>
          <textarea
            id="jsonInput"
            v-model="jsonInput"
            @input="process"
            class="flex-1 w-full bg-transparent font-mono text-sm text-slate-300 focus:outline-none resize-none placeholder-slate-600"
            placeholder='Paste your JSON here... { "id": 1, "name": "Go" }'
          ></textarea>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex flex-col gap-4">
        <div
          class="bg-card border border-slate-800 rounded-lg p-3 flex flex-wrap gap-4 items-center text-sm"
        >
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="optInline"
              v-model="optInline"
              @change="process"
              class="rounded bg-dark border-slate-700 text-primary focus:ring-0"
            />
            <span class="text-slate-300">Inline Structs</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="optOmitempty"
              v-model="optOmitempty"
              @change="process"
              class="rounded bg-dark border-slate-700 text-primary focus:ring-0"
            />
            <span class="text-slate-300">Add <code>omitempty</code></span>
          </label>
          <div class="flex items-center gap-2 ml-auto">
            <span class="text-slate-500">Struct Name:</span>
            <input
              type="text"
              id="structName"
              v-model="structName"
              @input="process"
              class="bg-dark border border-slate-700 text-white px-2 py-1 rounded w-32 focus:border-primary outline-none"
            />
          </div>
        </div>

        <div
          class="flex-1 bg-editor border border-slate-700 rounded-xl overflow-hidden flex flex-col relative editor-height"
        >
          <div class="absolute top-4 right-4 z-10">
            <button
              @click="copyOutput"
              id="copyBtn"
              class="bg-slate-800/90 hover:bg-primary text-white border border-slate-600 hover:border-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition backdrop-blur"
            >
              <i class="ph-bold ph-copy"></i> Copy Go Code
            </button>
          </div>

          <pre
            class="flex-1 w-full h-full p-4 m-0 overflow-auto"
          ><code id="goOutput" class="language-go text-sm font-mono">{{ goOutput }}</code></pre>

          <div
            v-if="showErrorOverlay"
            id="errorOverlay"
            class="absolute inset-0 bg-dark/80 flex items-center justify-center backdrop-blur-sm"
          >
            <div
              class="text-red-400 bg-red-900/20 border border-red-500/50 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <i class="ph-fill ph-warning-circle"></i>
              <span id="errorMsg">{{ errorMsg }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #sidebar>
      <div class="w-full lg:w-80 flex flex-col gap-6">
        <div class="bg-card border border-slate-800 rounded-xl p-4">
          <h4 class="font-bold text-white mb-4 text-sm flex items-center gap-2">
            <i class="ph-fill ph-shield-check text-green-500"></i> Cryptography
            Tools
          </h4>
          <p class="text-xs text-slate-400 mb-3">
            Need to generate cryptographic hashes (MD5, SHA256) instead?
          </p>
          <NuxtLink
            to="/tools/hash-generator"
            class="block text-center w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition"
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
import { ref, watch, nextTick } from "vue";

// 假设 PrismJS 和相关组件已通过 CDN 或构建工具加载
// import Prism from 'prismjs';
// import 'prismjs/components/prism-go';
// import SidebarAd from "~/components/SidebarAd.vue";
// import ToolLayout from "~/components/ToolLayout.vue";

// --- Reactive State ---
const jsonInput = ref("");
const goOutput = ref("");
const structName = ref("AutoGenerated");
const optInline = ref(false);
const optOmitempty = ref(false);
const showErrorOverlay = ref(false);
const errorMsg = ref("");

// --- Utilities ---

/**
 * Helper to check if PrismJS is available before calling its methods.
 */
function highlightCode() {
  if (window.Prism) {
    // Need to wait for the DOM update (goOutput.value) before highlighting
    const element = document.getElementById("goOutput");
    if (element) {
      window.Prism.highlightElement(element);
    }
  }
}

/**
 * Formats JSON input.
 */
function formatJsonInput() {
  try {
    const val = jsonInput.value;
    if (val) jsonInput.value = JSON.stringify(JSON.parse(val), null, 2);
    process();
  } catch (e) {
    // Silent catch for formatting errors
  }
}

/**
 * Loads a sample JSON structure.
 */
function loadSample() {
  const sample = {
    status: 200,
    message: "success",
    data: {
      user_id: 1024,
      username: "gopher_master",
      is_admin: true,
      scores: [98.5, 88.0, 100],
      profile: {
        website: "https://devtool.com",
        created_at: "2025-01-01T12:00:00Z",
      },
    },
  };
  jsonInput.value = JSON.stringify(sample, null, 2);
  process();
}

// ---------------------------------------------------------
// 核心算法：JSON -> Go Struct (移植自 HTML)
// ---------------------------------------------------------

// 转换入口
function process() {
  const raw = jsonInput.value.trim();
  goOutput.value = "";
  showErrorOverlay.value = false;

  if (!raw) return;

  try {
    const json = JSON.parse(raw);
    const rootName = structName.value || "AutoGenerated";
    const goCode = jsonToGo(json, rootName);

    goOutput.value = goCode;

    // 确保 DOM 更新后执行高亮
    nextTick(() => highlightCode());
  } catch (e) {
    errorMsg.value = e.message.includes("JSON.parse")
      ? "Invalid JSON format"
      : e.message;
    showErrorOverlay.value = true;
  }
}

// 辅助：格式化类型名称 (snake_case -> PascalCase)
function formatName(n) {
  n = n.replace(/[^a-zA-Z0-9]/g, "_");
  return n
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// 辅助：内联结构体生成 (用于 inline 模式或数组内部)
function parseStructInline(obj) {
  let str = "struct {\n";
  for (const key in obj) {
    const fieldName = formatName(key);
    // 简化版内联逻辑，使用 interface{} 兜底
    str += `\t\t${fieldName} interface{} \`json:"${key}"\`\n`;
  }
  str += "\t}";
  return str;
}

// 核心转换函数
function jsonToGo(json, typename) {
  let output = "";
  let subStructs = [];

  // 辅助：解析具体对象
  function parseStruct(obj, name) {
    let lines = [];
    lines.push(`type ${name} struct {`);

    for (const key in obj) {
      const value = obj[key];
      const fieldName = formatName(key);
      let type = "interface{}";

      if (value === null) {
        type = "interface{}";
      } else if (typeof value === "string") {
        // 尝试检测时间
        if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
          type = "time.Time";
        } else {
          type = "string";
        }
      } else if (typeof value === "number") {
        type = Number.isInteger(value) ? "int" : "float64";
      } else if (typeof value === "boolean") {
        type = "bool";
      } else if (Array.isArray(value)) {
        // 处理数组
        if (value.length === 0) {
          type = "[]interface{}";
        } else {
          const first = value[0];
          if (typeof first === "object" && first !== null) {
            const subName = fieldName;
            if (optInline.value) {
              type = "[]" + parseStructInline(first);
            } else {
              type = "[]" + subName;
              // 避免重复定义
              if (!subStructs.find((s) => s.name === subName)) {
                subStructs.push({ name: subName, obj: first });
              }
            }
          } else {
            // 基本类型数组
            type = "[]" + typeof first;
            if (typeof first === "number")
              type = Number.isInteger(first) ? "[]int" : "[]float64";
          }
        }
      } else if (typeof value === "object") {
        // 嵌套对象
        const subName = fieldName;
        if (optInline.value) {
          type = parseStructInline(value);
        } else {
          type = subName;
          if (!subStructs.find((s) => s.name === subName)) {
            subStructs.push({ name: subName, obj: value });
          }
        }
      }

      // 生成 Tag
      let jsonTag = `json:"${key}`;
      if (optOmitempty.value) jsonTag += `,omitempty`;
      jsonTag += `"`;

      lines.push(`\t${fieldName} ${type} \`${jsonTag}\``);
    }
    lines.push("}");
    return lines.join("\n");
  }

  // 开始解析根对象
  output += parseStruct(json, typename);

  // 如果不是内联模式，处理所有子结构体
  if (!optInline.value) {
    let i = 0;
    while (i < subStructs.length) {
      const item = subStructs[i];
      output += "\n\n" + parseStruct(item.obj, item.name);
      i++;
    }
  }

  return output;
}

// --- Actions ---

function copyOutput() {
  const text = goOutput.value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    // Simple visual feedback
    const btn = document.getElementById("copyBtn");
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="ph-bold ph-check text-green-400"></i> Copied!';
    setTimeout(() => (btn.innerHTML = originalHTML), 2000);
  });
}
</script>

<style scoped>
/* Scoped styles adapted from the HTML file */
.text-primary {
  color: #00add8;
} /* Go Language Brand Color (Cyan) */
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
.bg-red-900\/20 {
  background-color: rgba(153, 27, 27, 0.2);
}
.border-red-500\/50 {
  border-color: rgba(239, 68, 68, 0.5);
}
.text-red-400 {
  color: #f87171;
}
.text-green-400 {
  color: #4ade80;
}
</style>
