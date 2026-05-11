const https = require("https");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const gatewayToken = process.env.KETHIC_GATEWAY_TOKEN;
const gatewayHost = process.env.KETHIC_GATEWAY_HOST ?? "cozy-ai-gate.lovable.app";
const gatewayPath = process.env.KETHIC_GATEWAY_PATH ?? "/api/public/chat";
const model = process.env.KETHIC_BENCHMARK_MODEL ?? "gpt-5.2";
const scenario = process.env.KETHIC_BENCHMARK_SCENARIO ?? "standalone-html";
const promptCapsulePath = process.env.KETHIC_PROMPT_CAPSULE_PATH ?? "docs/AI_PROMPT_CAPSULE.md";

if (gatewayToken === undefined || gatewayToken.trim().length === 0) {
  console.error("Set KETHIC_GATEWAY_TOKEN before running this benchmark.");
  process.exit(1);
}

function sendChat(prompt) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    });

    const request = https.request(
      {
        hostname: gatewayHost,
        path: gatewayPath,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gatewayToken}`,
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (response.statusCode === undefined || response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`Gateway returned HTTP ${response.statusCode}: ${body.slice(0, 500)}`));
            return;
          }

          resolve(JSON.parse(body));
        });
      },
    );

    request.on("error", reject);
    request.write(payload);
    request.end();
  });
}

function extractCode(content) {
  const fenced = content.match(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/);
  return (fenced === null ? content : fenced[1]).trim();
}

function requireUsage(response) {
  if (response.usage === undefined) {
    throw new Error("Gateway response did not include token usage.");
  }

  return response.usage;
}

function percentReduction(candidate, baseline) {
  return Number(((1 - candidate / baseline) * 100).toFixed(2));
}

function readPromptCapsule() {
  const document = fs.readFileSync(promptCapsulePath, "utf8");
  const fenced = document.match(/```text\s*([\s\S]*?)```/);

  if (fenced === null) {
    throw new Error(`Prompt capsule at ${promptCapsulePath} must contain a text code block.`);
  }

  return fenced[1].trim();
}

const scenarios = {
  "standalone-html": {
    baselineLabel: "Standalone HTML/CSS/JS",
    baselinePrompt:
      "Create a polished, production-quality landing page for an open-source AI-native programming language called Kethic. Requirements: hero section with headline and CTA button, three feature cards, email signup form with name and email inputs, footer, responsive CSS, accessible labels, and a tiny JavaScript click handler for the CTA. Return one complete standalone HTML file only. No explanation.",
  },
  "react-tailwind": {
    baselineLabel: "React/Tailwind component",
    baselinePrompt:
      "Create a polished, production-quality React landing page component for an open-source AI-native programming language called Kethic. Use Tailwind CSS classes. Requirements: hero section with headline and CTA button, three feature cards, email signup form with name and email inputs, footer, responsive layout, accessible labels, and a tiny click handler for the CTA. Return one complete React component file only. No explanation.",
  },
};

if (scenarios[scenario] === undefined) {
  console.error(`Unknown KETHIC_BENCHMARK_SCENARIO "${scenario}". Use one of: ${Object.keys(scenarios).join(", ")}.`);
  process.exit(1);
}

const kethicPrompt = `${readPromptCapsule()}

Task: Create the same landing page for an open-source AI-native programming language called Kethic, focused on building quality websites with fewer AI output tokens. Include hero, navigation, three features, signup form, footer, mount, and a CTA action.`;

async function main() {
  const outputDirectory = path.join(os.tmpdir(), `kethic-ai-benchmark-${Date.now()}`);
  fs.mkdirSync(outputDirectory, { recursive: true });

  const activeScenario = scenarios[scenario];
  const normalResponse = await sendChat(activeScenario.baselinePrompt);
  const kethicResponse = await sendChat(kethicPrompt);
  const normalUsage = requireUsage(normalResponse);
  const kethicUsage = requireUsage(kethicResponse);

  const normalSource = extractCode(normalResponse.choices[0].message.content ?? "");
  const kethicSource = extractCode(kethicResponse.choices[0].message.content ?? "");

  const normalPath = path.join(outputDirectory, "normal.html");
  const kethicPath = path.join(outputDirectory, "macro.keth");
  const compiledDirectory = path.join(outputDirectory, "compiled");
  fs.writeFileSync(normalPath, normalSource, "utf8");
  fs.writeFileSync(kethicPath, kethicSource, "utf8");

  let compileOk = false;
  let compileError = null;

  try {
    execFileSync("node", ["dist/src/cli.js", "web", kethicPath, "--out-dir", compiledDirectory], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    compileOk = true;
  } catch (error) {
    compileError = `${error.stdout?.toString() ?? ""}\n${error.stderr?.toString() ?? error.message}`.trim();
  }

  const compiledChars = compileOk
    ? fs.readFileSync(path.join(compiledDirectory, "index.html"), "utf8").length +
      fs.readFileSync(path.join(compiledDirectory, "styles.css"), "utf8").length +
      fs.readFileSync(path.join(compiledDirectory, "runtime.js"), "utf8").length
    : 0;

  const result = {
    model,
    scenario,
    baselineLabel: activeScenario.baselineLabel,
    promptCapsulePath,
    outputDirectory,
    normal: {
      promptTokens: normalUsage.prompt_tokens,
      completionTokens: normalUsage.completion_tokens,
      totalTokens: normalUsage.total_tokens,
      sourceChars: normalSource.length,
    },
    kethic: {
      promptTokens: kethicUsage.prompt_tokens,
      completionTokens: kethicUsage.completion_tokens,
      totalTokens: kethicUsage.total_tokens,
      sourceChars: kethicSource.length,
      compileOk,
      compiledChars,
      compileError,
    },
    savings: {
      outputTokenReductionPercent: percentReduction(kethicUsage.completion_tokens, normalUsage.completion_tokens),
      totalTokenReductionPercent: percentReduction(kethicUsage.total_tokens, normalUsage.total_tokens),
      sourceCharReductionPercent: percentReduction(kethicSource.length, normalSource.length),
    },
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
