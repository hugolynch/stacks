/**
 * Fullscreen API utilities for the Quarry game
 */

export interface FullscreenState {
  isFullscreen: boolean;
  isSupported: boolean;
}

let fullscreenState: FullscreenState = {
  isFullscreen: false,
  isSupported: false
};

const listeners: ((state: FullscreenState) => void)[] = [];

/**
 * Initialize fullscreen support detection
 */
export function initializeFullscreen(): void {
  fullscreenState.isSupported = !!(
    document.fullscreenEnabled ||
    (document as any).webkitFullscreenEnabled ||
    (document as any).mozFullScreenEnabled ||
    (document as any).msFullscreenEnabled
  );
  
  // Listen for fullscreen changes
  const events = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'MSFullscreenChange'
  ];
  
  events.forEach(event => {
    document.addEventListener(event, updateFullscreenState);
  });
  
  updateFullscreenState();
}

/**
 * Update the current fullscreen state
 */
function updateFullscreenState(): void {
  const isFullscreen = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
  
  if (fullscreenState.isFullscreen !== isFullscreen) {
    fullscreenState.isFullscreen = isFullscreen;
    notifyListeners();
  }
}

/**
 * Subscribe to fullscreen state changes
 */
export function onFullscreenChange(callback: (state: FullscreenState) => void): () => void {
  listeners.push(callback);
  // Call immediately with current state
  callback(fullscreenState);
  
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

/**
 * Get current fullscreen state
 */
export function getFullscreenState(): FullscreenState {
  return { ...fullscreenState };
}

/**
 * Check if the app is running as an installed PWA
 */
export function isRunningAsPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Auto-enter fullscreen if running as installed PWA
 */
export async function enterFullscreenIfPWA(): Promise<boolean> {
  if (!isRunningAsPWA()) {
    return false;
  }
  
  if (!fullscreenState.isSupported) {
    console.warn('Fullscreen is not supported on this device');
    return false;
  }
  
  if (fullscreenState.isFullscreen) {
    return true; // Already in fullscreen
  }
  
  try {
    await enterFullscreen();
    return true;
  } catch (error) {
    console.error('Failed to enter fullscreen for PWA:', error);
    return false;
  }
}

/**
 * Toggle fullscreen mode
 */
export async function toggleFullscreen(): Promise<boolean> {
  if (!fullscreenState.isSupported) {
    console.warn('Fullscreen is not supported on this device');
    return false;
  }
  
  try {
    if (fullscreenState.isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
    return true;
  } catch (error) {
    console.error('Failed to toggle fullscreen:', error);
    return false;
  }
}

/**
 * Enter fullscreen mode
 */
async function enterFullscreen(): Promise<void> {
  const element = document.documentElement;
  
  if (element.requestFullscreen) {
    await element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) {
    await (element as any).webkitRequestFullscreen();
  } else if ((element as any).mozRequestFullScreen) {
    await (element as any).mozRequestFullScreen();
  } else if ((element as any).msRequestFullscreen) {
    await (element as any).msRequestFullscreen();
  } else {
    throw new Error('Fullscreen API not available');
  }
}

/**
 * Exit fullscreen mode
 */
async function exitFullscreen(): Promise<void> {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    await (document as any).webkitExitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    await (document as any).mozCancelFullScreen();
  } else if ((document as any).msExitFullscreen) {
    await (document as any).msExitFullscreen();
  } else {
    throw new Error('Exit fullscreen API not available');
  }
}

/**
 * Notify all listeners of state changes
 */
function notifyListeners(): void {
  listeners.forEach(callback => {
    try {
      callback(fullscreenState);
    } catch (error) {
      console.error('Error in fullscreen listener:', error);
    }
  });
}
