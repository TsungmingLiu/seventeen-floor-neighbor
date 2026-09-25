# AI production experiments

> Lifecycle: **EXPERIMENTAL — NOT A PRODUCTION SOURCE OF TRUTH**

本目錄保存 capability test、pilot Task Packet、runbook、failure record 與 generated pilot result。

- 內容可以用來解釋設計決策與已知平台限制。
- 內容不可覆蓋 `.ai/WORKFLOW_MANIFEST.yaml`、active harness、canonical schema 或 locked production artifact。
- Fresh production worker 不得讀取本目錄，除非任務本身就是明確的 experiment/research task。
- 成功或失敗的 pilot prompt 都不可直接複製成新的 production task。
