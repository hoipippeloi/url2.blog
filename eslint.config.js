{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:svelte/recommended"
  ],
  "overrides": [
    {
      "files": ["*.svelte"],
      "parser": "svelte-parser"
    }
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "env": {
    "browser": true,
    "node": true
  },
  "ignorePatterns": ["**/build/", "**/.svelte-kit/", "**/node_modules/"],
  "plugins": ["@typescript-eslint", "svelte"]
}
