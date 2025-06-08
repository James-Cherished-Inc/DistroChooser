# Updating the json files with accurate and verified values.

**Context:** We are creating a Linux Distro Chooser tool. We are now creating the json database at data/distros/ with a json file for each Distro.
Each criteria is a column in the big table we are building. Each Distro is a line in the table. Therefore, each Distro json item must have the same attribute variables (i.e criteria, i.e. column), and for them, values (i.e. cells) from the same array (true or false ; numbers e.g. 2GB ; or a 1-10 score). 

We will later create an algorithm that will match the distros against the user preferences. The interactive table also will have the option to hide distros by filter (example : security score lower than 9, or RAM requirements higher than 14GB ; etc...)

**Task:** Orchestrate the updating process of the information of each json file in the the distros/ directory.
Most distros/ json files have placeholder values for the attritbute.
Your overall objective is to ensure that for each json file, the data is standardized and uniform for algorithmic processing, and the result of thorough research.

You will create one task per file. You are responsible of tracking the state of each file. You should maintain index.md with checkboxes that you will tick every time a subtask has correctly completed a file without any issue.

Subtask methodology: You are responsible for ensuring each subtask, using the Technical Writer mode, receives the correct context and instructions to perform the task correctly.
- The subtask must maintain the format to ensure all data is standardized. It must follow the process outlined in template.json5.
- Each subtask only has to use the following command in the terminal, by changing the query with the informations they need:
Tool : curl requests in the terminal : curl -X POST -H "Content-Type: application/json" -d '{"query": "Fedora"}' http://localhost:3000


If you have any question, you may ask. Otherwise, please proceed.


**Specific Requirements:**
Maintain all other existing attributes and their values for each distribution entry.
Ensure the JSON structure remains valid throughout the process.


----

# Creating the json files

Context: We are creating a Linux Distro Chooser tool. We are now creating the json database at data/distros/ with a json file for each Distro.
Each criteria is a column in the big table we are building. Each Distro is a line in the table. Therefore, each Distro json item must have the same attribute variables (i.e criteria, i.e. column), and for them, values (i.e. cells) from the same array (true or false ; numbers e.g. 2GB ; or a 1-10 score). 

We will later create an algorithm that will match the distros against the user preferences. The interactive table also will have the option to hide distros by filter (example : security score lower than 9, or RAM requirements higher than 14GB ; etc...)

Your task: Create a json file for all the remaining distros from the list docs/DistroList.md , for all the criterias we need, following the template template.json5 to include the right set of options.
Another task later on will be created to choose the criteria value with the right information.

If you have any question, you may ask. Otherwise, please proceed.

**Specific Requirements:** Ensure the JSON structure remains valid throughout the process.
**Add or update the `comment` attributes when needed:**
    *   Include a general string value that provides additional context or details, and specific when needed, like the `secure_boot` "boot_comment", and any other notable characteristics relevant to the data points. If no specific comment is needed, this field will be an empty string `""`.

