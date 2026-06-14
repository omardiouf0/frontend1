import * as fs from 'fs';
import * as path from 'path';

function findNewFiles(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('node_modules') || fullPath.includes('.git') || fullPath.includes('dist')) {
      continue;
    }
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findNewFiles(fullPath);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.svg', '.json', '.ts'].includes(ext)) {
        console.log(`File: ${fullPath} - Size: ${stat.size} - MTime: ${stat.mtime}`);
      }
    }
  }
}

findNewFiles('.');
