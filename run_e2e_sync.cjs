import { spawnSync } from 'child_process';
const res = spawnSync('node', ['e2e.js'], { encoding: 'utf8' });
console.log(res.stdout);
console.log(res.stderr);
