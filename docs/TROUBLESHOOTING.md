# Troubleshooting Guide

**Having problems with BenefitFinder?**

This guide will help you solve common issues.

---

## Quick Fixes (Try These First!)

### App Not Loading

**Try this (in order):**

1. **Refresh the page**
   - Press F5 on keyboard
   - Or click the reload button in browser

2. **Check your internet connection**
   - Needed for first visit only
   - Try opening another website
   - If other sites work, continue to next step

3. **Clear browser cache**
   - Chrome: Ctrl+Shift+Delete → Clear data
   - Firefox: Ctrl+Shift+Delete → Clear data
   - Safari: Cmd+Option+E

4. **Try a different browser**
   - If using Chrome, try Firefox
   - If using Safari, try Chrome

5. **Restart your device**
   - Turn off completely
   - Wait 30 seconds
   - Turn back on

### Questionnaire Issues

**Can't click "Next" button:**
- Make sure you answered the question
- Look for red error messages
- Required fields must be filled
- Check that your answer is valid (e.g., positive number for income)

**Lost my progress:**
- Answers should be saved automatically
- If using private/incognito mode, they won't save when browser closes
- Use regular browser mode to save progress

**Questions don't make sense:**
- Skip questions that don't apply (if skip option available)
- Answer to best of your ability
- You can always redo if needed

### Results Not Showing

**After clicking "See Results", nothing happens:**
- Wait a few seconds (calculations take a moment)
- Check if page scrolled down
- Try clicking again
- Refresh page and try once more

**Results look wrong:**
- Review your answers
- Click "Why?" to see calculation details
- Check if you selected correct state
- Verify income and household size

### Can't Save or Print

**"Save" button not working:**
- Check if browser allows local storage
- Disable private/incognito mode
- Try different browser
- Check available storage space

**Print not working:**
- Check for popup blockers (disable for this site)
- Try Ctrl+P (Windows) or Cmd+P (Mac) instead
- Try different browser
- Update browser to latest version

---

## Specific Problems

### Problem: "Page is blank"

**Possible causes:**
- JavaScript is disabled
- Old browser version
- Browser extension blocking scripts

**Solutions:**
1. **Enable JavaScript:**
   - Chrome: Settings → Privacy → Site Settings → JavaScript → Allowed
   - Firefox: about:config → javascript.enabled → true
   - Safari: Preferences → Security → Enable JavaScript

2. **Update browser:**
   - Chrome: Menu → Help → About Chrome
   - Firefox: Menu → Help → About Firefox
   - Safari: Updates come with macOS updates

3. **Disable browser extensions:**
   - Try incognito/private mode (extensions usually disabled)
   - Or disable extensions one by one to find the culprit

### Problem: "Can't find 'Save' button"

**Where to look:**
- Top of results page
- Look for 💾 icon
- May be in menu on mobile (three dots or hamburger menu)

**If still not found:**
- Scroll to top of page
- Widen browser window (button might be hidden)
- Try desktop version on mobile (browser menu)

### Problem: "Encrypted file won't open"

**Check:**
1. **Correct password?**
   - Passwords are case-sensitive
   - Check Caps Lock
   - Try typing carefully

2. **Correct file?**
   - File should end with .bfx
   - File size should be > 1 KB

3. **File corrupted?**
   - Try downloading again
   - Try different download method
   - Ask sender to re-export

**If still won't open:**
- Password might be wrong (most common issue)
- File might be from newer version (update BenefitFinder)
- Contact whoever sent it to re-export

### Problem: "Results disappeared"

**Check:**
1. **Did you save them?**
   - Must click "Save Results"
   - Look in "History"

2. **Cleared browser data?**
   - Clears saved results too
   - Can't recover if cleared

3. **Different browser?**
   - Results save per browser
   - Check same browser you used before

4. **Private/incognito mode?**
   - Doesn't save between sessions
   - Use regular browser mode

**Prevention:**
- Click "Save Results" after each screening
- Export encrypted file as backup
- Print to PDF for permanent record

### Problem: "Can't click checkboxes"

