### Make the slider for the detailed filter controls purple instead of red.

### The rows of the table are not clearly separated

### UI Improvement : add a modern feel and colorful borders to the big divs and sections, please. 

# Useful

## Allow users to add one of the 56 distros from the list as a new row by typing the name, just on top of the table. This allows to add a distro that's been filtered out, to compare it with the displayed results

## Can we increase the width of the "Description" column in the table please?

## Refactoring Recommendations for script.js

The `script.js` file, currently a monolithic structure, could benefit significantly from refactoring to improve maintainability, readability, and scalability.

**Proposed Modular Structure:**

The `DistroComparator` class should be broken down into smaller, more focused modules or classes, each responsible for a specific aspect of the application:

*   `DataLoader`: Handles loading the distro data and filter template.
*   `FilterManager`: Manages the state of all filters and applies the filtering logic to the data.
*   `UIManager`: Handles rendering the filter controls, the table, the modal, and updating the stats/badges.
*   `SortingManager` (Optional): If sorting logic becomes more complex, a separate module could handle this.

**Diagram:**

```mermaid
graph TD
    A[script.js (Main App)] --> B(DataLoader)
    A --> C(FilterManager)
    A --> D(UIManager)
    C --> D
    B --> C
    B --> D
```

**Benefits:**

*   **Improved Code Organization:** Clearer separation of concerns.
*   **Enhanced Readability:** Smaller, more focused modules are easier to understand.
*   **Increased Maintainability:** Changes in one area are less likely to affect others.
*   **Easier Testing:** Individual modules can be tested in isolation.
*   **Greater Reusability:** Components can be reused in other parts of the application or in future projects.

**Optimization Considerations:**

*   **Filtering Logic:** Analyze the performance of the `filterDistros` function and consider optimizations such as caching filtered results or using more efficient data structures.

**Implementation Strategy:**

Refactoring should be done incrementally, one module at a time, with thorough testing after each step to ensure that the application continues to function correctly.

---


# Later On

### active-filters
- make the badges more visible for each user-set filter

### Optimize performance by implementing lazy loading for distro data or caching filter results to handle larger datasets in the future.
