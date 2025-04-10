// Easing function (easeInOutCubic for a nice curve)
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function smoothScrollToBottom(element, duration = 1000) {
  const start = element.scrollTop;
  const end = element.scrollHeight;
  const change = end - start;
  const startTime = performance.now();

  function animateScroll(currentTime) {
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    element.scrollTop = start + change * ease;

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  }

  requestAnimationFrame(animateScroll);
}

  // Scroll function with header offset
  export function smoothScrollToElement(container, targetElement, duration = 1000, offset = 0) {
    const start = container.scrollTop;
    const targetOffsetTop = targetElement.offsetTop - offset;
    const change = targetOffsetTop - start;
    const startTime = performance.now();
  
    function animateScroll(currentTime) {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);
  
      container.scrollTop = start + change * ease;
  
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }
  
    requestAnimationFrame(animateScroll);
  }
  