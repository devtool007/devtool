<template>
  <div
    class="max-w-[1920px] mx-auto w-full px-6 lg:px-14 py-8 flex flex-col lg:flex-row gap-6 flex-grow"
  >
    <main class="flex-1 min-w-0">
      <header class="mb-6 border-b border-slate-800 pb-6">
        <div class="flex items-center gap-3 mb-2">
          <div
            class="p-2 bg-[#1e293b] border border-slate-700 rounded-lg text-white"
          >
            <slot name="icon" />
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {{ title }}
          </h1>
        </div>
        <p class="text-slate-400 text-base leading-relaxed ml-1">
          {{ description }}
        </p>
      </header>

      <div class="animate-fade-in">
        <slot />
      </div>
    </main>

    <aside class="w-full lg:w-72 lg:flex-shrink-0 flex flex-col gap-6">
      <div class="sticky top-24 flex flex-col gap-6">
        <slot name="sidebar" />
      </div>
    </aside>
  </div>
</template>

<script setup>
defineProps(["title", "description"]);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
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
</style>
