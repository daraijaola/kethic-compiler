# Kethic Public Site V0

The first public Kethic website is built with Kethic itself.

Source:

```text
examples/kethic-public-site.keth
```

Brand:

```text
examples/brands/kethic.json
```

Content:

```text
examples/data/kethic-features.json
examples/data/kethic-proof.json
```

Compile:

```powershell
npm run build
node dist/src/cli.js web examples/kethic-public-site.keth --out-dir dist-kethic-site --brand examples/brands/kethic.json
```

Why this matters:

- it dogfoods Kethic;
- it uses Brand Profile, external data, repeaters, section roles, and variants;
- it gives us a clean base for `kethic.org`;
- it remains standard HTML/CSS output.
