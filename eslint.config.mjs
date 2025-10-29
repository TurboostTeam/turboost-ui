import { FlatCompat } from "@eslint/eslintrc";
import prettierConfig from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import storybook from "eslint-plugin-storybook";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ["components/ui/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  ...storybook.configs["flat/recommended"],
  prettierConfig,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // 导入排序
      "import/order": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
];

export default eslintConfig;
