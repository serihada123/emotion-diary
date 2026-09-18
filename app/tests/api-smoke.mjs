import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
for (const route of ["uruuru-chat", "archive-result"]) {
  for (const body of ["{", "null", "[]", "{}", JSON.stringify(route === "uruuru-chat"
    ? { message: "hello", history: [null] }
    : { conversationText: " ".repeat(20) })]) {
    const response = await fetch(`${base}/api/${route}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body,
    });
    assert.equal(response.status, 400, `${route}: ${body}`);
    assert.equal(typeof (await response.json()).error, "string");
  }
}
console.log("PASS: both API routes return JSON 400 for 10 malformed/invalid requests.");
