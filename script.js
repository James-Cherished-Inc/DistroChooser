class DistroComparator {
  constructor() {
    this.allDistros = []; // Load from comprehensive database
    this.filteredDistros = [];
    this.eliminatedDistros = new Set();
    this.currentFilters = {
      nonNegotiable: true,
      important: false,
      niceToHave: false,
      search: '',
      sortBy: 'overall',
      attributeFilters: {} // New object to store attribute-specific filter values
    };
    this.filterTemplate = null; // To store the loaded filter template
    this.tableHeadersGenerated = false; // Track if headers have been generated
  }

  // Load the filter template from JSON
  async loadFilterTemplate() {
    try {
      const response = await fetch('data/template.json5');
      // Assuming json5 is not directly supported by fetch, parse as text and then use JSON.parse
      // In a real application, consider using a JSON5 parser library
      const text = await response.text();
      this.filterTemplate = JSON5.parse(text); // Use JSON5.parse for JSON5 format
      
      
    } catch (error) {
      
       // Log the specific error object
      // Optionally display an error message to the user
    }
  }

  // Dynamically render filter controls based on the loaded template
  renderFilterControls() {
    if (!this.filterTemplate) {
      
      return;
    }
    

    const detailedFiltersContainer = document.getElementById('detailed-filters');
    
    if (!detailedFiltersContainer) {
        
        return;
    }

    // Clear existing filter placeholders (except category headers)
    // It's important this doesn't clear the category H3 titles themselves.
    // The .filter-placeholder divs are siblings to the H3s within .filter-category.
    detailedFiltersContainer.querySelectorAll('.filter-placeholder').forEach((placeholder, index) => {
        
        placeholder.innerHTML = '';
    });


    // Iterate through the template and create filter controls
    for (const attributeName in this.filterTemplate) {
        
        // Skip attributes that are not meant to be filters or are additional features
        if (["name", "description", "website", "based_on"].includes(attributeName) || attributeName.startsWith('//') || attributeName.startsWith('----')) {
            continue;
        }

        const attributeValue = this.filterTemplate[attributeName];
        let attributeType;

        if (typeof attributeValue === 'number') {
            if (attributeValue <= 10) {
                attributeType = 'scale';
            } else {
                attributeType = 'number';
            }
        } else if (typeof attributeValue === 'boolean') {
            attributeType = 'boolean';
        } else if (Array.isArray(attributeValue)) {
            attributeType = 'array';
        } else if (typeof attributeValue === 'string') {
            // Need to differentiate between general strings and specific string values
            // For now, assuming all other strings are specific values that might need a select/checkbox
            attributeType = 'string';
        } else {
            continue; // Skip unknown types
        }

        // Determine the category placeholder based on attribute name (this needs refinement based on your template structure)
        // For now, a simple mapping based on the provided index.html structure
        let categoryPlaceholderId;
        if (['ram_requirements_minimum', 'ram_requirements_recommended', 'disk_requirements_minimum', 'disk_requirements_recommended', 'cpu_requirements_minimum', 'cpu_cores_minimum', 'architecture_support'].includes(attributeName)) {
            categoryPlaceholderId = 'system-requirements-filters';
        } else if (['secure_boot', 'boot_level_vulnerability', 'gui_customization', 'terminal_reliance', 'app_compatibility', 'nvidia_support', 'telemetry', 'stability', 'updates', 'responsive', 'resource_efficient', 'power_efficient', 'cost', 'documentation_quality', 'lightweight'].includes(attributeName)) {
            categoryPlaceholderId = 'non-negotiable-criteria-filters';
        } else if (['free_software_ideology', 'proprietary_software_required', 'sysadmin', 'sysadmin_vulnerability', 'illegal'].includes(attributeName)) {
            categoryPlaceholderId = 'important-criteria-filters';
        } else if (['security_vulnerability', 'active_community'].includes(attributeName)) {
            categoryPlaceholderId = 'nice-to-have-criteria-filters';
        } else if (['ram_usage_idle', 'disk_space_installed', 'iso_size', 'boot_time', 'package_manager', 'desktop_environments', 'default_desktop', 'init_system', 'kernel', 'release_model', 'release_cycle_months', 'support_duration_years', 'update_frequency'].includes(attributeName)) {
            categoryPlaceholderId = 'detailed-specifications-filters';
        } else if (['privacy_rating', 'security_rating', 'firewall_default', 'firewall', 'encryption_support', 'selinux_apparmor', 'automatic_updates'].includes(attributeName)) {
            categoryPlaceholderId = 'security-privacy-filters';
        } else if (['wifi', 'bluetooth', 'touchscreen', 'hidpi', 'arm_', 'raspberry'].includes(attributeName)) {
            categoryPlaceholderId = 'hardware-compatibility-filters';
        } else if (['cpu_usage_idle', 'disk_io_performance', 'network_performance', 'gaming_performance'].includes(attributeName)) {
            categoryPlaceholderId = 'performance-metrics-filters';
        } else if (['beginner_friendliness', 'installer_difficulty', 'post_install_setup', 'gui_tools_availability', 'software_center_quality'].includes(attributeName)) {
            categoryPlaceholderId = 'usability-filters';
        } else if (['development_tools', 'programming_languages_included', 'container_support', 'virtualization_support', 'server_suitability', 'enterprise_features'].includes(attributeName)) {
            categoryPlaceholderId = 'development-professional-use-filters';
        } else if (['multimedia_codecs', 'audio_quality', 'video_editing_support', 'graphics_design_tools'].includes(attributeName)) {
            categoryPlaceholderId = 'multimedia-creativity-filters';
        } else if (['screen_reader_support', 'keyboard_navigation', 'high_contrast_themes', 'font_scaling'].includes(attributeName)) {
            categoryPlaceholderId = 'accessibility-filters';
        } else if (['languages_supported', 'rtl_language_support', 'regional_variants'].includes(attributeName)) {
            categoryPlaceholderId = 'localization-filters';
        } else if (['forum_activity', 'github_activity', 'commercial_support', 'third_party_repositories', 'flatpak_support', 'snap_support', 'appimage_support'].includes(attributeName)) {
            categoryPlaceholderId = 'community-ecosystem-filters';
        } else if (['live_usb_support', 'persistence_support', 'snapshot_rollback', 'immutable_system', 'unique_features', 'target_audience'].includes(attributeName)) {
            categoryPlaceholderId = 'special-features-filters';
        } else if (['manual_intervention_frequency', 'breaking_changes_frequency', 'long_term_stability', 'backup_tools_included'].includes(attributeName)) {
            categoryPlaceholderId = 'maintenance-filters';
        } else {
            // If an attribute doesn't match any known category, skip it for now
            
            continue;
        }


        const categoryPlaceholder = document.getElementById(categoryPlaceholderId);
        

        if (!categoryPlaceholder) {
            
            continue;
        }
        

        const attributeDiv = document.createElement('div');
        attributeDiv.classList.add('filter-attribute');
        attributeDiv.dataset.attribute = attributeName;
        attributeDiv.dataset.type = attributeType;

        // Create label (convert snake_case to Title Case)
        const labelText = attributeName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const label = document.createElement('label');
        label.setAttribute('for', `${attributeName}-pref`);
        label.textContent = `${labelText}:`;
        attributeDiv.appendChild(label);

        // Create preference level slider with labels
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'priority-buttons-container';

        const priorityLabels = ['Not important', 'Don\'t care', 'Nice to have', 'Important', 'Non-negotiable'];
        priorityLabels.forEach((label, index) => {
            const button = document.createElement('button');
            button.textContent = label;
            button.dataset.value = index;
            button.classList.add('priority-button');
            if (index === 1) { // Default to "Don't care"
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                // Remove active class from all buttons in this container
                buttonContainer.querySelectorAll('.priority-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                this.filterDistros();
            });
            buttonContainer.appendChild(button);
        });

        attributeDiv.appendChild(buttonContainer);

        // Create placeholder for value control
        const valueControlContainer = document.createElement('div');
        valueControlContainer.classList.add('attribute-value-control');
        attributeDiv.appendChild(valueControlContainer);

        // Render the appropriate value control
        const valueControlElement = this.renderValueControl(attributeName, attributeType);
        valueControlContainer.appendChild(valueControlElement);

        // Create span to display the current value
        const valueDisplay = document.createElement('span');
        valueDisplay.classList.add('filter-value-display');
        valueDisplay.textContent = valueControlElement.value;
        valueControlContainer.appendChild(valueDisplay);

        // Update the displayed value on input for number and scale types
        if (attributeType === 'number' || attributeType === 'scale') {
            valueControlElement.addEventListener('input', () => {
                valueDisplay.textContent = valueControlElement.value;
            });
        }

        // Populate select options for array/string types after rendering
        if (attributeType === 'array' || attributeType === 'string') {
            this.populateSelectOptions(attributeName);
        }


        // Event listener for the value control element
        if (valueControlElement) { // Check if an element was actually created
            if (attributeType === 'boolean') {
                valueControlElement.addEventListener('change', () => {
                    this.filterDistros();
                });
            } else if (attributeType === 'number' || attributeType === 'scale') {
                valueControlElement.addEventListener('input', () => {
                    this.filterDistros();
                });
            } else if (attributeType === 'array' || attributeType === 'string') {
                 valueControlElement.addEventListener('change', () => {
                    this.filterDistros();
                 });
            }
        }
      
      
        // Append the attributeDiv to the categoryPlaceholder
        categoryPlaceholder.appendChild(attributeDiv);
        
    }
    
}


  // Render the appropriate value control based on attribute type
  // Render the appropriate value control based on attribute type
  renderValueControl(attributeName, attributeType) {
    let controlElement;
    switch (attributeType) {
      case 'number':
        controlElement = document.createElement('input');
        controlElement.type = 'range';
        controlElement.id = `${attributeName}-value`;
        controlElement.min = '0'; // Placeholder, will need dynamic min/max later
        controlElement.max = '100'; // Placeholder
        controlElement.value = '50'; // Default value
        break;
      case 'scale':
        controlElement = document.createElement('input');
        controlElement.type = 'range';
        controlElement.id = `${attributeName}-value`;
        controlElement.min = '1';
        controlElement.max = '10';
        controlElement.value = '5';
        break;
      case 'boolean':
        controlElement = document.createElement('input');
        controlElement.type = 'checkbox';
        controlElement.id = `${attributeName}-value`;
        break;
      case 'array':
      case 'string':
        controlElement = document.createElement('select');
        controlElement.id = `${attributeName}-value`;
        controlElement.multiple = true; // For array types, allow multiple selections
        break;
      default:
        controlElement = document.createElement('div'); // Return an empty div for unknown/skipped types
        break;
    }
    return controlElement;
  }

  // Populate select options for array and string attributes
  populateSelectOptions(attributeName) {
      const selectElement = document.getElementById(`${attributeName}-value`);
      if (!selectElement || !this.allDistros || this.allDistros.length === 0) return;

      const uniqueValues = new Set();
      this.allDistros.forEach(distro => {
          const value = distro[attributeName];
          if (Array.isArray(value)) {
              value.forEach(item => uniqueValues.add(item));
          } else if (typeof value === 'string') {
              uniqueValues.add(value);
          }
      });

      // Clear existing options
      selectElement.innerHTML = '';

      // Add a default "Select all" or placeholder option if needed
      // const defaultOption = document.createElement('option');
      // defaultOption.value = '';
      // defaultOption.textContent = `Select ${attributeName}`;
      // selectElement.appendChild(defaultOption);

      // Add unique values as options
      uniqueValues.forEach(value => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          selectElement.appendChild(option);
      });
  }


  async loadDistrosFromJSON() {
    try {
      // List of all distro files in data/distros/main
      const distroFiles = [
        '4mlinux.json',
        'almalinux.json',
        'alpine-linux.json',
        'antix.json',
        'archlinux.json',
        'arcolinux.json',
        'artix-linux.json',
        'blackarch.json',
        'bodhilinux.json',
        'centos-stream.json',
        'clear-linux.json',
        'container-linux.json',
        'deepin.json',
        'dietpi.json',
        'elementaryos.json',
        'endeavouros.json',
        'endless-os.json',
        'fedora.json',
        'funtoo.json',
        'garuda-linux.json',
        'gentoo.json',
        'kali-linux.json',
        'kaos.json',
        'kde-neon.json',
        'kxstudio.json',
        'linuxmint.json',
        'lxle.json',
        'mageia.json',
        'manjaro.json',
        'mxlinux-variants.json',
        'mxlinux.json',
        'netrunner.json',
        'nixos.json',
        'openmandriva.json',
        'opensuse.json',
        'oracle-linux.json',
        'osgeolive.json',
        'parrot-security-os.json',
        'pclinuxos.json',
        'peppermintos.json',
        'popos.json',
        'porteus.json',
        'puppylinux.json',
        'qubes-os.json',
        'red-hat-enterprise-linux.json',
        'rocky-linux.json',
        'slackware.json',
        'slax.json',
        'solus.json',
        'sparkylinux.json',
        'suse-linux-enterprise.json',
        'tails.json',
        'ubuntu-server.json',
        'ubuntu.json',
        'void-linux.json',
        'zorin-os.json'
      ];

      // Fetch each distro file
      const distroPromises = distroFiles.map(file =>
        fetch(`data/distros/perplexity-verified/${file}`).then(res => res.json())
      );
     
     

     this.allDistros = await Promise.all(distroPromises);
     
     
     
   } catch (error) {
     
      // Optionally display an error message to the user
    }
  }

  // Calculate scores for each category
  calculateScores(distro) {
    // Since the JSON structure is flat, we need to map properties to categories
    const categoryMappings = {
      nonNegotiable: ['free_software_ideology', 'privacy_rating', 'security_rating'],
      important: ['beginner_friendliness', 'installer_difficulty', 'post_install_setup'],
      niceToHave: ['gaming_performance', 'multimedia_codecs', 'desktop_environments']
    };

    const scores = {
      nonNegotiable: 0,
      important: 0,
      niceToHave: 0,
      overall: 0
    };

    const maxScores = {
      nonNegotiable: categoryMappings.nonNegotiable.length * 10,
      important: categoryMappings.important.length * 10,
      niceToHave: categoryMappings.niceToHave.length * 10
    };

    // Calculate scores for each category, including boolean handling for non-negotiable
    categoryMappings.nonNegotiable.forEach(prop => {
      const value = distro[prop];
      if (value !== undefined) {
        if (typeof value === 'number') {
          scores.nonNegotiable += value;
        } else if (typeof value === 'boolean') {
          // Boolean non-negotiable criteria count as full score (10) if true
          scores.nonNegotiable += value ? 10 : 0;
        }
      }
    });

    categoryMappings.important.forEach(prop => {
      if (distro[prop] !== undefined) {
        scores.important += typeof distro[prop] === 'number' ? distro[prop] : 0;
      }
      });

    categoryMappings.niceToHave.forEach(prop => {
      if (distro[prop] !== undefined) {
        scores.niceToHave += typeof distro[prop] === 'number' ? distro[prop] : 0;
      }
    });

    // Normalize scores to 100
    scores.nonNegotiable = (scores.nonNegotiable / maxScores.nonNegotiable) * 100;
    scores.important = (scores.important / maxScores.important) * 100;
    scores.niceToHave = (scores.niceToHave / maxScores.niceToHave) * 100;

    // Weighted overall score
    scores.overall = (scores.nonNegotiable * 0.5) +
                     (scores.important * 0.3) +
                     (scores.niceToHave * 0.2);

    return scores;
  }

  // Filter distributions based on criteria
  filterDistros() {
    

    // Ensure allDistros is populated before proceeding
    if (!this.allDistros || this.allDistros.length === 0) {
      
      return; // Exit the function if data is not ready
    }

    // Start with all distros
    let currentList = [...this.allDistros];
    

    // Filter out eliminated distros
    currentList = currentList.filter(distro => !this.eliminatedDistros.has(distro.name));
    

    // Apply priority summary filters based on selected checkboxes
    if (this.currentFilters.nonNegotiable) {
        currentList = currentList.filter(distro => this.calculateScores(distro).nonNegotiable === 100);
    }
    if (this.currentFilters.important) {
        currentList = currentList.filter(distro => this.calculateScores(distro).important === 100);
    }
    if (this.currentFilters.niceToHave) {
        currentList = currentList.filter(distro => this.calculateScores(distro).niceToHave === 100);
    }

    // Apply sorting before rendering
    this.sortDistros();
    
    this.filteredDistros = currentList;
    

    // NOTE: static summary filters applied above; dynamic attribute filters can be added here

    // Apply sorting
    // ... sorting logic ...

    // Render the table with filtered and sorted data
    
    this.renderTable();
    

    // Update the displayed count
    
    this.updateStats();
    
  }

  // Sort distributions based on criteria
  sortDistros() {
    const sortBy = this.currentFilters.sortBy;
    // Predefined scores for specific sort keys that use the calculateScores method
    const scoreBasedSortKeys = ['overall', 'nonNegotiable', 'important', 'niceToHave'];

    this.filteredDistros.sort((a, b) => {
      if (scoreBasedSortKeys.includes(sortBy)) {
        const scoresA = this.calculateScores(a);
        const scoresB = this.calculateScores(b);
        // Higher scores first (descending)
        if (sortBy === 'overall') return scoresB.overall - scoresA.overall;
        if (sortBy === 'nonNegotiable') return scoresB.nonNegotiable - scoresA.nonNegotiable;
        if (sortBy === 'important') return scoresB.important - scoresA.important;
        if (sortBy === 'niceToHave') return scoresB.niceToHave - scoresA.niceToHave;
      }

      // Generic sorting for other keys (actual data properties)
      const valA = a[sortBy];
      const valB = b[sortBy];

      // Handle different data types for sorting
      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB); // Ascending for strings
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return valB - valA; // Descending for numbers
      }
      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        return (valB === true ? 1 : 0) - (valA === true ? 1 : 0); // True sorts higher (descending)
      }
      
      // Fallback for undefined or mixed types (maintains stable sort or pushes undefined to end)
      if (valA === undefined && valB !== undefined) return 1; // valA (undefined) comes after valB
      if (valA !== undefined && valB === undefined) return -1; // valA comes before valB (undefined)
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  }

  // Render table with current filtered data
  renderTable() {
    const tableContainer = document.getElementById('table-container');
    if (!tableContainer) {
      
      return;
    }

    // Clear existing table
    tableContainer.innerHTML = '';

    // Create table element
    const table = document.createElement('table');
    table.className = 'distro-table';

    // Define column groups
    const columnGroups = [
      { label: 'Actions', keys: ['actions'] },
      { label: 'General Info', keys: ['name', 'description', 'website', 'based_on'] },
      { label: 'System Requirements', keys: ['ram_requirements_minimum', 'ram_requirements_recommended', 'disk_requirements_minimum', 'disk_requirements_recommended', 'cpu_requirements_minimum', 'cpu_cores_minimum', 'architecture_support'] },
      { label: 'Non-Negotiable Criteria', keys: ['secure_boot', 'boot_level_vulnerability', 'gui_customization', 'terminal_reliance', 'app_compatibility', 'nvidia_support', 'telemetry', 'stability', 'updates', 'responsive', 'resource_efficient', 'power_efficient', 'cost', 'documentation_quality', 'lightweight'] },
      { label: 'Important Criteria', keys: ['free_software_ideology', 'proprietary_software_required', 'sysadmin', 'sysadmin_vulnerability', 'illegal'] },
      { label: 'Nice-To-Have Criteria', keys: ['security_vulnerability', 'active_community'] },
      { label: 'Detailed Specifications', keys: ['ram_usage_idle', 'disk_space_installed', 'iso_size', 'boot_time', 'package_manager', 'desktop_environments', 'default_desktop', 'init_system', 'kernel', 'release_model', 'release_cycle_months', 'support_duration_years', 'update_frequency'] },
      { label: 'Security & Privacy', keys: ['privacy_rating', 'security_rating', 'firewall_default', 'firewall', 'encryption_support', 'selinux_apparmor', 'automatic_updates'] },
      { label: 'Hardware Compatibility', keys: ['wifi', 'bluetooth', 'touchscreen', 'hidpi', 'arm_', 'raspberry'] },
      { label: 'Performance Metrics', keys: ['cpu_usage_idle', 'disk_io_performance', 'network_performance', 'gaming_performance'] },
      { label: 'Usability', keys: ['beginner_friendliness', 'installer_difficulty', 'post_install_setup', 'gui_tools_availability', 'software_center_quality'] },
      { label: 'Development & Professional Use', keys: ['development_tools', 'programming_languages_included', 'container_support', 'virtualization_support', 'server_suitability', 'enterprise_features'] },
      { label: 'Multimedia & Creativity', keys: ['multimedia_codecs', 'audio_quality', 'video_editing_support', 'graphics_design_tools'] },
      { label: 'Accessibility', keys: ['screen_reader_support', 'keyboard_navigation', 'high_contrast_themes', 'font_scaling'] },
      { label: 'Localization', keys: ['languages_supported', 'rtl_language_support', 'regional_variants'] },
      { label: 'Community & Ecosystem', keys: ['forum_activity', 'github_activity', 'commercial_support', 'third_party_repositories', 'flatpak_support', 'snap_support', 'appimage_support'] },
      { label: 'Special Features', keys: ['live_usb_support', 'persistence_support', 'snapshot_rollback', 'immutable_system', 'unique_features', 'target_audience'] },
      { label: 'Maintenance', keys: ['manual_intervention_frequency', 'breaking_changes_frequency', 'long_term_stability', 'backup_tools_included'] }
    ];

    // Create table header with grouped columns
    const thead = document.createElement('thead');

    // Group header row
    const groupHeaderRow = document.createElement('tr');
    columnGroups.forEach((group, groupIndex) => {
      const th = document.createElement('th');
      th.colSpan = group.keys.length;
      th.dataset.originalColspan = group.keys.length; // Store original colspan
      th.className = 'category-header';
      th.textContent = group.label;
      // Store group index for toggling
      th.dataset.groupIndex = groupIndex;
      if (groupIndex === 0) {
        // First column ("Actions") is not collapsible
        groupHeaderRow.appendChild(th);
        return;
      }
      // Add arrow indicator for collapse/expand
      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = ' ▼';
      th.appendChild(arrow);
      // Click event to toggle columns visibility
      th.addEventListener('click', () => {
        const isCollapsed = th.classList.toggle('collapsed');
        arrow.textContent = isCollapsed ? ' ►' : ' ▼';
        // Toggle hidden-column class on relevant header and body cells
        const headerCells = table.querySelectorAll(`thead tr:nth-child(2) th[data-group-index="${groupIndex}"]`);
        const bodyCells = table.querySelectorAll(`tbody td[data-group-index="${groupIndex}"]`);
        
        if (isCollapsed) {
          // When collapsing, show only first column in group
          headerCells.forEach((cell, idx) => {
            cell.classList.toggle('hidden-column', idx !== 0);
          });
          bodyCells.forEach((cell, idx) => {
            // Calculate column index within group (modulo group size)
            const colIdx = idx % group.keys.length;
            cell.classList.toggle('hidden-column', colIdx !== 0);
          });
          // Adjust group header colspan to match visible column
          th.colSpan = 1;
        } else {
          // When expanding, show all columns
          headerCells.forEach(cell => cell.classList.remove('hidden-column'));
          bodyCells.forEach(cell => cell.classList.remove('hidden-column'));
          // Restore original colspan
          th.colSpan = parseInt(th.dataset.originalColspan);
        }
      });
      groupHeaderRow.appendChild(th);
    });
    thead.appendChild(groupHeaderRow);

    // Column header row
    const headerRow = document.createElement('tr');
    columnGroups.forEach((group, groupIndex) => {
      group.keys.forEach(key => {
        const th = document.createElement('th');
        // Format header text
        const formatted = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        th.textContent = formatted;
        th.dataset.sortKey = key;
        th.dataset.groupIndex = groupIndex;
        th.className = 'sortable-header';
        // Add sort indicator
        const indicator = document.createElement('span');
        indicator.className = 'sort-indicator';
        indicator.innerHTML = ' &#x2195;';
        th.appendChild(indicator);
        // Sort event
        th.addEventListener('click', () => {
          this.currentFilters.sortBy = key;
          this.sortDistros();
          this.renderTable();
        });
        headerRow.appendChild(th);
      });
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');
    this.filteredDistros.forEach(distro => {
      const row = document.createElement('tr');
      columnGroups.forEach((group, groupIndex) => {
        group.keys.forEach(key => {
          const td = document.createElement('td');
          td.dataset.groupIndex = groupIndex;
          if (key === 'actions') {
            const detailsBtn = document.createElement('button');
            detailsBtn.textContent = 'Details';
            detailsBtn.className = 'details-btn';
            detailsBtn.addEventListener('click', () => this.showDetails(distro.name));
            td.appendChild(detailsBtn);

            const eliminateBtn = document.createElement('button');
            eliminateBtn.textContent = 'Eliminate';
            eliminateBtn.className = 'eliminate-btn';
            eliminateBtn.addEventListener('click', () => this.eliminateDistro(distro.name));
            td.appendChild(eliminateBtn);
          } else {
            const value = distro[key];
            if (Array.isArray(value)) {
              td.textContent = value.join(', ');
            } else if (typeof value === 'boolean') {
              td.textContent = value ? 'Yes' : 'No';
            } else {
              td.textContent = value != null ? String(value) : '';
            }
          }
          row.appendChild(td);
        });
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Append table to container
    tableContainer.appendChild(table);
  }

  createDistroRow(tableBody, distro, dataHeaders) {
    const row = tableBody.insertRow();

    // Add Actions cell FIRST
    const actionsCell = row.insertCell(0); // Insert at index 0

    const detailsButton = document.createElement('button');
    detailsButton.textContent = 'Details';
    detailsButton.className = 'details-btn'; // For styling
    detailsButton.addEventListener('click', () => this.showDetails(distro.name));
    actionsCell.appendChild(detailsButton);

    const eliminateButton = document.createElement('button');
    eliminateButton.textContent = 'Eliminate';
    eliminateButton.className = 'eliminate-btn'; // For styling
    eliminateButton.addEventListener('click', () => this.eliminateDistro(distro.name));
    actionsCell.appendChild(eliminateButton);

    // Add data cells after the Actions cell
    dataHeaders.forEach(headerKey => {
      const cell = row.insertCell(); // Appends after the actions cell
      const value = distro[headerKey];
      if (Array.isArray(value)) {
        cell.textContent = value.join(', ');
      } else if (typeof value === 'boolean') {
        cell.textContent = value ? 'Yes' : 'No';
      } else {
        cell.textContent = (value !== undefined && value !== null) ? String(value) : '';
      }
    });
  }

  // Render category columns with emojis and scores
  renderCategoryColumns(category) {
    // Simplified rendering for flat JSON structure
    return Object.entries(category).map(([key, value]) => {
      let displayValue = '';
      let cellClass = '';

      if (typeof value === 'boolean') {
        displayValue = value ? '✅ Yes' : '❌ No';
        cellClass = value ? 'success' : 'failure';
      } else if (typeof value === 'number') {
        displayValue = `${value}/10`;
        cellClass = value >= 8 ? 'excellent' : value >= 6 ? 'good' : value >= 4 ? 'fair' : 'poor';
      } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
        cellClass = 'neutral';
      } else {
        displayValue = value;
        cellClass = 'neutral';
      }

      return `${key}: ${displayValue}`;
    }).join('<br>');
  }

  // Eliminate distribution from comparison
  eliminateDistro(distroName) {
     // ADD THIS LINE
    this.eliminatedDistros.add(distroName);
    this.filterDistros();
    this.showNotification(`${distroName} eliminated from comparison`);
  }

  // Show detailed information modal
  showDetails(distroName) {
    
    const distro = this.allDistros.find(d => d.name === distroName);
    

    if (!distro) {
      
      this.showNotification(`Error: Could not find details for ${distroName}.`);
      return;
    }

    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('modalContent');
    
    

    if (!modal || !content) {
        
        return;
    }

    // Dynamically build content based on distro properties to avoid errors with missing keys
    // Add an "X" close button, styled inline for now, with purple color
    let detailsHtml = `<span class="close-button modal-x-close" style="position: absolute; top: 10px; right: 15px; font-size: 24px; cursor: pointer; line-height: 1; color: purple;">&times;</span>`;
    detailsHtml += `<h2>${distro.name || 'N/A'}</h2><div class="distro-details-content">`;
    

    try {
        // Iterate over all keys from the distro object for simplicity.
        for (const key in distro) {
            if (Object.hasOwnProperty.call(distro, key)) {
                const value = distro[key];
                const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                let formattedValue = '';

                if (Array.isArray(value)) {
                    formattedValue = value.join(', ');
                } else if (typeof value === 'boolean') {
                    formattedValue = value ? 'Yes' : 'No';
                } else {
                    formattedValue = (value !== undefined && value !== null) ? String(value) : 'N/A';
                }
                detailsHtml += `<p><strong>${formattedKey}:</strong> ${formattedValue}</p>`;
            }
        }
        detailsHtml += `</div><button class="close-button">Close</button>`;
        
        content.innerHTML = detailsHtml;
        

    } catch (error) {
        
        content.innerHTML = `<p>Error displaying details for ${distro.name || 'Unknown Distro'}.</p><button class="close-button">Close</button>`;
    }

    modal.style.display = 'block';
    // Attempt to override other CSS properties that might hide the modal
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.position = 'fixed'; // Or 'absolute' depending on desired behavior
    modal.style.left = '50%';
    modal.style.top = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.zIndex = '10000'; // A very high z-index
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)'; // Semi-transparent background

    // Adjust modal size
    modal.style.width = '80%';
    modal.style.maxWidth = '700px';
    modal.style.maxHeight = '80vh';
    // Ensure modalContent is scrollable and has some padding for the X button
    content.style.backgroundColor = 'lightgreen'; // Green background for modal content
    content.style.color = 'purple'; // Purple text for modal content
    content.style.padding = '20px'; // General padding
    content.style.paddingTop = '40px'; // Extra padding at the top for the X button
    content.style.borderRadius = '8px'; // Rounded corners for a modern feel
    content.style.maxHeight = 'calc(80vh - 40px)'; // Adjust based on padding/borders of modal-content
    content.style.overflowY = 'auto';
    

    
    
    
    


    // Close modal when clicking outside or on close button.
    // Using .onclick to ensure only one handler is attached, overwriting previous if any.
    modal.onclick = (event) => {
        
        if (event.target === modal || event.target.classList.contains('close-button')) {
            
            modal.style.display = 'none';
        }
    };
    
  }

  // Show a simple notification (can be enhanced later)
  showNotification(message) {
    
    // For a more user-friendly notification, you might want to create a temporary element on the page
    // or use a library. For now, a console log will suffice for debugging.
    // Example of a simple on-page notification:
    /*
    const notificationElement = document.createElement('div');
    notificationElement.className = 'notification';
    notificationElement.textContent = message;
    document.body.appendChild(notificationElement);
    setTimeout(() => {
      notificationElement.remove();
    }, 3000);
    */
  }

  // Update slider label highlighting
  updateSliderLabel(labelsContainer, value) {
    const labels = labelsContainer.querySelectorAll('span');
    labels.forEach((label, index) => {
      if (index === value) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    });
  }

  // Update statistics display
  updateStats() {
      const filteredCountElem = document.getElementById('filtered-count');
      const totalCountElem = document.getElementById('total-count');
      if (filteredCountElem && totalCountElem) {
          filteredCountElem.textContent = this.filteredDistros.length;
          totalCountElem.textContent = this.allDistros.length;
      }
  }

  // Display active detailed filter badges (show only those with priority other than "Don't care")
  updateActiveFilters() {
      const container = document.querySelector('.active-filters');
      if (!container) return;
      container.innerHTML = '';
      // Iterate through each detailed filter attribute element
      document.querySelectorAll('.filter-attribute').forEach(attrDiv => {
          const attributeName = attrDiv.dataset.attribute;
          const formattedAttr = attributeName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const activeBtn = attrDiv.querySelector('.priority-button.active');
          if (!activeBtn) return;
          const priorityLabel = activeBtn.textContent.trim();
          if (priorityLabel === "Don't care") return;
          const badge = document.createElement('span');
          badge.className = 'filter-badge attribute-badge';
          badge.textContent = `${formattedAttr}: ${priorityLabel}`;
          container.appendChild(badge);
      });
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new DistroComparator();
  Promise.all([app.loadFilterTemplate(), app.loadDistrosFromJSON()]).then(() => {
    // Defer filter rendering slightly to ensure DOM is fully ready for manipulation
    setTimeout(() => {
        app.renderFilterControls();
    }, 0);
    // filterDistros also calls renderTable, which should be fine as it targets a different part of the DOM
    // and also happens after the Promise.all.
    app.filterDistros();
      // Attach priority filter change handlers
      ['filterNonNegotiable', 'filterImportant', 'filterNiceToHave'].forEach(id => {
          const cb = document.getElementById(id);
          if (cb) {
              cb.addEventListener('change', () => {
                  // Map checkbox id to currentFilters key
                  const key = id === 'filterNonNegotiable' ? 'nonNegotiable' : id === 'filterImportant' ? 'important' : 'niceToHave';
                  app.currentFilters[key] = cb.checked;
                  app.updateActiveFilters();
                  app.filterDistros();
              });
          }
      });
      // Initial display of active filters
      app.updateActiveFilters();
  });

  // Add collapsible functionality to Detailed Filters section
  const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
  const filtersContent = document.getElementById('filters-content');
  
  if (toggleFiltersBtn && filtersContent) {
    toggleFiltersBtn.addEventListener('click', () => {
      filtersContent.classList.toggle('collapsed');
      toggleFiltersBtn.textContent = filtersContent.classList.contains('collapsed') ? '►' : '▼';
    });
    
    // Ensure filters expanded on load
    filtersContent.classList.remove('collapsed');
    toggleFiltersBtn.textContent = '▼';
  }
// Subsection toggles
document.querySelectorAll('.subsection-toggle-btn').forEach(button => {
    button.addEventListener('click', () => {
        const subsection = button.closest('.subsection');
        subsection.classList.toggle('collapsed');
        button.textContent = subsection.classList.contains('collapsed') ? '►' : '▼';
    });
});
});