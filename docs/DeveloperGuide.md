# Linux Distribution Comparison Tool - Developer Guide

This guide provides technical details and insights into the architecture and implementation of the Linux Distribution Comparison Tool.

## Table of Contents
- [Project Structure](#project-structure)
- [Data Loading and Structure](#data-loading-and-structure)
  - [File Roles](#file-roles)
  - [Runtime Behavior](#runtime-behavior)
  - [Why Distributed Design?](#why-distributed-design)
- [Data Structure and Mapping](#data-structure-and-mapping)
- [Tom Select Integration](#tom-select-integration)
- [Filter Logic](#filter-logic)
  - [Core Principles](#core-principles)
  - [Detailed Filter Application Flow (`filterDistros()` method)](#detailed-filter-application-flow-filterdistros-method)
  - [Default Behaviors and Priority Handling](#default-behaviors-and-priority-handling)
  - [Example Scenarios](#example-scenarios)
  - [Active Filter Badges](#active-filter-badges)
- [Recommendation Scoring Algorithm](#recommendation-scoring-algorithm)
- [Manually Added Distros](#manually-added-distros)
- [Core Logic (`script.js`)](#core-logic-scriptjs)
- [Component Interaction Diagram](#component-interaction-diagram)
- [Session State Management](#session-state-management)
- [Recommendation Engine](#recommendation-engine)

## Project Structure

The project follows a simple structure:

*   `/`: The root directory contains the main `index.html` file.
*   `/data`: This directory stores data files, including the distribution data in JSON format and documentation related to data collection.
  *   `data/template.json5`: Template file outlining the structure and criteria for each distribution's data.
  *   `data/distros/`: Directory containing individual JSON files for each distribution.
  *   `data/docs/`: Contains documentation related to the data, such as research notes and task prompts.
*   `/docs`: This directory contains project documentation, including the Master Implementation Plan, Changelog, and this Developer Guide.
  *   `docs/Changelog.md`: Records notable changes and updates to the project.
  *   `docs/MasterImplementationPlan.md`: Outlines the overall project plan and progress.
  *   `docs/Prompt.md`: Contains the initial detailed prompt for the project.
  *   `docs/TaskPlan.md`: (Will be created for the current documentation task)
*   `/scripts`: This directory is intended for any utility scripts.
*   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
*   `index.html`: The main HTML file that structures the web page and includes the CSS and JavaScript files.
*   `styles.css`: Contains the CSS rules for styling the web application.
*   `script.js`: Contains the core JavaScript logic for data handling, filtering, sorting, and rendering the interactive table.

## Data Loading and Structure

The project's data management is designed for modularity, extensibility, and ease of contribution, ensuring that the Linux distribution information can be updated incrementally without disrupting the overall application.

### File Roles
- **Individual JSON Files (`data/distros/perplexity-verified/*.json`)**: Each file represents a single Linux distribution, containing structured attributes such as system requirements, security ratings, and usability scores. This modular approach allows contributors to focus on one distribution at a time, submit targeted pull requests, and maintain data freshness without recompiling the entire dataset. For example, `alpine-linux.json` holds all details for Alpine Linux, adhering strictly to the schema defined in `data/template.json5` (no comments allowed in final JSONs).
- **`data/distros/index.md`**: Serves as a human-readable reference catalog listing all available distributions. It is not used for runtime data loading but is essential for contributors to check existing entries, avoid duplicates, and update the overview when adding new distributions. This file acts as a lightweight manifest, facilitating community-driven expansions.
- **`data/template.json5`**: Defines the comprehensive schema for distribution data, including attribute types (e.g., boolean for `secure_boot`, number scales 1-10 for `beginner_friendliness`, arrays for `desktop_environments`). JSON5 format was chosen for its support of comments and unquoted keys, making it more readable during development. The final JSON files exported from this template must be comment-free for compatibility.

### Runtime Behavior
Data loading occurs asynchronously during application initialization in the `DistroComparator` class within [`script.js`](script.js:419-502). The `loadDistrosFromJSON()` method uses a hardcoded array of filenames (lines 421-477) to fetch each file from the `data/distros/perplexity-verified/` subdirectory via `fetch()` and `Promise.all()` for concurrent loading:

```javascript
// Excerpt from loadDistrosFromJSON() in script.js
const distroFiles = [
  'alpine-linux.json',
  'archlinux.json',
  // ... (approximately 50 more filenames)
];

const distroPromises = distroFiles.map(file =>
  fetch(`data/distros/perplexity-verified/${file}`).then(res => res.json())
);

this.allDistros = await Promise.all(distroPromises).then(results => {
  return results;
}).catch(error => {
  console.error('Error loading distro data:', error);
  return [];
});
```

This populates `this.allDistros` as an array of distribution objects, which is then used for filtering (`filterDistros()`), scoring (`calculateScores()` and `calculateRecommendationScore()`), and rendering (`renderTable()`). The `perplexity-verified` subdirectory indicates curated, verified data (e.g., cross-checked via AI tools like Perplexity for accuracy). Errors are logged to console, ensuring graceful degradation if individual files fail.

For visualization of the data flow:

```mermaid
graph TD
    A[DOMContentLoaded Event] --> B[loadDistrosFromJSON() in script.js]
    B --> C[Hardcoded Filename Array]
    C --> D[Async Fetch: data/distros/perplexity-verified/*.json]
    D --> E[Parse JSONs into allDistros Array]
    E --> F[Apply Filters & Calculate Scores]
    F --> G[Render Interactive Table]
    H[data/distros/index.md] -.->|Reference for Contributors| C
    I[scripts/compile_distros.py] -.->|Build-Time Alternative| J[Single File: data/distributions.json]
    J -.->|Potential Future Load| B
```

### Why Distributed Design?
The distributed structure (one JSON per distro) prioritizes ease of contributions: Developers or community members can research, verify, and submit data for a single entry without touching others, aligning with the project's open-source ethos. It also supports incremental growth as the database expands. However, for performance in larger datasets, a build-time compilation script is provided at [`scripts/compile_distros.py`](scripts/compile_distros.py), which merges all JSONs into a single `data/distributions.json`. This utility is currently unused but offers a path to reducing HTTP requests—future iterations could integrate it for production builds, with dynamic loading from the compiled file instead of individual fetches.

## Data Structure and Mapping

The distribution data is stored in JSON files within the `data/distros/` directory, following the structure defined in `data/template.json5`. Each JSON file represents a single Linux distribution.

*   **Distros as Rows:** In the interactive table, each distribution object from the JSON data corresponds to a row (`<tr>`).
*   **Criteria as Columns:** The attributes within each distribution's JSON object (e.g., `secure_boot`, `gui_customization`, `ram_requirements_minimum`) represent the criteria, which are displayed as columns (`<td>`) in the table.
*   **Values as Cells:** The values associated with each criterion attribute in the JSON (e.g., `true`, `8`, `"2GB"`) are the data points displayed in the individual table cells.

The `data/template.json5` file is crucial for understanding the available criteria and their expected data types and scales (boolean, number, 1-10 score, string, array).

## Tom Select Integration

We've replaced the custom dropdown implementation with Tom Select (v2.3.1) to improve UX and accessibility. Tom Select is a lightweight (16KB gzipped), framework-agnostic library that evolved from Selectize.js, offering intelligent search, multi-select, and tagging capabilities without jQuery dependencies. It was chosen for its performance with large datasets (handles 15,000+ items efficiently via Sifter scoring), active maintenance (v2.4.3 as latest), and strong ARIA/keyboard support, aligning with the project's accessible, vanilla JS stack.

### Technical Choices and Features
- **Core Functionality**: Supports diacritic-insensitive search across multiple fields, caret positioning between selections, and multi-item deletion via Ctrl/Cmd. For array/string attributes, it enables OR logic in filtering (distro matches if any selected value is present).
- **Performance Optimizations**: Uses modular builds (base vs. complete); dynamic option loading recommended for scalability. In this project, options are populated from unique values in `allDistros` via `populateSelectOptions()`, limiting to maxOptions=56 for quick rendering.
- **Accessibility**: Built-in ARIA roles and keyboard nav (arrows, Enter, Escape); however, screen readers may not announce collapsed selections—mitigated by custom focus management in event listeners. Tested cross-browser, with Safari input focus workarounds via CSS.
- **Customization**: Themed via CSS classes; here, integrated with project styles for consistency (e.g., dropdown matches filter panel). Plugins like 'clear_button' added for UX.

### Key Integration Points and Code Logic
* CDN links added to [`index.html`](index.html) for simplicity (no build step needed).
* In [`script.js`](script.js), `renderValueControl()` creates `<select multiple class="tom-select">` for array/string types.
* `populateSelectOptions()` clears options, adds unique values from `allDistros`, then initializes: `new TomSelect(select, {placeholder: 'Select option...', allowEmptyOption: true, plugins: ['clear_button']})`.
* Event handling: 'change' listener on TomSelect instance triggers `debouncedFilterDistros()`, using `tomselect.getValue()` for array of selected values in filtering (some() for OR match).
* Risks Mitigated: Potential styling conflicts addressed with specific selectors; performance monitored—no regressions in filter speed. Alternatives like Choices.js considered but rejected for Tom Select's plugin ecosystem and community support.

This integration enhances multi-select filters for attributes like `desktop_environments` or `package_manager`, making criteria selection intuitive while maintaining lightweight load times.

## Filter Logic
 
The filtering mechanism in `script.js` has been significantly enhanced to provide precise control over distribution visibility based on user-defined priorities and values. This section details the logic, default behaviors, and priority handling.
 
### Core Principles
 
1.  **Initial State**: The filtering process always begins with all distributions loaded into the system, excluding only those manually eliminated by the user.
2.  **Detailed Attribute Filtering**: Filters applied via individual attribute controls (sliders, checkboxes, multi-selects) are only active if their corresponding priority level's summary checkbox is also checked.
3.  **Summary Checkbox Control**: The three summary checkboxes (Non-Negotiable, Important, Nice-to-Have) act as master switches for their respective priority levels. If a summary checkbox is *unchecked*, no filters associated with that priority level will be applied, regardless of individual attribute settings.
4.  **Cumulative Filtering**: When multiple summary checkboxes are checked, the filters are applied cumulatively, narrowing the list of distributions further.
 
### Detailed Filter Application Flow (`filterDistros()` method)

The `filterDistros()` method in `script.js` executes the filtering in the following order, using dynamic value controls based on attribute types from `data/template.json5`:

1.  **Eliminated Distributions**: Removes any distributions that the user has explicitly eliminated from the comparison.
2.  **Attribute-Specific Filtering**: Iterates through each detailed filter attribute (e.g., "Secure Boot", "RAM Requirements Minimum", "Desktop Environments"). For each attribute:
    *   It determines the user's selected value (e.g., `true` for a boolean switch, `8GB` for a RAM slider, `GNOME, KDE` for desktop environments).
    *   It checks the attribute's assigned priority level (Non-Negotiable, Important, Nice-to-Have) via its active priority button.
    *   **Crucially**, it then checks if the *corresponding summary checkbox* for that priority level is currently checked.
    *   **Only if** the summary checkbox is checked *and* the attribute's value control is set to an "active" (non-default/non-neutral) state, the filter for that specific attribute is applied to the list of distributions.
        *   **Boolean Attributes**: Custom UI switch (`<div class="custom-switch">`) toggles true/false; filtered if "on" AND summary checked.
        *   **Number/Scale Attributes**: Range slider (`<input type="range" class="control-range-slider">` with noUiSlider) for min-max; filtered if range != default (e.g., >min) AND summary checked, using >= min && <= max logic.
        *   **Array/String Attributes (Tom Select)**: Multi-select (`<select multiple class="tom-select">`); filtered if selections present AND summary checked, using some() for OR match (any selected value in distro's array).
        *   **General Strings (name, description, website)**: No value control; only preference slider for priority, no content-based filtering.
3.  **Recommendation Score Calculation**: After all detailed and summary filters are applied, the `calculateRecommendationScore()` method is called for each remaining distribution. This score is used for sorting and reflects how well a distro matches the user's 'Nice-to-Have' and 'Important' criteria.

Value controls are dynamically rendered in `renderFilterControls()` based on type (from template.json5), placed in category placeholders (e.g., "System Requirements" for RAM/CPU). HTML structure per attribute: `<div class="filter-attribute" data-attribute="name" data-type="type">` with label, preference slider (`<input type="range" min="0" max="4" value="1">`), and value control placeholder.

Filtering uses cumulative AND across priorities: Detailed first (value-based), then summary checkboxes apply group filters on the result. Mermaid diagram for logic:

```mermaid
graph TD
    A[Start with All Distros] --> B{Eliminate Manually Hidden Distros};
    B --> C[Initial Filterable List];

    subgraph Detailed Attribute Filtering
        C --> D{For each attribute (e.g., Secure Boot, RAM)}
        D -- User sets value (e.g., Yes, >=8GB) and Priority (e.g., Important) --> E[Apply Value Filter based on user input];
        E --> F[List filtered by detailed values];
    end

    F --> G{Non-Negotiable Summary Checkbox Checked?};
    G -- Yes --> H{Filter `valueFilteredList`: Distro must meet ALL criteria user marked "Non-negotiable" with their set values};
    G -- No --> I[List remains as is];
    H --> I;

    I --> J{Important Summary Checkbox Checked?};
    J -- Yes --> K{Filter Current List: Distro must meet ALL criteria user marked "Important" with their set values};
    J -- No --> L[List remains as is];
    K --> L;

    L --> M{Nice-to-Have Summary Checkbox Checked?};
    M -- Yes --> N{Filter Current List: Distro must meet ALL criteria user marked "Nice-to-Have" with their set values};
    M -- No --> O[List remains as is];
    N --> O;

    O --> P[Final Filtered List for Display];
```

This ensures precise, type-specific filtering while maintaining modularity for new attributes.
 
### Default Behaviors and Priority Handling
 
*   **Default Filter State**: By default, all detailed attribute controls are set to a "neutral" or "don't care" state (e.g., boolean switches are "off", range sliders are at their minimum, Tom Selects have no options selected). This ensures that, when all summary checkboxes are unchecked, all distributions are visible (except eliminated ones).
*   **Priority Buttons**: The individual priority buttons for each attribute (Not important, Don't care, Nice-to-have, Important, Non-negotiable) determine the *level* of importance the user assigns to that attribute. This priority, combined with the state of the summary checkboxes, dictates whether the attribute's specific value filter is applied.
*   **Summary Checkboxes**:
    *   **Unchecked**: If a summary checkbox (e.g., "Show only distributions meeting IMPORTANT criteria") is unchecked, *no* attributes marked with that priority level will be used to filter the list, regardless of their individual value settings. This allows for broader results.
    *   **Checked**: If a summary checkbox is checked, then *all* attributes marked with that priority level *and* their active value settings must be met by a distribution for it to remain in the filtered list.
 
### Example Scenarios
 
Let's consider the 8 possible combinations of the summary checkboxes:
 
1.  **NN unchecked, I unchecked, NTH unchecked**:
    *   **Behavior**: Only detailed attribute filters that are *not* tied to any priority (e.g., if a future "always apply" filter type is introduced) would apply. Currently, this means *no* detailed attribute filters are applied, and all non-eliminated distributions are shown.
    *   **Result**: Shows the maximum number of distributions (all non-eliminated).
 
2.  **NN checked, I unchecked, NTH unchecked**:
    *   **Behavior**: Detailed attribute filters for attributes marked "Non-negotiable" (priority 4) are applied. Other detailed filters (Important, Nice-to-Have) are ignored.
    *   **Result**: Distributions must pass all active "Non-negotiable" criteria.
 
3.  **NN unchecked, I checked, NTH unchecked**:
    *   **Behavior**: Detailed attribute filters for attributes marked "Important" (priority 3) are applied. Other detailed filters (Non-negotiable, Nice-to-Have) are ignored.
    *   **Result**: Distributions must pass all active "Important" criteria.
 
4.  **NN unchecked, I unchecked, NTH checked**:
    *   **Behavior**: Detailed attribute filters for attributes marked "Nice-to-Have" (priority 2) are applied. Other detailed filters (Non-negotiable, Important) are ignored.
    *   **Result**: Distributions must pass all active "Nice-to-Have" criteria.
 
5.  **NN checked, I checked, NTH unchecked**:
    *   **Behavior**: Detailed attribute filters for attributes marked "Non-negotiable" (priority 4) are applied, AND detailed attribute filters for attributes marked "Important" (priority 3) are applied. Nice-to-Have filters are ignored.
    *   **Result**: Distributions must pass all active "Non-negotiable" AND all active "Important" criteria.
 
6.  **NN checked, I unchecked, NTH checked**:
    *   **Behavior**: Detailed attribute filters for attributes marked "Non-negotiable" (priority 4) are applied, AND detailed attribute filters for attributes marked "Nice-to-Have" (priority 2) are applied. Important filters are ignored.
    *   **Result**: Distributions must pass all active "Non-negotiable" AND all active "Nice-to-Have" criteria.
 
7.  **NN unchecked, I checked, NTH checked**:
    *   **Behavior**: Detailed attribute filters for attributes marked "Important" (priority 3) are applied, AND detailed attribute filters for attributes marked "Nice-to-Have" (priority 2) are applied. Non-negotiable filters are ignored.
    *   **Result**: Distributions must pass all active "Important" AND all active "Nice-to-Have" criteria.
 
8.  **NN checked, I checked, NTH checked**:
    *   **Behavior**: Detailed attribute filters for attributes marked "Non-negotiable" (priority 4), "Important" (priority 3), AND "Nice-to-Have" (priority 2) are all applied.
    *   **Result**: Distributions must pass all active criteria across all three priority levels.
 
This comprehensive approach ensures that the filtering system is both powerful and intuitive, allowing users to precisely define their desired Linux distribution characteristics.
 
### Active Filter Badges
 
The `updateActiveFilters()` method displays badges for all active attribute-specific filters, providing clear visual feedback to the user about the applied criteria. Badges are shown for:
 
*   Attributes with a priority set to anything other than "Don't care".
*   Attributes with an active value filter (e.g., a boolean switch is "on", a range slider is not at its minimum, or a multi-select has chosen options).
 
Each badge includes a reset icon, allowing users to quickly revert individual attribute filters to their default "Don't care" state.
 
## Recommendation Scoring Algorithm
 
The Recommendation Engine calculates a score for each distribution based on how well it matches the user's "Nice-to-Have" and "Important" criteria. The algorithm:
 
1. For each filter attribute:
    - Skips "Don't Care" and "Non-negotiable" priorities
    - For "Nice-to-Have" and "Important":
        * Calculates attribute match score (0-1) based on data type
        * Applies priority weight (Nice-to-Have=1, Important=2)
        * Adds weighted score to total
2. Normalizes total score to 0-100 range
3. Stores score as `distro.recommendationScore`
 
The scores are used to sort distributions, with higher scores appearing first.

## Manually Added Distros
To allow comparison of filtered-out distros, the "Re-add a filtered out Distro" feature uses a TomSelect dropdown above the table. Selecting a distro (exact match from allDistros) triggers addDistro, which unshifts the name to the addedDistros array (for insertion order).

- **Integration in filterDistros()**: After detailed and summary filters produce 'list', prepends addedList (fetched from allDistros, excluding eliminated, with recalculated recommendationScore using current filters for accurate comparison). Ensures added appear at top, bypassing filters.
- **Sorting Priority in sortDistros()**: Before normal sort, prioritizes all addedDistros (isAdded check) to keep them at top regardless of sortBy; within added/non-added, applies standard logic (e.g., descending scores).
- **Rendering in renderTable()**: For each row, if distro.name in addedDistros, adds 'added-row' class for light highlight (CSS: background #f0f8ff, border-left blue).
- **Elimination Handling in eliminateDistro()**: If in addedDistros, filters it out before adding to eliminatedSet; triggers re-filter.
- **UI Trigger**: In DOMContentLoaded setTimeout after renderFilterControls, appends flex container to #distributions before #table-container; initializes TomSelect with allDistros options (max 56), single-select, onChange extracts name (handles array/single), calls addDistro, clears select.
- **Persistence**: Session-only via in-memory array; clears on reload. No duplicates; shows notification if already added/eliminated/not found.
- **Decisions**: Array over Set for order (unshift latest to top); exact match for simplicity (no fuzzy); full recalc for scores to reflect current filters; highlight for visibility.

This integrates seamlessly with existing logic, enabling temporary re-addition for comparison without altering core filtering.
 
## Core Logic (`script.js`)
 
The main functionality of the interactive table is handled by the `DistroComparator` class in `script.js`. Key aspects of the logic include:
 
*   **Data Loading:** The class is responsible for loading the distribution data from the JSON files.
*   **Score Calculation:** It calculates overall and category-specific scores for each distribution based on the values of the criteria.
*   **Filtering:** Implements the logic to filter distributions based on the selected criteria priorities. To enhance reusability and styling, CSS classes have been added to the control elements in the renderValueControl function in script.js. These classes (e.g., 'control-number', 'control-scale', 'control-boolean', 'control-array') allow for targeted CSS styling, improving the appearance and user experience of the filter controls. This change ensures that each type of control can be styled consistently and efficiently without duplicating code. The update was made to support the task of creating reusable, well-styled components for different control types as defined in data/template.json5.
*   **Sorting:** Provides methods to sort the filtered distributions based on different criteria or calculated scores.
*   **Table Rendering:** Dynamically generates the HTML table rows and cells based on the filtered and sorted data, including visual indicators (emojis, color coding) and action buttons.
*   **Event Handling:** Manages user interactions such as clicking filter checkboxes, column headers for sorting, and action buttons (Eliminate, Details).
 
## Component Interaction Diagram
 
The following Mermaid diagram illustrates the interaction between the main components:
 
```mermaid
graph TD
    A[index.html] --> B(script.js);
    B --> C{DistroComparator Class};
    C --> D[data/distros/*.json];
    C --> E[styles.css];
    E --> A;
    D --> C;
    C --> F[Interactive Table (in index.html)];
    F --> C;
    F --> G[Filter Controls (in index.html)];
    G --> C;
    F --> H[Action Buttons (Eliminate, Details)];
    H --> C;
    C --> I[Details Modal (in index.html)];
    I --> F;
```
 
**Explanation:**
 
*   `index.html` is the main entry point, structuring the page and displaying the table and controls.
*   `script.js` contains the `DistroComparator` class, which is the central logic unit.
*   The `DistroComparator` class loads data from the JSON files (`data/distros/*.json`).
*   `styles.css` provides the styling for the HTML elements.
*   The `DistroComparator` class interacts with the Interactive Table and Filter Controls in `index.html` to display data and respond to user input.
*   Action Buttons within the table trigger methods in the `DistroComparator` class.
*   The `DistroComparator` class can display a Details Modal in `index.html` with more information.
 
This diagram provides a high-level overview of how the different parts of the application work together.
 
## Recommendation Engine
 
A detailed plan for the Recommendation Engine implementation has been created. This engine will calculate a weighted score for each distribution based on user-defined filter priorities ("Nice-to-Have" and "Important") and the degree to which a distribution matches the selected criteria values. Distributions that do not meet "Non-negotiable" criteria will be excluded.
 
The detailed plan can be found in [`docs/RecommendationEnginePlan.md`](docs/RecommendationEnginePlan.md). This section will be updated with implementation details once the engine is built.

## Recommendation Scoring Algorithm
The Recommendation Engine calculates a score for each distribution based on how well it matches the user's "Nice-to-Have" and "Important" criteria. The algorithm:

1. For each filter attribute:
   - Skips "Don't Care" and "Non-negotiable" priorities
   - For "Nice-to-Have" and "Important":
     * Calculates attribute match score (0-1) based on data type
     * Applies priority weight (Nice-to-Have=1, Important=2)
     * Adds weighted score to total
2. Normalizes total score to 0-100 range
3. Stores score as `distro.recommendationScore`

The scores are used to sort distributions, with higher scores appearing first.

## Core Logic (`script.js`)

The main functionality of the interactive table is handled by the `DistroComparator` class in `script.js`. Key aspects of the logic include:

*   **Data Loading:** The class is responsible for loading the distribution data from the JSON files.
*   **Score Calculation:** It calculates overall and category-specific scores for each distribution based on the values of the criteria.
*   **Filtering:** Implements the logic to filter distributions based on the selected criteria priorities. To enhance reusability and styling, CSS classes have been added to the control elements in the renderValueControl function in script.js. These classes (e.g., 'control-number', 'control-scale', 'control-boolean', 'control-array') allow for targeted CSS styling, improving the appearance and user experience of the filter controls. This change ensures that each type of control can be styled consistently and efficiently without duplicating code. The update was made to support the task of creating reusable, well-styled components for different control types as defined in data/template.json5.
*   **Sorting:** Provides methods to sort the filtered distributions based on different criteria or calculated scores.
*   **Table Rendering:** Dynamically generates the HTML table rows and cells based on the filtered and sorted data, including visual indicators (emojis, color coding) and action buttons.
*   **Event Handling:** Manages user interactions such as clicking filter checkboxes, column headers for sorting, and action buttons (Eliminate, Details).

## Component Interaction Diagram

The following Mermaid diagram illustrates the interaction between the main components:

```mermaid
graph TD
    A[index.html] --> B(script.js);
    B --> C{DistroComparator Class};
    C --> D[data/distros/*.json];
    C --> E[styles.css];
    E --> A;
    D --> C;
    C --> F[Interactive Table (in index.html)];
    F --> C;
    F --> G[Filter Controls (in index.html)];
    G --> C;
    F --> H[Action Buttons (Eliminate, Details)];
    H --> C;
    C --> I[Details Modal (in index.html)];
    I --> F;
```

**Explanation:**

*   `index.html` is the main entry point, structuring the page and displaying the table and controls.
*   `script.js` contains the `DistroComparator` class, which is the central logic unit.
*   The `DistroComparator` class loads data from the JSON files (`data/distros/*.json`).
*   `styles.css` provides the styling for the HTML elements.
*   The `DistroComparator` class interacts with the Interactive Table and Filter Controls in `index.html` to display data and respond to user input.
*   Action Buttons within the table trigger methods in the `DistroComparator` class.
*   The `DistroComparator` class can display a Details Modal in `index.html` with more information.

This diagram provides a high-level overview of how the different parts of the application work together.

## Session State Management
* Implemented session-only persistence for application state
* Created `SessionState.js` to explicitly prevent client-side storage
* Added `beforeunload` event listener in `script.js` to clear state on page unload
* Added ESLint rule to prevent accidental usage of `localStorage` and `sessionStorage`
* Updated documentation to reflect session-only behavior

## Recommendation Engine

A detailed plan for the Recommendation Engine implementation has been created. This engine will calculate a weighted score for each distribution based on user-defined filter priorities ("Nice-to-Have" and "Important") and the degree to which a distribution matches the selected criteria values. Distributions that do not meet "Non-negotiable" criteria will be excluded.

The detailed plan can be found in [`docs/RecommendationEnginePlan.md`](docs/RecommendationEnginePlan.md). This section will be updated with implementation details once the engine is built.


# Master Implementation Plan

# Linux Distribution Comparison Tool - Master Implementation Plan

This document outlines the overall plan and progress for the Linux Distribution Comparison Tool project.

## Project Goals (Tree Structure)

The project aims to provide a comprehensive tool for users to choose a Linux distribution. The high-level goals are structured as follows:

*   **Phase 1: UI Foundation (Completed)**
    *   Project Structure
    *   HTML Skeleton
    *   Core CSS Styling
    *   JavaScript Application Skeleton

*   **Phase 2: Core Functionality (Completed)**
    *   Data Loading
    *   Table Rendering
    *   Filtering System
    *   Sorting Mechanism
    *   **Filter System Architecture (See Diagram Below)**

*   **Phase 3: Advanced Features (In Progress)**
    *   Export/Import Functionality
    *   Recommendation Engine (Plan Complete - See [`docs/RecommendationEnginePlan.md`](docs/RecommendationEnginePlan.md))
    *   Add Filtered Distro Feature: Allows users to re-add a filtered-out distro via TomSelect dropdown for comparison; uses exact matching, prepends to table top with recalculated scores, highlights row, full actions; session-only persistence. Chosen for simplicity and UX consistency with existing filters.
    *   Accessibility Features
    *   Performance Optimizations
    *   Improve Mobile Responsiveness
    *   Expand Test Coverage

*   **Future Phases**
    *   Database Integration (Connect to DistroWatch API)
    *   User Accounts to Save Preferences
    *   Machine Learning Recommendation Engine
    *   Mobile App Version
    *   Social Sharing Features

## Implementation Progress

### Phase 1: UI Foundation
- [x] Create project structure
- [x] Implement HTML skeleton
- [x] Develop core CSS styling
- [x] Create JavaScript application skeleton

### Phase 2: Core Functionality
- [x] Implement data loading
- [x] Develop table rendering
- [x] Create filtering system
- [x] Build sorting mechanism

### Phase 3: Advanced Features
- [x] Implement priority sliders for filter controls
- [ ] Export/import functionality
- [x] Recommendation engine
- [x] Author Information Panel
- [ ] Accessibility features
- [x] Performance optimizations - Implemented session-only persistence to improve privacy and reduce storage overhead
- [ ] Improve mobile responsiveness
- [ ] Expand test coverage

## Filter System Architecture
 
The filter system is a critical component for user interaction and data exploration. Its architecture ensures a logical and cumulative application of criteria.
 
```mermaid
graph TD
    A[All Distributions] --> B{Eliminate Manually Hidden};
    B --> C[Initial Filterable List];
 
    subgraph Detailed Attribute Filtering
        C --> D{For each Filter Attribute};
        D -- Get User Value & Priority --> E{Is Corresponding Summary Checkbox Checked?};
        E -- Yes & Value Active --> F[Apply Attribute Filter];
        E -- No or Value Inactive --> G[Skip Attribute Filter];
        F --> H[List Filtered by Active Detailed Attributes];
        G --> H;
    end
 
    H --> I{Non-Negotiable Summary Checkbox Checked?};
    I -- Yes --> J{Filter `H`: Must meet ALL "Non-negotiable" criteria with their set values};
    I -- No --> K[List remains as is];
    J --> K;
 
    K --> L{Important Summary Checkbox Checked?};
    L -- Yes --> M{Filter Current List: Must meet ALL "Important" criteria with their set values};
    L -- No --> N[List remains as is];
    M --> N;
 
    N --> O{Nice-to-Have Summary Checkbox Checked?};
    O -- Yes --> P{Filter Current List: Must meet ALL "Nice-to-Have" criteria with their set values};
    O -- No --> Q[List remains as is];
    P --> Q;
 
    Q --> R[Final Filtered List for Display];
    R --> S[Calculate Recommendation Scores];
    S --> T[Sort Distributions];
    T --> U[Render Table & Update Stats/Badges];
```
 
**Explanation of the Filter Flow:**
 
*   **Start**: The process begins with the complete set of distributions.
*   **Elimination**: Distributions explicitly hidden by the user are removed first.
*   **Detailed Attribute Filtering**: This is the first major filtering pass. Each individual attribute's filter (e.g., a specific RAM value, a boolean for Secure Boot) is only applied if:
    1.  The user has set a specific value for it (i.e., it's not in its "don't care" default state).
    2.  The summary checkbox corresponding to that attribute's *priority level* (Non-Negotiable, Important, or Nice-to-Have) is checked. If the summary checkbox is unchecked, the individual attribute filter for that priority level is bypassed.
*   **Summary Checkbox Filtering**: After the detailed attribute filters, the list is further refined by the summary checkboxes. These act as cumulative "AND" conditions:
    *   If "Non-Negotiable" is checked, only distributions meeting *all* criteria marked as Non-Negotiable (with their specific values) proceed.
    *   If "Important" is checked, only distributions meeting *all* criteria marked as Important (with their specific values) from the *already filtered list* proceed.
    *   If "Nice-to-Have" is checked, only distributions meeting *all* criteria marked as Nice-to-Have (with their specific values) from the *further filtered list* proceed.
*   **Final Steps**: The resulting list is then used to calculate recommendation scores, sorted, and finally rendered in the table, with updated statistics and active filter badges.
 
This architecture ensures that the filter system is both powerful and intuitive, allowing users to precisely define their desired Linux distribution characteristics while maintaining clear control through the summary checkboxes.
 
## Future Phases (Planned)
 
- [ ] Database integration (connect to DistroWatch API)
- [ ] Add user accounts to save preferences
- [ ] Implement machine learning recommendation engine
- [ ] Create mobile app version
- [ ] Add social sharing features
 
## Documentation Enhancements (Ongoing)
 
1.  Create a visual architecture diagram (Completed - See Filter System Architecture)
2.  Create README (Completed)
3.  Create user guide, with screenshots (Planned)
4.  Add contribution guidelines (Planned)
5.  Create Developer Guide (Updated with Filter Logic)
6.  Create Task Plan for documentation task (Planned)
 
## Suggested Improvements (Future Consideration)
 
1.  Integrate with DistroWatch API for real-time data
2.  Add API integration documentation
3.  Add user accounts to save preferences
4.  Implement machine learning recommendation engine
5.  Create mobile app version
6.  Add social sharing features
 
## Tech Stack and Dependencies

*   HTML5
*   CSS3
*   Vanilla JavaScript (ES6+)
*   Web Components
*   Local Storage
*   Data Management: Modular JSONs loaded via async fetches for simplicity in static app. Planned: Dynamic discovery to avoid hardcoding.

(Note: This section will be updated as dependencies are added, e.g., for API integration or ML.)
 
## Decisions and Tech Choices
* Added author information panel using vanilla JS for consistency with existing tech stack, ensuring lightweight and fast implementation without additional frameworks.
 
*   **Frontend:** Vanilla JavaScript was chosen for simplicity and performance, avoiding framework overhead for this initial version.
*   **Data Structure:** JSON5 format was chosen for the data template due to its flexibility and human-readability.
*   **Styling:** CSS3 with Flexbox and Grid is used for a responsive and modern layout.
*   **Data Storage:** Initially using local JSON files; planning to integrate with external APIs for a comprehensive database.