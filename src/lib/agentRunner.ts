import { buildAgentContext } from "./agentContext";
console.log("key:", import.meta.env.VITE_GEMINI_API_KEY);

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function extractCodeBlocks(text: string): string[] {
  const regex = /```(?:js|javascript|ts|typescript)?\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

function executeCode(code: string, context: Record<string, unknown>): string {
  try {
    const fn = new Function(...Object.keys(context), code);
    const result = fn(...Object.values(context));
    return result !== undefined ? String(result) : "ok";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[agent code error]", msg);
    return `Error: ${msg}`;
  }
}

function buildSystemPrompt(context: ReturnType<typeof buildAgentContext>): string {
  const matrices = context.listMatrices();
  const vectors = context.listVectors();

  return `You are a linear algebra assistant embedded in an interactive visualizer.
When you need to add, update, or remove matrices or vectors in the app, write JavaScript in a \`\`\`js code block. The code will be executed automatically and the UI will update.

## Available functions (already in scope — do NOT import anything):

### Matrix store
- addMatrix(name: string, values: string[][])   — values must be a 2D array of strings e.g. [["1","2"],["3","4"]]
- updateMatrix(name: string, values: string[][])
- removeMatrix(name: string)
- listMatrices() → string[]
- getMatrix(name: string) → { name, values } | undefined

### Vector store
- addVector(name: string, values: string[])     — values must be a 1D array of strings e.g. ["1","2","3"]
- updateVector(name: string, values: string[])
- removeVector(name: string)
- listVectors() → string[]
- getVector(name: string) → { name, values } | undefined

### Math tools
- matrix.add(a, b)        matrix.subtract(a, b)    matrix.multiply(a, b)
- matrix.det(a)           matrix.inverse(a)         matrix.transpose(a)
- matrix.eigenVals(a)     matrix.eigenVectors(a)
- vector.add(...names)    vector.subtract(a, b)     vector.dot(a, b)
- vector.cross(a, b)      vector.magnitude(a)       vector.scalarMultiply(a, scalar)

## Rules
- Values are always strings — write numbers as "1" not 1.
- Choose short single-letter names (A, B, v, u) unless the user says otherwise.
- Write one code block per logical operation. Do not chain unrelated operations.
- Explain briefly what you did after each code block.
- Never call functions outside of a code block.

## Current app state
Matrices: ${matrices.length ? matrices.join(", ") : "none"}
Vectors:  ${vectors.length ? vectors.join(", ") : "none"}`;
}

export async function runAgentTurn(
  history: ChatMessage[],
  userMessage: string,
  onChunk: (delta: string) => void
): Promise<string> {
  const context = buildAgentContext();
  const systemPrompt = buildSystemPrompt(context);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: "llama-3.3-70b-versatile",
    max_tokens: 2048,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ],
  }),
});

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  let fullText = "";
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]" || !data) continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
        fullText += delta;
        onChunk(delta);
        }
      } catch {}
    }
  }

  // Execute code blocks after full response is streamed
  const blocks = extractCodeBlocks(fullText);
  for (const code of blocks) {
    executeCode(code, context as Record<string, unknown>);
  }

  return fullText;
}