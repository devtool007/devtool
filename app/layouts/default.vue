<template>
  <div class="bg-[#0f172a] text-slate-300 font-sans min-h-screen flex flex-col">
    <nav
      class="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur sticky top-0 z-50"
    >
      <div
        class="max-w-[1920px] mx-auto px-6 lg:px-14 h-16 flex items-center justify-between"
      >
        <NuxtLink
          to="/"
          class="flex items-center gap-2 hover:opacity-80 transition"
        >
          <i class="ph-fill ph-terminal-window text-3xl text-blue-500"></i>
          <span class="font-bold text-xl text-white tracking-tight"
            >DevTool.com</span
          >
        </NuxtLink>
        <div class="hidden md:flex gap-6 text-sm font-medium text-slate-400">
          <NuxtLink to="/" class="hover:text-white transition"
            >All Tools</NuxtLink
          >
        </div>
      </div>
    </nav>

    <slot />

    <footer
      class="border-t border-slate-800 py-10 mt-auto text-center text-sm text-slate-600"
    >
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="text-slate-500 mb-4">
          DevTool.com - The Essential Developer Toolbox
        </p>
        <div class="flex justify-center gap-6 text-sm text-slate-400 mb-8">
          <a href="#" class="hover:text-primary">Privacy Policy</a>
          <a href="#" class="hover:text-primary">Terms of Service</a>
        </div>
        <p class="text-slate-600 text-sm">
          © {{ new Date().getFullYear() }} DevTool.com. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// 配置 Cloudflare Web Analytics
// 使用您的 Token: de107b759d3e4ede8423adbf61d7eb8c
useHead({
  script: [
    {
      src: "https://static.cloudflareinsights.com/beacon.min.js",
      "data-cf-beacon": '{"token": "de107b759d3e4ede8423adbf61d7eb8c"}',
      defer: true,
    },
  ],
});
</script>
