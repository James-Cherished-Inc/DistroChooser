import { SessionState } from './SessionState.js';

class DistroComparator {
  constructor() {
    this.allDistros = []; // Load from comprehensive database
    this.filteredDistros = [];
    this.eliminatedDistros = new Set();
    this.currentFilters = {
      nonNegotiable: false,
      important: false,
      niceToHave: false,
      search: '',
      sortBy: 'overall',
      attributeFilters: {} // New object to store attribute-specific filter values
    };
    this.filterTemplate = null; // To store the loaded filter template
    this.tableHeadersGenerated = false; // Track if headers have been generated
    this.stateHandler = SessionState; // Use session-only handler
  }

  // Load the filter template from JSON
  async loadFilterTemplate() {
    try {
      // Load main template
      const templateResponse = await fetch('data/template.json5');
      const templateText = await templateResponse.text();
      this.filterTemplate = JSON5.parse(templateText);
      
      // Load descriptions
      const descResponse = await fetch('data/template_descriptions.json');
      const descText = await descResponse.text();
      console.log('Raw descriptions text:', descText); // Added log
      this.filterDescriptions = JSON.parse(descText).descriptions;
      console.log('Filter descriptions loaded:', this.filterDescriptions); // Re-added log
      
    } catch (error) {
      console.error('Error loading template or descriptions:', error);
    }
  }

