// Mini-librería para los hooks de .claude/hooks/*.mjs.
// Los hooks leen un JSON por stdin y responden por stdout (JSON) o exit code.
// Referencia: https://code.claude.com/docs/en/hooks

import { execSync } from 'node:child_process';

export async function readStdin() {
    const chunks = [];
    for await (const c of process.stdin) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf8').trim();
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

export function normalize(p) {
    return String(p || '').replace(/\\/g, '/');
}

/** PreToolUse: allow | deny | ask con motivo. Sale del proceso. */
export function decide(permissionDecision, permissionDecisionReason, additionalContext) {
    const out = { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision, permissionDecisionReason } };
    if (additionalContext) out.hookSpecificOutput.additionalContext = additionalContext;
    process.stdout.write(JSON.stringify(out));
    process.exit(0);
}

/** PostToolUse / SessionStart: añade contexto a Claude sin bloquear. Sale del proceso. */
export function context(hookEventName, additionalContext) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName, additionalContext } }));
    process.exit(0);
}

export function git(cmd, cwd) {
    try {
        return execSync(`git ${cmd}`, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
        return null;
    }
}
