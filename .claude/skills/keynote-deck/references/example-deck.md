---
title: The Cost of Cleverness
language: en
accent: "#E4572E"
---

type: title

# The Cost of Cleverness
How premature abstraction taxes every future reader

---

type: statement

# Abstraction is a loan
[+] and the interest compounds

---

type: section

# Three tells

---

type: bullets

## Three tells
- a wrapper with one caller
- a config flag no one flips
- [+] a name that hides the noun

---

type: stat

# 47%
single-caller "abstractions" in the code we cut

::: notes
land the number, then pause
:::

::: script
Forty-seven percent. Nearly half of the abstractions we were proud of
had exactly one caller — indirection wearing an abstraction's coat.
:::

---

type: quote

> Duplication is far cheaper than the wrong abstraction.
— Sandi Metz

---

type: image
src: !todo "a tangled dependency graph collapsing to a straight line"
alt: dependency graph, before and after

before, and after

---

type: code
file: src/pipeline.ts

```ts
function run(step: Step, cfg: Config) {
  return cfg.mode === "fast" ? fast(step) : slow(step);
}
```

---

type: comparison

::: Clever
- one generic pipeline
- every case a config
:::

::: Plain
- three explicit functions
- each read top to bottom
:::

---

type: video
src: assets/demo-run.mp4
poster: assets/demo-poster.jpg

the migration, running end to end

---

type: statement
link: https://poll.example/clever

# Which one would you merge?
