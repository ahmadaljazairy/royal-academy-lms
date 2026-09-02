import { nodeConfig } from "@template/eslint-config/node";

export default [
    ...nodeConfig,
    {
        languageOptions: {
            parserOptions: {
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
            },
        },
        rules: {
            // Prevent stripping constructor DI classes
            "@typescript-eslint/consistent-type-imports": "off",
        },
    },
];