**Try:**
1. Click directly on the checkbox (small square)
2. Or click on the label text next to it
3. Make sure page is fully loaded
4. Try tapping if on touchscreen

**If still not working:**
- Try different browser
- Update browser to latest version
- See if JavaScript is enabled

### Problem: "Text is too small"

**Make it bigger:**

**On computer:**
- Press Ctrl and + (plus) key
- Or: Ctrl and scroll mouse wheel up
- Or: Browser menu → Zoom → Increase

**On phone:**
- Pinch to zoom (two fingers spread apart)
- Or: Browser settings → Text size → Larger

**On tablet:**
- Same as phone
- Or accessibility settings → Display size

---

## Error Messages

### "This field is required"

**What it means:** You need to answer this question

**Fix:** Enter an answer in the field with the error

### "Please enter a valid number"

**What it means:** Answer must be a number

**Fix:**
- Enter numbers only (no dollar signs or commas)
- Use digits: 1500 not "fifteen hundred"
- No negative numbers

### "Please enter a valid date"

**What it means:** Date format is wrong

**Fix:**
- Use the calendar picker if available
- Or format: MM/DD/YYYY (e.g., 03/15/1990)
- Month must be 01-12
- Day must be valid for that month

### "Network error" or "Connection failed"

**What it means:** Internet connection problem

**Fix:**
1. Check your internet connection
2. Try different Wi-Fi network
3. Try using mobile data instead of Wi-Fi
4. Wait a few minutes and try again

**Note:** After first load, app works offline!

### "Storage quota exceeded"

**What it means:** Too much data saved on your device

**Fix:**
1. Delete old saved results (History → Delete)
2. Clear other browser data
3. Free up space on your device
4. Use encrypted export to save elsewhere before deleting

---

## Browser-Specific Issues

### Chrome Issues

**App won't install:**
- Make sure you're on HTTPS or localhost
- Check if already installed
- Try incognito mode first, then regular mode

**Can't save:**
- Check Settings → Privacy → Site Settings → Cookies
- Must allow cookies and site data

### Firefox Issues

**Slow performance:**
- Update to latest version
- Disable unnecessary extensions
- Clear cache

**Can't install as app:**
- Firefox doesn't support PWA installation on desktop
- Use Chrome, Edge, or Safari instead
- Or just bookmark the page

### Safari (iPhone/iPad) Issues

**Can't add to home screen:**
- Must use Safari (not Chrome or other browsers on iOS)
- Tap Share button → "Add to Home Screen"
- Icon appears on home screen

**Features not working:**
- Safari has some limitations with PWAs
- Some features may work differently
- Try in browser first before installing

**Storage limits:**
- iOS may clear data after 7 days of not using
- Export important results before iOS clears them
- Re-open app every few days to prevent clearing

---

## Device-Specific Issues

### On Android

**App closes unexpectedly:**
- Check for system updates
- Clear device cache
- Reinstall app (delete and re-add to home screen)

**Can't download exported files:**
- Check permissions for browser
- Settings → Apps → Browser → Permissions → Storage
- Check available storage space

### On iPhone/iPad

**Can't install:**
- Use Safari, not Chrome or Firefox
- iOS 11.3 or higher required
- Make sure you're online for first install

**Features disabled:**
- iOS doesn't support all web features
- Some interactive features may be limited
- Core functionality works

### On Computer

**Small text:**
- Increase zoom level (Ctrl/Cmd +)
- Adjust system display settings
- Use browser text size settings

**Can't find downloads:**
- Check Downloads folder
- Check browser downloads page (Ctrl+J in Chrome)
- Look in default download location

---

## Advanced Troubleshooting

### Clearing All Data

**Warning:** This deletes all saved results!

**Chrome:**
1. Press Ctrl+Shift+Delete
2. Select "All time"
3. Check "Cookies and site data"
4. Check "Cached images and files"
5. Click "Clear data"

**Firefox:**
1. Press Ctrl+Shift+Delete
2. Select "Everything"
3. Check all boxes
4. Click "Clear Now"

