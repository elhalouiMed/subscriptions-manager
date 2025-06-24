import js from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';

export default [
    js.configs.recommended,
    {
        files: ["src/**/*.{ts,tsx}"],
        ignores: [
            "**/*.test.ts"
        ],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                project: "./tsconfig.json"
            }
        },
        plugins: {
            "@typescript-eslint": typescriptPlugin,
            jest: jestPlugin
        },
        rules: {
            // TypeScript rules
            "@typescript-eslint/no-explicit-any": 'off',
            'no-undef': 'off',
            'no-unused-vars': 'off',
            // Jest rules
            'jest/no-disabled-tests': 'warn',
            'jest/no-focused-tests': 'error',
            'jest/no-identical-title': 'error',
            'jest/prefer-to-have-length': 'warn',
            'jest/valid-expect': 'error'
        }
    }
];