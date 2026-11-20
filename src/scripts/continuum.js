import {
  Box3, Color, Curve, DirectionalLight, Group, HemisphereLight, InstancedMesh,
  LatheGeometry, Matrix4, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, OrthographicCamera, PCFSoftShadowMap,
  Scene, TubeGeometry, Vector2, Vector3, WebGLRenderer
} from 'three';

// A closed trefoil drawn in space. Its oval, turned ribs are cut perpendicular
// to the curve at equal distances, so the spacing survives the tight folds.
class Spine extends Curve {
  getPoint(t, target = new Vector3()) {
    const a = t * Math.PI * 2;
    const radius = 1.24 + 0.68 * Math.cos(3 * a);
    return target.set(
      radius * Math.cos(2 * a) * 1.08,
      radius * Math.sin(2 * a),
      0.74 * Math.sin(3 * a)
    );
  }
}

function createSculpture() {
  const path = new Spine();
  path.arcLengthDivisions = 1600;
  const count = 188;
  const { normals, binormals, tangents } = path.computeFrenetFrames(count, true);
  const points = path.getSpacedPoints(count);
  const step = path.getLength() / count;
  const profile = [
    [0, -0.45], [0.94, -0.45], [0.985, -0.34], [1, -0.13],
    [1, 0.13], [0.985, 0.34], [0.94, 0.45], [0, 0.45]
  ].map(([radius, height]) => new Vector2(radius, height * step));
  const geometry = new LatheGeometry(profile, 64);
  const material = new MeshPhysicalMaterial({
    color: 0xee4524, roughness: 0.44, metalness: 0.06,
    clearcoat: 0.16, clearcoatRoughness: 0.48
  });
  const ribs = new InstancedMesh(geometry, material, count);
  const matrix = new Matrix4();
  for (let i = 0; i < count; i++) {
    const phase = (i / count) * Math.PI * 2;
    const width = 0.55 + 0.055 * Math.cos(3 * phase + 0.4);
    const depth = 0.43 + 0.055 * Math.sin(3 * phase);
    matrix.makeBasis(
      normals[i].clone().multiplyScalar(width),
      tangents[i],
      binormals[i].clone().multiplyScalar(-depth)
    );
    matrix.setPosition(points[i]);
    ribs.setMatrixAt(i, matrix);
  }
  ribs.castShadow = true;
  ribs.receiveShadow = true;
  const core = new Mesh(
    new TubeGeometry(path, 360, 0.34, 32, true),
    new MeshStandardMaterial({ color: 0xb6331c, roughness: 0.65 })
  );
  core.receiveShadow = true;
  const assembly = new Group();
  assembly.add(core, ribs);
  return assembly;
}

export function mountContinuum(frame, button) {
  const canvas = frame.querySelector('canvas');
  const hint = frame.parentElement.querySelector('[data-sculpture-hint]');
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  const camera = new OrthographicCamera(-2.8, 2.8, 2.8, -2.8, 0.1, 35);
  camera.position.set(0, 0, 9);
  const holder = new Group();
  const sculpture = createSculpture();
  sculpture.rotation.set(-0.38, 0.26, -0.48);
  sculpture.updateMatrixWorld();
  const centre = new Box3().setFromObject(sculpture).getCenter(new Vector3());
  sculpture.position.sub(centre);
  holder.add(sculpture);
  scene.add(holder);
  scene.add(new HemisphereLight(new Color('#fff5e8'), new Color('#773c31'), 1.45));

  const key = new DirectionalLight(0xfff1df, 3.1);
  key.position.set(-4, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: 0.2, far: 18 });
  key.shadow.bias = -0.00012;
  key.shadow.normalBias = 0.009;
  scene.add(key);
  const rim = new DirectionalLight(0xffe7c9, 1.4);
  rim.position.set(3, 2, -3);
  scene.add(rim);

  function render() {
    renderer.render(scene, camera);
  }
  function resize() {
    const size = frame.clientWidth;
    renderer.setSize(size, size, false);
    render();
  }

  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const speed = (Math.PI * 2) / 72;
  let playing = !preference.matches;
  let visible = true;
  let drag;
  let targetX = 0;
  let targetY = 0;
  let frameId = 0;
  let previousTime = 0;

  function wake() {
    if (!frameId && visible && !document.hidden && frame.dataset.live) {
      frameId = requestAnimationFrame(animate);
    }
  }

  function stop() {
    cancelAnimationFrame(frameId);
    frameId = 0;
    previousTime = 0;
  }

  function animate(time) {
    frameId = 0;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.1) : 0;
    previousTime = time;
    const turning = playing && !drag;
    // Apply idle rotation to both angles. Dragging can take over at the current
    // orientation, and releasing resumes from exactly where the visitor left it.
    if (turning) {
      targetY += speed * delta;
      holder.rotation.y += speed * delta;
    }
    const dx = targetX - holder.rotation.x;
    const dy = targetY - holder.rotation.y;
    const settled = preference.matches || Math.max(Math.abs(dx), Math.abs(dy)) < 0.001;
    const blend = settled ? 1 : 1 - Math.exp(-18 * delta);
    holder.rotation.x += dx * blend;
    holder.rotation.y += dy * blend;
    render();
    if (turning || !settled) wake();
    else previousTime = 0;
  }

  function updateControl() {
    button.querySelector('[data-motion-label]').textContent = playing ? 'Pause rotation' : 'Play rotation';
    button.dataset.playing = String(playing);
    wake();
  }
  function syncVisibility() {
    if (visible && !document.hidden) wake();
    else stop();
  }
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncVisibility();
  });
  visibility.observe(frame);
  document.addEventListener('visibilitychange', syncVisibility);
  preference.addEventListener('change', () => {
    playing = !preference.matches;
    updateControl();
  });
  button.addEventListener('click', () => {
    playing = !playing;
    updateControl();
  });
  frame.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    frame.setPointerCapture(event.pointerId);
    wake();
  });
  frame.addEventListener('pointermove', event => {
    if (event.pointerId !== drag?.id) return;
    const sensitivity = 4 / frame.clientWidth;
    targetY += (event.clientX - drag.x) * sensitivity;
    targetX += (event.clientY - drag.y) * sensitivity;
    drag.x = event.clientX;
    drag.y = event.clientY;
    wake();
  });
  frame.addEventListener('lostpointercapture', () => { drag = undefined; wake(); });
  frame.addEventListener('keydown', event => {
    const step = Math.PI / 9;
    const offsets = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    targetY += offset[0];
    targetX += offset[1];
    wake();
  });

  function showCanvas() {
    resize();
    frame.dataset.live = 'true';
    hint.textContent = 'Drag to turn';
    frame.tabIndex = 0;
    frame.setAttribute('role', 'group');
    frame.setAttribute('aria-label', 'Continuum sculpture. Drag or use the arrow keys to rotate.');
    button.hidden = false;
    updateControl();
  }
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    stop();
    drag = undefined;
    delete frame.dataset.live;
    hint.textContent = 'Form study';
    frame.removeAttribute('tabindex');
    frame.removeAttribute('role');
    frame.removeAttribute('aria-label');
    button.hidden = true;
  });
  canvas.addEventListener('webglcontextrestored', showCanvas);
  new ResizeObserver(resize).observe(frame);
  showCanvas();
}
