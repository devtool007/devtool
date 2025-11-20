<template>
  <ToolLayout
    title="JSON to Java"
    description="Generate Java POJO classes from JSON."
    :showAdSlot="false"
  >
    <template #icon><i class="ph-fill ph-coffee text-primary"></i></template>

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
            placeholder='Paste your JSON here... { "id": 1, "userName": "JavaDev" }'
          ></textarea>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex flex-col gap-4">
        <div
          class="bg-card border border-slate-800 rounded-lg p-3 flex flex-wrap gap-4 items-center text-sm"
        >
          <div class="flex items-center gap-2">
            <span class="text-slate-500 text-xs font-bold">Pkg:</span>
            <input
              type="text"
              id="pkgName"
              v-model="pkgName"
              @input="process"
              class="bg-dark border border-slate-700 text-white px-2 py-1 rounded w-28 text-xs focus:border-primary outline-none"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-slate-500 text-xs font-bold">Class:</span>
            <input
              type="text"
              id="className"
              v-model="className"
              @input="process"
              class="bg-dark border border-slate-700 text-white px-2 py-1 rounded w-20 text-xs focus:border-primary outline-none"
            />
          </div>

          <div class="h-4 w-px bg-slate-700"></div>

          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="optLombok"
              v-model="optLombok"
              @change="process"
              class="rounded bg-dark border-slate-700 text-primary focus:ring-0"
            />
            <span class="text-slate-300 text-xs font-bold">Lombok (@Data)</span>
          </label>

          <div class="flex items-center gap-2 ml-auto">
            <select
              id="annotationLib"
              v-model="annotationLib"
              @change="process"
              class="bg-dark border border-slate-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-primary"
            >
              <option value="none">No Annotations</option>
              <option value="jackson">Jackson</option>
              <option value="gson">Gson</option>
              <option value="fastjson">FastJson</option>
            </select>
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
              <i class="ph-bold ph-copy"></i> Copy Java
            </button>
          </div>

          <pre
            class="flex-1 w-full h-full p-4 m-0 overflow-auto"
          ><code id="javaOutput" class="language-java text-sm font-mono">{{ javaOutput }}</code></pre>

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
            <i class="ph-fill ph-file-code text-primary"></i> Backend Tools
          </h4>
          <p class="text-xs text-slate-400 mb-3">
            Develop in Golang instead of Java?
          </p>
          <NuxtLink
            to="/tools/json-to-go"
            class="block text-center w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition"
          >
            JSON to Go Converter
          </NuxtLink>
        </div>

        <SidebarAd />
      </div>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, nextTick } from "vue";

// 假设 PrismJS 和相关组件已通过 CDN 或构建工具加载
// import Prism from 'prismjs';
// import 'prismjs/components/prism-java';
// import SidebarAd from "~/components/SidebarAd.vue";
// import ToolLayout from "~/components/ToolLayout.vue";

// --- Reactive State ---
const jsonInput = ref("");
const javaOutput = ref("");
const pkgName = ref("com.example.entity");
const className = ref("Root");
const optLombok = ref(true);
const annotationLib = ref("jackson");
const showErrorOverlay = ref(false);
const errorMsg = ref("");

// --- Utilities ---

/**
 * Helper to check if PrismJS is available before calling its methods.
 */
function highlightCode() {
  if (window.Prism) {
    // Need to wait for the DOM update (javaOutput.value) before highlighting
    const element = document.getElementById("javaOutput");
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
    code: 0,
    msg: "success",
    data: {
      user_info: {
        user_id: 888,
        nick_name: "JavaMaster",
        roles: ["admin", "editor"],
      },
      permissions: [
        { id: 1, code: "sys:read" },
        { id: 2, code: "sys:write" },
      ],
    },
  };
  jsonInput.value = JSON.stringify(sample, null, 2);
  process();
}

// ---------------------------------------------------------
// 核心算法：JSON -> Java POJO (移植自 HTML)
// ---------------------------------------------------------

