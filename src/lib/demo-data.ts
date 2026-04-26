/**
 * Demo catalog + license types for the interactive demo.
 */

export const LICENSE_TYPES = [
  {
    id: "free-attribution",
    name: "Free with Attribution",
    scope: ["non-commercial", "derivative-allowed", "attribution-required"],
    terms_url: "https://proofmeta.org/templates/free-attribution",
    terms_hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    pricing: { model: "free" as const },
  },
  {
    id: "commercial-standard",
    name: "Commercial Standard",
    scope: ["commercial", "derivative-allowed", "ai-training-excluded"],
    terms_url: "https://proofmeta.org/templates/commercial-standard",
    terms_hash: "sha256:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    pricing: { model: "one-time" as const, amount: "5.00", currency: "USD" },
  },
  {
    id: "ai-training-dataset",
    name: "AI Training Dataset",
    scope: ["commercial", "ai-training-allowed", "attribution-required"],
    terms_url: "https://proofmeta.org/templates/ai-training-dataset",
    terms_hash: "sha256:b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
    pricing: { model: "usage-based" as const, amount: "0.01", currency: "USD", unit: "record" },
  },
];

export const CATALOG_ITEMS = [
  {
    id: "prompt-chain-kit",
    name: "Prompt Chain Kit",
    description: "A reusable prompt orchestration toolkit for multi-step agent workflows.",
    type: "code",
    available_licenses: ["free-attribution", "commercial-standard"],
  },
  {
    id: "market-research-dataset",
    name: "DACH Market Research Dataset",
    description: "Structured market data for the German-speaking region. 12,000 records.",
    type: "dataset",
    available_licenses: ["commercial-standard", "ai-training-dataset"],
  },
  {
    id: "onboarding-flow",
    name: "Onboarding Flow Agent",
    description: "Drop-in onboarding agent for SaaS products. Handles user activation in 3 steps.",
    type: "code",
    available_licenses: ["free-attribution", "commercial-standard"],
  },
];
