const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const cases = [
  {
    name: "clean roles nocturne",
    source: "examples/clean-roles-demo.keth",
    brand: "examples/brands/nocturne.json",
    requiredRoles: ["hero", "features", "proof", "cta"],
    requiredRepeats: 6,
  },
  {
    name: "clean roles lumen",
    source: "examples/clean-roles-demo.keth",
    brand: "examples/brands/lumen.json",
    requiredRoles: ["hero", "features", "proof", "cta"],
    requiredRepeats: 6,
  },
  {
    name: "clean roles forge",
    source: "examples/clean-roles-demo.keth",
    brand: "examples/brands/forge.json",
    requiredRoles: ["hero", "features", "proof", "cta"],
    requiredRepeats: 6,
  },
  {
    name: "external data forge",
    source: "examples/external-data-demo.keth",
    brand: "examples/brands/forge.json",
    requiredRoles: [],
    requiredRepeats: 6,
  },
];

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function compileCase(testCase) {
  const outputDirectory = path.join(os.tmpdir(), `kethic-visual-${Date.now()}-${slug(testCase.name)}`);
  const args = ["dist/src/cli.js", "web", testCase.source, "--out-dir", outputDirectory];

  if (testCase.brand !== undefined) {
    args.push("--brand", testCase.brand);
  }

  execFileSync("node", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return {
    outputDirectory,
    html: fs.readFileSync(path.join(outputDirectory, "index.html"), "utf8"),
    css: fs.readFileSync(path.join(outputDirectory, "styles.css"), "utf8"),
    runtime: fs.existsSync(path.join(outputDirectory, "runtime.js"))
      ? fs.readFileSync(path.join(outputDirectory, "runtime.js"), "utf8")
      : "",
  };
}

function assertContains(value, pattern, message) {
  if (pattern.test(value)) {
    pass(message);
    return;
  }

  fail(message);
}

function assertAtLeast(actual, expected, message) {
  if (actual >= expected) {
    pass(`${message}: ${actual}`);
    return;
  }

  fail(`${message}: expected at least ${expected}, got ${actual}`);
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    pass(`${message}: ${actual}`);
    return;
  }

  fail(`${message}: expected ${expected}, got ${actual}`);
}

function collectAttributeValues(html, attribute) {
  const values = [];
  const pattern = new RegExp(`${attribute}="([^"]+)"`, "g");
  let match = pattern.exec(html);

  while (match !== null) {
    values.push(match[1]);
    match = pattern.exec(html);
  }

  return values;
}

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

function collectVariantSet(html) {
  return new Set([...html.matchAll(/kethic-variant-[A-Za-z0-9_-]+/g)].map((match) => match[0]));
}

function checkNoDuplicateIds(html, label) {
  const ids = collectAttributeValues(html, "id");
  const seen = new Set();
  const duplicates = new Set();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }

    seen.add(id);
  }

  if (duplicates.size === 0) {
    pass(`${label} has no duplicate ids`);
    return;
  }

  fail(`${label} has duplicate ids: ${[...duplicates].join(", ")}`);
}

function checkCase(testCase, result) {
  console.log(`\n# ${testCase.name}`);
  assertContains(result.html, /<main id="app" class="[^"]*kethic-page"/, "emits mounted page");
  assertAtLeast(countMatches(result.html, /<section /g), 2, "emits multiple sections");
  assertEqual(countMatches(result.html, /<h1 /g), 1, "emits exactly one h1");
  assertContains(result.html, /<nav class="[^"]*kethic-navigation"/, "emits navigation");
  assertContains(result.css, /@media \(max-width: 720px\)/, "emits mobile media rules");
  assertContains(result.css, /:focus-visible/, "emits focus-visible rules");
  assertContains(result.css, /kethic-metriccard/, "emits card styling");
  checkNoDuplicateIds(result.html, testCase.name);

  for (const role of testCase.requiredRoles) {
    assertContains(result.html, new RegExp(`kethic-section-${role}`), `emits ${role} role class`);
    assertContains(result.html, new RegExp(`kethic-variant-${role}-[A-Za-z0-9_-]+`), `emits ${role} variant class`);
  }

  if (testCase.requiredRepeats > 0) {
    assertAtLeast(
      countMatches(result.html, /data-kethic-repeat="/g),
      testCase.requiredRepeats,
      "renders repeated component instances",
    );
  }
}

function slug(value) {
  return value.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase();
}

function main() {
  const variantSets = [];
  const outputs = [];

  for (const testCase of cases) {
    const result = compileCase(testCase);
    outputs.push({
      name: testCase.name,
      outputDirectory: result.outputDirectory,
      htmlChars: result.html.length,
      cssChars: result.css.length,
      runtimeChars: result.runtime.length,
    });
    checkCase(testCase, result);

    if (testCase.source === "examples/clean-roles-demo.keth") {
      variantSets.push({
        name: testCase.name,
        variants: collectVariantSet(result.html),
      });
    }
  }

  const uniqueVariantSignatures = new Set(
    variantSets.map((entry) => [...entry.variants].sort().join("|")),
  );
  assertEqual(uniqueVariantSignatures.size, variantSets.length, "brand profiles produce distinct variant sets");

  if (process.exitCode === undefined) {
    console.log(`\n${JSON.stringify({ outputs }, null, 2)}`);
  }
}

main();
