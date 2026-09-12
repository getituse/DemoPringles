/**
 * "what-input" modality tracking (~10 lines, no dependency).
 *
 * Some engines (Safari/macOS) apply `:focus-visible` to programmatic focus
 * regardless of the pointer, so UA focus heuristics cannot be trusted to
 * suppress rings after mouse clicks. We track the input modality ourselves:
 * Tab/Arrow keydown → keyboard; pointerdown → pointer (capture phase, so the
 * flag is settled before any element-level focus/pointer handlers run).
 */
let keyboardModality = false;

if (typeof window !== 'undefined') {
  window.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Tab' || e.key.startsWith('Arrow')) keyboardModality = true;
    },
    true,
  );
  window.addEventListener('pointerdown', () => {
    keyboardModality = false;
  }, true);
}

/** True when the current interaction modality is keyboard. */
export function isKeyboardModality(): boolean {
  return keyboardModality;
}
