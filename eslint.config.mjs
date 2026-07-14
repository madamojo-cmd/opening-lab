import next from "eslint-config-next";
import { globalIgnores } from "eslint/config";

export default [
  globalIgnores([
    ".next/**",
    "node_modules/**",
    ".git/**",
    ".agent_runs/**",
    "backups/**",
    "blundr-deploy-v16/**",
    "review_exports/**",
    "*.zip",
    "*.tgz",
  ]),
  ...next,
  {
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/use-memo": "off",
    },
  },
];
