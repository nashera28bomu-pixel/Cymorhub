// All modules self-initialize on DOMContentLoaded.
// This file is kept as the final script tag so it's the natural place
// to add any cross-module orchestration as Cymor Hub grows.
document.addEventListener('cymor:loaded', () => {
  // Fires once the boot-sequence loader finishes and the hub is revealed.
});
