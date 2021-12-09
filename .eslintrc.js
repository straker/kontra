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
    'no-duplicate-imports': 2,
    'object-shorthand': 2,
    'prefer-arrow-callback': 2,
    'multiline-comment-style': ['error', 'separate-lines'],
    'max-len': [
      'error',
      {
	code: 70,
	// ignore block comments since they are parsed using markdown
	ignorePattern: '^\\s*\\*'
      }
    ],
    'no-restricted-syntax': [
      'error',
      {
	selector: 'BinaryExpression[operator="==="]',
	message: 'Prefer \'==\' over \'===\' to save bytes'
      },
      {
	selector: 'BinaryExpression[operator="!=="]',
	message: 'Prefer \'!=\' over \'!==\' to save bytes'
      },
      {
	selector: 'MemberExpression[object.name=Math][property.name=floor]',
	message: 'Prefer \'| 0\' over \'Math.floor\' to save bytes'
      },
      {
	selector: 'VariableDeclaration[kind=const]',
	message: 'Prefer \'let\' over \'const\' to save bytes'
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
