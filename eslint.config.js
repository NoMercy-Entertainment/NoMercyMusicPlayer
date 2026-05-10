import antfu from '@antfu/eslint-config';

export default antfu({
	ignores: [
		'dist/**',
		'README.md',
		// Linting `eslint.config.js` itself triggers a full config-cache rebuild
		// on save (~70s on Windows with antfu's plugin set). Run `npx eslint
		// eslint.config.js` manually when editing this file.
		'eslint.config.js',
	],
	typescript: {
		overrides: {
			'antfu/top-level-function': 'off',
			'no-console': 'off',
			'no-extend-native': 'off',
			'ts/method-signature-style': 'off',
			'unused-imports/no-unused-vars': 'error',
		},
	},
	test: {
		overrides: {
			'test/prefer-lowercase-title': 'off',
		},
	},
	stylistic: {
		indent: 'tab',
		quotes: 'single',
		semi: true,
		overrides: {
			'style/newline-per-chained-call': [
				'error',
				{ ignoreChainWithDepth: 2 },
			],
			'style/object-curly-newline': [
				'error',
				{
					ObjectExpression: {
						multiline: true,
						minProperties: 2,
						consistent: true,
					},
					ObjectPattern: {
						multiline: true,
						minProperties: 4,
						consistent: true,
					},
					ImportDeclaration: {
						multiline: true,
						minProperties: 4,
						consistent: true,
					},
					ExportDeclaration: {
						multiline: true,
						minProperties: 4,
						consistent: true,
					},
				},
			],
			'style/object-property-newline': [
				'error',
				{ allowAllPropertiesOnSameLine: true },
			],
			'style/function-paren-newline': ['error', 'multiline-arguments'],
			'style/array-element-newline': ['error', 'consistent'],
			'style/array-bracket-newline': ['error', 'consistent'],
		},
	},
}, {
	files: ['src/__tests__/**/*.ts'],
	rules: {
		'style/newline-per-chained-call': 'off',
		'style/object-curly-newline': 'off',
	},
});
