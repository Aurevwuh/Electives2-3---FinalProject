import soundManager from '@/library/soundManager.js';

/**
 * Composable for button sound effects
 */
export function useButtonSounds() {
  const playClickSound = () => {
    soundManager.play('clickSfx');
  };

  const playHoverSound = () => {
    soundManager.play('hoverButton');
  };

  return {
    playClickSound,
    playHoverSound
  };
}
