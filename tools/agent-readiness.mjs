import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const repo = process.cwd();
const requiredContract = existsSync('DEVELOPMENT_STANDARDS.md') ? 'DEVELOPMENT_STANDARDS.md' : 'AGENTS.md';
assert.ok(existsSync(requiredContract), 'Missing repository operating contract');
assert.ok(existsSync('.github/agents'), 'Missing specialist profile directory');
const agentFiles = readdirSync('.github/agents').filter(n => n.endsWith('.agent.md'));
assert.ok(agentFiles.length >= 2, 'Expected at least two specialist profiles');
const names = new Set();
for (const filename of agentFiles) {
  const content = readFileSync('.github/agents/' + filename, 'utf8');
  assert.match(content, /^---\nname: [a-z][a-z0-9-]+\ndescription: .+\n---\n/m, 'Invalid agent frontmatter: ' + filename);
  const name = content.match(/^name: (.+)$/m)[1];
  assert.ok(!names.has(name), 'Duplicate agent name: ' + name);
  names.add(name);
  assert.match(content, /Handoff contract/i, 'Missing handoff instructions: ' + filename);
}
const config = readFileSync('.codex/config.toml', 'utf8');
assert.match(config, /\[features\]\s*multi_agent\s*=\s*true/, 'Missing Codex multi-agent setting');
const guidance = readFileSync('AGENT_COORDINATION.md', 'utf8');
assert.match(guidance, /no.*production|never.*production|no.*deploy/i, 'No production restriction');
if (requiredContract === 'DEVELOPMENT_STANDARDS.md') {
  assert.ok(existsSync('index.html'), 'Missing WorldWideGames entrypoint');
  assert.ok(existsSync('games'), 'Missing WorldWideGames games directory');
} else {
  assert.ok(existsSync('package.json'), 'Missing source validation package');
}
console.log('PASS agent readiness: ' + agentFiles.length + ' specialists, contract ' + requiredContract + '. This is NOT a gameplay or UE compile test.');
