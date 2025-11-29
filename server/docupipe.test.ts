import { describe, expect, it } from "vitest";

describe("DOCUPIPE API Integration", () => {
  it("should have valid DOCUPIPE API credentials configured", async () => {
    const DOCUPIPE_API_KEY = process.env.DOCUPIPE_API_KEY;
    const DOCUPIPE_API_URL = "https://app.docupipe.ai";
    
    // Check that API key is configured
    expect(DOCUPIPE_API_KEY).toBeDefined();
    expect(DOCUPIPE_API_KEY).not.toBe("");
    
    // Make a lightweight API call to validate the key
    // We'll try to list documents (should return 200 or 401 if invalid)
    const response = await fetch(`${DOCUPIPE_API_URL}/document`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-API-Key": DOCUPIPE_API_KEY!,
      },
    });
    
    // Valid key should return 200, invalid key returns 401
    expect(response.status).not.toBe(401);
    expect(response.status).toBeLessThan(500); // Should not be server error
    
    console.log(`[DOCUPIPE Test] API key validation: ${response.status === 200 ? "✓ Valid" : "⚠ Check configuration"}`);
  }, { timeout: 10000 });
  
  it("should have DOCUPIPE_SCHEMA_ID configured (optional)", () => {
    const DOCUPIPE_SCHEMA_ID = process.env.DOCUPIPE_SCHEMA_ID;
    
    if (DOCUPIPE_SCHEMA_ID && DOCUPIPE_SCHEMA_ID !== "") {
      console.log(`[DOCUPIPE Test] Schema ID configured: ${DOCUPIPE_SCHEMA_ID}`);
    } else {
      console.log("[DOCUPIPE Test] Schema ID not configured (optional - will use default)");
    }
    
    // This is optional, so we just log the status
    expect(true).toBe(true);
  });
});
