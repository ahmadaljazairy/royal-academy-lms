import globals from "globals";
import baseConfig from "./base.js";
import tseslint from "typescript-eslint";

export const nodeConfig = tseslint.config(
    ...baseConfig,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.es2022
            }
        }
    }
);

export default nodeConfig;