  // Dynamically render filter controls based on the loaded template
  renderFilterControls() {
    if (!this.filterTemplate) {
      
      return;
    }
    

    console.time('renderFilterControls'); // Start timer for renderFilterControls
    const detailedFiltersContainer = document.getElementById('detailed-filters');
    
    if (!detailedFiltersContainer) {
        console.timeEnd('renderFilterControls'); // End timer if container not found
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
        if (["name", "description", "website"].includes(attributeName) || attributeName.startsWith('//') || attributeName.startsWith('----')) {
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

        // Determine the category placeholder based on attribute name and the new category structure
        let categoryPlaceholderId;
        if (['based_on', 'cost'].includes(attributeName)) {
            categoryPlaceholderId = 'general-info-filters';
        } else if (['ram_range', 'ram_requirements_recommended', 'disk_range', 'disk_requirements_recommended', 'cpu_range', 'cpu_cores_minimum', 'architecture_support'].includes(attributeName)) {
            categoryPlaceholderId = 'system-requirements-filters';
        } else if (['ram_usage_idle', 'disk_space_installed', 'iso_size', 'boot_time', 'package_manager', 'desktop_environments', 'default_desktop', 'init_system', 'kernel', 'release_model', 'release_cycle_months', 'support_duration_years', 'update_frequency'].includes(attributeName)) {
            categoryPlaceholderId = 'detailed-specifications-filters';
        } else if (['secure_boot', 'boot_level_vulnerability', 'telemetry', 'sysadmin_vulnerability', 'illegal', 'privacy_rating', 'security_rating', 'firewall_default', 'firewall', 'encryption_support', 'selinux_apparmor', 'automatic_updates', 'security_vulnerability'].includes(attributeName)) {
            categoryPlaceholderId = 'security-privacy-filters';
        } else if (['nvidia_support', 'wifi', 'bluetooth', 'touchscreen', 'hidpi', 'arm_', 'raspberry'].includes(attributeName)) {
            categoryPlaceholderId = 'hardware-compatibility-filters';
        } else if (['responsive', 'resource_efficient', 'power_efficient', 'lightweight', 'cpu_usage_idle', 'disk_io_performance', 'network_performance', 'gaming_performance'].includes(attributeName)) {
            categoryPlaceholderId = 'performance-metrics-filters';
        } else if (['gui_customization', 'terminal_range', 'app_compatibility', 'beginner_friendliness', 'installer_difficulty', 'post_install_setup', 'gui_tools_availability', 'software_center_quality'].includes(attributeName)) {
            categoryPlaceholderId = 'usability-filters';
        } else if (['sysadmin', 'development_tools', 'programming_languages_included', 'container_support', 'virtualization_support', 'server_suitability', 'enterprise_features'].includes(attributeName)) {
            categoryPlaceholderId = 'development-professional-use-filters';
        } else if (['multimedia_codecs', 'audio_quality', 'video_editing_support', 'graphics_design_tools'].includes(attributeName)) {
            categoryPlaceholderId = 'multimedia-creativity-filters';
        } else if (['screen_reader_support', 'keyboard_navigation', 'high_contrast_themes', 'font_scaling'].includes(attributeName)) {
            categoryPlaceholderId = 'accessibility-filters';
        } else if (['languages_supported', 'rtl_language_support', 'regional_variants'].includes(attributeName)) {
            categoryPlaceholderId = 'localization-filters';
        } else if (['documentation_quality', 'active_community', 'forum_activity', 'github_activity', 'commercial_support', 'third_party_repositories', 'flatpak_support', 'snap_support', 'appimage_support'].includes(attributeName)) {
            categoryPlaceholderId = 'community-ecosystem-filters';
        } else if (['free_software_ideology', 'proprietary_software_required', 'live_usb_support', 'persistence_support', 'snapshot_rollback', 'immutable_system', 'unique_features', 'target_audience'].includes(attributeName)) {
            categoryPlaceholderId = 'special-features-filters';
        } else if (['stability', 'updates', 'manual_intervention_frequency', 'breaking_changes_frequency', 'long_term_stability', 'backup_tools_included'].includes(attributeName)) {
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
        const labelContainer = document.createElement('div');
        labelContainer.className = 'label-container';
        
        const label = document.createElement('label');
        label.setAttribute('for', `${attributeName}-pref`);
        label.textContent = `${labelText}:`;
        labelContainer.appendChild(label);
        
        // Add help icon with description tooltip
        if (this.filterDescriptions && this.filterDescriptions[attributeName]) {
          const helpIcon = document.createElement('span');
          helpIcon.className = 'help-icon';
          helpIcon.textContent = '?';
          helpIcon.title = this.filterDescriptions[attributeName]; // Keep for accessibility fallback
          helpIcon.dataset.tooltip = this.filterDescriptions[attributeName]; // New data attribute for custom tooltip
          console.log(`Help icon created for ${attributeName}. Title: "${helpIcon.title}", Data-tooltip: "${helpIcon.dataset.tooltip}"`); // Re-added log
          // Prevent click events on help icon from propagating
          helpIcon.addEventListener('click', (e) => e.stopPropagation());
          labelContainer.appendChild(helpIcon);
          // Log computed style after appending to DOM
          setTimeout(() => {
            const computedStyle = window.getComputedStyle(helpIcon);
            console.log(`Computed style for ${attributeName} help icon: display=${computedStyle.display}, visibility=${computedStyle.visibility}, opacity=${computedStyle.opacity}`); // Re-added log
          }, 50); // Small delay to ensure rendering
        }
        
        attributeDiv.appendChild(labelContainer);

        // Create preference level slider with labels
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'priority-buttons-container';
        buttonContainer.style.display = 'block'; // Ensure proper layout

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
                this.debouncedFilterDistros();
            });
            buttonContainer.appendChild(button);
        });

        attributeDiv.appendChild(buttonContainer);

        // Create placeholder for value control
        const valueControlContainer = document.createElement('div');
        valueControlContainer.classList.add('attribute-value-control');
        attributeDiv.appendChild(valueControlContainer);

        // Declare variables at the top of the block
        let inputContainer, minVal, maxVal, stepVal;

        // Render the appropriate value control
        const controlResult = this.renderValueControl(attributeName, attributeType, attributeValue);
        let valueControlElement = controlResult.controlElement;

        valueControlContainer.appendChild(valueControlElement);

