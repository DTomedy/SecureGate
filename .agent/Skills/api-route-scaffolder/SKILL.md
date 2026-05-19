# Skill: API Route Scaffolder

## Objective
[cite_start]Safely create backend endpoint targets that evaluate input criteria, isolate processing errors, and execute atomic registration or updates[cite: 24, 120].

## Tasks & Steps
1. [cite_start]Provision individual API handlers under `src/app/api/` (e.g., signup endpoint setups)[cite: 86].
2. [cite_start]Wrap incoming payloads with strict server validation engines (Zod)[cite: 49, 86].
3. [cite_start]Integrate rate-limiting verification middleware checks prior to evaluating heavy authentication functions[cite: 35, 118].
4. [cite_start]Mask all outward exception signals; log precise error states inside execution runtimes, but respond with broad, sanitized statuses to the external caller[cite: 120].