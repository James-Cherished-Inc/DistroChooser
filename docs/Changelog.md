# Changelog
## [2025-06-09, 21:02:00 (Europe/Madrid)] Documentation Update - Filter Logic
* Added a dedicated "Filter Logic" section to [`docs/DeveloperGuide.md`](docs/DeveloperGuide.md) explaining the detailed filter application flow, default behaviors, and priority handling.
* Included a Mermaid diagram in [`docs/MasterImplementationPlan.md`](docs/MasterImplementationPlan.md) to visualize the filter system architecture and its integration with the overall project.
### Files Modified:
- [`docs/DeveloperGuide.md`](docs/DeveloperGuide.md)
- [`docs/MasterImplementationPlan.md`](docs/MasterImplementationPlan.md)
- [`docs/Changelog.md`](docs/Changelog.md)
## [2025-06-09, 20:21:00 (Europe/Madrid)] Corrected Filter Logic
* Fixed bug where detailed attribute filters were applied even if the corresponding summary checkbox was not checked.
* Modified `filterDistros()` in [`script.js`](script.js) to ensure detailed attribute filters are only applied when the attribute's priority matches a checked summary filter (Non-Negotiable, Important, or Nice-to-Have).
### Files Modified:
- [`script.js`](script.js)
- [`docs/Changelog.md`](docs/Changelog.md)
## [2025-06-09, 20:07:00 (Europe/Madrid)] Revised Filter Logic Implementation
* Fixed bug where summary checkboxes did not correctly filter distributions based on individual attribute priorities and values.
* Refactored `filterDistros()` to first apply detailed attribute filters based on user-set values, then apply summary-level filters (Non-Negotiable, Important, Nice-to-Have) cumulatively.
* Ensured dynamic handling of all distributions from `data/distros`.
* Updated recommendation score recalculation, sorting, rendering, stats, and filter badges.
### Files Modified:
- [`script.js`](script.js)
- [`docs/Changelog.md`](docs/Changelog.md)

## [2025-06-09] Multiple Selection Enhancement
* Enabled multiple selections for both array and string attribute types
* Updated Tom Select dropdowns to support multi-select for most options

### Files Modified:
- [`script.js`](script.js)

## [2025-06-09] Tom Select Integration
* Replaced custom dropdowns with Tom Select library (v2.3.1)
* Improved accessibility and UX for parameter selection
* Added CDN links to Tom Select in index.html
* Modified renderValueControl and populateSelectOptions in script.js
* Added custom styles for Tom Select in styles.css
* Updated Developer Guide with integration details

### Files Modified:
- [`index.html`](index.html)
- [`script.js`](script.js)
- [`styles.css`](styles.css)
- [`docs/DeveloperGuide.md`](docs/DeveloperGuide.md)

## 2025-06-01, 02:04:11 (Europe/Madrid)
* Implemented core functionality of Linux distribution comparison tool
* Created initial project structure with HTML, CSS, and JavaScript files
* Developed interactive table with filtering and sorting capabilities
* Implemented data loading from mock dataset
* Added score calculation and visual representation of criteria
* Created initial implementation plan and database research documentation
* Completed Phase 1 (UI Foundation) and Phase 2 (Core Functionality) of implementation plan

### Files Modified:
- [`index.html`](index.html): Implemented table structure and filter controls
- [`styles.css`](styles.css): Added core styling for table and UI elements
- [`script.js`](script.js): Implemented DistroComparator class with filtering/sorting
- [`mockData.js`](mockData.js): Created sample dataset for development [now deleted]
- [`docs/ImplementationPlan.md`](docs/ImplementationPlan.md): Updated with completed tasks
- [`docs/DatabaseResearch.md`](docs/DatabaseResearch.md): Initial research notes

The Linux distribution comparison website has been successfully implemented with all core functionality:

1. **UI Foundation**:
   - Created project structure with proper file organization
   - Implemented HTML table structure with filter controls
   - Developed responsive CSS styling for optimal UX

2. **Core Functionality**:
   - Implemented data loading from mock dataset
   - Created dynamic table rendering with score calculation
   - Developed advanced filtering system based on criteria priorities
   - Built sorting mechanism for all columns
   - Added distribution elimination feature

3. **Documentation**:
   - Maintained detailed implementation plan
   - Created comprehensive changelog
   - Added database research documentation

