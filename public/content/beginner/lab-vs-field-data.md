---
id: lesson-05
slug: lab-vs-field-data
title: "Lab Data vs Field Data"
level: beginner
order: 5
duration: 16
tags:
  - measurement
  - lab-data
  - field-data
  - rum
  - crux
summary: "The two ways to measure performance — synthetic lab tests (Lighthouse, DevTools, WebPageTest) versus real-user field data (RUM and the Chrome UX Report) — why they legitimately disagree, and when to trust each."
---

# Learning Objectives

By the end of this lesson you will be able to:

- Define **lab (synthetic)** data and **field (real-user) data**.
- Match common tools to each: **Lighthouse / DevTools / WebPageTest** vs **RUM / CrUX**.
- Explain **why lab and field results legitimately differ**.
- Read a **PageSpeed Insights** report, which shows both.
- Choose the right data source: field to **judge**, lab to **debug**.

# Why It Matters

You will constantly see two performance numbers for the same page — and they'll disagree. If you don't know
*why*, you'll either dismiss real problems ("but it's fast in Lighthouse!") or chase noise. Lab and field
data answer different questions: lab tells you what happens in one controlled run you can repeat, field
tells you what your actual users experience. You need both, used for the right purpose.

# Concept Explanation

### Lab data (synthetic)

**Lab data** comes from a **controlled, scripted test** in a fixed environment — a chosen device profile,
a throttled network, no real user. Because it's repeatable, it's ideal for **debugging** a specific cause
and for **catching regressions in CI** before you ship. Common lab tools:

- **Lighthouse** — audits a page and produces a performance score plus metrics (built into Chrome DevTools,
  also a CLI and in PageSpeed Insights).
- **Chrome DevTools Performance panel** — records a detailed timeline of a single load or interaction.
- **WebPageTest** — runs tests from real devices/locations with detailed waterfalls and filmstrips.

Its limitation: it's **one environment, one moment**. It can't capture the variety of real devices,
networks, and behaviors — and Lighthouse can't measure **INP**, because there's no real user interacting.

### Field data (real-user monitoring)

**Field data**, also called **RUM (Real User Monitoring)**, is collected from **actual users' browsers** as
they use the site. It reflects the true spread of devices, networks, locations, and interactions. Sources:

- **Your own RUM** — the **web-vitals** JavaScript library measures LCP/INP/CLS in each real session and
  sends them to your analytics. You control which pages and dimensions to slice by.
- **CrUX (Chrome UX Report)** — Google's **public dataset** of field metrics from opted-in Chrome users. It
  reports **75th-percentile** values and is what powers the "field" section of PageSpeed Insights and
  Google's page-experience assessment. (As of writing, CrUX is a rolling 28-day dataset, so it lags recent
  changes.)

Its limitation: you need **traffic**, it's noisier, and it tells you *what* is slow for users but not always
*why* — that's where lab debugging comes in.

### Why they disagree — and that's normal

Lab runs one fixed profile; the field is everyone. Real users have older phones, weak networks, cold and
warm caches, different geographies, and they actually *interact*. So a page might show **LCP 2.0 s in the
lab** but **LCP 3.8 s at the field p75**. Neither is "wrong" — they measure different things. **INP** and
interaction-driven **CLS** especially need the field, because lab tools don't perform realistic
interactions (Lighthouse uses **TBT** as a lab proxy for responsiveness).

### PageSpeed Insights shows both

**PageSpeed Insights (PSI)** puts them side by side: at the top, **field** data from CrUX (if the page has
enough traffic) judged at p75; below it, a **lab** Lighthouse run you can use to diagnose. The rule of
thumb: **judge with field data, diagnose with lab data.**

# Key Terminology

- **Lab / synthetic data** — metrics from a controlled, repeatable test with no real user.
- **Field data / RUM** — metrics collected from real users' browsers in the wild.
- **Lighthouse** — a lab auditing tool (score + metrics).
- **WebPageTest** — a lab tool with detailed multi-location testing.
- **CrUX (Chrome UX Report)** — Google's public field dataset, reported at p75.
- **PageSpeed Insights (PSI)** — a report combining CrUX field data and a Lighthouse lab run.
- **Throttling** — artificially slowing CPU/network in a lab test to mimic a mid-range device.

# Options and Trade-offs

| Question | Lab | Field | How to choose |
| -------- | --- | ----- | ------------- |
| Purpose | Debug a cause; block regressions in CI | Judge the real user experience | Use lab to find/fix, field to decide if it's actually a problem. |
| INP | Only an estimate (TBT proxy) | Measured from real interactions | Trust field data for INP. |
| Data needed | Works on any page immediately | Needs real traffic | New/low-traffic pages may only have lab data. |
| Field source | — | CrUX (free, no code) vs your own RUM | CrUX is easy and public; own RUM covers every page and custom dimensions. |

# Worked Example

Reading a PageSpeed Insights result for a page:

```text
FIELD DATA (CrUX, 75th percentile — real Chrome users, last 28 days)
  LCP  3.6 s   Needs improvement
  INP  150 ms  Good
  CLS  0.02    Good
  => Real users mostly struggle with LOADING (LCP), not responsiveness or stability.

LAB DATA (Lighthouse, one throttled run on this test device)
  Performance score  88
  LCP  2.4 s     FCP 1.2 s     TBT 120 ms     CLS 0.00
  => The lab run is faster than the field p75 — expected, since it's one fast, controlled run.

Takeaway: the field says fix LCP. Use the lab run's LCP breakdown to find WHY (e.g. a
late-loading hero image), fix it, then confirm the fix later in the field.
```

