// Combined Script: Auto-click "View orders" until done, then scrape tracking numbers
(async function() {
  console.log('=== COMBINED SCRIPT STARTED ===');
  console.log('Phase 1: Clicking "View orders" until no more buttons');
  
  // Phase 1: Auto-click "View orders" until no more buttons
  const BUTTON_TEXT = 'View orders';
  let clickCount = 0;
  let isRunning = true;
  const maxAttempts = 50; // Safety limit
  
  async function autoClickViewOrders() {
    while (isRunning && clickCount < maxAttempts) {
      // Wait for page to stabilize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Look for "View orders" button
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'))
        .filter(el => el.textContent.includes(BUTTON_TEXT));
      
      if (buttons.length > 0) {
        // Button found - click it
        clickCount++;
        console.log(`Click ${clickCount}: Found "${BUTTON_TEXT}" button, clicking...`);
        
        buttons[0].click();
        
        // Wait for page refresh/load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Continue loop
      } else {
        // No button found - we're done with Phase 1!
        console.log(`\n=== PHASE 1 COMPLETE ===`);
        console.log(`List of Items fully expanded.`);
        console.log(`Total clicks performed: ${clickCount}`);
        isRunning = false;
        break;
      }
    }
    
    if (clickCount >= maxAttempts) {
      console.log(`\n⚠️  Safety limit reached (${maxAttempts} clicks).`);
      console.log('Proceeding to tracking number scraping...');
    }
  }
  
  // Execute Phase 1
  await autoClickViewOrders();
  
  console.log('\n=== STARTING PHASE 2: Scraping Tracking Numbers ===');
  
  // Phase 2: Scraping Tracking Numbers
  // Step 1: Collect all tracking links from the current page
  const trackingLinks = Array.from(
    document.querySelectorAll('a[href^="https://www.aliexpress.com/p/tracking/"]')
  ).map(link => link.href);
  
  console.log(`Found ${trackingLinks.length} tracking links`);
  
  // Step 2: Create array to store tracking numbers
  const trackingNumbers = [];
  
  // Step 3: Visit each link and extract tracking numbers
  for (let i = 0; i < trackingLinks.length; i++) {
    const link = trackingLinks[i];
    console.log(`Processing link ${i + 1}/${trackingLinks.length}: ${link}`);
    
    try {
      // Open the link in a new tab/window
      const newWindow = window.open(link, '_blank');
      
      // Wait for the new window to load
      await new Promise(resolve => {
        newWindow.onload = resolve;
        // Also add a timeout in case the page takes too long
        setTimeout(resolve, 5000);
      });
      
      // Wait a bit for dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Extract tracking numbers from the new window
      const trackingElements = newWindow.document.querySelectorAll('.logistic-info-v2--mailNoValue--X0fPzen');
      
      if (trackingElements.length > 0) {
        trackingElements.forEach(element => {
          const trackingNumber = element.textContent.trim();
          if (trackingNumbers.includes(trackingNumber)) {
            console.log(` Tracking number already part of list ${trackingNumber}`);
          }
          if (trackingNumber && !trackingNumbers.includes(trackingNumber)) {
            trackingNumbers.push(trackingNumber);
            console.log(` Found NEW tracking number: ${trackingNumber} \n Tracking number add to list`);
          }
        });
      } else {
        console.log(`  No tracking numbers found on this page`);
      }
      
      // Close the tab/window
      newWindow.close();
      
      // Add a small delay to avoid being blocked
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error processing link ${link}:`, error);
    }
  }
  
  // Step 4: Display results
  console.log('\n=== FINAL RESULTS ===');
  console.log(`Total tracking numbers found: ${trackingNumbers.length}`);
  console.log('Tracking numbers:');
  trackingNumbers.forEach((num, index) => {
    console.log(`${index + 1}: ${num}`);
  });

  console.log('\n=== SCRIPT COMPLETED SUCCESSFULLY ===');
})();
