import React, { useState, useEffect } from 'react';
import './InstallPrompt.css';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Show install prompt after 3 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      console.log('✅ PWA Install prompt available');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA was installed');
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('❌ No install prompt available');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('✅ User accepted the install prompt');
    } else {
      console.log('❌ User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    
    // Show again after 24 hours
    const dismissedTime = Date.now();
    localStorage.setItem('pwaPromptDismissed', dismissedTime.toString());
  };

  // Don't show if already installed or dismissed recently
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwaPromptDismissed');
    if (dismissedTime) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        setShowPrompt(false);
      }
    }
  }, []);

  // Don't render if installed or shouldn't show
  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="install-prompt-overlay">
      <div className="install-prompt-card">
        <button className="close-btn" onClick={handleDismiss} aria-label="Close">
          ✕
        </button>

        <div className="install-icon">📱</div>

        <h2 className="install-title">Install Cartify App</h2>

        <p className="install-description">
          Install our app for a better shopping experience!
        </p>

        <div className="install-features">
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Faster loading</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📴</span>
            <span>Works offline</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔔</span>
            <span>Push notifications</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🏠</span>
            <span>Home screen access</span>
          </div>
        </div>

        <div className="install-buttons">
          <button className="install-btn" onClick={handleInstallClick}>
            📥 Install Now
          </button>
          <button className="dismiss-btn" onClick={handleDismiss}>
            Maybe Later
          </button>
        </div>

        <p className="install-note">
          Free • Takes just 2 seconds • No download needed
        </p>
      </div>
    </div>
  );
}

export default InstallPrompt;