// 转换入口
function process() {
  const raw = jsonInput.value.trim();
  javaOutput.value = "";
  showErrorOverlay.value = false;

  if (!raw) return;

  try {
    const json = JSON.parse(raw);
    const rootClass = className.value || "Root";
    const pkg = pkgName.value || "com.example";

    const javaCode = generateJava(json, rootClass, pkg);

    javaOutput.value = javaCode;

    // 确保 DOM 更新后执行高亮
    nextTick(() => highlightCode());
  } catch (e) {
    errorMsg.value = e.message.includes("JSON.parse")
      ? "Invalid JSON format"
      : e.message;
    showErrorOverlay.value = true;
  }
}

// Helper: Naming
function toCamelCase(str) {
  return str.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
}
function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

// Core Generation Logic
function generateJava(json, rootClass, pkgName) {
  let output = `package ${pkgName};\n\n`;

  // Imports
  let imports = new Set();
  if (optLombok.value) imports.add("import lombok.Data;");

  // Check deep for Lists to import List
  if (JSON.stringify(json).includes("[")) imports.add("import java.util.List;");

  const lib = annotationLib.value;
  if (lib === "jackson")
    imports.add("import com.fasterxml.jackson.annotation.JsonProperty;");
  else if (lib === "gson")
    imports.add("import com.google.gson.annotations.SerializedName;");
  else if (lib === "fastjson")
    imports.add("import com.alibaba.fastjson.annotation.JSONField;");

  output += Array.from(imports).sort().join("\n") + "\n\n";

  // Recursive Class Builder
  function getFieldsAndSubClasses(obj) {
    let fields = [];
    let subClasses = [];

    for (const key in obj) {
      const val = obj[key];
      const fieldName = toCamelCase(key);
      let type = "Object";

      if (val === null) type = "Object";
      else if (typeof val === "string") type = "String";
      else if (typeof val === "number")
        type = Number.isInteger(val) ? "Integer" : "Double";
      else if (typeof val === "boolean") type = "Boolean";
      else if (Array.isArray(val)) {
        if (val.length > 0 && typeof val[0] === "object") {
          const subName = toPascalCase(key);
          type = `List<${subName}>`;
          subClasses.push({ name: subName, obj: val[0] });
        } else {
          let inner = "Object";
          if (val.length > 0) {
            if (typeof val[0] === "string") inner = "String";
            else if (typeof val[0] === "number")
              inner = Number.isInteger(val[0]) ? "Integer" : "Double";
          }
          type = `List<${inner}>`;
        }
      } else if (typeof val === "object") {
        const subName = toPascalCase(key);
        type = subName;
        subClasses.push({ name: subName, obj: val });
      }

      fields.push({ key, fieldName, type });
    }
    return { fields, subClasses };
  }

  function buildClassString(name, obj, isRoot) {
    let str = "";

    if (optLombok.value) str += "@Data\n";

    str += `public ${isRoot ? "class" : "static class"} ${name} {\n`;

    const { fields, subClasses } = getFieldsAndSubClasses(obj);

    // Fields
    fields.forEach((f) => {
      if (lib === "jackson") str += `    @JsonProperty("${f.key}")\n`;
      else if (lib === "gson") str += `    @SerializedName("${f.key}")\n`;
      else if (lib === "fastjson") str += `    @JSONField(name="${f.key}")\n`;
      str += `    private ${f.type} ${f.fieldName};\n\n`;
    });

    // Inner Classes
    if (subClasses.length > 0) {
      str += "\n";
      subClasses.forEach((sub) => {
        // Indent the inner class (4 spaces per level)
        const subStr = buildClassString(sub.name, sub.obj, false);
        str +=
          subStr
            .split("\n")
            .map((line) => (line ? "    " + line : line))
            .join("\n") + "\n";
      });
    }

    if (!optLombok.value) {
      str +=
        "    // Getters and Setters omitted (Enable Lombok to view clean code)\n";
    }

    str += "}";
    return str;
  }

  return output + buildClassString(rootClass, json, true);
}

// --- Actions ---

function copyOutput() {
  const outputElement = document.getElementById("javaOutput");
  const text = outputElement ? outputElement.textContent : javaOutput.value;

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
  color: #f58220;
} /* Java Brand Orange */
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
