# Recommendation Engine Implementation Plan

This document outlines the plan for implementing the algorithmic calculation that recommends the best Linux distributions based on user filters and their assigned priority levels.

## Objective:

Implement a recommendation scoring algorithm within the `DistroComparator` class in `script.js` that calculates a score for each Linux distribution based on how well it matches the user's selected filter criteria and their assigned priority levels ("Nice-to-Have" and "Important"). The existing "Non-negotiable" priority will continue to function as a hard filter, eliminating distros that do not meet the criteria. The "Don't Care" priority will not influence the score or filtering. The table will then be sortable by this new recommendation score.

## Current State:

*   The project loads distro data from JSON files.
*   Filter controls are dynamically rendered based on `data/template.json5`.
*   Users can set priority levels ("Don't Care", "Nice-to-Have", "Important", "Non-negotiable") for each filter attribute.
*   The `filterDistros()` function currently applies hard filtering based on "Non-negotiable" criteria and selected values for boolean/array/string types with "Important" or "Non-negotiable" priority.
*   The `calculateScores()` function exists but calculates scores based on predefined categories, not the user's specific filter selections.
*   The table can be sorted by predefined category scores and some attributes.

## Proposed Recommendation Algorithm:

The algorithm will calculate a weighted score for each distribution that passes the "Non-negotiable" hard filters. The score will reflect how closely the distribution's attributes match the user's desired values for "Nice-to-Have" and "Important" criteria.

For each distribution that remains after applying "Non-negotiable" filters:

*   Initialize `recommendationScore = 0`.
*   Initialize `maxPossibleScore = 0`.
*   Define weights for priorities: `importantWeight = 2` (or similar, can be adjusted), `niceToHaveWeight = 1`.
*   Iterate through each filterable attribute defined in `data/template.json5`.
*   For the current attribute, get the user's selected priority level and value(s).
*   If the priority is "Don't Care" or "Non-negotiable", skip this attribute for scoring.
*   If the priority is "Nice-to-Have" or "Important":
    *   Get the distribution's value for this attribute.
    *   Calculate an `attributeMatchScore` (0 to 1) based on the data type and how well the distro's value matches the user's filter value(s):
        *   **Boolean:** If user wants `true` and distro is `true`, `attributeMatchScore = 1`. Otherwise, `attributeMatchScore = 0`.
        *   **Number/Scale:** If user sets a minimum value `X`, and distro's value is `Y`: if `Y >= X`, `attributeMatchScore = 1`, otherwise `0`.
        *   **Array/String (Multi-select):** If user selects values `[A, B]`, and distro's array/string contains `[C, D, A]`: `attributeMatchScore = (number of selected values found in distro's values) / (total number of selected values)`.
        *   **String (Single value):** If user selects value `A`, and distro's value is `A`: `attributeMatchScore = 1`. Otherwise, `attributeMatchScore = 0`.
    *   Determine the `priorityWeight` (either `importantWeight` or `niceToHaveWeight`).
    *   Add `attributeMatchScore * priorityWeight` to `recommendationScore`.
    *   Add `1 * priorityWeight` to `maxPossibleScore`.
*   The final `recommendationScore` for the distribution is `(recommendationScore / maxPossibleScore) * 100` (if `maxPossibleScore > 0`, otherwise 0).

## Visual Representation (Mermaid Diagram):

```mermaid
graph TD
    A[Start Scoring for Distro] --> B{Distro Passes Non-Negotiable?};
    B -- Yes --> C[Initialize Scores: recommendationScore = 0, maxPossibleScore = 0];
    C --> D{Iterate through Filter Attributes};
    D --> E{Get User Priority & Value};
    E -- Priority is Don't Care or Non-Negotiable --> D;
    E -- Priority is Nice-to-Have or Important --> F{Calculate AttributeMatchScore};
    F --> G[Determine Priority Weight];
    G --> H[Add AttributeMatchScore * Weight to recommendationScore];
    H --> I[Add Max Possible Score (1 * Weight) to maxPossibleScore];
    I --> D;
    D -- All Attributes Processed --> J{Calculate Final Normalized Score};
    J[Final Score = (recommendationScore / maxPossibleScore) * 100] --> K[Store Score with Distro];
    K --> L[End Scoring for Distro];
    B -- No --> L[End Scoring for Distro (Score 0 or Excluded)];
```

## Implementation Steps:

1.  **Modify `script.js`:**
    *   Add a new method `calculateRecommendationScore(distro)` to the `DistroComparator` class. This method will implement the scoring logic described above. It will need access to the `this.currentFilters.attributeFilters` and the active priority buttons for each attribute.
    *   Update the `filterDistros()` method:
        *   After the initial filtering based on "Non-negotiable" criteria and selected values, iterate through the remaining `currentList`.
        *   For each distro in `currentList`, call `this.calculateRecommendationScore(distro)` and store the result (e.g., `distro.recommendationScore = score`).
    *   Update the `sortDistros()` method to include `'recommendationScore'` as a sortable key. When sorting by `recommendationScore`, sort in descending order.
    *   (Optional for MVP) Modify `renderTable()` to display the calculated `recommendationScore` for each distro, perhaps in a new column or as part of the details.

## Documentation Updates:

1.  **`docs/MasterImplementationPlan.md`**: Update the "Recommendation Engine" item in Phase 3 to reflect that planning is complete and implementation is the next step.
2.  **`docs/DeveloperGuide.md`**: Add a new section explaining the Recommendation Scoring Algorithm, detailing how scores are calculated for different data types and priorities. Explain the changes made to the `filterDistros` and `sortDistros` methods.
3.  **Create `docs/RecommendationEnginePlan.md`**: Create a new markdown file detailing this specific plan, including the proposed algorithm and implementation steps. (This step is being completed now).

## Testing:

*   After implementation, test the recommendation engine with various filter combinations and priorities to ensure the scores are calculated correctly and the table is sorted as expected.
*   Verify that "Non-negotiable" filters still correctly exclude distros.
*   Verify that "Don't Care" filters do not affect the score or filtering.