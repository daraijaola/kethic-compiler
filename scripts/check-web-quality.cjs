const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const sourcePath = process.argv[2] ?? "examples/kethic-landing.macro.keth";
const outputDirectory = path.join(os.tmpdir(), `kethic-quality-${Date.now()}`);

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function requireMatch(html, pattern, message) {
  if (pattern.test(html)) {
    pass(message);
    return;
  }

  fail(message);
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

function findDuplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }

    seen.add(value);
  }

  return [...duplicates];
}

function main() {
  execFileSync("node", ["dist/src/cli.js", "web", sourcePath, "--out-dir", outputDirectory], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  const html = fs.readFileSync(path.join(outputDirectory, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(outputDirectory, "styles.css"), "utf8");
  const runtime = fs.readFileSync(path.join(outputDirectory, "runtime.js"), "utf8");

  requireMatch(html, /<main id="app" class="[^"]*kethic-page"/, "emits a mounted main page");
  requireMatch(html, /<nav class="[^"]*kethic-navigation" aria-label="Main"/, "emits labelled navigation");
  requireMatch(html, /<section id="hero" class="[^"]*kethic-section"/, "emits hero section");
  requireMatch(html, /<section id="features" class="[^"]*kethic-section"/, "emits features section");
  requireMatch(html, /<section id="signup" class="[^"]*kethic-section"/, "emits signup section");
  requireMatch(html, /<h1 id="kethic">Kethic<\/h1>/, "emits one clear h1");
  requireMatch(html, /<form class="[^"]*kethic-form"/, "emits form");
  requireMatch(html, /<label for="field-name">Name<\/label>/, "emits name label");
  requireMatch(html, /<label for="field-email">Email<\/label>/, "emits email label");
  requireMatch(html, /<input id="field-name" name="name" required aria-describedby="field-name-message">/, "wires name input to validation message");
  requireMatch(html, /<input id="field-email" name="email" required aria-describedby="field-email-message">/, "wires email input to validation message");
  requireMatch(html, /<button type="button" data-kethic-action="join"/, "emits action button");
  requireMatch(html, /<button type="submit" class="kethic-button">/, "emits submit button");
  requireMatch(css, /:focus-visible/, "emits focus-visible styles");
  requireMatch(css, /@media \(max-width: 720px\)/, "emits mobile responsive styles");
  requireMatch(runtime, /document\.addEventListener\('click'/, "emits event runtime");

  const ids = collectAttributeValues(html, "id");
  const duplicateIds = findDuplicateValues(ids);
  if (duplicateIds.length === 0) {
    pass("has no duplicate ids");
  } else {
    fail(`has duplicate ids: ${duplicateIds.join(", ")}`);
  }

  if (process.exitCode === undefined) {
    console.log(JSON.stringify({ sourcePath, outputDirectory, htmlChars: html.length, cssChars: css.length, runtimeChars: runtime.length }, null, 2));
  }
}

main();