The website is now functional with mock data. Users can:
- View distributions in a sortable table
- Filter by non-negotiable, important, and nice-to-have criteria
- See visual indicators for criteria satisfaction
- Eliminate distributions from view
- View detailed distribution information

---

## 2025-06-08, 01:54:15 pm (Europe/Madrid)
* Created a comprehensive `.gitignore` file to exclude unnecessary files from version control.

### Files Modified:
- [`docs/Changelog.md`](docs/Changelog.md): Added new entry for `.gitignore` creation.
- [`docs/DeveloperGuide.md`](docs/DeveloperGuide.md): Updated project structure to include `.gitignore`.
- [`.gitignore`](.gitignore): New file created.

The `.gitignore` file has been added to the project to ensure that temporary files, build artifacts, environment-specific configurations, and other non-essential files are not committed to the Git repository. This improves repository cleanliness and reduces potential conflicts.

---

## 09/06/2025, 12:57:00 am (Europe/Madrid)
* Implemented priority slider functionality for filter controls.
* Added sliders to filter settings in the UI, allowing selection of 5 priority levels.
* Styled sliders and labels for improved usability and visual appeal.

### Files Modified:
- [`index.html`](index.html): Added slider input elements and associated labels to filter controls.
- [`styles.css`](styles.css): Added CSS rules for styling the sliders and priority labels.
- [`script.js`](script.js): Implemented JavaScript logic for slider initialization, value handling, and updating filter state based on slider input.

The filter controls now feature interactive sliders for each setting, providing a more intuitive way to select priority levels. The visual styling highlights the active priority level.

---

## 09/06/2025, 12:43:38 pm (Europe/Madrid)
* Fixed bug where filter priorities (Non-Negotiable, Important, Nice-to-Have) were not correctly filtering distributions or updating the active filters display.

### Details:
- Enhanced the [`calculateScores`](script.js) function in [`script.js`](script.js) to correctly handle boolean criteria for scoring.
- Modified the [`filterDistros`](script.js) function in [`script.js`](script.js) to apply filtering based on the active priority levels (Non-Negotiable, Important, Nice-to-Have) by checking if a distribution's calculated score for that priority level is 100%.
- Confirmed that the [`updateActiveFilters`](script.js) function correctly displays the active priority badges.

### Files Modified:
- [`script.js`](script.js)

---

## 09/06/2025, 12:52:18 pm (Europe/Madrid)
* Fixed frontend display issues related to active filters and distribution count.

### Details:
- Selected priority filters were not displaying in the `.active-filters` div.
- The distribution count display ("Displaying 0 of 0 distributions") was not updating correctly and was positioned incorrectly.

### Changes Made:
- In [`script.js`](script.js), the [`updateStats`](script.js) function was refactored to target specific span elements (`#filtered-count` and `#total-count`) within the distribution count paragraph.
- In [`index.html`](index.html), the distribution count paragraph was moved to be immediately below the `.active-filters` div and updated to include the `#filtered-count` and `#total-count` span elements.
- Verified that filter change listeners correctly trigger the update of both active filters and the distribution count.

### Files Modified:
- [`script.js`](script.js)
- [`index.html`](index.html)

---

## 09/06/2025, 01:18:01 pm (Europe/Madrid)
* Implemented detailed filter badges and removed debug logs.

### Details:
- Modified the `updateActiveFilters` function in `script.js` to display badges for detailed filters that have been assigned a priority value other than "Don't care".
- Removed all `console.log`, `console.error`, and `console.warn` statements from `script.js`.

### Files Modified:
- [`script.js`](script.js)
- [`docs/Changelog.md`](docs/Changelog.md)

## [2025-06-09] "Based On" Filter Control
* Added a filter control for the "based_on" criteria in the Detailed Filters section.
* Ensured the filter functions as a multiple-choice selector, similar to other array filters.
* Updated `script.js` to correctly render and apply the "based_on" filter.

### Files Modified:
- [`script.js`](script.js)
- [`docs/Changelog.md`](docs/Changelog.md)
- [`docs/DeveloperGuide.md`](docs/DeveloperGuide.md)

## [09/06/2025] Recommendation Engine Plan Documentation

*   Created a detailed plan for the Recommendation Engine implementation.
*   Updated documentation files to reflect the new plan and project status.

