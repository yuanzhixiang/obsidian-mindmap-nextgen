type MarkmapLike = {
  options: { duration: number }
  setOptions(options: { duration: number }): void
  fit(): Promise<unknown> | unknown
}

const waitFrame = () => new Promise<void>(resolve => {
  if (typeof requestAnimationFrame === 'function')
    requestAnimationFrame(() => resolve())
  else
    setTimeout(resolve, 16)
})

// Initial rendering sometimes happens before layout settles; fitting twice on
// animation frames produces a stable full-size viewport without visible zoom-in.
export async function fitWithoutAnimation(markmap: MarkmapLike, frame: () => Promise<void> = waitFrame) {
  const previousDuration = markmap.options.duration
  markmap.setOptions({ duration: 0 })

  await frame()
  await frame()
  await markmap.fit()
  await frame()
  await markmap.fit()

  markmap.setOptions({ duration: previousDuration })
}
