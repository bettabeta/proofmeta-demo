/**
 * Minimal ProofMeta crypto — browser-compatible, no Node.js deps.
 * Uses Web Crypto API for hashing + @noble/ed25519 for signing.
 */
import * as ed from "@noble/ed25519";
import canonicalize from "canonicalize";
import { v7 as uuidv7 } from "uuid";

// v3 uses Web Crypto internally — no configuration needed.

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export interface KeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  did: string;
}

export function generateKeyPair(): KeyPair {
  const privateKey = ed.utils.randomSecretKey();
  const publicKey = ed.getPublicKey(privateKey);
  const did = `did:key:z6Mk${bytesToHex(publicKey).slice(0, 32)}`;
  return { privateKey, publicKey, did };
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(hash));
}

export async function hashPayload(
  payload: Record<string, unknown>
): Promise<string> {
  const canonical = canonicalize(payload);
  if (!canonical) throw new Error("Failed to canonicalize payload");
  const hex = await sha256Hex(canonical);
  return `sha256:${hex}`;
}

export async function signHash(
  payloadHash: string,
  privateKey: Uint8Array
): Promise<string> {
  const msg = new TextEncoder().encode(payloadHash);
  const sig = await ed.signAsync(msg, privateKey);
  return `ed25519:${bytesToHex(sig)}`;
}

export interface Envelope {
  proofmeta: string;
  payload: Record<string, unknown>;
  payload_hash: string;
  author: string;
  signature: string;
  timestamp: string;
  in_reply_to?: string;
}

export async function createEnvelope(
  payload: Record<string, unknown>,
  keyPair: KeyPair,
  inReplyTo?: string
): Promise<Envelope> {
  const payloadHash = await hashPayload(payload);
  const signature = await signHash(payloadHash, keyPair.privateKey);
  return {
    proofmeta: "1.0",
    payload,
    payload_hash: payloadHash,
    author: keyPair.did,
    signature,
    timestamp: new Date().toISOString(),
    ...(inReplyTo ? { in_reply_to: inReplyTo } : {}),
  };
}

export function newRequestId(): string {
  return uuidv7();
}

export type Status = "OPEN" | "PENDING" | "GRANTED" | "DENIED" | "REVOKED";
