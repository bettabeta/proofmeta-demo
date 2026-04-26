/**
 * In-memory store for the demo. No database needed.
 * State resets on page refresh — that's fine for a demo.
 */
import { type Envelope, type Status } from "./proofmeta";

export interface LicenseRequest {
  requestId: string;
  itemId: string;
  licenseType: string;
  status: Status;
  chain: Envelope[];
}

class DemoStore {
  private requests: Map<string, LicenseRequest> = new Map();

  addRequest(req: LicenseRequest) {
    this.requests.set(req.requestId, req);
  }

  getRequest(requestId: string): LicenseRequest | undefined {
    return this.requests.get(requestId);
  }

  getAllRequests(): LicenseRequest[] {
    return Array.from(this.requests.values());
  }

  updateStatus(requestId: string, status: Status, envelope: Envelope) {
    const req = this.requests.get(requestId);
    if (!req) return;
    req.status = status;
    req.chain.push(envelope);
  }
}

export const store = new DemoStore();
