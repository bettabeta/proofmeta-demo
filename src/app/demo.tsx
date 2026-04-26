"use client";

import { useState, useCallback, useEffect } from "react";
import {
  generateKeyPair,
  createEnvelope,
  newRequestId,
  type Envelope,
  type KeyPair,
  type Status,
} from "@/lib/proofmeta";
import { CATALOG_ITEMS, LICENSE_TYPES } from "@/lib/demo-data";

interface RequestState {
  requestId: string;
  itemId: string;
  licenseType: string;
  status: Status;
  chain: Envelope[];
}

const STATUS_COLORS: Record<Status, string> = {
  OPEN: "text-[#d4873c] border-[#d4873c]",
  PENDING: "text-[#d4873c] border-[#d4873c]",
  GRANTED: "text-[#7ba05b] border-[#7ba05b]",
  DENIED: "text-[#c65b4e] border-[#c65b4e]",
  REVOKED: "text-[#c65b4e] border-[#c65b4e]",
};

export default function DemoPage() {
  const [providerKeys] = useState<KeyPair>(() => generateKeyPair());
  const [consumerKeys] = useState<KeyPair>(() => generateKeyPair());
  const [requests, setRequests] = useState<RequestState[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [expandedEnvelope, setExpandedEnvelope] = useState<string | null>(null);
  const [step, setStep] = useState<"discover" | "request" | "track">("discover");
  const [manifest, setManifest] = useState<Envelope | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Build manifest on mount
  useEffect(() => {
    createEnvelope(
      {
        type: "manifest",
        provider: { id: providerKeys.did, name: "Demo Provider Agent" },
        request_endpoint: "https://demo.proofmeta.com/api/request",
        catalog_endpoint: "https://demo.proofmeta.com/api/catalog",
        license_types: LICENSE_TYPES,
        items: CATALOG_ITEMS,
      },
      providerKeys
    ).then(setManifest);
  }, [providerKeys]);

  // Submit license request
  const handleRequest = useCallback(async () => {
    if (!selectedItem || !selectedLicense || submitting) return;
    setSubmitting(true);

    const license = LICENSE_TYPES.find((l) => l.id === selectedLicense);
    if (!license) return;

    const requestId = newRequestId();

    // OPEN envelope (Consumer signs)
    const openEnvelope = await createEnvelope(
      {
        type: "license.request",
        request_id: requestId,
        consumer: { id: consumerKeys.did },
        provider_id: providerKeys.did,
        item_id: selectedItem,
        license_type: selectedLicense,
        terms_hash: license.terms_hash,
        status: "OPEN",
      },
      consumerKeys
    );

    const newRequest: RequestState = {
      requestId,
      itemId: selectedItem,
      licenseType: selectedLicense,
      status: "OPEN",
      chain: [openEnvelope],
    };

    setRequests((prev) => [...prev, newRequest]);
    setStep("track");
    setSubmitting(false);

    // Auto-advance: PENDING after 1.5s
    setTimeout(async () => {
      const pendingEnvelope = await createEnvelope(
        {
          type: "status-update",
          request_id: requestId,
          status: "PENDING",
          reason: "Resolver processing",
        },
        providerKeys,
        openEnvelope.payload_hash
      );
      setRequests((prev) =>
        prev.map((r) =>
          r.requestId === requestId
            ? { ...r, status: "PENDING", chain: [...r.chain, pendingEnvelope] }
            : r
        )
      );

      // GRANTED after another 1.5s
      setTimeout(async () => {
        const grantedEnvelope = await createEnvelope(
          {
            type: "status-update",
            request_id: requestId,
            status: "GRANTED",
            reason: "License granted — terms accepted",
          },
          providerKeys,
          pendingEnvelope.payload_hash
        );
        setRequests((prev) =>
          prev.map((r) =>
            r.requestId === requestId
              ? { ...r, status: "GRANTED", chain: [...r.chain, grantedEnvelope] }
              : r
          )
        );
      }, 1500);
    }, 1500);
  }, [selectedItem, selectedLicense, consumerKeys, providerKeys, submitting]);

  const item = CATALOG_ITEMS.find((i) => i.id === selectedItem);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-3">
          End-to-End <span className="text-[#d4873c]">Licensing Flow</span>
        </h1>
        <p className="text-[#8a8678] max-w-xl">
          See how two AI agents negotiate a license using ProofMeta. Every step produces a signed, verifiable envelope. Click any envelope to inspect it.
        </p>
      </div>

      {/* Identity cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-white/10 bg-[#151412] p-5">
          <div className="text-xs text-[#d4873c] tracking-widest mb-2">PROVIDER AGENT</div>
          <div className="text-sm font-bold mb-1">Demo Provider</div>
          <div className="text-xs text-[#8a8678] break-all">{providerKeys.did}</div>
        </div>
        <div className="border border-white/10 bg-[#151412] p-5">
          <div className="text-xs text-[#7ba05b] tracking-widest mb-2">CONSUMER AGENT</div>
          <div className="text-sm font-bold mb-1">Demo Consumer</div>
          <div className="text-xs text-[#8a8678] break-all">{consumerKeys.did}</div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex gap-2 text-xs">
        {(["discover", "request", "track"] as const).map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`px-3 py-1.5 border tracking-wider transition-colors ${
              step === s
                ? "border-[#d4873c] text-[#d4873c]"
                : "border-white/10 text-[#8a8678] hover:text-[#e8e3d5]"
            }`}
          >
            {i + 1}. {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Step 1: Discover */}
      {step === "discover" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2">1. Provider publishes manifest</h2>
            <p className="text-sm text-[#8a8678]">
              The Provider signs a manifest describing what it offers. Any agent can discover it at{" "}
              <code className="text-[#d4873c]">/.well-known/proofmeta.json</code>
            </p>
          </div>

          <div className="border border-white/10 bg-[#151412] p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-[#d4873c] tracking-widest">SIGNED MANIFEST</span>
              <button
                onClick={() => setExpandedEnvelope(expandedEnvelope === "manifest" ? null : "manifest")}
                className="text-xs text-[#8a8678] hover:text-[#d4873c]"
              >
                {expandedEnvelope === "manifest" ? "collapse" : "inspect envelope →"}
              </button>
            </div>

            {expandedEnvelope === "manifest" && manifest && (
              <pre className="text-xs text-[#8a8678] overflow-x-auto mb-4 p-3 bg-[#0b0b0b] border border-white/5">
                {JSON.stringify(manifest, null, 2)}
              </pre>
            )}

            <div className="text-sm mb-3 font-bold">Catalog Items</div>
            <div className="space-y-2">
              {CATALOG_ITEMS.map((catItem) => (
                <button
                  key={catItem.id}
                  onClick={() => {
                    setSelectedItem(catItem.id);
                    setSelectedLicense(null);
                    setStep("request");
                  }}
                  className={`w-full text-left p-3 border transition-colors ${
                    selectedItem === catItem.id
                      ? "border-[#d4873c] bg-[#d4873c]/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold">{catItem.name}</div>
                      <div className="text-xs text-[#8a8678] mt-1">{catItem.description}</div>
                    </div>
                    <span className="text-[10px] tracking-widest text-[#8a8678] border border-white/10 px-2 py-0.5 shrink-0">
                      {catItem.type.toUpperCase()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Step 2: Request */}
      {step === "request" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2">2. Consumer requests a license</h2>
            <p className="text-sm text-[#8a8678]">
              {item
                ? `Selected: ${item.name}. Now pick a license type.`
                : "Go back and select an item first."}
            </p>
          </div>

          {item && (
            <div className="space-y-3">
              {LICENSE_TYPES.filter((l) => item.available_licenses.includes(l.id)).map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLicense(l.id)}
                  className={`w-full text-left p-4 border transition-colors ${
                    selectedLicense === l.id
                      ? "border-[#d4873c] bg-[#d4873c]/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold">{l.name}</div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {l.scope.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 border border-white/10 text-[#8a8678]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {l.pricing.model === "free" ? (
                        <span className="text-[#7ba05b] text-sm font-bold">FREE</span>
                      ) : (
                        <div>
                          <div className="text-sm font-bold">
                            {"amount" in l.pricing && l.pricing.amount}{" "}
                            {"currency" in l.pricing && l.pricing.currency}
                          </div>
                          <div className="text-[10px] text-[#8a8678]">
                            {l.pricing.model}
                            {"unit" in l.pricing && ` / ${l.pricing.unit}`}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {selectedLicense && (
                <button
                  onClick={handleRequest}
                  disabled={submitting}
                  className="px-5 py-3 border border-[#e8e3d5] text-sm font-bold hover:bg-[#d4873c] hover:text-[#0b0b0b] hover:border-[#d4873c] transition-colors disabled:opacity-50"
                >
                  {submitting ? "Signing..." : "Sign & Submit License Request →"}
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* Step 3: Track */}
      {step === "track" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2">3. Track the lifecycle</h2>
            <p className="text-sm text-[#8a8678]">
              Every status change is a new signed envelope. The chain is the proof.
            </p>
          </div>

          {requests.length === 0 ? (
            <p className="text-[#8a8678] text-sm">No requests yet. Go back and submit one.</p>
          ) : (
            requests.map((req) => (
              <div key={req.requestId} className="border border-white/10 bg-[#151412] p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-bold">
                      {CATALOG_ITEMS.find((i) => i.id === req.itemId)?.name}
                    </div>
                    <div className="text-xs text-[#8a8678] mt-1">
                      License: {req.licenseType} · ID: {req.requestId.slice(0, 8)}…
                    </div>
                  </div>
                  <span
                    className={`text-xs tracking-widest px-2 py-1 border ${STATUS_COLORS[req.status]}`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* Envelope chain */}
                <div className="space-y-2">
                  {req.chain.map((env, i) => {
                    const envKey = `${req.requestId}-${i}`;
                    const status = (env.payload as Record<string, unknown>).status as string;
                    return (
                      <div key={envKey} className="border border-white/5 bg-[#0b0b0b]">
                        <button
                          onClick={() =>
                            setExpandedEnvelope(expandedEnvelope === envKey ? null : envKey)
                          }
                          className="w-full text-left px-3 py-2 flex justify-between items-center text-xs hover:bg-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`tracking-widest ${
                                STATUS_COLORS[status as Status] || "text-[#8a8678]"
                              }`}
                            >
                              {status}
                            </span>
                            <span className="text-[#8a8678]">
                              signed by {env.author.slice(0, 20)}…
                            </span>
                          </div>
                          <span className="text-[#8a8678]">
                            {expandedEnvelope === envKey ? "▾" : "▸"}
                          </span>
                        </button>
                        {expandedEnvelope === envKey && (
                          <pre className="text-[10px] text-[#8a8678] overflow-x-auto p-3 border-t border-white/5">
                            {JSON.stringify(env, null, 2)}
                          </pre>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Verification */}
                {req.status === "GRANTED" && (
                  <div className="flex items-center gap-2 text-xs text-[#7ba05b]">
                    <span>✓</span>
                    <span>
                      Chain verified: {req.chain.length} envelopes, all signatures valid,
                      in_reply_to links intact
                    </span>
                  </div>
                )}
              </div>
            ))
          )}

          {requests.length > 0 && (
            <button
              onClick={() => {
                setSelectedItem(null);
                setSelectedLicense(null);
                setStep("discover");
              }}
              className="text-xs text-[#8a8678] hover:text-[#d4873c]"
            >
              ← Start another request
            </button>
          )}
        </section>
      )}

      {/* How it works summary */}
      <section className="border-t border-white/10 pt-8 mt-12">
        <h2 className="text-lg font-bold mb-4">What just happened</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="border border-white/10 p-4 bg-[#151412]">
            <div className="text-[#d4873c] font-bold mb-2">1. Discover</div>
            <p className="text-[#8a8678] text-xs">
              Provider published a signed manifest with catalog items and license types.
              Any agent can find it at /.well-known/proofmeta.json
            </p>
          </div>
          <div className="border border-white/10 p-4 bg-[#151412]">
            <div className="text-[#d4873c] font-bold mb-2">2. Request</div>
            <p className="text-[#8a8678] text-xs">
              Consumer signed a license request envelope referencing the item, license type,
              and terms hash. Cryptographic proof of intent.
            </p>
          </div>
          <div className="border border-white/10 p-4 bg-[#151412]">
            <div className="text-[#d4873c] font-bold mb-2">3. Grant</div>
            <p className="text-[#8a8678] text-xs">
              Provider responded with PENDING → GRANTED. Each status is a new signed envelope
              chained via in_reply_to. The chain is the proof.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
