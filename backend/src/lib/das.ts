import { env } from "../env.js";

export type DasAsset = {
  id: string;
  content?: {
    json_uri?: string;
  };
  ownership?: {
    owner?: string;
  };
  authority?: Array<{ address?: string }>;
};

export async function getAsset(assetId: string): Promise<DasAsset | null> {
  try {
    const res = await fetch(env.RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAsset",
        params: { id: assetId },
      }),
    });
    const data = (await res.json()) as {
      result?: DasAsset;
      error?: { message?: string };
    };
    if (data.error) {
      console.warn("[das] getAsset error", assetId, data.error.message);
      return null;
    }
    return data.result ?? null;
  } catch (err) {
    console.warn("[das] getAsset failed", assetId, err);
    return null;
  }
}