        if (attributeType === 'number' || attributeType === 'scale') {
            inputContainer = controlResult.inputContainer;
            minVal = controlResult.minVal;
            maxVal = controlResult.maxVal;
            stepVal = controlResult.stepVal;

            // Append input container AFTER the valueControlContainer, but still within attributeDiv
            attributeDiv.appendChild(inputContainer);
        }

        // Append the attributeDiv to the categoryPlaceholder
        categoryPlaceholder.appendChild(attributeDiv);

        // Initialize slider AFTER the element is in the DOM
        if (attributeType === 'number' || attributeType === 'scale') {
            // Initialize noUiSlider
            noUiSlider.create(valueControlElement, {
                start: [minVal, maxVal], // Initial range values (min, max)
                connect: true, // Connect the handles with a bar
                range: {
                    'min': minVal,
                    'max': maxVal
                },
                step: stepVal,
                tooltips: false // Disable tooltips to check if they are causing the "00" display
            });

            const minInput = inputContainer.querySelector('.range-min-input');
            const maxInput = inputContainer.querySelector('.range-max-input');

            // Link slider to input fields
            valueControlElement.noUiSlider.on('update', (values, handle) => {
                if (handle === 0) {
                    minInput.value = values[handle];
                } else {
                    maxInput.value = values[handle];
                }
            });

            // Link input fields to slider
            minInput.addEventListener('change', () => {
                valueControlElement.noUiSlider.set([minInput.value, null]);
                this.debouncedFilterDistros(); // Trigger filter on input change
            });

            maxInput.addEventListener('change', () => {
                valueControlElement.noUiSlider.set([null, maxInput.value]);
                this.debouncedFilterDistros(); // Trigger filter on input change
            });

            // Add a 'change' event listener to the slider itself to trigger filtering
            valueControlElement.noUiSlider.on('change', () => {
                this.debouncedFilterDistros();
            });
        } else if (attributeType === 'boolean' || attributeType === 'array' || attributeType === 'string') {
             valueControlElement.addEventListener('change', () => {
                this.debouncedFilterDistros();
             });
        }