**Safari:**
1. Safari menu → Preferences → Privacy
2. Click "Manage Website Data"
3. Find BenefitFinder
4. Click "Remove"

### Checking Browser Storage

**Chrome:**
1. F12 (open DevTools)
2. Application tab
3. Storage section
4. See how much space used

**To check quota:**
- DevTools → Console
- Type: `navigator.storage.estimate()`
- Shows usage and available quota

### Reporting a Bug

**If something's really broken:**

1. **Note what happened:**
   - What were you trying to do?
   - What did you expect to happen?
   - What actually happened?
   - Any error messages?

2. **Note your setup:**
   - Device (iPhone, Android, Computer)
   - Browser (Chrome, Safari, Firefox)
   - Operating system version

3. **Try to reproduce:**
   - Can you make it happen again?
   - Does it happen every time?
   - Does it happen in different browser?

4. **Report:**
   - GitHub issues (if you know how)
   - Or tell community center staff
   - Or tell benefits counselor who recommended the tool

---

## When to Get Human Help

**Contact a benefits counselor if:**
- ❌ You can't figure out your household size
- ❌ You have complex income (self-employment, irregular)
- ❌ You have immigration questions
- ❌ You have disability considerations
- ❌ Your situation is unusual
- ❌ Results don't make sense

**Where to find help:**
- **211** - Free referral service (dial 2-1-1)
- **Local food bank** - Often have benefits counselors
- **Community center** - Resource navigators
- **Legal aid** - For complex situations
- **Benefits office** - Can answer program-specific questions

**BenefitFinder is a tool, not a replacement for expert help!**

---

## Still Having Problems?

### Emergency Contacts

**If you need help right now:**
- **Food**: Dial 211 → Ask for food banks
- **Health**: Emergency room (can't turn you away)
- **Crisis**: Crisis Text Line: Text HOME to 741741
- **Housing**: 211 → Ask for emergency shelter
- **Violence**: National Domestic Violence Hotline: 1-800-799-7233

### Feedback

**App not working as expected?**
- We want to know!
- Your feedback helps us improve
- Helps future users

**How to give feedback:**
- Through community centers
- Through NGO partners
- GitHub (if you know how)

---

## Prevention Tips

### To Avoid Problems

**Do:**
- ✅ Use updated browser
- ✅ Have stable internet for first visit
- ✅ Use regular (not private) mode if you want to save
- ✅ Allow cookies for functionality
- ✅ Save results if you want to keep them
- ✅ Export as backup

**Don't:**
- ❌ Close browser mid-screening without saving
- ❌ Use very old browsers (update if possible)
- ❌ Block all cookies (needed for functionality)
- ❌ Use public computers for saving sensitive data

---

## System Requirements

### Minimum Requirements

**Browser (any of these):**
- Chrome 90 or higher
- Firefox 88 or higher
- Safari 14 or higher
- Edge 90 or higher

**Device:**
- Smartphone from 2018 or newer
- Tablet from 2018 or newer
- Computer from 2015 or newer

**Operating System:**
- Android 8.0 or higher
- iOS 14.0 or higher
- Windows 10 or higher
- macOS 10.15 or higher

**Storage:**
- At least 50 MB free space
- More if saving many results

**Internet:**
- Required for first visit
- Optional after installation
- Works completely offline after first load

### Recommended Setup

**For best experience:**
- Recent browser (updated in last year)
- Stable internet for first visit
- At least 1 GB free storage
- Device from last 3-5 years

---

## Can't Find the Answer?

**Try these resources:**

1. **User Guide** (USER_GUIDE.md) - Complete how-to guide
2. **FAQ** (FAQ.md) - Common questions
3. **Privacy Guide** (PRIVACY_GUIDE.md) - Privacy questions

**Still need help?**
- Call your local benefits office
- Call 211 for community resources
- Visit a community center or library
- Ask a trusted friend or family member

---

## Remember

- Most problems are easy to fix!
- Try the simple solutions first
- Don't hesitate to get human help
- Your privacy is still protected even if you need help

**We're here to help you access the benefits you deserve!** ❤️

