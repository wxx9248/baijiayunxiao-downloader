import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

export default [
    // add more generic rulesets here, such as:
    // js.configs.recommended,
    ...pluginVue.configs["flat/recommended"],
    ...eslintPluginPrettier,
    {
        rules: {
            // override/add rules settings here, such as:
            // 'vue/no-unused-vars': 'error'
        },
        languageOptions: {
            sourceType: "module",
            globals: {
                ...globals.browser
            }
        }
    }
];
