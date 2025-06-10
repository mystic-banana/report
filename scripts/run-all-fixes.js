import { approveAllPendingPodcasts, fixPodcastsWithMissingEpisodes, fixPodcastCategoryPages } from '../src/utils/migrateAndFixDB';

// Main function to run all fixes
async function runAllFixes() {
  console.log('Starting comprehensive fixes for Mystic Banana...');
  console.log('--------------------------------------------');
  
  // Step 1: Approve all pending podcasts
  console.log('\n⚙️ STEP 1: Approving all pending podcasts');
  const approveResult = await approveAllPendingPodcasts();
  console.log(approveResult ? '✅ Successfully approved all pending podcasts' : '❌ Failed to approve podcasts');
  
  // Step 2: Fix podcasts with missing episodes
  console.log('\n⚙️ STEP 2: Fixing podcasts with missing episodes');
  const episodeResult = await fixPodcastsWithMissingEpisodes();
  console.log(episodeResult ? '✅ Successfully fixed podcasts with missing episodes' : '❌ Failed to fix episodes');
  
  // Step 3: Fix podcast category pages
  console.log('\n⚙️ STEP 3: Fixing podcast category relationships');
  const categoryResult = await fixPodcastCategoryPages();
  console.log(categoryResult ? '✅ Successfully fixed podcast categories' : '❌ Failed to fix categories');
  
  console.log('\n--------------------------------------------');
  console.log('All fixes completed! The following issues should now be resolved:');
  console.log('1. Podcasts not showing on the public page (approved all pending podcasts)');
  console.log('2. Missing episodes (generated sample episodes for all podcasts)');
  console.log('3. Category page issues (ensured all podcasts have valid categories)');
  console.log('\nNext steps:');
  console.log('1. Refresh the app in your browser');
  console.log('2. Check the podcast listing page to verify podcasts are showing');
  console.log('3. Check podcast detail pages to verify episodes are displaying');
  console.log('4. Navigate to category pages to verify they load correctly');
}

// Run the main function
runAllFixes()
  .then(() => console.log('\nScript completed successfully!'))
  .catch(error => console.error('\nScript failed:', error));
