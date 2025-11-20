<template>
  <div class="min-h-screen flex flex-col">
    <header class="pt-24 pb-12 text-center px-4">
      <h1
        class="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
      >
        Developer Tools
        <span
          class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
          >Made Simple.</span
        >
      </h1>
      <p class="text-slate-400 max-w-2xl mx-auto text-lg mb-12">
        Free, open-source, and privacy-focused utilities. Processing happens in
        your browser.
      </p>

      <div class="max-w-md mx-auto relative group">
        <div
          class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
        >
          <i class="ph ph-magnifying-glass text-slate-500 text-xl"></i>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          class="block w-full pl-12 pr-4 py-4 bg-[#1e293b] border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-lg"
          placeholder="Search tools (e.g. 'json', 'cron', 'base64')..."
        />
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 pb-20 w-full flex-grow">
      <div v-for="(category, index) in filteredCategories" :key="index">
        <div v-if="category.tools.length > 0" class="mb-16 animate-fade-in">
          <h2
            class="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-2"
          >
            <i :class="category.icon + ' ' + category.color"></i>
            {{ category.title }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="tool in category.tools"
              :key="tool.path"
              :to="tool.path"
              class="block bg-[#1e293b] border border-slate-800 rounded-xl p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500 group"
            >
              <div class="flex justify-between mb-4">
                <div :class="`p-2 rounded-lg ${tool.bg} ${tool.color}`">
                  <i :class="tool.icon + ' text-2xl'"></i>
                </div>
                <span
                  v-if="tool.badge"
                  class="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded h-fit"
                >
                  {{ tool.badge }}
                </span>
              </div>
              <h3
                class="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition"
              >
                {{ tool.name }}
              </h3>
              <p class="text-sm text-slate-500">
                {{ tool.desc }}
              </p>
            </NuxtLink>
          </div>
        </div>
      </div>

      <div
        v-if="filteredCategories.every((c) => c.tools.length === 0)"
        class="text-center text-slate-500 py-20"
      >
        <i class="ph ph-smiley-sad text-4xl mb-2"></i>
        <p>No tools found matching "{{ searchQuery }}"</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// SEO Meta
useHead({
  title: "DevTool.com - The Essential Developer Toolbox",
  meta: [
    {
      name: "description",
      content: "A collection of free, fast, and secure developer tools.",
    },
  ],
});

// 搜索关键词
const searchQuery = ref("");

// 所有工具数据 (维护这里即可，不需要写 HTML)
const allData = [
  {
    title: "Generators",
    icon: "ph-fill ph-magic-wand",
    color: "text-purple-400",
    tools: [
      {
        name: "Cron Generator",
        path: "/tools/cron-generator",
        desc: "Visual Cron expression builder.",
        icon: "ph-fill ph-clock",
        color: "text-green-400",
        bg: "bg-green-500/10",
        badge: "HOT",
      },
      {
        name: "UUID Generator",
        path: "/tools/uuid-generator",
        desc: "Bulk generate v4 UUIDs.",
        icon: "ph-fill ph-fingerprint",
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
      },
      {
        name: "Password Generator",
        path: "/tools/password-generator",
        desc: "Secure random passwords.",
        icon: "ph-fill ph-lock-key",
        color: "text-teal-400",
        bg: "bg-teal-500/10",
      },
    ],
  },
  {
    title: "Formatters",
    icon: "ph-fill ph-brackets-curly",
    color: "text-blue-400",
    tools: [
      {
        name: "JSON Formatter",
        path: "/tools/json-formatter",
        desc: "Validate & Beautify JSON.",
        icon: "ph-fill ph-file-code",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        badge: "POPULAR",
      },
      {
        name: "SQL Formatter",
        path: "/tools/sql-formatter",
        desc: "Beautify SQL queries.",
        icon: "ph-fill ph-database",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
      },
      {
        name: "XML Viewer",
        path: "/tools/xml-viewer",
        desc: "XML to JSON converter.",
        icon: "ph-fill ph-code",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
      },
    ],
  },
  {
    title: "Converters",
    icon: "ph-fill ph-arrows-left-right",
    color: "text-cyan-400",
    tools: [
      {
        name: "JSON to Go",
        path: "/tools/json-to-go",
        desc: "JSON to Golang Structs.",
        icon: "ph-bold ph-file-go",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
      },
      {
        name: "JSON to Java",
        path: "/tools/json-to-java",
        desc: "JSON to Java POJO.",
        icon: "ph-bold ph-coffee",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
      },
      {
        name: "SQL to Code",
        path: "/tools/sql-to-code",
        desc: "SQL to Go/Java Entity.",
        icon: "ph-fill ph-database",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
      },
      {
        name: "Timestamp Converter",
        path: "/tools/timestamp-converter",
        desc: "Epoch to Date conversion.",
        icon: "ph-fill ph-clock-counter-clockwise",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
      },
    ],
  },
  {
    title: "Encoders & Security",
    icon: "ph-fill ph-shield-check",
    color: "text-emerald-400",
    tools: [
      {
        name: "JWT Debugger",
        path: "/tools/jwt-debugger",
        desc: "Decode & verify JWT.",
        icon: "ph-fill ph-identification-badge",
        color: "text-pink-400",
        bg: "bg-pink-500/10",
      },
      {
        name: "Base64 Converter",
        path: "/tools/base64-converter",
        desc: "Text Encode/Decode.",
        icon: "ph-bold ph-text-aa",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
      },
      {
        name: "Image Base64",
        path: "/tools/image-base64",
        desc: "Image to String.",
        icon: "ph-fill ph-image",
        color: "text-pink-400",
        bg: "bg-pink-500/10",
      },
      {
        name: "URL Encoder",
        path: "/tools/url-encoder",
        desc: "Escape URL params.",
        icon: "ph-fill ph-link",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
      },
      {
        name: "Hash Generator",
        path: "/tools/hash-generator",
        desc: "MD5, SHA1, SHA256.",
        icon: "ph-fill ph-hash",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
      },
      {
        name: "File Checksum",
        path: "/tools/file-hash",
        desc: "Large file hashing.",
        icon: "ph-fill ph-file-lock",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
      },
      {
        name: "Unicode Converter",
        path: "/tools/unicode-converter",
        desc: "Text to \\uXXXX.",
        icon: "ph-fill ph-translate",
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
      },
    ],
  },
];

// 核心搜索逻辑：计算属性自动更新视图
const filteredCategories = computed(() => {
  if (!searchQuery.value) return allData;

  const query = searchQuery.value.toLowerCase();

  // 返回一个新的过滤后的数组结构
  return allData.map((category) => {
    return {
      ...category,
      // 过滤每个分类下的工具
      tools: category.tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.desc.toLowerCase().includes(query)
      ),
    };
  });
});
</script>

<style>
/* 简单的淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
