<template>
  <ToolLayout
    title="SQL to Code"
    description="Convert SQL CREATE TABLE to Go Structs or Java Entities."
    :showAdSlot="false"
  >
    <template #icon
      ><i class="ph-fill ph-database text-slate-400"></i
    ></template>

    <div
      class="max-w-[1400px] mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6"
    >
      <div class="w-full lg:w-5/12 flex flex-col gap-4">
        <div
          class="flex-1 bg-editor border border-slate-700 rounded-xl p-4 flex flex-col relative editor-height"
        >
          <textarea
            id="sqlInput"
            v-model="sqlInput"
            @input="process"
            class="flex-1 w-full bg-transparent font-mono text-sm text-slate-300 focus:outline-none resize-none placeholder-slate-600 leading-relaxed"
            placeholder="CREATE TABLE users ( ... )"
          ></textarea>
        </div>
      </div>

      <div class="w-full lg:w-7/12 flex flex-col gap-4">
        <div
          class="bg-card border border-slate-800 rounded-lg p-3 flex flex-wrap gap-4 items-center text-sm justify-between"
        >
          <div class="flex bg-dark rounded-lg p-1 border border-slate-700">
            <button
              @click="setLang('go')"
              :class="[
                'px-4 py-1 rounded text-xs font-bold transition',
                currentLang === 'go'
                  ? 'bg-go text-white'
                  : 'text-slate-400 hover:text-white',
              ]"
            >
              Go Struct
            </button>
            <button
              @click="setLang('java')"
              :class="[
                'px-4 py-1 rounded text-xs font-bold transition',
                currentLang === 'java'
                  ? 'bg-java text-white'
                  : 'text-slate-400 hover:text-white',
              ]"
            >
              Java Entity
            </button>
          </div>

          <div
            v-show="currentLang === 'go'"
            id="opts-go"
            class="flex items-center gap-3"
          >
            <label class="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                id="goJson"
                v-model="goOptions.json"
                @change="process"
                class="rounded bg-dark border-slate-700 text-go focus:ring-0"
              />
              <span class="text-xs text-slate-300">JSON Tags</span>
            </label>
            <label class="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                id="goGorm"
                v-model="goOptions.gorm"
                @change="process"
                class="rounded bg-dark border-slate-700 text-go focus:ring-0"
              />
              <span class="text-xs text-slate-300">GORM Tags</span>
            </label>
          </div>

          <div
            v-show="currentLang === 'java'"
            id="opts-java"
            class="flex items-center gap-3"
          >
            <label class="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                id="javaLombok"
                v-model="javaOptions.lombok"
                @change="process"
                class="rounded bg-dark border-slate-700 text-java focus:ring-0"
              />
              <span class="text-xs text-slate-300">Lombok</span>
            </label>
            <label class="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                id="javaJpa"
                v-model="javaOptions.jpa"
                @change="process"
                class="rounded bg-dark border-slate-700 text-java focus:ring-0"
              />
              <span class="text-xs text-slate-300">JPA Annotations</span>
            </label>
          </div>
        </div>

        <div
          class="flex-1 bg-editor border border-slate-700 rounded-xl overflow-hidden flex flex-col relative editor-height"
        >
          <div class="absolute top-4 right-4 z-10">
            <button
              @click="copyOutput"
              id="copyBtn"
              class="bg-slate-800/90 hover:bg-white hover:text-dark text-white border border-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition backdrop-blur"
            >
              <i class="ph-bold ph-copy"></i> Copy Code
            </button>
          </div>

          <pre
            class="flex-1 w-full h-full p-4 m-0 overflow-auto"
          ><code :class="`language-${currentLang}`" id="codeOutput" class="text-sm font-mono">{{ codeOutput }}</code></pre>
        </div>
      </div>
    </div>

    <template #sidebar>
      <div class="w-full lg:w-80 flex flex-col gap-6">
        <div class="bg-card border border-slate-800 rounded-xl p-4">
          <h4 class="font-bold text-white mb-4 text-sm flex items-center gap-2">
            <i class="ph-fill ph-brackets-curly text-purple-500"></i> JSON to
            Code
          </h4>
          <p class="text-xs text-slate-400 mb-3">
            Convert JSON payloads directly to Go Struct or Java POJO.
          </p>
          <NuxtLink
            to="/tools/json-to-go"
            class="block text-center w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition mt-2"
          >
            Go Struct Converter
          </NuxtLink>
        </div>

        <div class="bg-card border border-slate-800 rounded-xl p-4">
          <h4 class="font-bold text-white mb-4 text-sm flex items-center gap-2">
            <i class="ph-fill ph-database text-blue-500"></i> SQL Utilities
          </h4>
          <p class="text-xs text-slate-400 mb-3">
            Beautify and format complex SQL queries.
          </p>
          <NuxtLink
            to="/tools/sql-formatter"
            class="block text-center w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition mt-2"
          >
            SQL Formatter
          </NuxtLink>
        </div>

        <SidebarAd />
      </div>
    </template>
  </ToolLayout>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from "vue";
