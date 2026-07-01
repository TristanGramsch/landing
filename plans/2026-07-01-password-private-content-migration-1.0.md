# Password Functionality & Private Content Migration Plan

## Executive Summary

This plan outlines the migration of the AssessingAgents password gate to manage private content display. Currently, the page shows only public content. The goal is to conditionally display private content (from `private-assessing-agents.txt`) below the image only when the password is correctly entered.

**Current State**: 
- Password protection exists but only gates access to the entire page
- Extra content loading uses external URL parameters (unused in normal flow)
- Private file exists but is never loaded

**Target State**:
- Public content displays when page loads (password form overlays it)
- Private content loads and displays below image only after password unlock
- No external URL dependency for private content

---

## Architecture & Structural Changes

### 1. Content Management Architecture

**Current Flow**:
```
routes.js (template) → content.js (public content: assessingAgentsText) → UI
```

**New Flow**:
```
content.js (imports: assessingAgentsText + privateAssessingAgentsText)
  ↓
routes.js (template receives both public & private content)
  ↓
main.js (renders based on unlock state)
  ↓
UI (public always visible, private conditional)
```

### 2. File Structure Changes

**Files to create/modify**:
- ✏️ `src/content.js` - Add private content import
- ✏️ `src/routes.js` - Separate public and private content in template
- ✏️ `src/main.js` - Adjust loadAssessingAgentsExtraTxt logic
- ✔️ `src/content/private-assessing-agents.txt` - Already exists (update with actual content)
- ℹ️ `src/lib/assessingAgentsGate.js` - No changes needed (password logic already sufficient)
- ℹ️ `src/router.js` - No changes needed (routing logic sufficient)

### 3. Architectural Decisions

#### Decision 1: Content Import Strategy
**Approach**: Import private content as raw text in content.js via Vite's `?raw` import

**Rationale**: 
- Keeps all content parsing centralized
- Leverages existing import pattern
- Private content is static (no complex parsing needed)
- Eliminates runtime URL fetching complexity

**Alternatives Considered**:
1. Keep URL-based loading: More complex, requires parameter management
2. Lazy-load via fetch(): Adds network request, no benefit here
3. Direct import in routes.js: Violates separation of concerns

#### Decision 2: Template Structure
**Approach**: Render locked and unlocked templates as distinct complete views (no partial updates)

**Rationale**:
- Matches existing pattern (locked vs unlocked templates)
- Clean state management - no partial DOM updates
- Unlock action re-renders entire route
- Simplifies conditional rendering logic

**Alternative**: Swap only private content section - more complex, error-prone

#### Decision 3: Private Content Display Location
**Approach**: Below the image in `#assessing-agents-extra-txt` placeholder

**Rationale**:
- Reuses existing placeholder structure
- Visual flow: Article → Image → Private content
- Maintains document semantics
- Clean CSS (styles already exist for `.assessing-agents-extra-txt`)

---

## Implementation Plan

### Phase 1: Content Layer Setup

- [ ] **Update content.js to import private content**
  - Add: `import privateAssessingAgentsText from "./content/private-assessing-agents.txt?raw"`
  - Parse into structured format if needed (likely just paragraphs)
  - Export both `assessingAgentsText` and `privateAssessingAgentsText`
  - Rationale: Centralizes all content management, maintains Vite import pattern

- [ ] **Prepare private-assessing-agents.txt content**
  - Update placeholder with actual private discussion content
  - Follow same text format as other content files
  - Rationale: Private file exists but needs real content

### Phase 2: Template Layer Refactoring

- [ ] **Refactor assessingAgentsUnlockedTemplate in routes.js**
  - Import `privateAssessingAgentsText` from content.js
  - Split template logic: public content section + private content section
  - Public content: Show in `<pre class="anim-text">` (existing)
  - Private content: Show in `#assessing-agents-extra-txt` after image
  - Wrap private content in appropriate container for styling
  - Rationale: Separates concerns, allows conditional rendering

- [ ] **Update import statements in routes.js**
  - Change: `import { assessingAgentsText } from "./content.js"`
  - To: `import { assessingAgentsText, privateAssessingAgentsText } from "./content.js"`
  - Rationale: Get access to both public and private content

