module.exports = {
  root: true,
  env: {
    node: true,
    'vue/setup-compiler-macros': true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  globals: { defineProps: 'readonly', defineEmits: 'readonly' },
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'prettier/prettier': 'off',
    quotes: 'off',
    semi: 'off',
  },
};