// 导入 Prism 模块
import Prism from "prismjs";

// --- Constants & Type Mapping ---

// SQL Types mapped to [Go Type, Java Type]
const typeMap = {
  tinyint: ["int8", "Integer"],
  smallint: ["int16", "Integer"],
  mediumint: ["int32", "Integer"],
  int: ["int", "Integer"],
  integer: ["int", "Integer"],
  bigint: ["int64", "Long"],
  float: ["float32", "Float"],
  double: ["float64", "Double"],
  decimal: ["float64", "BigDecimal"],
  char: ["string", "String"],
  varchar: ["string", "String"],
  text: ["string", "String"],
  mediumtext: ["string", "String"],
  longtext: ["string", "String"],
  blob: ["[]byte", "byte[]"],
  date: ["time.Time", "LocalDate"],
  datetime: ["time.Time", "LocalDateTime"],
  timestamp: ["time.Time", "LocalDateTime"],
  time: ["string", "LocalTime"],
  boolean: ["bool", "Boolean"],
  json: ["string", "String"],
};

// --- Reactive State ---
const sqlInput = ref("");
const codeOutput = ref("");
const currentLang = ref("go"); // 'go' or 'java'

const goOptions = reactive({
  json: true,
  gorm: true,
});
const javaOptions = reactive({
  lombok: true,
  jpa: true,
});

// --- Helper Functions ---

function toPascalCase(str) {
  return str.replace(/(^|[-_])(\w)/g, (c) =>
    c.toUpperCase().replace(/[-_]/, "")
  );
}
function toCamelCase(str) {
  return str.replace(/([-_][a-z])/gi, ($1) =>
    $1.toUpperCase().replace("-", "").replace("_", "")
  );
}

// ---------------------------------------------------------
// 1. SQL Parser (Regex based simplified parser)
// ---------------------------------------------------------