        // Populate select options for array/string types AFTER the element is in the DOM
        if (attributeType === 'array' || attributeType === 'string') {
            this.populateSelectOptions(attributeName);
        }
        
    }
    console.timeEnd('renderFilterControls'); // End timer for renderFilterControls
}


  // Render the appropriate value control based on attribute type
  renderValueControl(attributeName, attributeType, attributeValue) {
    let controlElement;
    let inputContainer = null;
    let minVal = null;
    let maxVal = null;
    let stepVal = null;

    switch (attributeType) {
      case 'number':
      case 'scale':
        controlElement = document.createElement('div');
        controlElement.id = `${attributeName}-value`;
        controlElement.classList.add('control-range-slider');

        const isScale = attributeType === 'scale';
        // Set minVal=1 for scale attributes and specific number attributes (RAM, disk, CPU)
        minVal = isScale ? 1 : (['ram_range', 'disk_range', 'cpu_range'].includes(attributeName) ? 1 : 0);
        maxVal = isScale ? 10 : 100;
        stepVal = isScale ? 1 : 1;

        inputContainer = document.createElement('div');
        inputContainer.classList.add('range-input-container');

        const minInput = document.createElement('input');
        minInput.type = 'number';
        minInput.classList.add('range-min-input');
        minInput.setAttribute('min', minVal);
        minInput.setAttribute('max', maxVal);
        minInput.setAttribute('step', stepVal);
        minInput.value = minVal; // Set initial value

        const maxInput = document.createElement('input');
        maxInput.type = 'number';
        maxInput.classList.add('range-max-input');
        maxInput.setAttribute('min', minVal);
        maxInput.setAttribute('max', maxVal);
        maxInput.setAttribute('step', stepVal);
        maxInput.value = maxVal; // Set initial value

        inputContainer.appendChild(minInput);
        inputContainer.appendChild(document.createTextNode(' - '));
        inputContainer.appendChild(maxInput);

        // Return both elements for slider initialization
        return { controlElement, inputContainer, minVal, maxVal, stepVal, minInput, maxInput, type: attributeType };

        return { controlElement, inputContainer, minVal, maxVal, stepVal, type: attributeType };

      case 'boolean':
        const switchContainer = document.createElement('div');
        switchContainer.classList.add('custom-switch');
        switchContainer.id = `${attributeName}-value`;
        switchContainer.dataset.attribute = attributeName;

        if (attributeValue) {
          switchContainer.classList.add('on');
        }

        const switchToggle = document.createElement('div');
        switchToggle.classList.add('switch-toggle');
        switchContainer.appendChild(switchToggle);

        const switchLabel = document.createElement('span');
        switchLabel.classList.add('switch-label');
        switchLabel.textContent = attributeValue ? 'True' : 'False';
        switchContainer.appendChild(switchLabel);

        controlElement = switchContainer;
        break;

      case 'array':
      case 'string':
        controlElement = document.createElement('select');
        controlElement.id = `${attributeName}-value`;
        controlElement.multiple = true;
        controlElement.dataset.param = attributeName;
        controlElement.classList.add('tom-select');
        controlElement.classList.add(`control-${attributeType}`);
        break;

      default:
        controlElement = document.createElement('div');
        break;
    }

    // Add a class for styling based on control type
    controlElement.classList.add(`control-${attributeType}`);

    return { controlElement, type: attributeType };
  }

  // Populate select options for array and string attributes
  populateSelectOptions(attributeName) {
      const select = document.getElementById(`${attributeName}-value`);
      if (!select) {
        return;
      }
      if (!this.allDistros || this.allDistros.length === 0) {
        return;
      }

      const uniqueValues = new Set();
      this.allDistros.forEach(distro => {
          const value = distro[attributeName];
          if (Array.isArray(value)) {
              value.forEach(item => {
                  if (item !== null && item !== undefined) uniqueValues.add(String(item));
              });
          } else if (typeof value === 'string') {
              uniqueValues.add(value);
          }
      });

      // Clear existing options
      select.innerHTML = '';

      // Add unique values as options
      uniqueValues.forEach(value => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
      });

      // Initialize Tom Select after adding options
      new TomSelect(select, {
        placeholder: 'Select option...',
        allowEmptyOption: true,
        plugins: ['clear_button']
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
     this.allDistros = await Promise.all(distroPromises).then(results => {
      // console.log('Distro data loaded successfully. Number of distros:', results.length); // Debug log for successful load
      return results;
     }).catch(error => {
      console.error('Error loading distro data:', error);
      return [];
     });
     
     
     
     
     
     
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
/**
   * Calculate the recommendation score for a distro based on user filters and priorities.
   * This score is a weighted match of 'Nice-to-Have' and 'Important' criteria, as per the recommendation engine plan.
   */
  calculateRecommendationScore(distro) {
    let recommendationScore = 0;
    let maxPossibleScore = 0;
    const importantWeight = 2; // Weight for 'Important' criteria
    const niceToHaveWeight = 1; // Weight for 'Nice-to-Have' criteria

    for (const attributeName in this.filterTemplate) {
      if (["name", "description", "website"].includes(attributeName) || attributeName.startsWith('//') || attributeName.startsWith('----')) {
        continue; // Skip non-filter attributes
      }
      const attrDiv = document.querySelector(`.filter-attribute[data-attribute="${attributeName}"]`);
      if (attrDiv) {
        const activePriorityButton = attrDiv.querySelector('.priority-button.active');
        if (activePriorityButton) {
          const priorityLabel = activePriorityButton.textContent.trim();
          if (priorityLabel === "Don't care") { // Remove 'Non-negotiable' from skip condition to apply filtering
            continue; // Skip attributes with 'Don't care' or 'Non-negotiable' priority
          }
          let filterValue = this.currentFilters.attributeFilters[attributeName];
          const attributeType = attrDiv.dataset.type;
          const distroValue = distro[attributeName];
          let attributeMatchScore = 0;
          if (attributeType === 'boolean') {
            if (filterValue === true && distroValue === true) attributeMatchScore = 1;
            else attributeMatchScore = 0;
          } else if (attributeType === 'number' || attributeType === 'scale') {
            if (distroValue >= filterValue) attributeMatchScore = 1;
            else attributeMatchScore = 0;
          } else if (attributeType === 'array' || attributeType === 'string') {
            if (Array.isArray(filterValue) && Array.isArray(distroValue)) {
              const matchCount = filterValue.filter(val => distroValue.includes(val)).length;
              attributeMatchScore = filterValue.length > 0 ? matchCount / filterValue.length : 0;
            } else {
              attributeMatchScore = 0;
            }
          } else {
            attributeMatchScore = 0; // Unknown type, no match
          }
          let priorityWeight = 0;
          if (priorityLabel === 'Nice to have') priorityWeight = niceToHaveWeight;
          else if (priorityLabel === 'Important') priorityWeight = importantWeight;
          recommendationScore += attributeMatchScore * priorityWeight;
          maxPossibleScore += 1 * priorityWeight; // Max possible score for normalization
        }
      }
    }
    if (maxPossibleScore > 0) {
      return (recommendationScore / maxPossibleScore) * 100; // Normalize to 0-100 scale
    } else {
      return 0; // No criteria to score, return 0
    }
  }
  filterDistros() {
    console.time('filterDistros'); // Start timer for filterDistros
    // Show loading indicator
    const tableBody = document.getElementById('distroTableBody');
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="20" class="loading-indicator">Filtering distributions...</td></tr>';
    }

    // Use requestAnimationFrame to prevent blocking UI
    requestAnimationFrame(() => {
      // Ensure data is ready
      if (!this.allDistros || this.allDistros.length === 0) return;

      // Base list minus eliminated distros
      let list = this.allDistros.filter(d => !this.eliminatedDistros.has(d.name));

      // Reset attribute filter store
      this.currentFilters.attributeFilters = {};

      // Apply detailed filters (only if corresponding summary checkbox is checked)
      document.querySelectorAll('.filter-attribute').forEach(attrDiv => {
        const name = attrDiv.dataset.attribute;
        const type = attrDiv.dataset.type;
        // Determine if this attribute's filter should apply based on its priority and summary checkbox
        const pBtn = attrDiv.querySelector('.priority-button.active');
        const pVal = pBtn ? parseInt(pBtn.dataset.value, 10) : 1; // Default to "Don't care" if no button active
        const applyFilter = (pVal === 4 && this.currentFilters.nonNegotiable) ||
                            (pVal === 3 && this.currentFilters.important) ||
                            (pVal === 2 && this.currentFilters.niceToHave);
        let val, active = false; // Initialize active to false

        if (type === 'boolean') {
          const sw = attrDiv.querySelector('.custom-switch');
          val = sw.classList.contains('on');
          active = val; // A boolean filter is active if the switch is 'on'
          if (applyFilter && active) {
            list = list.filter(d => d[name] === true);
          }
        } else if (type === 'number' || type === 'scale') {
          const slider = attrDiv.querySelector('.control-range-slider').noUiSlider;
          const rangeValues = slider.get().map(Number); // Get [min, max] as numbers
          val = rangeValues;
          // A range filter is active if the selected range is different from the full range
          const range = slider.options.range;
          active = rangeValues[0] !== range.min || rangeValues[1] !== range.max;
          if (applyFilter && active) {
            list = list.filter(d => {
              const distroValue = d[name];
              return typeof distroValue === 'number' && distroValue >= rangeValues[0] && distroValue <= rangeValues[1];
            });
          }
        } else { // array or string
          const sel = attrDiv.querySelector('select.tom-select');
          val = sel && sel.tomselect ? sel.tomselect.getValue() : [];
          active = Array.isArray(val) && val.length > 0; // A select filter is active if options are selected
          if (applyFilter && active) {
            list = list.filter(d => {
              const dvd = Array.isArray(d[name]) ? d[name] : [d[name]];
              // Use 'some' for OR logic when applying filters based on summary checkboxes
              return Array.isArray(val) && val.some(v => dvd.includes(v));
            });
          }
        }

        this.currentFilters.attributeFilters[name] = val;
      });

      this.filteredDistros = list;
      this.filteredDistros.forEach(d => d.recommendationScore = this.calculateRecommendationScore(d));
      this.sortDistros();
      this.renderTable();
      this.updateStats();
      this.updateActiveFilters();
      console.timeEnd('filterDistros'); // End timer for filterDistros
    });

    // Apply summary filters in order: NN (4), Important (3), Nice-to-Have (2)
    [
      { key: 'nonNegotiable', level: '4' },
      { key: 'important', level: '3' },
      { key: 'niceToHave', level: '2' }
    ].forEach(({ key, level }) => {
      if (this.currentFilters[key]) {
        document.querySelectorAll('.filter-attribute').forEach(attrDiv => {
          const btn = attrDiv.querySelector('.priority-button.active');
          if (btn && btn.dataset.value === level) {
            const name = attrDiv.dataset.attribute;
            const type = attrDiv.dataset.type;
            const filterVal = this.currentFilters.attributeFilters[name];
            if (filterVal == null) return;
            if (type === 'boolean') {
              list = list.filter(d => d[name] === true);
            } else if (type === 'number' || type === 'scale') {
              // Filter based on the selected range [min, max]
              if (Array.isArray(filterVal) && filterVal.length === 2) {
                list = list.filter(d => typeof d[name] === 'number' && d[name] >= filterVal[0] && d[name] <= filterVal[1]);
              }
            } else {
              list = list.filter(d => {
                const dvd = Array.isArray(d[name]) ? d[name] : [d[name]];
                return Array.isArray(filterVal) && filterVal.some(v => dvd.includes(v));
              });
            }
          }
        });
      }
    });
  }


  // Debounce filter to prevent excessive calls
  debouncedFilterDistros = _.debounce(() => this.filterDistros(), 300);

  // Sort distributions based on criteria
  sortDistros() {
    const sortBy = this.currentFilters.sortBy;
    // Predefined scores for specific sort keys that use the calculateScores method
    const scoreBasedSortKeys = ['overall', 'nonNegotiable', 'important', 'niceToHave', 'recommendationScore'];

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
    console.time('renderTable'); // Start timer for renderTable
    const tableContainer = document.getElementById('table-container');
    if (!tableContainer) {
      console.timeEnd('renderTable'); // End timer if container not found
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
      { label: 'System Requirements', keys: ['ram_range', 'ram_requirements_recommended', 'disk_range', 'disk_requirements_recommended', 'cpu_range', 'cpu_cores_minimum', 'architecture_support'] },
      { label: 'Non-Negotiable Criteria', keys: ['secure_boot', 'boot_level_vulnerability', 'gui_customization', 'terminal_range', 'app_compatibility', 'nvidia_support', 'telemetry', 'stability', 'updates', 'responsive', 'resource_efficient', 'power_efficient', 'cost', 'documentation_quality', 'lightweight'] },
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
          } else if (key === 'recommendationScore') {
            // Display recommendation score, rounded to 2 decimal places
            td.textContent = distro.recommendationScore != null ? distro.recommendationScore.toFixed(2) : '';
          }
          else {
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
    console.timeEnd('renderTable'); // End timer for renderTable
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
      // Update the filtered and total count in the stats display
      const filteredCountElem = document.getElementById('filtered-count');
      const totalCountElem = document.getElementById('total-count');
      if (filteredCountElem && totalCountElem) {
          filteredCountElem.textContent = this.filteredDistros.length;
          totalCountElem.textContent = this.allDistros.length;
      }
      
      // Update the header stats display with formatted string
      const headerStatsElem = document.getElementById('header-stats');
      if (headerStatsElem) {
          headerStatsElem.textContent = ` - ${this.filteredDistros.length} of ${this.allDistros.length} distros are displayed now`;
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
          // Add reset icon to badge for priority filter
          const resetIcon = document.createElement('span');
          resetIcon.className = 'reset-icon';
          resetIcon.textContent = ' ✕';
          resetIcon.title = 'Reset filter';
          resetIcon.addEventListener('click', (e) => {
              e.stopPropagation();
              this.resetFilter(attributeName);
          });
          badge.appendChild(resetIcon);
      });
 
      // Display attribute-specific filters
      for (const attributeName in this.currentFilters.attributeFilters) {
          const filterValue = this.currentFilters.attributeFilters[attributeName];
          if (filterValue !== undefined && filterValue !== null &&
              !(Array.isArray(filterValue) && filterValue.length === 0) &&
              !(typeof filterValue === 'boolean' && filterValue === false)) { // Don't show 'false' for booleans
              const formattedAttr = attributeName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              let displayValue = Array.isArray(filterValue) ? filterValue.join(', ') : String(filterValue);
              const badge = document.createElement('span');
              badge.className = 'filter-badge attribute-badge';
              badge.textContent = `${formattedAttr}: ${displayValue}`;
              container.appendChild(badge);
              // Add reset icon to badge for value filter
              const resetIcon = document.createElement('span');
              resetIcon.className = 'reset-icon';
              resetIcon.textContent = ' ✕';
              resetIcon.title = 'Reset filter';
              resetIcon.addEventListener('click', (e) => {
                  e.stopPropagation();
                  this.resetFilter(attributeName);
              });
              badge.appendChild(resetIcon);
          }
      }
  }
  // Reset a filter attribute to default values
  resetFilter(attributeName) {
      const attrDiv = document.querySelector(`.filter-attribute[data-attribute="${attributeName}"]`);
      if (!attrDiv) return;
      // Reset priority buttons to default ("Don't care" = value 1)
      const buttons = attrDiv.querySelectorAll('.priority-button');
      buttons.forEach(btn => btn.classList.remove('active'));
      buttons.forEach(btn => {
          if (btn.dataset.value === '1') btn.classList.add('active');
      });
      // Reset value control to default
      const type = attrDiv.dataset.type;
      if (type === 'boolean') {
          const sw = attrDiv.querySelector('.custom-switch');
          if (sw.classList.contains('on')) {
              sw.click(); // toggle off to false
          }
      } else if (type === 'number' || type === 'scale') {
          const slider = attrDiv.querySelector('.control-range-slider').noUiSlider;
          const range = slider.options.range;
          slider.set([range.min, range.max]); // Reset to full range
      } else {
          const select = attrDiv.querySelector('select.tom-select');
          if (select && select.tomselect) {
              select.tomselect.clear();
          }
      }
      this.filterDistros();
      this.updateActiveFilters();
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.time('DOMContentLoaded handler'); // Start timer for DOMContentLoaded
  const app = new DistroComparator();
  Promise.all([app.loadFilterTemplate(), app.loadDistrosFromJSON()]).then(() => {
    // Initialize currentFilters based on checkbox states after DOM is ready and data loaded
    const nonNegotiableCb = document.getElementById('filterNonNegotiable');
    const importantCb = document.getElementById('filterImportant');
    const niceToHaveCb = document.getElementById('filterNiceToHave');
    if (nonNegotiableCb) app.currentFilters.nonNegotiable = nonNegotiableCb.checked;
    if (importantCb) app.currentFilters.important = importantCb.checked;
    if (niceToHaveCb) app.currentFilters.niceToHave = niceToHaveCb.checked;
    
    // Defer filter rendering slightly to ensure DOM is fully ready for manipulation
    console.log('Scheduling renderFilterControls via setTimeout');
    setTimeout(() => {
        console.time('setTimeout renderFilterControls'); // Start timer for setTimeout callback
        app.renderFilterControls();
        console.timeEnd('setTimeout renderFilterControls'); // End timer for setTimeout callback
    }, 0);
    // Apply initial filter based on current state
    console.log('Calling initial filterDistros');
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
                console.log(`Checkbox ${id} changed, calling filterDistros`);
                app.filterDistros();
            });
        }
    });
    // Initial display of active filters
    app.updateActiveFilters();
    console.timeEnd('DOMContentLoaded handler'); // End timer for DOMContentLoaded
