# Security Notes

## Known Vulnerabilities

### lodash-es in mermaid (Moderate)
- **Status:** Accepted
- **Reason:** Low actual risk, fix would break functionality
- **Mitigation:** Input sanitization in MermaidDiagram.tsx
- **Review Date:** 2026-01
- **Action:** Monitor for mermaid v12 release


### Fix SNS Sandbox Issue
-  Move SNS Out of Sandbox (Recommended for Production)