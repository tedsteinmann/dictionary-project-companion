import { cp, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist');
await Promise.all([
  cp('index.html', 'dist/index.html'),
  cp('src', 'dist/src', { recursive: true })
]);

console.log('Built static site in dist/');
