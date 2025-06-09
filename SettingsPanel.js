import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // Import react-markdown
import './SettingsPanel.css';
import { useAppContext } from '../contexts/AppContext.js'; // Import context hook

function SettingsPanel({ isVisible, onClose }) { // Remove modeConfig and selectMode props
  const [apiKey, setApiKey] = useState('');
  const [userGuideContent, setUserGuideContent] = useState('Loading user guide...'); // State for guide content
  const [isLoadingGuide, setIsLoadingGuide] = useState(false); // State for loading status
  const [cloudSession, setCloudSession] = useState(null);

  // --- Consume Context ---
  const {
    modeConfig,
    selectMode,
  } = useAppContext();

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('openRouterApiKey');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Fetch user guide when panel becomes visible
  useEffect(() => {
    if (isVisible && !isLoadingGuide && userGuideContent === 'Loading user guide...') { // Only fetch if visible and not already loaded/loading
      setIsLoadingGuide(true);
      // Use the full API URL from environment variables
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Fallback for safety
      fetch(`${apiUrl}/api/docs/user_guide.md`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(text => {
          setUserGuideContent(text);
        })
        .catch(error => {
          console.error("Error fetching user guide:", error);
          setUserGuideContent("Failed to load user guide. Please check the console for details.");
        })
        .finally(() => {
          setIsLoadingGuide(false);
        });
    }
  }, [isVisible, isLoadingGuide, userGuideContent]); // Add dependencies

  // Fetch cloud session information when in cloud mode
  useEffect(() => {
    if (modeConfig && modeConfig.mode === 'cloud') {
      fetch('/api/cloud/session')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setCloudSession(data);
        })
        .catch(error => {
          console.error("Error fetching cloud session:", error);
          // Handle error appropriately (e.g., display an error message)
        });
    } else {
      setCloudSession(null);
    }
  }, [modeConfig]);

  const handleSaveKey = (event) => {
    event.preventDefault(); // Prevent form submission from refreshing the page
    localStorage.setItem('openRouterApiKey', apiKey);
    alert('API Key saved!'); // Simple confirmation for now
    // TODO: Add visual feedback instead of alert
  };

  const handleModeSwitch = () => {
    if (modeConfig && modeConfig.mode === 'local') {
      selectMode('cloud');
    } else {
      selectMode('local');
    }
    console.log('handleModeSwitch called');
  };

  // Use a dynamic class for the overlay based on visibility
  const overlayClassName = `settings-panel-overlay ${isVisible ? 'visible' : ''}`;

  // No need to return null, CSS handles visibility via the overlay class
  // if (!isVisible) {
  //   return null;
  // }

  return (
    // Add the 'visible' class dynamically
    <div className={overlayClassName} onClick={onClose}>
      {console.log("SettingsPanel rendered")}
      <div className="settings-panel-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Settings</h2>

        {/* 1. OpenRouter API Key */}
        <div className="settings-section">
          <form onSubmit={handleSaveKey}>
            <label htmlFor="apiKey">OpenRouter API Key:</label>
            <input
              type="password" // Use password type to obscure the key
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenRouter API key"
            />
            <button type="submit">Save Key</button>
          </form>
        </div>

        {/* Mode Transition UI */}
        <div className="settings-section">
          <h3>Mode</h3>{/* Add check for modeConfig before accessing its properties */}
          <p>Current mode: {modeConfig?.mode ? modeConfig.mode : 'Loading...'}</p>
          {modeConfig?.mode === 'cloud' && (
            <>
              <p>Cloud Session ID: {cloudSession ? cloudSession.sessionId : 'Loading...'}</p>
              <p>Storage Quota: {cloudSession ? cloudSession.storageQuota : 'Loading...'}</p>
              <p>Used Storage: {cloudSession ? cloudSession.usedStorage : 'Loading...'}</p>
            </>
          )}
          <button onClick={handleModeSwitch}>
            Switch to {modeConfig && modeConfig.mode === 'local' ? 'Cloud' : 'Local'} Mode
          </button>
        </div>

        {/* 2. Support Me Link */}
        <div className="settings-section">
          <a href="https://cherished.website/contribute" target="_blank" rel="noopener noreferrer" className="animated-link support-link">
            💖 Support Me
          </a>
        </div>
        <div className="settings-section">
          <a href="https://cherished.website/feedback" target="_blank" rel="noopener noreferrer" className="animated-link feedback-link">
            📋 Feedback
          </a>
        </div>

        {/* 3. About Link */}
        <div className="settings-section">
          <a href="https://cherished.website/about-docs-nexus" target="_blank" rel="noopener noreferrer" className="animated-link about-link">
            ℹ️ About Docs Nexus
          </a>
        </div>

        {/* 4. User Guide */}
        <div className="settings-section user-guide-section">
          <h3>User Guide</h3>
          <div className="user-guide-content">
            {/* Render the fetched markdown content */}
            <ReactMarkdown>{userGuideContent}</ReactMarkdown>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SettingsPanel;