function parseSQL(sql) {
  sql = sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

  const tableNameMatch = sql.match(
    /create\s+table\s+[`"]?([a-zA-Z0-9_]+)[`"]?/i
  );
  const tableName = tableNameMatch ? tableNameMatch[1] : "MyTable";

  const firstParen = sql.indexOf("(");
  const lastParen = sql.lastIndexOf(")");
  if (firstParen === -1 || lastParen === -1) return { tableName, fields: [] };

  const body = sql.substring(firstParen + 1, lastParen);

  const lines = body.split(/,\s*\n|,\n/);
  const fields = [];

  for (let line of lines) {
    line = line.trim();
    if (!line || /^(PRIMARY|KEY|CONSTRAINT|UNIQUE|FOREIGN|INDEX)/i.test(line))
      continue;

    // Parse Column: `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'xx'
    // Regex: Name, Type
    const parts = line.match(/[`"]?([a-zA-Z0-9_]+)[`"]?\s+([a-zA-Z]+)/);
    if (parts) {
      const name = parts[1];
      const sqlType = parts[2].toLowerCase();

      const commentMatch = line.match(/COMMENT\s+['"]([^'"]+)['"]/i);
      const comment = commentMatch ? commentMatch[1] : "";

      fields.push({ name, sqlType, comment });
    }
  }

  return { tableName, fields };
}

// ---------------------------------------------------------
// 2. Generators
// ---------------------------------------------------------

function generateGo(schema) {
  let structName = toPascalCase(schema.tableName);
  let code = `type ${structName} struct {\n`;

  schema.fields.forEach((f) => {
    const fieldName = toPascalCase(f.name);
    let goType = typeMap[f.sqlType] ? typeMap[f.sqlType][0] : "string";

    let tags = [];
    if (goOptions.gorm) tags.push(`gorm:"column:${f.name}"`);
    if (goOptions.json) tags.push(`json:"${f.name}"`);

    let tagStr = tags.length > 0 ? ` \`${tags.join(" ")}\`` : "";
    let commentStr = f.comment ? ` // ${f.comment}` : "";

    code += `\t${fieldName} ${goType}${tagStr}${commentStr}\n`;
  });

  code += `}`;
  return code;
}

function generateJava(schema) {
  let className = toPascalCase(schema.tableName);
  let code = "";

  // Imports
  if (
    schema.fields.some((f) =>
      ["date", "datetime", "timestamp"].includes(f.sqlType)
    )
  ) {
    code += "import java.time.*;\n";
  }
  if (schema.fields.some((f) => f.sqlType === "decimal")) {
    code += "import java.math.BigDecimal;\n";
  }
  if (javaOptions.jpa) code += "import javax.persistence.*;\n";
  if (javaOptions.lombok) code += "import lombok.Data;\n";

  code += "\n";

  if (javaOptions.lombok) code += "@Data\n";
  if (javaOptions.jpa) {
    code += "@Entity\n";
    code += `@Table(name = "${schema.tableName}")\n`;
  }

  code += `public class ${className} {\n\n`;

  schema.fields.forEach((f) => {
    const fieldName = toCamelCase(f.name);
    let javaType = typeMap[f.sqlType] ? typeMap[f.sqlType][1] : "String";

    if (f.comment) code += `    /** ${f.comment} */\n`;

    if (javaOptions.jpa) {
      if (f.name === "id" || f.name.includes("_id")) {
        code +=
          "    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n";
      }
      code += `    @Column(name = "${f.name}")\n`;
    }

    code += `    private ${javaType} ${fieldName};\n\n`;
  });

  code += "}";
  return code;
}

// ---------------------------------------------------------
// 3. Main Process Function
// ---------------------------------------------------------

function process() {
  const sql = sqlInput.value.trim();
  if (!sql) {
    codeOutput.value = "";
    return;
  }

  const schema = parseSQL(sql);
  let output = "";

  if (currentLang.value === "go") {
    output = generateGo(schema);
  } else {
    output = generateJava(schema);
  }

  codeOutput.value = output;

  // 关键修复：确保 Vue 完成 DOM 更新后调用高亮
  nextTick(() => highlightCode());
}

function highlightCode() {
  // 确保使用导入的 Prism 模块
  if (Prism) {
    const element = document.getElementById("codeOutput");

    if (element && element.textContent.trim()) {
      // Prism requires the language class to be present
      Prism.highlightElement(element);
    }
  }
}

// --- UI Switcher & Actions ---

function setLang(lang) {
  currentLang.value = lang;
  process();
}

function loadSample() {
  const sample = `CREATE TABLE users (
  id bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  username varchar(50) NOT NULL COMMENT 'User Login Name',
  email varchar(100) DEFAULT NULL,
  password_hash varchar(255) NOT NULL,
  is_active tinyint(1) DEFAULT '1',
  balance decimal(10,2) DEFAULT '0.00',
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  sqlInput.value = sample;
  process();
}

function copyOutput() {
  const text = codeOutput.value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyBtn");
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="ph-bold ph-check text-green-400"></i> Copied!';
    setTimeout(() => (btn.innerHTML = originalHTML), 2000);
  });
}

// --- Initialization ---
onMounted(() => {
  loadSample();
});
</script>

<style scoped>
/* Scoped styles adapted from the HTML file */
.text-primary {
  color: #6366f1;
} /* Indigo-500 */
.bg-dark {
  background-color: #0f172a;
}
.bg-card {
  background-color: #1e293b;
}
.bg-editor {
  background-color: #111827;
}
.bg-go {
  background-color: #00add8;
}
.bg-java {
  background-color: #f58220;
}

.editor-height {
  height: calc(100vh - 280px);
  min-height: 550px;
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
</style>
