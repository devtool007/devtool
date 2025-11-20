<template>
  <div>
    <NuxtLoadingIndicator color="#3b82f6" />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// 全局 SEO 配置 (兜底配置)
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - DevTool.com`
      : "DevTool.com - Developer Utilities";
  },
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { charset: "utf-8" },
  ],
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
});
</script>
