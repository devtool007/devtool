<template>
  <ToolLayout
    title="Unicode Converter"
    description="Convert text to Unicode escape sequences (\uXXXX) and vice versa."
    :showAdSlot="false"
  >
    <template #icon
      ><i class="ph-fill ph-translate text-indigo-400"></i
    ></template>

    <div class="flex flex-col h-[calc(100vh-300px)] min-h-[600px]">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div class="flex gap-2">
          <button
            @click="
              mode = 'encode';
              process();
            "
            :class="[
              'px-6 py-2 rounded-lg font-bold text-sm transition',
              mode === 'encode'
                ? 'bg-indigo-600 text-white'
                : 'bg-[#1e293b] text-slate-300 border border-slate-700 hover:border-indigo-500',
            ]"
          >
            To Unicode
          </button>
          <button
            @click="
              mode = 'decode';
              process();
            "
            :class="[
              'px-6 py-2 rounded-lg font-bold text-sm transition',
              mode === 'decode'
                ? 'bg-indigo-600 text-white'
                : 'bg-[#1e293b] text-slate-300 border border-slate-700 hover:border-indigo-500',
            ]"
          >
            To Text
          </button>
        </div>
        <button
          @click="clear"
          class="text-slate-400 hover:text-red-400 transition px-3"
          title="Clear All"
        >
          <i class="ph-bold ph-trash text-xl"></i>
        </button>
      </div>

      <div
        class="bg-[#1e293b] border border-slate-800 rounded-lg p-4 flex flex-wrap gap-6 items-center text-sm mb-6"
      >
        <label
          class="flex items-center gap-2 cursor-pointer select-none hover:text-white transition-colors"
        >
          <input
            type="checkbox"
            v-model="keepAscii"
            @change="process"
            class="rounded bg-[#0f172a] border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
          />
          <span class="text-slate-300 font-medium">Keep ASCII (A-Z, 0-9)</span>
        </label>

        <div class="flex items-center gap-2 ml-auto">
          <span class="text-slate-500 font-bold uppercase text-xs tracking-wide"
            >Format</span
          >
          <select
            v-model="format"
            @change="process"
            class="bg-[#0f172a] border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="js">\uXXXX (JS/Java)</option>
            <option value="htmlHex">&amp;#xXXXX; (HTML Hex)</option>
            <option value="css">\XXXX (CSS)</option>
            <option value="uplus">U+XXXX</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div class="flex flex-col h-full">
          <div class="flex justify-between mb-2 px-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Input Text</label
            >
            <button
              @click="paste"
              class="text-xs text-indigo-400 hover:text-white transition"
            >
              Paste
            </button>
          </div>
          <textarea
            v-model="input"
            @input="process"
            class="flex-1 w-full bg-[#111827] border border-slate-700 rounded-xl p-4 text-slate-300 focus:border-indigo-500 outline-none resize-none placeholder-slate-600 leading-relaxed transition-colors"
            placeholder="Type text here (e.g. Hello 世界)..."
          ></textarea>
        </div>

        <div class="flex flex-col h-full">
          <div class="flex justify-between mb-2 px-1">
            <label class="text-xs font-bold text-slate-500 uppercase"
              >Result</label
            >
            <button
              @click="copy"
              class="text-xs text-indigo-400 hover:text-white flex items-center gap-1 transition"
            >
              <i class="ph-bold ph-copy"></i> Copy
            </button>
          </div>
          <div class="relative flex-1 group">
            <textarea
              v-model="output"
              readonly
              class="w-full h-full bg-[#111827] border border-slate-700 rounded-xl p-4 text-indigo-300 outline-none resize-none placeholder-slate-700 font-mono leading-relaxed group-hover:border-slate-600 transition-colors"
              placeholder="Result..."
            ></textarea>
          </div>
        </div>
      </div>

      <div class="mt-6 prose prose-invert max-w-none text-slate-400 text-xs">
        <p>
          <strong>Tip:</strong> Use "Keep ASCII" to maintain readability for
          English characters. Useful for Java <code>.properties</code> files or
          CSS content values.
        </p>
      </div>
    </div>

    <template #sidebar>
      <div class="flex flex-col gap-6">
        <div class="bg-[#1e293b] border border-slate-800 rounded-xl p-5">
          <h4 class="font-bold text-white mb-4 text-sm flex items-center gap-2">
            <i class="ph-fill ph-link text-cyan-400"></i> Web Encoding
          </h4>
          <div class="space-y-3">
            <NuxtLink
              to="/tools/url-encoder"
              class="block text-center w-full py-2.5 bg-[#0f172a] border border-slate-700 hover:border-cyan-500 text-white text-xs font-bold rounded-lg transition"
            >
              URL Encoder
            </NuxtLink>
            <NuxtLink
              to="/tools/base64-converter"
              class="block text-center w-full py-2.5 bg-[#0f172a] border border-slate-700 hover:border-yellow-500 text-white text-xs font-bold rounded-lg transition"
            >
              Base64 Converter
            </NuxtLink>
          </div>
        </div>

        <SidebarAd />
      </div>
    </template>
  </ToolLayout>
</template>

<script setup>
import ToolLayout from "~/components/ToolLayout.vue";
import SidebarAd from "~/components/SidebarAd.vue";
import { ref } from "vue";

const input = ref("");
const output = ref("");
const mode = ref("encode");
const keepAscii = ref(true);
const format = ref("js");

const process = () => {
  if (!input.value) {
    output.value = "";
    return;
  }

  if (mode.value === "encode") output.value = encodeLogic(input.value);
  else output.value = decodeLogic(input.value);
};

const encodeLogic = (str) => {
  let res = "";
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = str.charCodeAt(i);
    if (keepAscii.value && code >= 32 && code <= 126) {
      res += char;
      continue;
    }

    let hex = code.toString(16).toLowerCase().padStart(4, "0");
    if (format.value === "js") res += "\\u" + hex;
    else if (format.value === "htmlHex") res += `&#x${hex};`;
    else if (format.value === "css") res += `\\${hex} `;
    else if (format.value === "uplus") res += `U+${hex.toUpperCase()} `;
  }
  return res;
};

const decodeLogic = (str) => {
  try {
    return JSON.parse(`"${str}"`);
  } catch (e) {
    return str
      .replace(/\\u([\d\w]{4})/gi, (_, g) =>
        String.fromCharCode(parseInt(g, 16))
      )
      .replace(/&#x([0-9a-fA-F]+);/g, (_, g) =>
        String.fromCharCode(parseInt(g, 16))
      )
      .replace(/U\+([0-9a-fA-F]{4})/g, (_, g) =>
        String.fromCharCode(parseInt(g, 16))
      );
  }
};

const clear = () => {
  input.value = "";
  output.value = "";
};
const paste = async () => {
  try {
    input.value = await navigator.clipboard.readText();
    process();
  } catch (e) {}
};
const copy = () => {
  if (output.value) navigator.clipboard.writeText(output.value);
};
</script>
