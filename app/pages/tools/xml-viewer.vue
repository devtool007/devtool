<template>
  <ToolLayout
    title="XML Viewer & Formatter"
    description="Beautify, minify XML or convert it to JSON."
    :showAdSlot="false"
  >
    <template #icon><i class="ph-fill ph-code text-orange-500"></i></template>

    <div
      class="max-w-[1400px] mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6"
    >
      <main class="flex-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 editor-height">
          <div class="flex flex-col h-full">
            <div class="flex justify-between items-center mb-2 px-1">
              <label
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Input XML</label
              >
              <button
                @click="loadSample"
                class="text-xs text-primary hover:underline cursor-pointer"
              >
                Load Sample
              </button>
            </div>
            <textarea
              id="xmlInput"
              v-model="xmlInput"
              class="flex-1 w-full bg-editor border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Paste your XML here..."
            ></textarea>
          </div>

          <div class="flex flex-col h-full">
            <div class="flex justify-between items-center mb-2 px-1">
              <label
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Result</label
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
              class="relative flex-1 bg-editor border border-slate-700 rounded-lg overflow-hidden"
            >
              <div
                v-if="statusMsg.show"
                id="statusMsg"
                :class="[
                  'absolute top-0 left-0 right-0 text-xs p-2 border-b z-10',
                  statusMsg.isError
                    ? 'bg-red-900/90 text-red-200 border-red-700'
                    : 'bg-green-900/90 text-green-200 border-green-700',
                ]"
              >
                {{ statusMsg.text }}
              </div>

              <pre
                class="w-full h-full p-4 overflow-auto m-0"
              ><code :class="`language-${outputLang}`" id="xmlOutput" class="font-mono text-sm">{{ xmlOutput }}</code></pre>
            </div>
          </div>
        </div>

        <article class="mt-12 prose prose-invert max-w-none text-slate-400">
          <h2 class="text-white text-lg font-semibold">About XML Tool</h2>
          <p>
            XML (Extensible Markup Language) is widely used for data storage and
            transport, but raw XML is hard to read. Our tool helps you:
          </p>
          <ul>
            <li>
              <strong>Format:</strong> Indent XML tags hierarchically for
              readability.
            </li>
            <li>
              <strong>Convert to JSON:</strong> Quickly transform XML data into
              JSON objects for JavaScript development.
            </li>
            <li>
              <strong>Validate:</strong> Check if your XML string is
              well-formed.
            </li>
          </ul>
        </article>
      </main>
    </div>
    <template #sidebar>
      <aside class="w-full lg:w-80 flex flex-col gap-6">
        <div
          class="bg-gradient-to-br from-orange-900/40 to-red-900/40 border border-orange-500/20 rounded-xl p-6 text-center"
        >
          <div
            class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30"
          >
            <i class="ph-fill ph-file-json text-white text-2xl"></i>
          </div>
          <h3 class="text-white font-bold mb-2">Need JSON Tools?</h3>
          <p class="text-sm text-slate-400 mb-4">
            Switch to our JSON Formatter for advanced JSON validation.
          </p>
          <NuxtLink
            to="/tools/json-formatter"
            class="block w-full py-2 bg-white text-dark font-bold rounded hover:bg-slate-200 transition"
            >Go to JSON Tool</NuxtLink
          >
        </div>

        <div class="bg-card border border-slate-800 rounded-xl p-4">
          <h4 class="font-bold text-white mb-4 text-sm">Popular Tools</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink
                to="/tools/sql-formatter"
                class="text-slate-400 hover:text-primary flex items-center gap-2"
                ><i class="ph-fill ph-database"></i> SQL Formatter</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/tools/uuid-generator"
                class="text-slate-400 hover:text-primary flex items-center gap-2"
                ><i class="ph-fill ph-fingerprint"></i> UUID Generator</NuxtLink
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
// 导入 Prism 模块
import Prism from "prismjs";
// 假设 SidebarAd, NuxtLink, ToolLayout 是可用的

// --- Reactive State ---
const xmlInput = ref("");
const xmlOutput = ref("");
const outputLang = ref("markup"); // 'markup' (for XML) or 'json'
const statusMsg = reactive({
  show: false,
  text: "",
  isError: false,
});

// --- Core Logic: XML Formatting (Minimal implementation from HTML) ---

