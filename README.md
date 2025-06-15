# Cherished Linux Distro Chooser

Welcome to the Cherished Linux Distro Chooser project! This tool is designed to help users find the perfect Linux distribution based on their specific needs and preferences. By providing a comprehensive, interactive table and powerful filtering options, we aim to simplify the often overwhelming process of choosing a Linux distribution.


## Vision and Goals

Intuitive, data-driven tool that empowers users to make informed decisions, ultimately contributing to the growth and adoption of Linux.

*   Building a comprehensive and accurate database of Linux distributions and their characteristics.
*   Developing a robust and flexible filtering and recommendation system.
*   Creating a user-friendly and accessible interface.
*   Fostering a community around the tool for data contributions and feedback.

Hope this tool helps you find the perfect Linux distribution for your needs!

## Current Features

The current version of the Linux Distro Chooser provides the following features:

*   **Interactive Table:** Displays a list of Linux distributions with various criteria.
*   **Criteria-based Filtering:** Filter distributions based on Non-Negotiable, Important, and Nice-to-Have criteria priorities.
*   **Distribution Elimination:** Users can hide distributions from the table that do not meet their requirements.
*   **Detailed Information:** View more detailed specifications and scores for each distribution.
*   Export/Import functionality for user preferences and filtered lists.
*   Retractable Supra-columns, inspired by https://artificialanalysis.ai/

### Planned Features

*   **Sorting:** Sort the table by different criteria columns.
*   An AI-powered recommendation engine to suggest distributions based on user input.
*   Performance optimizations for handling larger datasets.
*   Enhanced accessibility features for a wider range of users.

## How to Use

The interactive table is the core of the Linux Distro Chooser.

1.  **Viewing Distributions:** All available distributions are listed in the table, with columns representing different criteria.
2.  **Filtering:** Use the checkboxes at the top of the page to apply filters based on criteria priorities (Non-Negotiable, Important, Nice-to-Have). Checking a box will hide distributions that do not meet *all* criteria within that priority level.
3.  **Sorting:** Click on the column headers to sort the table based on that criterion's score or value.
4.  **Eliminating Distributions:** Use the "❌ Eliminate" button in the "Actions" column to hide a specific distribution from the table.
5.  **Viewing Details:** Use the "ℹ️ Details" button in the "Actions" column to view a modal with more detailed information about a distribution, including system requirements and detailed scoring.


## Session Behavior

- All application state (filtered distributions, eliminated distributions, filter settings) is stored only in memory for the current session.
- State is cleared when:
  - The page is refreshed.
  - The browser tab or window is closed.
  - Browser cache is cleared.
- No personal data or application state is stored persistently on your device.


# Contributing

Enthusiasts are welcome to contribute! Please submit a pull request (PR) with additions or corrections.

**Adding or Correcting Distro Information:**

*   Follow the `data/template.json5` template for data submissions. Note that JSON files do not accept comments, so your JSON file should not include any.
*   The list of distributions is located at `data/distros/index.md`. Remember to update this file if you add a new distribution.
*   Please include official sources and, if possible, "proofs" in your PR to support your contribution.

**Contributing to UI, Performance, or Backend:**

1.  Submit a PR for a new branch.
2.  Test your changes with a user story (e.g., Enterprise admin, Security geek, Beginner).
3.  Include a video recording if possible for demo and double-checking.

Your PR will be merged as long as it aligns with the project's philosophy and functions smoothly. Otherwise, it can be kept as your own branch in this repository, as long as it's valuable and usable.

**About the Project Creator**

Hi, I'm James! I hope you're enjoying the tools I build.

I'm a solo dev and a new Linux fan.

If you find some value in the time, money, and effort I've spent towards my vision, I'm glad. I'm driven by the idea of an equitable chance to anyone on Earth to freely pursue their dreams and fulfillment, for free. An Internet connection as the single requirement brings this truer and truer with each effort.

Linux contributes to this realization, and I hope this can be a small gift to the community.

You can support my work on [X (Twitter)](https://x.com/JamesCherished).

## Local Quickstart

To get started with the Linux Distro Chooser, simply open the `index.html` file in your web browser. The application is built using standard web technologies (HTML, CSS, JavaScript) and does not require any server-side setup to run locally.

1.  Clone the repository 
2.  Navigate to the project directory.
3.  npm start will concurrently start the backend and the frontend, and open it in your browser.