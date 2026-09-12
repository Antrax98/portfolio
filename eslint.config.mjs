// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },

  // ---------------------------------------------------------------------------
  // Architecture rules.
  //
  // These are the conventions from CLAUDE.md, turned into rules the linter can
  // enforce. The point is not bureaucracy: a rule you can read in an error
  // message, at the moment you break it, teaches better than a paragraph in a
  // document nobody re-reads. Every message explains the WHY, not just the WHAT.
  // ---------------------------------------------------------------------------

  // `application` must never import from `infrastructure`.
  // The dependency is inverted: the port is an abstract class in `domain`, the
  // adapter implements it in `infrastructure`, and the module wires the two.
  {
    files: ['src/**/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure', '**/infrastructure/**'],
              message:
                '`application` must not import from `infrastructure`. Declare a port (an abstract class) in `domain` and let the module bind it to its adapter.',
            },
          ],
        },
      ],
    },
  },

  // `domain` stays framework-free. This is why AppException extends Error and
  // not HttpException: the domain should not know that an HTTP API exists.
  {
    files: ['src/**/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nestjs/*', '@nestjs/**', 'typeorm', 'typeorm/**'],
              message:
                '`domain` stays framework-free — no Nest, no TypeORM. That independence is what lets the domain be tested and reasoned about on its own.',
            },
            {
              group: [
                '**/infrastructure',
                '**/infrastructure/**',
                '**/application',
                '**/application/**',
              ],
              message:
                '`domain` is the innermost layer: it does not import from `application` or `infrastructure`. The arrows point inwards.',
            },
          ],
        },
      ],
    },
  },

  // A controller is the door to exactly ONE application service or use case.
  // Enforced by counting constructor parameters — two injected dependencies
  // means the controller is coordinating, and coordination is not its job.
  {
    files: ['src/**/*.controller.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'MethodDefinition[kind="constructor"][value.params.length>1]',
          message:
            'A controller is the door to exactly ONE application service or use case. If an endpoint needs to coordinate several, that coordination has business meaning: it is a use case, and it belongs in `application`.',
        },
      ],
    },
  },

  // Tests live in `application`. `infrastructure` is never tested.
  // The legacy suites listed below predate this rule and are frozen: they are
  // kept as teaching material, but no new test is added to them.
  {
    files: ['src/**/*.spec.ts'],
    ignores: [
      'src/**/application/**/*.spec.ts',
      'src/common/**/*.spec.ts',
      'src/modules/user/domain/**/*.spec.ts',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program',
          message:
            'Tests belong in `application` (use cases and application services). `infrastructure` is never tested. To protect a rule, move it into `application` or `domain` and test it through the use case.',
        },
      ],
    },
  },
);