### Phase 3: Main Application Logic

- [ ] **Refactor loadAssessingAgentsExtraTxt in main.js**
  - Remove URL parameter checking logic (not needed for static private content)
  - Always display the image (preserve current behavior)
  - When unlocked: Display private content in `#assessing-agents-extra-txt`
  - When locked: Keep placeholder empty (image only)
  - Rationale: Simplifies the function, removes external dependency

- [ ] **Verify unlock flow in main.js**
  - When password is correct and form submitted:
    - `setAssessingAgentsUnlocked(true)` is called (existing)
    - `renderRoute(currentPath)` re-renders with unlocked template
    - `loadAssessingAgentsExtraTxt()` loads private content
  - No changes needed to existing unlock submission handler
  - Rationale: Existing flow already supports re-render on unlock

### Phase 4: Password Gate Verification

- [ ] **Verify assessingAgentsGate.js requires no changes**
  - Password logic is storage-based (sessionStorage + localStorage)
  - Unlock state persists across route changes
  - No modifications needed
  - Rationale: Existing implementation sufficient for new requirements

- [ ] **Verify router.js requires no changes**
  - Route registration already exists for `/sociological/assessing-agents`
  - Route handler dispatches to correct template
  - No routing logic changes needed
  - Rationale: Routing layer independent of content management

### Phase 5: Integration & Testing Points

- [ ] **Verify boot-time behavior**
  - Direct URL load to `/sociological/assessing-agents`:
    - Shows locked template initially (password required)
    - Image loads immediately
    - Loaded text animates when scrolled
  - Rationale: Test cold-start scenario

- [ ] **Verify unlock behavior**
  - Submit correct password:
    - Template switches to unlocked version
    - Public content displays
    - Private content loads below image
    - Scroll animation triggers
  - Rationale: Test primary unlock flow

- [ ] **Verify session persistence**
  - Unlock once, navigate to other route, return:
    - Should show unlocked template immediately
    - Private content loads without re-authenticating
  - Rationale: Test sessionStorage persistence

---

## Technical Details & Implementation Notes

### Content Import & Parsing

**Current pattern in content.js**:
```javascript
import assessingAgentsText from "./content/assessing-agents.txt?raw";
export { assessingAgentsText };
```

**New addition**:
```javascript
import privateAssessingAgentsText from "./content/private-assessing-agents.txt?raw";
export { privateAssessingAgentsText };
```

**Vite `?raw` import**: Loads file as raw text string at build time - efficient and clean.

### Template Updates

**Current assessingAgentsUnlockedTemplate structure**:
```html
<div id="assessing-agents-extra-txt" class="assessing-agents-extra-txt">
  <!-- Image loads here via loadAssessingAgentsExtraTxt() -->
</div>
```

**New structure**:
```html
<div id="assessing-agents-extra-txt" class="assessing-agents-extra-txt">
  <!-- Image loads here -->
  <!-- Private content appends here when unlocked -->
</div>
```

**No CSS changes needed** - existing `.assessing-agents-extra-txt` styles apply.

### Main.js Function Simplification

**Current loadAssessingAgentsExtraTxt**:
- Checks URL parameters
- Checks sessionStorage
- Fetches external URL if available
- Loads content dynamically

**Simplified version**:
- Always displays image
- When unlocked: Appends private content text
- No external URL fetching
- Static content only

---

## Verification Criteria

### Functional Requirements

- ✓ **Public content always displays**: assessing-agents.txt renders in `<pre>` tag
- ✓ **Image displays after public content**: 44 Hano image shows below article
- ✓ **Private content conditional**: Only displays when `isAssessingAgentsUnlocked() === true`
- ✓ **Password gate works**: Entering "justice" unlocks private content
- ✓ **Scroll animation applies**: Private content text animates on scroll
- ✓ **Session persistence**: Unlock state survives navigation and page refresh (sessionStorage + localStorage)

### Technical Requirements

- ✓ **No runtime errors**: Console clean on all pages
- ✓ **No external dependencies**: All content self-contained, no URL parameters
- ✓ **Existing styles apply**: Private content uses existing CSS classes
- ✓ **No breaking changes**: Other routes unaffected

