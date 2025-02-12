---
'@jahands/notion-client': patch
---

fix: Make node-fetch external and don't access from 'this'

Fixes issues with node-fetch not working because of invalid 'this'
