type InteractionOptions = {
  zoom: boolean
  pan: boolean
  scrollForPan: boolean
}

export function defaultScrollForPan() {
  return typeof navigator !== 'undefined' &&
    navigator.userAgent.includes('Macintosh')
}

export function getInteractionOptions(lockCanvasScroll?: boolean): InteractionOptions {
  if (lockCanvasScroll)
    return { zoom: false, pan: false, scrollForPan: false }

  return { zoom: true, pan: true, scrollForPan: defaultScrollForPan() }
}
