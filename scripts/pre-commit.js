const { execSync } = require('child_process');

console.log('================================================================================');
console.log('🏗️👷 Styling, testing and building your project before committing');
console.log('================================================================================');

try {
  console.log('🎯 Starting VitaLC Code Quality Gate...');
  console.log('🔧 Step 1: Checking Prettier formatting...');
  execSync('yarn check-format', { stdio: 'inherit' });
  console.log('✅ Prettier formatting passed! 👯‍♀️✨');

  console.log('🔧 Step 2: Checking ESLint rules...');
  execSync('yarn check-lint', { stdio: 'inherit' });
  console.log('✅ ESLint rules passed! 🕵️‍♂️🔍');

  console.log('🔧 Step 3: Checking TypeScript compilation...');
  execSync('yarn check-types', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation passed! 🔷⚡');

  console.log('================================================================================');
  console.log('🤔🤔🤔🤔... Alright.... Code looks good to me... Trying to build now. 🤔🤔🤔🤔');
  console.log('================================================================================');
  console.log('⚙️  Step 4: Building both client and server...');
  execSync('yarn build', { stdio: 'inherit' });
  console.log('✅ Build successful! Next.js + TypeScript compiled perfectly! 🚀🔥');

  console.log('================================================================================');
  console.log('🎉 =========================================================================');
  console.log('🎉    CODE QUALITY CHECKS PASSED! COMMIT APPROVED!    ');
  console.log('🎉 =========================================================================');
  console.log('✅ All checks completed successfully!');
  console.log('✅ Prettier formatting: PASSED ✨');
  console.log('✅ ESLint linting: PASSED 🔍');
  console.log('✅ TypeScript types: PASSED 🔷');
  console.log('✅ Full build: PASSED 🚀');
  console.log('🎉 =========================================================================');
  console.log('✅✅✅✅ You win this time... I am committing this now! ✅✅✅✅');
  console.log('================================================================================');
} catch (error) {
  console.error('❌ Check failed. Fix the errors above and try commit again.');
  process.exit(1);
}
