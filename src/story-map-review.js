// Build omits this module and its notes from player releases.
export function installReview(controller, controls, chapter) {
  const label = document.createElement('label');
  label.className = 'story-review-switch';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'story-review-toggle';
  label.append(checkbox, document.createTextNode('開發審閱'));

  const status = document.createElement('span'); status.role = 'status';
  controller.reviewControls = [label, status];
  checkbox.addEventListener('change', async () => {
    if (!checkbox.checked) { controller.review = false; status.textContent = ''; controller.refresh(); return; }
    checkbox.disabled = true;
    try {
      const routeId = chapter.id.replace(/-chapter-\d+$/, '');
      const response = await fetch(`content/routes/${routeId}/story-map-review.json`, { cache: 'no-cache' });
      if (!response.ok) throw new Error('Review notes unavailable');
      const review = await response.json();
      controller.notes = review.revisions?.[controller.revision]?.notes || review.notes || {};
      controller.review = checkbox.checked;
      status.textContent = '唯讀・完整劇本';
      controller.refresh();
    } catch (error) {
      console.error(error); checkbox.checked = false; controller.review = false;
      status.textContent = '審閱資料載入失敗，請重新整理。'; controller.refresh();
    } finally { checkbox.disabled = false; }
  });
}
