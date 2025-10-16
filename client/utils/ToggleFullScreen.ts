export function toggleFullScreen(): void {
  const doc: Document = document
  const docEl: HTMLElement = document.documentElement

  if (!doc.fullscreenElement) {
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen()
    }
  } else {
    if (doc.exitFullscreen) {
      doc.exitFullscreen()
    }
  }
}
