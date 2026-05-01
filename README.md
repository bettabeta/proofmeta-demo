# ProofMeta Demo

> Layer: Execution
> Depends on: [proofmeta-primitive-core](https://github.com/bettabeta/proofmeta-primitive-core) + [proofmeta-license-contracts](https://github.com/bettabeta/proofmeta-license-contracts)
> Guarantees: Interactive end-to-end protocol demo showing discovery, request, status lifecycle, and envelope verification UX.

This repo is the execution/demo layer for ProofMeta. It demonstrates how an agent-facing product can consume protocol primitives and license semantics in a practical user flow.

## Protocol inputs

This execution repo is intentionally downstream of:
- Primitive protocol rules and envelope semantics:
  - https://github.com/bettabeta/proofmeta-primitive-core
- License templates and chain-agnostic license schema:
  - https://github.com/bettabeta/proofmeta-license-contracts

### Contracts used in demo flows

- `schemas/license-type.schema.json`
- `schemas/run-receipt.schema.json`
- `schemas/rating.schema.json`

## Scope of this repo

- Demo UI for ProofMeta licensing flow
- Simulated provider/consumer interactions
- Envelope generation/inspection in a product-like experience

Not in scope here:
- Defining new core protocol primitives (belongs in primitive-core)
- Defining canonical license semantics/templates (belongs in license-contracts)

## Getting started

Requirements:
- Node.js 20+
- npm

Run:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Architecture rule

Dependency direction must stay one-way:

execution -> primitive-core + license-contracts

Never the reverse.

