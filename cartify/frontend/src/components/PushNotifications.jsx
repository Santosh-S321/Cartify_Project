import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './PushNotifications.css';

function PushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    // Check if push notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPushNotifications = async () => {
    setLoading(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        alert('⚠️ Please allow notifications to receive updates!');
        setLoading(false);
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      // Note: In production, you need a VAPID public key from your backend
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // This is a placeholder - replace with your actual VAPID public key
          'BJ2KpetVrmjMogqeoVCFxMhJgJtKUKcxlIrO-bTD4wtXBhyQ4fMCf_eWofiEgw4LB6o6jWZvrEtiTsm8icC9eLw'
        )
      });

      // Send subscription to backend
      await axios.post(`${API_URL}/notifications/subscribe`, {
        subscription,
        userId: user?.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsSubscribed(true);
      
      // Show success notification
      await registration.showNotification('🎉 Notifications Enabled!', {
        body: 'You will now receive updates about your orders and special offers.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        tag: 'welcome-notification'
      });

      console.log('✅ Push notification subscription successful');
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
      alert('Failed to enable notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify backend
        await axios.post(`${API_URL}/notifications/unsubscribe`, {
          userId: user?.id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setIsSubscribed(false);
        console.log('✅ Unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('❌ Unsubscribe failed:', error);
      alert('Failed to unsubscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification('🛒 Test Notification', {
        body: 'This is a test notification from Cartify!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: 'test-notification',
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        },
        actions: [
          {
            action: 'explore',
            title: 'Go to Shop',
            icon: '/icons/shop-icon.png'
          },
          {
            action: 'close',
            title: 'Close',
            icon: '/icons/close-icon.png'
          }
        ]
      });

      console.log('✅ Test notification sent');
    } catch (error) {
      console.error('❌ Test notification failed:', error);
      alert('Failed to send test notification');
    }
  };

  if (!isSupported) {
    return (
      <div className="notification-settings">
        <div className="not-supported">
          <span className="icon">⚠️</span>
          <h3>Notifications Not Supported</h3>
          <p>Your browser doesn't support push notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="notification-header">
        <span className="notification-icon">🔔</span>
        <div>
          <h3>Push Notifications</h3>
          <p>Get updates about your orders and special offers</p>
        </div>
      </div>

      <div className="notification-status">
        <div className={`status-badge ${isSubscribed ? 'active' : 'inactive'}`}>
          {isSubscribed ? '✅ Enabled' : '❌ Disabled'}
        </div>
      </div>

      <div className="notification-benefits">
        <h4>📱 Benefits:</h4>
        <ul>
          <li>✓ Order status updates in real-time</li>
          <li>✓ Exclusive deals and flash sales</li>
          <li>✓ Price drop alerts on saved items</li>
          <li>✓ Delivery notifications</li>
        </ul>
      </div>

      <div className="notification-actions">
        {!isSubscribed ? (
          <button 
            className="enable-btn" 
            onClick={subscribeToPushNotifications}
            disabled={loading}
          >
            {loading ? '⏳ Enabling...' : '🔔 Enable Notifications'}
          </button>
        ) : (
          <>
            <button 
              className="test-btn" 
              onClick={testNotification}
            >
              🧪 Send Test Notification
            </button>
            <button 
              className="disable-btn" 
              onClick={unsubscribeFromPushNotifications}
              disabled={loading}
            >
              {loading ? '⏳ Disabling...' : '🔕 Disable Notifications'}
            </button>
          </>
        )}
      </div>

      <div className="notification-info">
        <p className="info-text">
          💡 <strong>Tip:</strong> You can change notification settings anytime in your browser or device settings.
        </p>
      </div>
    </div>
  );
}

export default PushNotifications;