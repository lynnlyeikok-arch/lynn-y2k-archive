import { useEffect, useRef } from 'react'
import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

const PDF_SRC = '/documents/magazine-apa7-references.pdf'

const linkService = {
  externalLinkEnabled: true,
  addLinkAttributes(link: HTMLAnchorElement, url: string) {
    link.href = url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.title = url
  },
  getDestinationHash() {
    return '#'
  },
  getAnchorUrl() {
    return '#'
  },
  goToDestination() {},
  executeNamedAction() {},
  executeSetOCGState() {},
  getAttachmentContent() {
    return Promise.resolve(null)
  },
}

export function ReferencesPdf() {
  const viewerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    let cancelled = false
    let token = 0
    let loadingTask: PDFDocumentLoadingTask | null = null
    let pdf: PDFDocumentProxy | null = null
    let page: PDFPageProxy | null = null
    let renderTask: { cancel: () => void; promise: Promise<unknown> } | null = null
    let pdfjs: typeof import('pdfjs-dist') | null = null
    let lastKey = ''

    const render = async () => {
      if (!pdfjs || !page || cancelled) return
      const width = viewer.clientWidth
      if (width < 2) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const key = `${Math.round(width)}:${dpr}`
      if (key === lastKey) return
      const current = ++token
      try {
        renderTask?.cancel()
      } catch {
        /* The render may already have finished. */
      }

      const base = page.getViewport({ scale: 1 })
      const scale = width / base.width
      const viewport = page.getViewport({ scale: scale * dpr })
      const cssViewport = page.getViewport({ scale })

      const sheet = document.createElement('div')
      sheet.className = 'references-sheet'
      sheet.style.aspectRatio = `${base.width} / ${base.height}`
      sheet.style.setProperty('--scale-factor', String(scale))
      sheet.style.setProperty('--user-unit', String(page.userUnit || 1))

      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      canvas.setAttribute('role', 'presentation')
      sheet.append(canvas)

      const layer = document.createElement('div')
      layer.className = 'annotationLayer'
      sheet.append(layer)

      const task = page.render({ canvas, viewport })
      renderTask = task
      try {
        await task.promise
      } catch {
        if (cancelled || current !== token) return
        lastKey = ''
        return
      }
      if (cancelled || current !== token) return

      const pixel = canvas.getContext('2d')?.getImageData(2, 2, 1, 1).data
      if (pixel && pixel[3] > 0) {
        const pink = `rgb(${pixel[0]} ${pixel[1]} ${pixel[2]})`
        viewer.closest<HTMLElement>('.references-page')?.style.setProperty('--references-pink', pink)
        document.documentElement.style.setProperty('--references-pink', pink)
      }

      const annotations = await page.getAnnotations()
      if (cancelled || current !== token) return
      const annotationLayer = new pdfjs.AnnotationLayer({
        div: layer,
        accessibilityManager: null,
        annotationCanvasMap: new Map(),
        annotationEditorUIManager: null,
        page,
        viewport: cssViewport,
        structTreeLayer: null,
        commentManager: null,
        linkService,
        annotationStorage: null,
      })
      await annotationLayer.render({
        viewport: cssViewport,
        div: layer,
        annotations,
        page,
        linkService: linkService as never,
        renderForms: false,
        enableAnnotationEditing: false,
        enableScripting: false,
      })
      if (cancelled || current !== token) return
      viewer.replaceChildren(sheet)
      lastKey = key
    }

    const observer = new ResizeObserver(() => {
      void render()
    })
    observer.observe(viewer)

    void (async () => {
      pdfjs = await import('pdfjs-dist')
      if (cancelled) return
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
      loadingTask = pdfjs.getDocument({ url: PDF_SRC })
      pdf = await loadingTask.promise
      if (cancelled) {
        await loadingTask.destroy()
        return
      }
      page = await pdf.getPage(1)
      await render()
    })()

    return () => {
      cancelled = true
      token += 1
      try {
        renderTask?.cancel()
      } catch {
        /* The render may already have finished. */
      }
      observer.disconnect()
      void loadingTask?.destroy()
    }
  }, [])

  return <div className="references-viewer" ref={viewerRef} />
}
