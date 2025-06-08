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
      const response = await fetch('http://localhost:8001/http://localhost:8000/data/template.json5');
      // Assuming json5 is not directly supported by fetch, parse as text and then use JSON.parse
      // In a real application, consider using a JSON5 parser library
      const text = await response.text();
      this.filterTemplate = JSON5.parse(text); // Use JSON5.parse for JSON5 format
      console.log('Filter template loaded:', this.filterTemplate);
      console.log('loadFilterTemplate() called');
    } catch (error) {
      console.error('Error loading filter template:', error);
      console.error('Filter template parsing error:', error); // Log the specific error object
      // Optionally display an error message to the user
    }
  }

  // Dynamically render filter controls based on the loaded template
  renderFilterControls() {
    if (!this.filterTemplate) {
      console.error('Filter template not loaded.');
      return;
    }
    console.log('renderFilterControls() called');

    const detailedFiltersContainer = document.getElementById('detailed-filters');
    if (!detailedFiltersContainer) return;

    // Clear existing filter placeholders (except category headers)
    detailedFiltersContainer.querySelectorAll('.filter-placeholder').forEach(placeholder => {
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
            attributeType = 'number';
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
            console.warn(`Attribute "${attributeName}" not mapped to a category.`);
            continue;
        }


        const categoryPlaceholder = document.getElementById(categoryPlaceholderId);
        if (!categoryPlaceholder) {
            console.warn(`Category placeholder "${categoryPlaceholderId}" not found.`);
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

        // Create preference level slider
        const preferenceSlider = document.createElement('input');
        preferenceSlider.setAttribute('type', 'range');
        preferenceSlider.setAttribute('id', `${attributeName}-pref`);
        preferenceSlider.classList.add('preference-level-slider');
        preferenceSlider.setAttribute('min', '0');
        preferenceSlider.setAttribute('max', '4');
        preferenceSlider.setAttribute('value', '1'); // Default to "Don't care"
        attributeDiv.appendChild(preferenceSlider);

        // Create placeholder for value control
        const valueControlContainer = document.createElement('div');
        valueControlContainer.classList.add('attribute-value-control');
        attributeDiv.appendChild(valueControlContainer);

        // Render the appropriate value control
        // Call the new renderValueControl that returns an element
        const valueControlElement = this.renderValueControl(attributeName, attributeType);
        valueControlContainer.appendChild(valueControlElement); // Append the element directly

        // Populate select options for array/string types after rendering
        if (attributeType === 'array' || attributeType === 'string') {
            this.populateSelectOptions(attributeName);
        }

        // Add event listeners to the dynamically created controls
        preferenceSlider.addEventListener('input', () => {
            this.filterDistros();
        });

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
      console.log(`renderFilterControls: Processing attribute: ${attributeName}, type: ${attributeType}`);
      console.log(`renderFilterControls: attributeDiv outerHTML before appending:`, attributeDiv.outerHTML);
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
        fetch(`http://localhost:8001/http://localhost:8000/data/distros/perplexity-verified/${file}`).then(res => res.json())
      );
     
     console.log('loadDistrosFromJSON: distroPromises created.');

     this.allDistros = await Promise.all(distroPromises);
     console.log('loadDistrosFromJSON: Promise.all resolved. Data assigned to this.allDistros.');
     console.log('Distros loaded:', this.allDistros);
     console.log('loadDistrosFromJSON() called');
   } catch (error) {
     console.error('Error loading distributions:', error);
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

    // Calculate scores for each category
    categoryMappings.nonNegotiable.forEach(prop => {
      if (distro[prop] !== undefined) {
        scores.nonNegotiable += typeof distro[prop] === 'number' ? distro[prop] : 0;
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
    console.log('filterDistros() called');

    // Ensure allDistros is populated before proceeding
    if (!this.allDistros || this.allDistros.length === 0) {
      console.log('filterDistros: allDistros is empty, skipping filtering and rendering.');
      return; // Exit the function if data is not ready
    }

    // Start with all distros
    this.filteredDistros = [...this.allDistros];
    console.log('Initial filteredDistros count:', this.filteredDistros.length);

    // Apply filters
    // ... filtering logic ...

    // Apply sorting
    // ... sorting logic ...

    // Render the table with filtered and sorted data
    console.log('Calling renderTable()');
    this.renderTable();
    console.log('renderTable() called');

    // Update the displayed count
    console.log('Calling updateDistroCount()');
    this.updateStats();
    console.log('updateStats() called');
  }

  // Sort distributions based on criteria
  sortDistros() {
    this.filteredDistros.sort((a, b) => {
      const scoresA = this.calculateScores(a);
      const scoresB = this.calculateScores(b);

      // Handle sorting by individual criteria using the calculated scores
      const sortBy = this.currentFilters.sortBy;
      switch (sortBy) {
        case 'nonNegotiable':
          return scoresB.nonNegotiable - scoresA.nonNegotiable;
        case 'important':
          return scoresB.important - scoresA.important;
        case 'niceToHave':
          return scoresB.niceToHave - scoresA.niceToHave;
        case 'name':
          return a.name.localeCompare(b.name);
        default: // overall
          return scoresB.overall - scoresA.overall;
      }
    });
  }

  // Render table with current filtered data
  renderTable() {
    const tableContainer = document.getElementById('table-container');
    if (!tableContainer) {
      console.error('Table container not found');
      return;
    }

    // Clear existing table
    tableContainer.innerHTML = '';

    // Create table element
    const table = document.createElement('table');
    table.className = 'distro-table';

    // Get the keys from the first distro object to create the header
    const headers = Object.keys(this.allDistros[0] || {});

    // Create table header
    const headerRow = table.insertRow(0);
    headers.forEach(headerText => {
      const headerCell = document.createElement('th');
      headerCell.textContent = headerText;
      headerRow.appendChild(headerCell);
    });

    // Create table rows
    this.filteredDistros.forEach(distro => {
      this.createDistroRow(table, distro, headers);
    });

    tableContainer.appendChild(table);
  }

  createDistroRow(table, distro, headers) {
    const row = table.insertRow();
    headers.forEach(header => {
      const cell = row.insertCell();
      cell.textContent = distro[header] || '';
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
    this.eliminatedDistros.add(distroName);
    this.filterDistros();
    this.showNotification(`${distroName} eliminated from comparison`);
  }

  // Show detailed information modal
  showDetails(distroName) {
    const distro = this.allDistros.find(d => d.name === distroName);
    if (!distro) return;

    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('modalContent');

    // Need to update this to render all attributes dynamically based on the template
    content.innerHTML = `
      <h2>${distro.name}</h2>
      <div class="distro-details-content">
        <h3>General Info</h3>
        <p><strong>Description:</strong> ${distro.description}</p>
        <p><strong>Website:</strong> <a href="${distro.website}" target="_blank">${distro.website}</a></p>
        <p><strong>Based On:</strong> ${distro.based_on}</p>

        <h3>System Requirements</h3>
        <p><strong>RAM Minimum:</strong> ${distro.ram_requirements_minimum} GB</p>
        <p><strong>RAM Recommended:</strong> ${distro.ram_requirements_recommended} GB</p>
        <p><strong>Disk Minimum:</strong> ${distro.disk_requirements_minimum} GB</p>
        <p><strong>Disk Recommended:</strong> ${distro.disk_requirements_recommended} GB</p>
        <p><strong>CPU Minimum:</strong> ${distro.cpu_requirements_minimum} GHz</p>
        <p><strong>CPU Cores Minimum:</strong> ${distro.cpu_cores_minimum}</p>
        <p><strong>Architecture Support:</strong> ${distro.architecture_support.join(', ')}</p>

        <h3>NON-NEGOTIABLE CRITERIA</h3>
        <p><strong>Secure Boot:</strong> ${distro.secure_boot}</p>
        <p><strong>Boot Level Vulnerability:</strong> ${distro.boot_level_vulnerability ? 'Yes' : 'No'}</p>
        <p><strong>GUI Customization:</strong> ${distro.gui_customization}/10</p>
        <p><strong>Terminal Reliance:</strong> ${distro.terminal_reliance}/10</p>
        <p><strong>App Compatibility:</strong> ${distro.app_compatibility}/10</p>
        <p><strong>NVIDIA Support:</strong> ${distro.nvidia_support ? 'Yes' : 'No'}</p>
        <p><strong>Telemetry:</strong> ${distro.telemetry ? 'Yes' : 'No'}</p>
        <p><strong>Stability:</strong> ${distro.stability}/10</p>
        <p><strong>Updates:</strong> ${distro.updates}/10</p>
        <p><strong>Responsive:</strong> ${distro.responsive}/10</p>
        <p><strong>Resource Efficient:</strong> ${distro.resource_efficient}/10</p>
        <p><strong>Power Efficient:</strong> ${distro.power_efficient}/10</p>
        <p><strong>Cost:</strong> ${distro.cost}</p>
        <p><strong>Documentation Quality:</strong> ${distro.documentation_quality}/10</p>
        <p><strong>Lightweight:</strong> ${distro.lightweight}/10</p>

        <h3>IMPORTANT CRITERIA</h3>
        <p><strong>Free Software Ideology:</strong> ${distro.free_software_ideology}/10</p>
        <p><strong>Proprietary Software Required:</strong> ${distro.proprietary_software_required ? 'Yes' : 'No'}</p>
        <p><strong>Sysadmin:</strong> ${distro.sysadmin ? 'Yes' : 'No'}</p>
        <p><strong>Sysadmin Vulnerability:</strong> ${distro.sysadmin_vulnerability ? 'Yes' : 'No'}</p>
        <p><strong>Illegal:</strong> ${distro.illegal ? 'Yes' : 'No'}</p>

        <h3>NICE-TO-HAVE CRITERIA</h3>
        <p><strong>Security Vulnerability:</strong> ${distro.security_vulnerability ? 'Yes' : 'No'}</p>
        <p><strong>Active Community:</strong> ${distro.active_community ? 'Yes' : 'No'}</p>

        <h3>DETAILED SPECIFICATIONS</h3>
        <p><strong>RAM Usage Idle:</strong> ${distro.ram_usage_idle} MB</p>
        <p><strong>Disk Space Installed:</strong> ${distro.disk_space_installed} GB</p>
        <p><strong>ISO Size:</strong> ${distro.iso_size} MB</p>
        <p><strong>Boot Time:</strong> ${distro.boot_time} seconds</p>
        <p><strong>Package Manager:</strong> ${distro.package_manager}</p>
        <p><strong>Desktop Environments:</strong> ${distro.desktop_environments.join(', ')}</p>
        <p><strong>Default Desktop:</strong> ${distro.default_desktop}</p>
        <p><strong>Init System:</strong> ${distro.init_system}</p>
        <p><strong>Kernel:</strong> ${distro.kernel}</p>
        <p><strong>Release Model:</strong> ${distro.release_model}</p>
        <p><strong>Release Cycle (Months):</strong> ${distro.release_cycle_months}</p>
        <p><strong>Support Duration (Years):</strong> ${distro.support_duration_years}</p>
        <p><strong>Update Frequency:</strong> ${distro.update_frequency}</p>

        <h3>SECURITY & PRIVACY</h3>
        <p><strong>Privacy Rating:</strong> ${distro.privacy_rating}/10</p>
        <p><strong>Security Rating:</strong> ${distro.security_rating}/10</p>
        <p><strong>Firewall Default:</strong> ${distro.firewall_default ? 'Yes' : 'No'}</p>
        <p><strong>Firewall:</strong> ${distro.firewall ? 'Yes' : 'No'}</p>
        <p><strong>Encryption Support:</strong> ${distro.encryption_support ? 'Yes' : 'No'}</p>
        <p><strong>SELinux/AppArmor:</strong> ${distro.selinux_apparmor ? 'Yes' : 'No'}</p>
        <p><strong>Automatic Updates:</strong> ${distro.automatic_updates}</p>

        <h3>HARDWARE COMPATIBILITY</h3>
        <p><strong>WiFi:</strong> ${distro.wifi ? 'Yes' : 'No'}</p>
        <p><strong>Bluetooth:</strong> ${distro.bluetooth ? 'Yes' : 'No'}</p>
        <p><strong>Touchscreen:</strong> ${distro.touchscreen ? 'Yes' : 'No'}</p>
        <p><strong>HiDPI:</strong> ${distro.hidpi ? 'Yes' : 'No'}</p>
        <p><strong>ARM Support:</strong> ${distro.arm_ ? 'Yes' : 'No'}</p>
        <p><strong>Raspberry Pi Support:</strong> ${distro.raspberry ? 'Yes' : 'No'}</p>

        <h3>PERFORMANCE METRICS</h3>
        <p><strong>CPU Usage Idle:</strong> ${distro.cpu_usage_idle}%</p>
        <p><strong>Disk I/O Performance:</strong> ${distro.disk_io_performance}/10</p>
        <p><strong>Network Performance:</strong> ${distro.network_performance}/10</p>
        <p><strong>Gaming Performance:</strong> ${distro.gaming_performance}/10</p>

        <h3>USABILITY</h3>
        <p><strong>Beginner Friendliness:</strong> ${distro.beginner_friendliness}/10</p>
        <p><strong>Installer Difficulty:</strong> ${distro.installer_difficulty}/10</p>
        <p><strong>Post Install Setup:</strong> ${distro.post_install_setup}/10</p>
        <p><strong>GUI Tools Availability:</strong> ${distro.gui_tools_availability}/10</p>
        <p><strong>Software Center Quality:</strong> ${distro.software_center_quality}/10</p>

        <h3>DEVELOPMENT & PROFESSIONAL USE</h3>
        <p><strong>Development Tools:</strong> ${distro.development_tools}/10</p>
        <p><strong>Programming Languages Included:</strong> ${distro.programming_languages_included.join(', ')}</p>
        <p><strong>Container Support:</strong> ${distro.container_support}/10</p>
        <p><strong>Virtualization Support:</strong> ${distro.virtualization_support}/10</p>
        <p><strong>Server Suitability:</strong> ${distro.server_suitability}/10</p>
        <p><strong>Enterprise Features:</strong> ${distro.enterprise_features}/10</p>

        <h3>MULTIMEDIA & CREATIVITY</h3>
        <p><strong>Multimedia Codecs:</strong> ${distro.multimedia_codecs}/10</p>
        <p><strong>Audio Quality:</strong> ${distro.audio_quality}/10</p>
        <p><strong>Video Editing Support:</strong> ${distro.video_editing_support}/10</p>
        <p><strong>Graphics Design Tools:</strong> ${distro.graphics_design_tools}/10</p>

        <h3>ACCESSIBILITY</h3>
        <p><strong>Screen Reader Support:</strong> ${distro.screen_reader_support}/10</p>
        <p><strong>Keyboard Navigation:</strong> ${distro.keyboard_navigation}/10</p>
        <p><strong>High Contrast Themes:</strong> ${distro.high_contrast_themes ? 'Yes' : 'No'}</p>
        <p><strong>Font Scaling:</strong> ${distro.font_scaling ? 'Yes' : 'No'}</p>

        <h3>LOCALIZATION</h3>
        <p><strong>Languages Supported:</strong> ${distro.languages_supported}</p>
        <p><strong>RTL Language Support:</strong> ${distro.rtl_language_support ? 'Yes' : 'No'}</p>
        <p><strong>Regional Variants:</strong> ${distro.regional_variants.join(', ')}</p>

        <h3>COMMUNITY & ECOSYSTEM</h3>
        <p><strong>Forum Activity:</strong> ${distro.forum_activity}/10</p>
        <p><strong>GitHub Activity:</strong> ${distro.github_activity}/10</p>
        <p><strong>Commercial Support:</strong> ${distro.commercial_support ? 'Yes' : 'No'}</p>
        <p><strong>Third Party Repositories:</strong> ${distro.third_party_repositories}/10</p>
        <p><strong>Flatpak Support:</strong> ${distro.flatpak_support ? 'Yes' : 'No'}</p>
        <p><strong>Snap Support:</strong> ${distro.snap_support ? 'Yes' : 'No'}</p>
        <p><strong>AppImage Support:</strong> ${distro.appimage_support ? 'Yes' : 'No'}</p>

        <h3>SPECIAL FEATURES</h3>
        <p><strong>Live USB Support:</strong> ${distro.live_usb_support ? 'Yes' : 'No'}</p>
        <p><strong>Persistence Support:</strong> ${distro.persistence_support ? 'Yes' : 'No'}</p>
        <p><strong>Snapshot Rollback:</strong> ${distro.snapshot_rollback ? 'Yes' : 'No'}</p>
        <p><strong>Immutable System:</strong> ${distro.immutable_system ? 'Yes' : 'No'}</p>
        <p><strong>Unique Features:</strong> ${distro.unique_features.join(', ')}</p>
        <p><strong>Target Audience:</strong> ${distro.target_audience.join(', ')}</p>

        <h3>MAINTENANCE</h3>
        <p><strong>Manual Intervention Frequency:</strong> ${distro.manual_intervention_frequency}/10</p>
        <p><strong>Breaking Changes Frequency:</strong> ${distro.breaking_changes_frequency}/10</p>
        <p><strong>Long Term Stability:</strong> ${distro.long_term_stability}/10</p>
        <p><strong>Backup Tools Included:</strong> ${distro.backup_tools_included}/10</p>
      </div>
      <button class="close-button">Close</button>
    `;

    modal.style.display = 'block';

    // Close modal when clicking outside or on close button
    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.classList.contains('close-button')) {
        modal.style.display = 'none';
      }
    });
  }

  // Update statistics display
  updateStats() {
      const statsElement = document.getElementById('stats');
      if (statsElement) {
          statsElement.textContent = `Displaying ${this.filteredDistros.length} of ${this.allDistros.length} distributions`;
      }
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new DistroComparator();
  Promise.all([app.loadFilterTemplate(), app.loadDistrosFromJSON()]).then(() => {
    app.renderFilterControls();
    app.filterDistros();
  });
});