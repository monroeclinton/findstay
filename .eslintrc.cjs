// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

/** @type {import("eslint").Linter.Config} */
const config = {
    overrides: [
        {
            extends: [
                "plugin:@typescript-eslint/recommended-requiring-type-checking",
            ],
            files: ["*.ts", "*.tsx"],
            parserOptions: {
                project: path.join(__dirname, "tsconfig.json"),
            },
        },
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: path.join(__dirname, "tsconfig.json"),
    },
    plugins: ["@typescript-eslint", "simple-import-sort", "@stylistic/js"],
    extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
    rules: {
        "@typescript-eslint/consistent-type-imports": [
            "warn",
            {
                prefer: "type-imports",
                fixStyle: "inline-type-imports",
            },
        ],
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {argsIgnorePattern: "^_"},
        ],
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
        "import/first": "error",
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",
        "object-curly-spacing": ["error", "always"],
    },
};

module.exports = config;