# Real World Analogy

Lab vs field is like testing a car. **Lab data** is the manufacturer's **test track**: controlled, repeatable,
great for isolating a specific problem with the brakes. **Field data** is **telemetry from real drivers** on
real roads in all weather — messier, but it's the only way to know how the car actually performs for the
people who own it. A responsible team uses the track to diagnose and fix, and real-world telemetry to decide
what's worth fixing.

# Examples

## Example 1 — Basic: a quick lab run from the command line

```bash
# Run Lighthouse against a URL and open an HTML report (Node required).
npx lighthouse https://example.com --view

# Or open Chrome DevTools → Lighthouse tab and click "Analyze page load".
```

**Why this works:** a lab run is instant and repeatable, perfect for a before/after comparison while you
work — just remember it's one environment.

## Example 2 — Real-world: great lab score, failing field INP

A dashboard scores 95 in Lighthouse, but CrUX shows **INP failing at p75 on mobile**. The cause: heavy
JavaScript that only bites when *real* users tap controls — something the lab's non-interactive run never
exercised. The team reproduces it in the DevTools Performance panel by recording an interaction, then trims
the main-thread work.

**Why this matters:** a lab score can look great while real interactions are slow; only field data reveals
it, and lab tools help you reproduce it.

## Example 3 — Pitfall: deciding from a single lab run

A developer runs Lighthouse once, sees LCP jump 300 ms, and reverts a change — but lab runs vary run to run.
The "regression" was noise. Comparing the **median of several runs** (or checking field data) would have
shown no real change.

**Why this bites:** a single synthetic run is noisy; treat one number as a data point, not a verdict.

# Common Mistakes

- **Judging real UX by a lab score.** Lighthouse is a lab estimate; it doesn't measure INP.
- **Ignoring field data because "it's fast on my machine."** Your machine is one fast lab profile.
- **Trusting a single lab run.** Runs vary; compare medians of several.
- **Expecting lab and field to match.** They measure different things and *should* differ.

# Best Practices

- **Judge with field data (p75)**, **debug with lab data** — use both deliberately.
- Add your own **RUM** (web-vitals) so you have field data for every page, not just popular ones.
- In the lab, **throttle CPU and network** to mimic a mid-range mobile device.
- Compare **medians of multiple lab runs**, not one.

# Summary

- **Lab (synthetic)** data is a controlled, repeatable test — great for **debugging** and **CI**; **field
  (RUM)** data comes from **real users** — the truth about experience.
- Lab tools: **Lighthouse, DevTools, WebPageTest**. Field sources: your **RUM** and **CrUX** (p75).
- They **legitimately differ** because the field spans many devices, networks, and real interactions.
- **PageSpeed Insights** shows both; **judge with field, debug with lab**.
- Lab tools don't measure **INP** directly — confirm responsiveness in the field.

# Flash Cards

Q: What is the difference between lab and field performance data?
A: Lab (synthetic) data comes from a controlled, repeatable test with no real user; field data (RUM) is collected from real users' browsers in the wild, reflecting real devices and networks.

Q: Name two lab tools and two sources of field data.
A: Lab: Lighthouse, Chrome DevTools Performance panel, WebPageTest. Field: your own RUM (the web-vitals library) and CrUX (the Chrome UX Report).

Q: Why do lab and field results for the same page often disagree?
A: Lab runs one fixed device/network profile at one moment; the field spans many devices, networks, locations, cache states, and real interactions, so its p75 is usually slower.

Q: Which Core Web Vital can't Lighthouse measure directly, and what does it use instead?
A: It can't measure INP (no real interaction); it uses Total Blocking Time (TBT) as a lab proxy for responsiveness.

Q: What does PageSpeed Insights show, and how should you use each part?
A: It shows CrUX field data (top, judged at p75) and a Lighthouse lab run (below). Judge the experience with the field data and diagnose causes with the lab run.

Q: Why shouldn't you trust a single lab run?
A: Lab runs vary run to run, so one number can be noise; compare the median of several runs (or confirm with field data).

# Exercises

### Easy
Run PageSpeed Insights on a popular site. Identify which numbers are **field** (CrUX) and which are **lab**
(Lighthouse). Do they agree? Which is slower?

### Medium
Run Lighthouse on the same page **three times** (DevTools or `npx lighthouse`). Record LCP each time and
compute the median. How much did a single run vary?

### Challenging
For a site you can add code to, sketch how you'd collect your own field data with the web-vitals library:
which metrics you'd capture, what dimensions you'd tag (device type, page template), and why field INP would
tell you something a lab run can't.

# Further Reading

- web.dev — *Lab and field data* / *Choosing metrics*: <https://web.dev/articles/lab-and-field-data-differences>
- web.dev — *Chrome UX Report (CrUX)*: <https://developer.chrome.com/docs/crux>
- Google — *PageSpeed Insights*: <https://pagespeed.web.dev/>
- web.dev — *WebPageTest* & DevTools: <https://web.dev/learn/performance/lab-and-field-measurement-tools>
