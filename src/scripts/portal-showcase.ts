export function mountPortalShowcase(figure: HTMLElement) {
  const track = figure.closest<HTMLElement>('.phone-track')!;
  const scene = figure.querySelector<HTMLElement>('.portal-scene')!;
  const rig = figure.querySelector<HTMLElement>('.portal-rig')!;
  const feed = figure.querySelector<HTMLElement>('.app-feed')!;
  const appWindow = figure.querySelector<HTMLElement>('.app-window')!;
  const plan = figure.querySelector<HTMLElement>('.app-plan')!;
  const usage = figure.querySelector<HTMLElement>('.app-usage')!;
  const gauge = figure.querySelector<SVGSVGElement>('.plan-body svg')!;
  const bars = figure.querySelector<HTMLElement>('.chart-series')!;
  const chapters = figure.querySelector<HTMLElement>('.chapter-nav')!;
  const buttons = Array.from(chapters.querySelectorAll('button'));
  const featureDetail = figure.querySelector<HTMLElement>('.phone-feature-detail')!;
  const hint = figure.querySelector<HTMLElement>('.portal-hint span')!;
  const motion = figure.querySelector<HTMLButtonElement>('.portal-motion')!;
  const motionText = motion.querySelector<HTMLElement>('.motion-text')!;
  const inspector = figure.querySelector<HTMLDialogElement>('dialog')!;
  const inspectButton = figure.querySelector<HTMLButtonElement>('.inspect-button')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (n:number, min:number, max:number) => Math.max(min,Math.min(max,n));
  const ease = (t:number) => t*t*(3-2*t);

  let targetProgress = 0;
  let progress = 0;
  let selected = -1;
  let runway = 0;
  let scrollStart = 0;
  let planProgress = .5;
  let usageStop = 0;
  let playing = !reduced.matches;
  let visible = true;
  let frame = 0;
  let previousTime = 0;
  let phase = 0;
  let yaw = reduced.matches ? 0 : -24;
  let pitch = reduced.matches ? 0 : 9;
  let roll = reduced.matches ? 0 : -9;
  let handYaw = 0;
  let handPitch = 0;
  let drag: { id:number; x:number; y:number; yaw:number; pitch:number; active:boolean } | null = null;
  const tourYaw = () => -24 + 43 * ease(progress) + 4 * Math.sin(phase);
  const tourPitch = () => 9 - 15 * progress + 1.6 * Math.sin(phase);

  function drawPhone() {
    rig.style.transform = `rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg) rotateZ(${roll.toFixed(2)}deg)`;
  }
  function chapterAt(position: number) {
    if (position < planProgress / 2) return 0;
    return position < (planProgress + 1) / 2 ? 1 : 2;
  }
  function chapterPosition(step: number) {
    return step === 1 ? planProgress : step / 2;
  }
  function drawApp() {
    const step = chapterAt(progress);
    feed.style.transform = `translateY(${(-usageStop * progress).toFixed(2)}px)`;
    const planReveal = ease(clamp(progress / planProgress, 0, 1));
    const usageReveal = ease(clamp((progress - planProgress) / (1 - planProgress), 0, 1));
    gauge.style.scale = String(playing ? .9 + .1 * planReveal : 1);
    bars.style.transform = `scaleY(${playing ? .62 + .38 * usageReveal : 1})`;
    if (step !== selected) {
      selected = step;
      featureDetail.textContent = buttons[step].dataset.summary!;
      buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === step)));
    }
  }
  function readScroll() {
    if (!runway || inspector.open) return;
    targetProgress = clamp((window.scrollY - scrollStart) / runway, 0, 1);
    if (!playing && visible && chapterAt(targetProgress) !== selected) {
      progress = chapterPosition(chapterAt(targetProgress));
      drawApp();
    }
  }
  function measure() {
    const canPin = !reduced.matches && figure.offsetHeight + 45 < window.innerHeight;
    track.toggleAttribute('data-scroll-tour', canPin);
    const pinTop = parseFloat(getComputedStyle(figure).top) || 0;
    scrollStart = track.getBoundingClientRect().top + window.scrollY - pinTop;
    runway = canPin ? track.offsetHeight - figure.offsetHeight : 0;
    usageStop = Math.min(Math.max(0, feed.offsetHeight - appWindow.clientHeight), usage.offsetTop);
    planProgress = usageStop > 0 ? clamp(plan.offsetTop / usageStop, .01, .99) : .5;
    hint.textContent = runway ? 'Scroll to explore · Drag to rotate' : 'Choose a feature · Drag to rotate';
    readScroll();
    drawApp();
  }
  function animate(now: number) {
    const dt = previousTime ? Math.min((now - previousTime) / 1000, .08) : 0;
    previousTime = now;
    if (progress !== targetProgress) {
      // Both the handset and its content sample the same frame, including between wheel ticks.
      const distance = targetProgress - progress;
      progress = Math.abs(distance) < .0002
        ? targetProgress
        : progress + distance * -Math.expm1(-16 * dt);
      drawApp();
    }
    phase += dt * .38;
    const decay = Math.exp(-dt * .44);
    handYaw *= decay;
    handPitch *= decay;
    yaw = tourYaw() + handYaw;
    pitch = tourPitch() + handPitch;
    roll = -9 + 13 * ease(progress);
    drawPhone();
    frame = requestAnimationFrame(animate);
  }
  function anchor() {
    handYaw = yaw - tourYaw();
    handPitch = pitch - tourPitch();
  }
  function syncMotion() {
    cancelAnimationFrame(frame);
    previousTime = 0;
    if (playing && visible && !document.hidden && !drag?.active && !inspector.open) {
      frame = requestAnimationFrame(animate);
    }
    motion.dataset.playing = String(playing);
    motionText.textContent = playing ? 'Pause motion' : 'Play motion';
  }
  function chooseStep(step:number) {
    const target = chapterPosition(step);
    if (runway) {
      const top = scrollStart + runway * target;
      window.scrollTo({top, behavior:playing ? 'smooth' : 'instant'});
    } else {
      targetProgress = target;
      if (!playing) {
        progress = target;
        drawApp();
      }
    }
  }
  buttons.forEach((button,i) => button.addEventListener('click', () => chooseStep(i)));
  chapters.hidden = false;
  motion.hidden = false;
  scene.tabIndex = 0;
  scene.setAttribute('role','group');
  scene.setAttribute('aria-label','Web Networks iPhone preview. Scroll or choose a feature to explore the app. Drag or use the arrow keys to rotate. Press Home for a front view.');
  motion.addEventListener('click', () => {
    playing = !playing;
    anchor();
    drawApp();
    syncMotion();
  });
  reduced.addEventListener('change', () => {
    playing = !reduced.matches;
    if (reduced.matches) {
      pitch = yaw = roll = 0;
      drawPhone();
    }
    anchor();
    measure();
    syncMotion();
  });
  window.addEventListener('scroll',readScroll,{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  const sizes = new ResizeObserver(measure);
  sizes.observe(figure);
  sizes.observe(track.closest<HTMLElement>('.phone-hero')!);
  document.fonts.ready.then(measure);
  document.addEventListener('visibilitychange',syncMotion);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        progress = playing ? targetProgress : chapterPosition(chapterAt(targetProgress));
        drawApp();
      }
      visible = entry.isIntersecting;
      syncMotion();
    }).observe(scene);
  }
  scene.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    const active = event.pointerType !== 'touch';
    drag = {id:event.pointerId, x:event.clientX, y:event.clientY, yaw, pitch, active};
    if (!active) return;
    scene.setPointerCapture(event.pointerId);
    scene.dataset.dragging = '';
    syncMotion();
  });
  scene.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.active) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        drag = null;
        return;
      }
      drag.active = true;
      drag.yaw = yaw;
      drag.pitch = pitch;
      scene.setPointerCapture(event.pointerId);
      scene.dataset.dragging = '';
      syncMotion();
    }
    const scale = 125 / scene.clientWidth;
    yaw = clamp(drag.yaw + dx * scale, -62, 62);
    pitch = clamp(drag.pitch - dy * scale, -27, 27);
    drawPhone();
  });
  function endDrag(event:PointerEvent) {
    if (!drag || event.pointerId !== drag.id) return;
    const wasDragging = drag.active;
    drag = null;
    if (!wasDragging) return;
    delete scene.dataset.dragging;
    anchor();
    syncMotion();
  }
  scene.addEventListener('pointerup',endDrag);
  scene.addEventListener('pointercancel',endDrag);
  scene.addEventListener('lostpointercapture',endDrag);
  scene.addEventListener('keydown', event => {
    switch (event.key) {
      case 'ArrowLeft': yaw = clamp(yaw-7,-62,62); break;
      case 'ArrowRight': yaw = clamp(yaw+7,-62,62); break;
      case 'ArrowUp': pitch = clamp(pitch+4,-27,27); break;
      case 'ArrowDown': pitch = clamp(pitch-4,-27,27); break;
      case 'Home': yaw = pitch = roll = 0; break;
      default: return;
    }
    event.preventDefault();
    playing = false;
    drawPhone();
    drawApp();
    syncMotion();
  });
  if (typeof inspector.showModal === 'function') {
    const desktop = inspector.querySelector<HTMLElement>('.inspector-desktop')!;
    const mobile = inspector.querySelector<HTMLElement>('.inspector-mobile')!;
    const display = inspector.querySelector<HTMLElement>('.inspector-display')!;
    const panHint = inspector.querySelector<HTMLElement>('.screen-pan-hint')!;
    const options = inspector.querySelectorAll<HTMLButtonElement>('[data-screen]');
    const narrowScreen = matchMedia('(max-width: 540px)');
    function updatePanFocus() {
      display.tabIndex = narrowScreen.matches && !desktop.hidden ? 0 : -1;
    }
    narrowScreen.addEventListener('change', updatePanFocus);
    function selectScreen(view: string) {
      display.dataset.view = view;
      desktop.hidden = view !== 'desktop';
      panHint.hidden = view !== 'desktop';
      display.scrollLeft = 0;
      updatePanFocus();
      mobile.hidden = view !== 'mobile';
      options.forEach(option => option.setAttribute('aria-pressed', String(option.dataset.screen === view)));
    }
    options.forEach(option => option.addEventListener('click', () => selectScreen(option.dataset.screen!)));
    inspectButton.hidden = false;
    inspectButton.addEventListener('click', () => {
      selectScreen('mobile');
      inspector.showModal();
      syncMotion();
    });
    inspector.querySelector('.inspector-close')!.addEventListener('click', () => inspector.close());
    inspector.addEventListener('click', event => {
      if (event.target !== inspector) return;
      const rect = inspector.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) inspector.close();
    });
    inspector.addEventListener('close', () => {
      syncMotion();
      inspectButton.focus({preventScroll:true});
    });
  }
  measure();
  drawPhone();
  syncMotion();
}
