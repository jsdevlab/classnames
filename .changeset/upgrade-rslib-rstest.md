---
"@jsdevlab/classnames": patch
---

Upgrade the build and test toolchain to Rslib 1.0 and Rstest 0.12. Builds now
target the `web` platform with ES2017 syntax, so the same ESM/CJS output works in
both Node.js and browsers, and the test suite now includes real-browser coverage.
