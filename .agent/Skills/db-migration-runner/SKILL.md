# Skill: Database Migration Runner

## Objective
[cite_start]Build, normalize, and commit the exact structural schema required to track security keys, access accounts, and session data profiles[cite: 27, 49].

## Tasks & Steps
1. [cite_start]Modify the `prisma/schema.prisma` configuration file exactly according to target requirements[cite: 72].
2. [cite_start]Maintain three distinct models[cite: 73, 74, 75]:
   - [cite_start]**User:** `id`, `name`, `email`, `password` (hashed format), `emailVerified`, `createdAt`[cite: 73].
   - [cite_start]**VerificationToken:** `identifier`, `token`, `expires`[cite: 74].
   - [cite_start]**PasswordResetToken:** `email`, `token`, `expires`[cite: 75].
3. [cite_start]Execute localized validation runs via `npx prisma migrate dev` to keep underlying structural definitions synchronized safely[cite: 76].