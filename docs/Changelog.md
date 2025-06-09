# Changelog

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
