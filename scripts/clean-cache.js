const { execSync } = require('child_process');
const rimraf = require('rimraf');
const path = require('path');

// Clean directories
rimraf.sync('.next');
rimraf.sync('node_modules/.prisma');
rimraf.sync('node_modules/@prisma');

// Regenerate Prisma
execSync('npx prisma generate', { stdio: 'inherit' });