### Content Structure

- ✓ **Private file readable**: private-assessing-agents.txt is valid UTF-8 text
- ✓ **Content flows logically**: Public → Image → Private reading order makes sense

---

## Potential Risks & Mitigations

### Risk 1: Content Import Timing
**Problem**: Private content import could fail silently if file is empty or malformed

**Mitigation**: 
- Add error handling in content.js for both imports
- Provide fallback placeholder text if import fails
- Console.warn() if content is missing (dev-time visibility)

### Risk 2: Re-render Performance
**Problem**: Full template re-render on unlock might cause visual jank

**Mitigation**:
- Current approach already re-renders route on unlock (no change)
- Animation.js handles scroll-triggered effects (no blocking)
- If performance issues arise, can implement partial DOM updates later

### Risk 3: Scroll Animation on Private Content
**Problem**: Private content might not animate if setupScrollTextRerender is not called

**Mitigation**:
- `setupScrollTextRerender({ appEl: app })` already called in main.js after unlock
- Private content gets `.anim-text` class (triggers animation)
- Test scroll behavior with browser DevTools

### Risk 4: sessionStorage/localStorage Limits
**Problem**: Private content might be large, but not stored (only checked for unlock state)

**Mitigation**:
- Not an issue - unlock state is tiny ("1" or removed), not content
- Private content stays in memory only
- No storage size constraints

---

## Alternative Approaches

### Alternative 1: URL-Based Private Content Loading
**Approach**: Keep external URL parameter system, but default to internal private file

**Pros**: 
- More flexible for future external content
- Backwards compatible with URL injection

**Cons**:
- More complex logic
- Static private content doesn't need this flexibility
- Adds unnecessary conditional checks

**Recommendation**: Not recommended unless flexibility needed

### Alternative 2: Separate Locked/Unlocked Content Files
**Approach**: Instead of conditional display, serve entirely different routes

**Pros**:
- Cleaner separation of concerns
- Each route fully self-contained

**Cons**:
- Duplicates public content in unlocked version
- Requires new route registration
- More files to maintain

**Recommendation**: Not recommended; existing conditional pattern is cleaner

### Alternative 3: Server-Side Password Verification
**Approach**: Move password to backend API with proper cryptography

**Pros**:
- True security (current client-side is obfuscation only)
- Server-side session management

**Cons**:
- No backend infrastructure currently
- Increases complexity significantly
- Overkill for privacy-by-convention content

**Recommendation**: Not recommended for this use case; current client-side approach fine per README.txt ("privacy-by-convention, not cryptographic")

---

## Deployment & Testing Checklist

### Pre-Deployment Testing
- [ ] **Content loads**: Both public and private import without errors
- [ ] **Locked state**: Password form displays on direct URL load
- [ ] **Unlock flow**: Password "justice" correctly unlocks private content
- [ ] **Animation**: Scroll-triggered text scrambling works on private content
- [ ] **Cross-browser**: Test in Chrome, Firefox, Safari
- [ ] **Mobile**: Test on iOS/Android (if responsive design applies)
- [ ] **Session restore**: Lock browser, reopen tab, should show unlocked (if recent)

### Post-Deployment Verification
- [ ] **No console errors**: Check DevTools on all paths
- [ ] **Analytics tracking**: Pageview events still fire
- [ ] **Performance**: No observable lag on unlock or scroll
- [ ] **Accessibility**: Content navigable with keyboard, screen readers

---

## Summary

This migration modernizes the password functionality from a page-access gate to a content-visibility gate. The implementation is straightforward because:

1. Password logic already exists and is battle-tested
2. Content management pattern is established (Vite imports)
3. Template structure supports conditional rendering
4. No new external dependencies needed
5. Existing CSS handles new content display

The main changes are in `content.js` (add import), `routes.js` (separate content sections), and `main.js` (simplify extra content loading). All changes are non-breaking and preserve existing functionality.

**Estimated Implementation Complexity**: Medium
- Low architectural risk (patterns already established)
- Moderate code changes (3-4 files affected)
- Clear testing path (unlock behavior is critical)

**Target Result**: Seamless integration of password-protected private content below public AssessingAgents article and image.