### Files Modified:
- [`docs/RecommendationEnginePlan.md`](docs/RecommendationEnginePlan.md) (New File)
- [`docs/MasterImplementationPlan.md`](docs/MasterImplementationPlan.md)
- [`docs/DeveloperGuide.md`](docs/DeveloperGuide.md)
- [`docs/Changelog.md`](docs/Changelog.md)

## [09/06/2025, 6:50:00 pm] Recommendation Engine Implementation
* Implemented the Recommendation Engine scoring algorithm as per [RecommendationEnginePlan.md](docs/RecommendationEnginePlan.md)
* Added `calculateRecommendationScore()` method to `DistroComparator` class
* Modified `filterDistros()` to calculate recommendation scores
* Updated `sortDistros()` to include 'recommendationScore' as sortable key
* Updated project documentation to reflect implementation completion

### Files Modified:
- [`script.js`](script.js)
- [`docs/MasterImplementationPlan.md`](docs/MasterImplementationPlan.md)
- [`docs/DeveloperGuide.md`](docs/DeveloperGuide.md)
- [`docs/Changelog.md`](docs/Changelog.md)

## [09/06/2025, 7:02:47 pm] Fix Default Filter Settings
* Problem solved: Default filter settings were not neutral, causing unintended filtering and visibility issues with distributions.
* How decided: Based on user feedback indicating non-neutral defaults, code analysis revealed issues in renderValueControl and filterDistros methods. Changes were proposed and approved to set neutral defaults and correct priority handling.
* Implications: Ensures all distributions are visible by default, improving user experience by reducing bias and making the application more intuitive and user-friendly.
* What's been implemented: Set neutral default values for all filter types in renderValueControl (e.g., booleans to false, ranges to minimum/neutral values) and fixed the filterDistros method to properly handle 'Non-negotiable' priority by removing it from the skip condition.
* Changes made to code logic: Updated renderValueControl to initialize with neutral values and modified filterDistros to apply filtering correctly for 'Non-negotiable' priorities.

### Files Modified:
- [`script.js`](script.js)

## [09/06/2025, 8:37:00 pm (Europe/Madrid)] Add Reset Icon to Active Filters Badges
* Added a reset icon ("✕") to each active filter badge, allowing users to clear individual filter settings.
* Implemented the resetFilter function in script.js to reset the filter to its default state.
* Added CSS styling for the reset icon to improve visibility and usability.

### Files Modified:
- [`script.js`](script.js)
- [`styles.css`](styles.css)
- [`docs/Changelog.md`](docs/Changelog.md)

### 2025-06-09 - Filter Attribute Help Icons
* Added ? icons next to filter labels in detailed filter section
* Implemented hover text showing attribute descriptions
* Descriptions loaded from data/template_descriptions.json
* Added CSS styling for help icons
* Updated script.js to load descriptions and create tooltips

## [14/06/2025, 4:43:00 pm (Europe/Madrid)] Added Author Information Panel
* Implemented an expandable right panel for author information, including bio, donation link, and X follow widget.
* Added new CSS file for styling and modified index.html and script.js for functionality.
* Fixed variable redeclaration issue in script.js to ensure code integrity.

### Files Modified:
- [`index.html`](index.html)
- [`script.js`](script.js)
- [`author-panel.css`](author-panel.css) (New file created)

## [{{CURRENT_DATE}}, {{CURRENT_TIME}}] Implemented Session-Only Persistence
* Ensured application state (filters, eliminated distros) is not persisted between sessions.
* Created `SessionState.js` to explicitly prevent client-side storage.
* Added `beforeunload` event listener in `script.js` to clear state on page unload.
* Added ESLint rule to prevent accidental usage of `localStorage` and `sessionStorage`.
* Updated documentation to reflect session-only behavior.

### Files Modified:
- [`SessionState.js`](SessionState.js) (New file created)
- [`script.js`](script.js)
- [`.eslintrc.json`](.eslintrc.json) (New file created)
- [`README.md`](README.md)
- [`docs/Changelog.md`](docs/Changelog.md)
- [`docs/MasterImplementationPlan.md`](docs/MasterImplementationPlan.md)
- [`docs/DeveloperGuide.md`](docs/DeveloperGuide.md)
