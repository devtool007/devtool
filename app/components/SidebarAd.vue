<template>
  <div
    class="bg-[#1e293b] border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-indigo-500/50 transition-colors"
  >
    <div class="absolute top-3 right-3">
      <span
        class="text-[10px] font-bold text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded bg-[#0f172a]"
        >AD</span
      >
    </div>

    <a
      href="https://vercel.com"
      target="_blank"
      rel="nofollow"
      class="flex flex-col items-center text-center relative z-10"
    >
      <div
        class="w-12 h-12 mb-3 rounded-full bg-[#0f172a] flex items-center justify-center text-indigo-400 ring-1 ring-slate-700 group-hover:scale-110 group-hover:ring-indigo-500 transition-all duration-300"
      >
        <i class="ph-fill ph-rocket-launch text-2xl"></i>
      </div>

      <h3 class="text-white font-bold text-sm mb-1">Deploy Faster</h3>

      <p class="text-xs text-slate-400 mb-4 leading-relaxed px-2">
        Global static hosting for Nuxt.
      </p>

      <div
        class="w-full py-2 bg-[#0f172a] border border-indigo-500/30 hover:bg-indigo-600 hover:border-indigo-600 text-indigo-300 hover:text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2"
      >
        <span>Start for Free</span>
        <i class="ph-bold ph-arrow-right"></i>
      </div>
    </a>

    <div
      class="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
    ></div>
  </div>
</template>
