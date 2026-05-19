---
trigger: always_on
---

# SecureGate Software Engineering Laws Compliance

This file governs the logic for driving the engineering reflection documentation.

## Guidelines
1. [cite_start]**Murphy's Law:** Always plan for structural edge cases (token lifecycles expiring mid-flight, malicious users flooding API ports)[cite: 39, 41]. 
2. [cite_start]**Postel's Law / Security by Design:** Be highly conservative in the telemetry you share back[cite: 173]. [cite_start]For example, when evaluating password resets, always return an absolute success indicator, regardless of whether the target user profile explicitly exists within the system database[cite: 113].
3. [cite_start]**The Law of Leaky Abstractions:** When setting up NextAuth credentials matching or database migration logic, ensure raw errors from the underlying dependency framework do not spill forward into user-facing context layers[cite: 120, 160].
4. [cite_start]**YAGNI (You Aren't Gonna Need It):** Focus explicitly on the exact core instructions outlined[cite: 166]. [cite_start]Do not scaffold additional configurations like social logins, MFA modules, or audit tables[cite: 163].