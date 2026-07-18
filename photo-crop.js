// Shared photo crop/zoom modal, built on Cropper.js (loaded globally via CDN script tag).
// Usage: const croppedFile = await cropImageFile(originalFile); if (croppedFile) { ...use it... }

let overlay = null;

function ensureOverlay() {
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'photo-crop-overlay';
  overlay.className = 'modal-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="modal-card crop-modal-card">
      <div class="modal-header">
        <h3>Adjust Photo</h3>
        <button type="button" class="modal-close" id="crop-modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="crop-stage">
        <img id="crop-target-image" alt="" />
      </div>
      <p class="field-hint crop-hint">Drag to reposition &middot; scroll or pinch to zoom</p>
      <div class="crop-modal-actions">
        <button type="button" class="btn btn-primary" id="crop-confirm-btn">Use Photo</button>
        <button type="button" class="btn btn-secondary" id="crop-cancel-btn">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

export function cropImageFile(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve(null);
      return;
    }

    const modal = ensureOverlay();
    const img = modal.querySelector('#crop-target-image');
    const closeBtn = modal.querySelector('#crop-modal-close');
    const confirmBtn = modal.querySelector('#crop-confirm-btn');
    const cancelBtn = modal.querySelector('#crop-cancel-btn');

    const objectUrl = URL.createObjectURL(file);
    let cropper = null;
    let settled = false;

    function cleanup(result) {
      if (settled) return;
      settled = true;
      modal.hidden = true;
      modal.style.display = 'none';
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
      URL.revokeObjectURL(objectUrl);
      img.removeAttribute('src');
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      closeBtn.removeEventListener('click', onCancel);
      modal.removeEventListener('click', onOverlayClick);
      resolve(result);
    }

    function onConfirm() {
      if (!cropper) {
        cleanup(null);
        return;
      }
      cropper.getCroppedCanvas({ width: 480, height: 480, imageSmoothingQuality: 'high' }).toBlob((blob) => {
        if (!blob) {
          cleanup(null);
          return;
        }
        const baseName = file.name ? file.name.replace(/\.[^./\\]+$/, '') : 'photo';
        const croppedFile = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
        cleanup(croppedFile);
      }, 'image/jpeg', 0.9);
    }

    function onCancel() {
      cleanup(null);
    }

    function onOverlayClick(e) {
      if (e.target === modal) onCancel();
    }

    img.onload = () => {
      cropper = new window.Cropper(img, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move',
        cropBoxResizable: false,
        cropBoxMovable: false,
        toggleDragModeOnDblclick: false,
        background: false,
        autoCropArea: 1,
        guides: false,
        center: false,
        highlight: false,
      });
    };
    img.src = objectUrl;

    modal.hidden = false;
    modal.style.display = 'flex';

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    closeBtn.addEventListener('click', onCancel);
    modal.addEventListener('click', onOverlayClick);
  });
}