// Add event listeners for scroll arrows inside DOMContentLoaded
document.getElementById('scroll-to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('scroll-to-bottom').addEventListener('click', () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});


   });
 
   // Add event listener to clear state on page unload
   window.addEventListener('beforeunload', () => {
     app.filteredDistros = [];
     app.eliminatedDistros.clear();
     app.currentFilters = {
       nonNegotiable: false,
       important: false,
       niceToHave: false,
       search: '',
       sortBy: 'overall',
       attributeFilters: {}
     };
     console.log('Application state cleared on unload.');
   });

   // Add collapsible functionality to Detailed Filters section
   const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
   
   // Add Author Panel functionality
   const authorPanelBtn = document.getElementById('authorPanelBtn');
   const authorPanelOverlay = document.getElementById('author-panel-overlay');
   const authorPanelCloseBtn = document.querySelector('#author-panel-overlay .close-btn');

   if (authorPanelBtn && authorPanelOverlay && authorPanelCloseBtn) {
     authorPanelBtn.addEventListener('click', showAuthorPanel);
     authorPanelCloseBtn.addEventListener('click', hideAuthorPanel);
     // Close panel when clicking outside
     authorPanelOverlay.addEventListener('click', (event) => {
       if (event.target === authorPanelOverlay) {
         hideAuthorPanel();
       }
     });
   }

   function showAuthorPanel() {
     authorPanelOverlay.classList.add('visible');
     loadTwitterWidget();
   }

   function hideAuthorPanel() {
     authorPanelOverlay.classList.remove('visible');
   }

   function loadAuthorBio() {
     fetch('data/author_bio.md')
       .then(response => {
         if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
         }
         return response.text();
       })
       .then(text => {
         const authorBio = document.getElementById('author-bio');
         if (authorBio) {
           authorBio.innerHTML = text; // Basic text insertion
         } else {
           console.error("Author bio element not found.");
         }
       })
       .catch(error => {
         console.error("Error fetching author bio:", error);
         const authorBio = document.getElementById('author-bio');
         if (authorBio) {
           authorBio.textContent = "Failed to load author bio. Please check the console for details.";
         }
       });
   }

   function loadTwitterWidget() {
     loadAuthorBio();
     // Load X widget script if not already loaded
     if (!window.twttr) {
       const script = document.createElement('script');
       script.src = "https://platform.twitter.com/widgets.js";
       script.setAttribute('async', ''); // Add async attribute
       script.setAttribute('charset', 'utf-8'); // Add charset attribute
       document.head.appendChild(script);
     }
     
     // Ensure the Twitter widget script is loaded before creating the button
     if (window.twttr && window.twttr.widgets) {
        twttr.widgets.createFollowButton(
          'JamesCherished', // Your Twitter handle
          document.querySelector('.twitter-follow-container'),
          { size: 'large' }
        );
     } else {
        // If twttr is not yet available, wait for it
        window.twttr_events = window.twttr_events || [];
        window.twttr_events.push(() => {
            twttr.widgets.createFollowButton(
              'JamesCherished', // Your Twitter handle
              document.querySelector('.twitter-follow-container'),
              { size: 'large' }
            );
        });
     }
   }

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
