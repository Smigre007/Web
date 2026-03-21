import { describe, it, expect } from "vitest";

// Replicate the escapeHtml + formatMessage logic here for unit testing
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMessage(content: string): string {
  const codeBlocks: string[] = [];
  const withPlaceholders = content.replace(/```(?:\w+)?\n([\s\S]*?)```/g, (_match, code) => {
    codeBlocks.push(code);
    return `\x00CODE${codeBlocks.length - 1}\x00`;
  });

  const escaped = escapeHtml(withPlaceholders);

  const withCode = escaped.replace(/\x00CODE(\d+)\x00/g, (_match, idx) => {
    const code = escapeHtml(codeBlocks[parseInt(idx)] ?? "");
    return `<pre class="code-block">${code}</pre>`;
  });

  return withCode
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
}

describe("formatMessage XSS prevention", () => {
  it("escapes script tags in plain text", () => {
    const result = formatMessage("<script>alert('xss')</script>");
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("escapes HTML attributes injection", () => {
    const result = formatMessage('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain("<img");
    expect(result).toContain("&lt;img");
  });

  it("allows bold markdown formatting", () => {
    const result = formatMessage("This is **bold** text");
    expect(result).toContain("<strong");
    expect(result).toContain("bold");
  });

  it("renders code blocks safely", () => {
    const result = formatMessage("```js\nconsole.log('<script>');\n```");
    expect(result).toContain("<pre");
    expect(result).toContain("&lt;script&gt;");
    expect(result).not.toContain("<script>");
  });

  it("does not escape code block container HTML", () => {
    const result = formatMessage("```js\nconst x = 1;\n```");
    expect(result).toContain('<pre class="code-block">');
  });
});
