/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness compiles the JSX module in memory. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
dom.window.matchMedia = () => ({ matches: false });
Object.assign(globalThis, { window: dom.window, document: dom.window.document,
  localStorage: dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT: true });
const React = require("react");
const { act } = React;
const { createRoot } = require("react-dom/client");
const filename = path.resolve(__dirname, "../components/EmotionArchiveApp.jsx");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const component = new Module(filename, module);
component.filename = filename;
component.paths = Module._nodeModulePaths(path.dirname(filename));
component._compile(compiled, filename);
const App = component.exports.default;
const key = "emotion-archive-entries";
const entry = { id: "new-1735786800000", date: "오늘", objectType: "book", objectName: "테스트 책",
  oneLine: "테스트", diaryText: "테스트 일기", primaryEmotion: "기쁨", secondaryEmotion: "편안함", characterLine: "좋아!" };
let root;
const findButton = (name) => [...document.querySelectorAll("button")].find((el) => (el.getAttribute("aria-label") || el.textContent).trim() === name);
async function click(el) { assert.ok(el, "element exists"); await act(async () => el.click()); }
async function mount(raw) {
  localStorage.clear();
  if (raw !== undefined) localStorage.setItem(key, raw);
  document.body.innerHTML = '<div id="root"></div>';
  root = createRoot(document.getElementById("root"));
  await act(async () => root.render(React.createElement(App)));
  await click([...document.querySelectorAll("p")].find((el) => el.textContent === "눌러서 시작하기") || document.querySelector("h1"));
  await click(findButton("건너뛰기"));
}
test.afterEach(async () => { if (root) await act(async () => root.unmount()); });

test("empty saved archive stays empty in the mounted app", async () => {
  await mount("[]");
  await click(findButton("아카이브"));
  assert.match(document.body.textContent, /해당하는 기록이 없어/);
  assert.equal(localStorage.getItem(key), "[]");
});

test("corrupt archive is preserved and warns the user", async () => {
  await mount("{broken");
  assert.match(document.querySelector('[role="alert"]').textContent, /기존 기록 보호/);
  assert.equal(localStorage.getItem(key), "{broken");
});

test("deleting the final record persists an empty archive across remount", async () => {
  await mount(JSON.stringify([entry]));
  await click(findButton("아카이브"));
  await click(document.querySelector('button[title="테스트 책"]'));
  await click(findButton("삭제"));
  await click(findButton("삭제하기"));
  const saved = localStorage.getItem(key);
  assert.equal(saved, "[]");
  await act(async () => root.unmount());
  await mount(saved);
  await click(findButton("아카이브"));
  assert.match(document.body.textContent, /해당하는 기록이 없어/);
});

test("failed update warns and preserves the previous stored record", async () => {
  const raw = JSON.stringify([entry]);
  await mount(raw);
  await click(findButton("아카이브"));
  await click(document.querySelector('button[title="테스트 책"]'));
  const original = dom.window.Storage.prototype.setItem;
  dom.window.Storage.prototype.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); };
  try {
    await click(findButton("삭제"));
    await click(findButton("삭제하기"));
    assert.match(document.querySelector('[role="alert"]').textContent, /저장하지 못했어/);
    assert.equal(localStorage.getItem(key), raw);
  } finally { dom.window.Storage.prototype.setItem = original; }
});

test("unavailable storage displays a warning", async () => {
  const original = dom.window.Storage.prototype.setItem;
  dom.window.Storage.prototype.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); };
  try {
    await mount();
    assert.match(document.querySelector('[role="alert"]').textContent, /저장하지 못했어/);
  } finally { dom.window.Storage.prototype.setItem = original; }
});

test("legacy timestamp date and persistent privacy notice are visible", async () => {
  await mount(JSON.stringify([entry]));
  await click(findButton("아카이브"));
  assert.match(document.body.textContent, /서비스 서버에는 보관하지 않아요/);
  await click(document.querySelector('button[title="테스트 책"]'));
  assert.doesNotMatch(document.body.textContent, /오늘/);
  assert.match(document.body.textContent, /2025년 1월 2일/);
});

test("IME composition does not send; pending request disables input and send", async () => {
  await mount("[]");
  let input = document.querySelector('input[type="text"]');
  await act(async () => {
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, "value").set.call(input, "오늘 좋았어");
    input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  });
  const original = globalThis.fetch;
  let calls = 0;
  let resolve;
  globalThis.fetch = () => { calls++; return new Promise((done) => { resolve = done; }); };
  try {
    await act(async () => {
      input.dispatchEvent(new dom.window.CompositionEvent("compositionstart", { bubbles: true }));
      input.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    assert.equal(calls, 0);
    await act(async () => input.dispatchEvent(new dom.window.CompositionEvent("compositionend", { bubbles: true })));
    await click(findButton("전송"));
    assert.equal(calls, 1);
    assert.equal(input.disabled, true);
    assert.equal(findButton("전송").disabled, true);
    await click(findButton("전송"));
    assert.equal(calls, 1);
    await act(async () => resolve({ ok: true, json: async () => ({ text: "무슨 일이 있었어?" }) }));
    assert.equal(input.disabled, false);
  } finally { globalThis.fetch = original; }
});
