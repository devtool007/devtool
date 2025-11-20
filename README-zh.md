---

### 2. 中文版 (README-zh.md) - 包含 AI 声明

```markdown
# DevTool.com: 开发者必备工具箱

![Nuxt 3](https://img.shields.io/badge/Nuxt.js-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Status](https://img.shields.io/badge/Status-Actively%20Maintained-brightgreen?style=for-the-badge)

## 🌐 语言
[English Version](README.md)

---

## 🌟 我们的使命

我们的使命是建立一个**最快、最可靠、以隐私为中心**的开发者工具套件。旨在取代那些缓慢、广告泛滥或可能损害您数据安全的在线服务。

我们的核心原则是：**零服务器依赖**。所有复杂的计算（哈希、格式化、编解码）都只在您的浏览器**客户端运行**，确保您的数据绝对私密和安全。

---

## 🤖 关于代码效率的说明

本项目体现了现代组件化开发和 **AI 辅助**带来的效率。

**本项目超过 90% 的核心代码由 AI 辅助生成、构建和重构。** 这个坚实的基础保证了代码的高一致性、清晰的组件结构（Vue/Nuxt）和可预测的逻辑，使项目易于上手和维护。

---

## ✨ 核心功能概览 (18+ 工具)

### 💻 代码与数据转换

- **JSON to Go/Java:** 一键将 JSON 结构体转换为 Go Struct 或 Java POJO (支持 Lombok/Jackson)。
- **SQL to Code:** 将 `CREATE TABLE` 语句转换为 Go Struct 或 Java Entity。
- **Timestamp Converter:** Unix Epoch 时间戳与人类可读时间双向转换。
- **XML Viewer:** XML 格式化、压缩及转 JSON。

### 🔐 安全与编解码

- **JWT Debugger:** 本地解码并验证 JWT 签名（Token 绝不离开浏览器）。
- **Hash Generator:** 实时 MD5, SHA-256, SHA-512 计算（文本与文件校验）。
- **Base64 & URL Encoder:** 强大的文本编码/解码，完全支持 UTF-8。
- **Unicode Converter:** 文本与 `\uXXXX` 序列的转换。

### ⚙️ 实用工具与生成器

- **Cron Generator:** 可视化 Cron 表达式构建器 (支持 Linux, Spring, Quartz 格式)。
- **JSON/SQL Formatter:** 标准代码格式化和美化。
- **UUID & Password Generator:** 安全、批量生成唯一 ID 和强密码。

---

## 🚀 本地开发与贡献指南

本项目基于 **Nuxt 3 (Vue 3)** 和 **Tailwind CSS**。

### 1. 快速入门

```bash
# 1. 安装依赖
npm install

# 2. 运行开发服务器 (支持热更新)
npm run dev

# 3. 静态构建（生成最终的 HTML 文件到 .output/public 目录）
npm run generate
```
