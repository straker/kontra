module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module'
  },
  rules: {
    // byte saving rules
    'no-duplicate-imports': 2,
    'object-shorthand': 2,
    'prefer-arrow-callback': 2,
    'no-else-return': 2,
    'one-var': [
      'error',
      {
        uninitialized: 'always'
      }
    ],
    'prefer-exponentiation-operator': 2,
    'no-restricted-syntax': [
      'error',
      {
        selector: 'BinaryExpression[operator="==="]',
        message: "Prefer '==' over '===' to save bytes"
      },
      {
        selector: 'BinaryExpression[operator="!=="]',
        message: "Prefer '!=' over '!==' to save bytes"
      },
      {
        selector:
          'MemberExpression[object.name=Math][property.name=floor]',
        message: "Prefer '| 0' over 'Math.floor' to save bytes"
      },
      {
        selector: 'VariableDeclaration[kind=const]',
        message: "Prefer 'let' over 'const' to save bytes"
      },
      {
        selector: 'MemberExpression[property.name=forEach]',
        message: "Prefer '.map()' over '.forEach()' to save bytes"
      }
    ],

    // code style rules
    'spaced-comment': [
      'error',
      'always',
      {
        exceptions: ['@__PURE__']
      }
    ],
    'array-bracket-spacing': 2,
    'object-curly-spacing': ['error', 'always'],
    'no-trailing-spaces': 2,
    'multiline-comment-style': ['error', 'separate-lines'],
    'max-len': [
      'error',
      {
        comments: 70,
        // ignore JSDoc block comments, @ifdef comments, template
        // literals with placeholders (ignoreStrings option doesn't
        // seem to work with it), and mocha describe and it functions
        // with template literals with placeholders
        ignorePattern:
          '^\\s*(\\*|\\/\\/ @ifdef|\\/\\* @ifdef|`|describe\\(`)|it\\(`',
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true
      }
    ]
  },
  overrides: [
    {
      files: ['test/**/*.js'],
      env: {
        browser: true,
        es2021: true,
        mocha: true
      },
      globals: {
        expect: true,
        sinon: true
      },
      plugins: ['mocha-no-only'],
      rules: {
        'no-restricted-syntax': 0,
        'mocha-no-only/mocha-no-only': 2
      }
    }
  ]
};
