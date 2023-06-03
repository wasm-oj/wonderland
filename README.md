# WOW

WASM OJ Wonderland.

The core instance of WASM OJ, including Web UI and submission management. Fully serverless and scalable.

## Target

One of the most important goals of WASM OJ is to provide an easily **deployable** and **scalable** online judge system. For runner and compiler components, we use [WARK](https://github.com/wasm-oj/wark) and [Compilet](https://github.com/wasm-oj/compilet). For the problem management, we use [Problem Box](https://github.com/wasm-oj/problem-box).

WASM OJ Wonderland is responsible to interact with these components and provide a web UI for users to view problems and submit solutions.

The following platforms are supported by WASM OJ Wonderland:

- [x] Cloudflare Pages
- [ ] Vercel
- [ ] Deta
- [x] Local

The components of WASM OJ Wonderland are also configurable. There are three components: **KV**, **DB**, and **Cache**.

For DB, we support:

- [x] Cloudflare D1 (only available on Cloudflare Pages)
- [x] SQLite (only available on non-edge environments)
- [ ] PostgreSQL
- [ ] MySQL
- [ ] ... (PRs are welcome!)

For KV, we support:

- [x] Cloudflare KV (only available on Cloudflare Pages)
- [ ] Upstash Redis
- [ ] Deta Base
- [ ] Redis
- [x] JSON file (only available on non-edge environments)
- [x] In-memory
- [ ] ... (PRs are welcome!)

For Cache, we support:

- [x] Cloudflare Cache (only available on Cloudflare Pages)
- [x] In-memory
- [ ] ... (PRs are welcome!)

You can use the following environment variables to configure:

```bash
DB_COMPONENT="..."
KV_COMPONENT="..."
CACHE_COMPONENT="..."
```

> See [src/lib/server/platform.ts](src/lib/server/platform.ts) for more details.
