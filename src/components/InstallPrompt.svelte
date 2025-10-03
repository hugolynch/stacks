<script lang="ts">
  import { onMount } from 'svelte'
  
  let deferredPrompt: any = null
  let showInstallPrompt = $state(false)
  let isInstalled = $state(false)

  onMount(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      isInstalled = true
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      deferredPrompt = e
      // Show the install prompt
      showInstallPrompt = true
    })

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      isInstalled = true
      showInstallPrompt = false
      deferredPrompt = null
    })
  })

  async function handleInstallClick() {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
    
    // Clear the deferredPrompt
    deferredPrompt = null
    showInstallPrompt = false
  }

  function dismissInstallPrompt() {
    showInstallPrompt = false
  }
</script>

{#if showInstallPrompt && !isInstalled}
  <div class="install-prompt">
    <div class="install-content">
      <div class="install-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        </svg>
      </div>
      <div class="install-text">
        <h3>Install Quarry</h3>
        <p>Install this app on your device for a better experience!</p>
      </div>
      <div class="install-actions">
        <button class="install-button" onclick={handleInstallClick}>
          Install
        </button>
        <button class="dismiss-button" onclick={dismissInstallPrompt} aria-label="Dismiss install prompt">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .install-prompt {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-width: 400px;
    margin: 0 auto;
  }

  .install-content {
    display: flex;
    align-items: center;
    padding: 16px;
    gap: 12px;
  }

  .install-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #007bff, #0056b3);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .install-icon svg {
    width: 24px;
    height: 24px;
  }

  .install-text {
    flex: 1;
    min-width: 0;
  }

  .install-text h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .install-text p {
    margin: 0;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
  }

  .install-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .install-button {
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .install-button:hover {
    background: #0056b3;
  }

  .dismiss-button {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .dismiss-button:hover {
    background: #f0f0f0;
  }

  .dismiss-button svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 480px) {
    .install-prompt {
      left: 12px;
      right: 12px;
      bottom: 12px;
    }
    
    .install-content {
      padding: 12px;
      gap: 10px;
    }
    
    .install-icon {
      width: 36px;
      height: 36px;
    }
    
    .install-icon svg {
      width: 20px;
      height: 20px;
    }
    
    .install-text h3 {
      font-size: 15px;
    }
    
    .install-text p {
      font-size: 13px;
    }
  }
</style>
