/**
 * Button Sound Effects Utility
 * Automatically adds sound effects to buttons with data-sound attribute
 */

import soundManager from '@/library/soundManager.js';

export function initButtonSounds() {
  // Listen for all button clicks
  document.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button && button.dataset.sound !== 'false') {
      soundManager.play('clickSfx');
    }
  }, true);

  // Listen for all button hovers
  document.addEventListener('mouseenter', (e) => {
    const button = e.target.closest('button');
    if (button && button.dataset.soundHover !== 'false') {
      soundManager.play('hoverButton');
    }
  }, true);
}
