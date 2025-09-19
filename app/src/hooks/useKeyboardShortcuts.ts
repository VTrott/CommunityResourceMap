import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          shortcut.key.toLowerCase() === (event.key || '').toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.metaKey === event.metaKey
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Common keyboard shortcuts for the app
export const APP_SHORTCUTS = {
  FOCUS_SEARCH: {
    key: '/',
    action: () => {
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    },
    description: 'Focus search input'
  },
  ESCAPE: {
    key: 'Escape',
    action: () => {
      // Close any open modals or clear selections
      const modals = document.querySelectorAll('[role="dialog"]');
      modals.forEach(modal => {
        const closeButton = modal.querySelector('[aria-label="Close"]') as HTMLButtonElement;
        if (closeButton) {
          closeButton.click();
        }
      });
    },
    description: 'Close modals and clear selections'
  },
  NEW_PLACE: {
    key: 'n',
    ctrlKey: true,
    action: () => {
      const newPlaceButton = document.querySelector('[data-action="new-place"]') as HTMLButtonElement;
      if (newPlaceButton) {
        newPlaceButton.click();
      }
    },
    description: 'Add new place (Ctrl+N)'
  },
  TOGGLE_VIEW: {
    key: 'v',
    ctrlKey: true,
    action: () => {
      const toggleButton = document.querySelector('[data-action="toggle-view"]') as HTMLButtonElement;
      if (toggleButton) {
        toggleButton.click();
      }
    },
    description: 'Toggle between map and list view (Ctrl+V)'
  }
} as const;
