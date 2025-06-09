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