function formatXMLString(xml) {
  let formatted = "";
  let reg = /(>)(<)(\/*)/g;
  xml = xml.replace(reg, "$1\r\n$2$3");
  let pad = 0;
  xml.split("\r\n").forEach(function (node) {
    let indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) {
        pad -= 1;
      }
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }

    let padding = "";
    for (let i = 0; i < pad; i++) {
      padding += "  ";
    }
    formatted += padding + node + "\r\n";
    pad += indent;
  });
  return formatted.trim();
}

function formatXML() {
  const raw = xmlInput.value.trim();
  if (!raw) return;

  if (!raw.startsWith("<")) {
    showStatus("Invalid XML: Must start with <", true);
    return;
  }

  try {
    const formatted = formatXMLString(raw);
    updateOutput(formatted, "markup");
    hideStatus();
  } catch (e) {
    showStatus("Error parsing XML", true);
  }
}

function minifyXML() {
  const raw = xmlInput.value.trim();
  if (!raw) return;
  const minified = raw.replace(/>\s+</g, "><");
  updateOutput(minified, "markup");
  hideStatus();
}

// --- Core Logic: XML to JSON ---

function xmlToJsonLogic(xml) {
  let obj = {};
  if (xml.nodeType === 1) {
    // element
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    // text
    obj = xml.nodeValue;
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;

      // Check if nodeName already exists (for array handling)
      if (typeof obj[nodeName] === "undefined") {
        const val = xmlToJsonLogic(item);
        // Ignore pure whitespace text nodes
        if (
          nodeName === "#text" &&
          typeof val === "string" &&
          val.trim() === ""
        )
          continue;

        if (nodeName === "#text") {
          // Set value directly for simple nodes
          obj = val;
        } else {
          // Set value as object property
          obj[nodeName] = val;
        }
      } else {
        // If the property exists, convert it to an array if it's not already one
        if (typeof obj[nodeName].push === "undefined") {
          const old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJsonLogic(item));
      }
    }
  }
  return obj;
}

function xmlToJson() {
  const raw = xmlInput.value.trim();
  if (!raw) return;

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(raw, "text/xml");

    // Check for parsing errors
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      throw new Error("Invalid XML");
    }

    const json = xmlToJsonLogic(xmlDoc);
    const jsonStr = JSON.stringify(json, null, 2);

    updateOutput(jsonStr, "json");
    showStatus("Converted to JSON successfully!", false);
  } catch (e) {
    showStatus("Conversion Failed: Invalid XML", true);
  }
}

// --- UI / Action Helpers ---

function updateOutput(text, lang) {
  xmlOutput.value = text;
  outputLang.value = lang;

  // Crucial: Wait for Vue to update the DOM before highlighting
  nextTick(() => highlightCode());
}

function highlightCode() {
  if (Prism) {
    const element = document.getElementById("xmlOutput");
    if (element) {
      Prism.highlightElement(element);
    }
  }
}

function showStatus(msg, isError) {
  statusMsg.text = msg;
  statusMsg.isError = isError;
  statusMsg.show = true;
}

function hideStatus() {
  statusMsg.show = false;
}

function clearAll() {
  xmlInput.value = "";
  xmlOutput.value = "";
  hideStatus();
  // Focus logic omitted (use ref in a real app)
}

function loadSample() {
  const sample = `<note id="501">\n<to>Tove</to>\n<from>Jani</from>\n<heading>Reminder</heading>\n<body>Don't forget me this weekend!</body>\n</note>`;
  xmlInput.value = sample;
  formatXML();
}

function copyOutput() {
  const text = xmlOutput.value;
  if (!text) return;
  navigator.clipboard.writeText(text);

  // Simple feedback (using temporary class/content)
  const copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="ph-bold ph-check"></i> Copied';
    setTimeout(() => (copyBtn.innerHTML = originalHTML), 2000);
  }
}

// --- Initialization ---
onMounted(() => {
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
  height: calc(100vh - 240px);
  min-height: 500px;
}

/* Status Colors */
.bg-red-900\/90 {
  background-color: rgba(153, 27, 27, 0.9);
}
.border-red-700 {
  border-color: #b91c1c;
}
.text-red-200 {
  color: #fecaca;
}

.bg-green-900\/90 {
  background-color: rgba(6, 78, 59, 0.9);
}
.border-green-700 {
  border-color: #047857;
}
.text-green-200 {
  color: #d1fae5;
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
