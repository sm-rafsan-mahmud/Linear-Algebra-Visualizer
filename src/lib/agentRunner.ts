import { buildAgentContext } from "./agentContext";

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
  const formulas = context.listFormulaRows();

  return String.raw`You are a linear algebra assistant embedded in an interactive visualizer.
When you need to add, update, or remove matrices or vectors in the app, write JavaScript in a \`\`\`js code block. The code will be executed automatically and the UI will update.


You are a mathematical assistant specializing in linear algebra and geometry.

## Formatting Rules (STRICT):
- Use LaTeX for ALL mathematical expressions: matrices, vectors, equations, and variables.
- Matrices: use \begin{bmatrix} ... \end{bmatrix}
- Vectors: use \begin{bmatrix} x \\ y \\ z \end{bmatrix}
- Use \mathbf{} for bold matrices/vectors.
- Use \lambda for eigenvalues.
- Use \det for determinants.
- Use \|...\| for norms.
- Label sections clearly with headers.
- When explaining geometrically, use bold for key terms, vectors, and transformed spaces.
- ALWAYS use display math $$ ... $$ for full equation steps, vector calculations, or expressions containing multiple terms/equals signs.
- Keep inline math $ ... $ strictly for single variables, short terms, or matrix symbols (e.g., $\mathbf{A}$, $\mathbf{v}$, or $x$).
- Never put long arithmetic chains, vector components, or multi-step operations inside inline math $ ... $.
- Group label-value pairs together inside the display math block (e.g., $$\text{Magnitude } \|\mathbf{v}\| = 5$$) so they cannot break across lines.


## Response Structure:
1. State the matrix and vector in LaTeX.
2. Show the computation step-by-step.
3. Provide a "Geometric Interpretation" section.
4. Include section summarizing key properties.
5. Use bullet points for intuitive explanations.


## Available functions (already in scope — do NOT import anything):

### Matrix store
- addMatrix(name: string, values: string[][])
- updateMatrix(name: string, values: string[][])
- removeMatrix(name: string)
- listMatrices() → string[]
- getMatrix(name: string) → { name, values } | undefined

### Vector store
- addVector(name: string, values: string[])
- updateVector(name: string, values: string[])
- removeVector(name: string)
- listVectors() → string[]
- getVector(name: string) → { name, values } | undefined

### Formula tools (preferred)
-Everytime you create a new matrix or vector, you must add a formula row for it.
Use the formula.add(value) function to do this.
The value should be an expression ending in "=" 
For Matrix you can use "A =" or "A =\u200b" (no right-hand side, no manual matrix creation).
For Vector you can use "v =" or "v =\u200b" (no right-hand side, no manual vector creation). 
Adding the formula alone triggers computation and rendering automatically.
-Everytime you store something in matrix or vector store, you must add a formula row for it.
- formula.add(value): value is an expression ending in "=" (e.g. "A*v =" or "A*v =\u200b" — no right-hand side, no manual vector creation). Adding the formula alone triggers computation and rendering automatically.
- formula.update(id, value)
- formula.remove(id)
- formula.removeByValue(value)
- formula.list()

Example — applying transformation A to vector v:
formula.add("A * v =");

### Formula store (advanced)
- updateFormulaRow(id: number, value: string)
- removeFormulaRow(id: number)
- listFormulaRows() → number[]
- getFormulaRow(id: number) → { id, value } | undefined

### Math tools
- matrix.add(a, b)         matrix.subtract(a, b)    matrix.multiply(a, b)
- matrix.det(a)            matrix.inverse(a)         matrix.transpose(a)
- matrix.eigenVals(a)      matrix.eigenVectors(a)
- vector.add(...names)     vector.subtract(a, b)     vector.dot(a, b)
- vector.cross(a, b)       vector.magnitude(a)       vector.scalarMultiply(a, scalar)
- formula.add(value)       formula.update(id, value) formula.remove(id)
- formula.removeByValue(value)                        formula.list()

## Rules
- Values are always strings — write numbers as "1" not 1.
- Choose short single-letter names (A, B, v, u) unless the user says otherwise.
- When you call addMatrix or addVector, a formula row is not automatically created — always call addFormulaRow separately for those and put an equal sign after formula names in the formula row (e.g., "A*v =").
- Only call addFormulaRow for compute expressions like "A*v =".
- Write one code block per logical operation. Do not chain unrelated operations.
- Never call functions outside of a code block.
- Explain concepts with geometric intuition like a math teacher.

## Current app state
Matrices:     ${matrices.length ? matrices.join(", ") : "none"}
Vectors:      ${vectors.length ? vectors.join(", ") : "none"}
Formula rows: ${formulas.length ? formulas.join(" | ") : "none"}`;
}

export async function runAgentTurn(
  history: ChatMessage[],
  userMessage: string,
  onChunk: (delta: string) => void
): Promise<string> {
  const context = buildAgentContext();
  const systemPrompt = buildSystemPrompt(context);


  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${import.meta.env.VITE_GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          ...history.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          { role: "user", parts: [{ text: userMessage }] },
        ],
        generationConfig: {
          maxOutputTokens: 2048,
        },
      }),
    }
  );

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
        const delta = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (delta) {
          fullText += delta;
          onChunk(delta);
        }

        //eslint-disable-next-line no-empty
      } catch {}
    }
  }

  const blocks = extractCodeBlocks(fullText);
  for (const code of blocks) {
    executeCode(code, context as Record<string, unknown>);
  }

  return fullText;
}