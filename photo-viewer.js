// Shared photo lightbox — click any image wired via makeViewable() to see it full-size.

let overlay = null;

function ensureOverlay() {
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'photo-viewer-overlay';
  overlay.className = 'modal-overlay photo-viewer-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="photo-viewer-stage">
      <button type="button" class="photo-viewer-close" aria-label="Close">&times;</button>
      <img id="photo-viewer-image" alt="" />
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('.photo-viewer-close').addEventListener('click', closePhotoViewer);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePhotoViewer();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closePhotoViewer();
  });

  return overlay;
}

export function openPhotoViewer(src, alt) {
  if (!src) return;
  const modal = ensureOverlay();
  const img = modal.querySelector('#photo-viewer-image');
  img.src = src;
  img.alt = alt || '';
  modal.hidden = false;
  modal.style.display = 'flex';
}

export function closePhotoViewer() {
  if (!overlay) return;
  overlay.hidden = true;
  overlay.style.display = 'none';
}

export function makeViewable(imgEl) {
  if (!imgEl) return;
  imgEl.classList.add('photo-viewable');
  imgEl.addEventListener('click', () => openPhotoViewer(imgEl.src, imgEl.alt));
}
