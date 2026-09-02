import globals from "globals";
import baseConfig from "./base.js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export const reactConfig = tseslint.config(
    ...baseConfig,
    {
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true }
            ]
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2022
            }
        }
    }
);

export default reactConfig;