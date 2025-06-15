# Linux Distribution Comparison Tool - Developer Guide

This guide provides technical details and insights into the architecture and implementation of the Linux Distribution Comparison Tool.

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

## Data Structure and Mapping

The distribution data is stored in JSON files within the `data/distros/` directory, following the structure defined in `data/template.json5`. Each JSON file represents a single Linux distribution.

*   **Distros as Rows:** In the interactive table, each distribution object from the JSON data corresponds to a row (`<tr>`).
*   **Criteria as Columns:** The attributes within each distribution's JSON object (e.g., `secure_boot`, `gui_customization`, `ram_requirements_minimum`) represent the criteria, which are displayed as columns (`<td>`) in the table.
*   **Values as Cells:** The values associated with each criterion attribute in the JSON (e.g., `true`, `8`, `"2GB"`) are the data points displayed in the individual table cells.

The `data/template.json5` file is crucial for understanding the available criteria and their expected data types and scales (boolean, number, 1-10 score, string, array).

## Tom Select Integration

We've replaced the custom dropdown implementation with Tom Select (v2.3.1) to improve UX and accessibility. Key integration points:

* Added CDN links to Tom Select CSS and JS in `index.html`
* Modified `renderValueControl()` to create Tom Select elements
* Updated `populateSelectOptions()` to initialize Tom Select after adding options
* Added custom styles in `styles.css` to match our design

Tom Select provides:
* Searchable dropdowns
* Clear selection button
* Better keyboard navigation
* Improved accessibility

## Filter Logic
 
The filtering mechanism in `script.js` has been significantly enhanced to provide precise control over distribution visibility based on user-defined priorities and values. This section details the logic, default behaviors, and priority handling.
 
### Core Principles
 
1.  **Initial State**: The filtering process always begins with all distributions loaded into the system, excluding only those manually eliminated by the user.
2.  **Detailed Attribute Filtering**: Filters applied via individual attribute controls (sliders, checkboxes, multi-selects) are only active if their corresponding priority level's summary checkbox is also checked.
3.  **Summary Checkbox Control**: The three summary checkboxes (Non-Negotiable, Important, Nice-to-Have) act as master switches for their respective priority levels. If a summary checkbox is *unchecked*, no filters associated with that priority level will be applied, regardless of individual attribute settings.
4.  **Cumulative Filtering**: When multiple summary checkboxes are checked, the filters are applied cumulatively, narrowing the list of distributions further.
 
### Detailed Filter Application Flow (`filterDistros()` method)
 
The `filterDistros()` method in `script.js` executes the filtering in the following order:
 
1.  **Eliminated Distributions**: Removes any distributions that the user has explicitly eliminated from the comparison.
2.  **Attribute-Specific Filtering**: Iterates through each detailed filter attribute (e.g., "Secure Boot", "RAM Requirements Minimum", "Desktop Environments"). For each attribute:
    *   It determines the user's selected value (e.g., `true` for a boolean switch, `8GB` for a RAM slider, `GNOME, KDE` for desktop environments).
    *   It checks the attribute's assigned priority level (Non-Negotiable, Important, Nice-to-Have) via its active priority button.
    *   **Crucially**, it then checks if the *corresponding summary checkbox* for that priority level is currently checked.
    *   **Only if** the summary checkbox is checked *and* the attribute's value control is set to an "active" (non-default/non-neutral) state, the filter for that specific attribute is applied to the list of distributions.
        *   **Boolean Attributes**: Filtered if the custom UI switch is "on" (`true`) AND the relevant summary checkbox is checked.
        *   **Number/Scale Attributes**: Filtered if the slider value is greater than its minimum/default ("Don't care") value AND the relevant summary checkbox is checked. Distributions must meet or exceed the selected numerical value.
        *   **Array/String Attributes (Tom Select)**: Filtered if one or more options are selected in the Tom Select dropdown AND the relevant summary checkbox is checked. Distributions must contain *all* selected options to pass this filter.
3.  **Recommendation Score Calculation**: After all detailed and summary filters are applied, the `calculateRecommendationScore()` method is called for each remaining distribution. This score is used for sorting and reflects how well a distro matches the user's 'Nice-to-Have' and 'Important' criteria.
 
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