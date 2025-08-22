#!/usr/bin/env node

/**
 * 🎨 Script para encontrar cores fixas que não se adaptam ao tema
 *
 * Este script busca por padrões de cores hardcoded no projeto
 * e sugere substituições por variáveis CSS adaptáveis.
 */

const fs = require("fs");
const path = require("path");

// Cores problemáticas e suas substituições
const COLOR_REPLACEMENTS = {
  // Azuis
  "text-blue-600": "text-primary",
  "text-blue-500": "text-primary",
  "text-blue-700": "text-primary",
  "bg-blue-50": "bg-primary/5",
  "bg-blue-100": "bg-primary/10",
  "border-blue-200": "border-primary/20",

  // Verdes
  "text-green-600": "text-green-600 dark:text-green-400",
  "text-green-700": "text-green-600 dark:text-green-400",
  "bg-green-50": "bg-green-500/5",
  "bg-green-100": "bg-green-500/10",
  "border-green-200": "border-green-500/20",

  // Roxos
  "text-purple-500": "text-primary",
  "text-purple-600": "text-primary",
  "bg-purple-50": "bg-primary/5",
  "bg-purple-100": "bg-primary/10",

  // Cinzas
  "text-gray-500": "text-muted-foreground",
  "text-gray-600": "text-muted-foreground",
  "text-gray-700": "text-foreground",
  "text-gray-900": "text-foreground",
  "bg-gray-50": "bg-muted/25",
  "bg-gray-100": "bg-muted/50",

  // Backgrounds comuns
  "bg-white": "bg-background",
  "text-black": "text-foreground",
};

// Padrões regex para encontrar cores problemáticas
const COLOR_PATTERNS = [
  /text-blue-\d+/g,
  /bg-blue-\d+/g,
  /text-green-\d+/g,
  /bg-green-\d+/g,
  /text-purple-\d+/g,
  /bg-purple-\d+/g,
  /text-gray-\d+/g,
  /bg-gray-\d+/g,
  /border-blue-\d+/g,
  /border-green-\d+/g,
  /border-purple-\d+/g,
  /border-gray-\d+/g,
];

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith(".") &&
      file !== "node_modules"
    ) {
      scanDirectory(filePath, results);
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      const content = fs.readFileSync(filePath, "utf8");
      const issues = [];

      // Procurar por padrões problemáticos
      COLOR_PATTERNS.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            const suggestion =
              COLOR_REPLACEMENTS[match] || "Verificar manualmente";
            issues.push({ match, suggestion });
          });
        }
      });

      if (issues.length > 0) {
        results.push({
          file: filePath,
          issues,
        });
      }
    }
  }

  return results;
}

// Executar escaneamento
console.log("🔍 Escaneando projeto para cores não adaptáveis...\n");

const srcDir = path.join(__dirname, "src");
const results = scanDirectory(srcDir);

if (results.length === 0) {
  console.log(
    "✅ Nenhuma cor problemática encontrada! Projeto está adaptado para temas.",
  );
} else {
  console.log(
    `❌ Encontradas ${results.length} arquivos com cores não adaptáveis:\n`,
  );

  results.forEach(({ file, issues }) => {
    console.log(`📁 ${file}`);
    issues.forEach(({ match, suggestion }) => {
      console.log(`  ❌ ${match} → ✅ ${suggestion}`);
    });
    console.log("");
  });

  console.log(
    "💡 Use o guia THEME-COLORS-GUIDE.md para as substituições corretas.",
  );
}
