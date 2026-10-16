"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The real system model (public/models/<slug>.glb, built by scripts/system-models)
 * shown close up in the visitor's colours. Those models name their materials, so the
 * exterior and interior shells can take different finishes like a dual-colour order.
 */
type Props = { src: string; exterior: string; interior: string; wood: boolean; glass: string };

const EXTERIOR = /^(aluminium exterior|pvc)$/i;
const INTERIOR = /^aluminium interior$/i;

export default function ProductCloseup({ src, exterior, interior, wood, glass }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const paintRef = useRef<(p: Omit<Props, "src">) => void>(() => {});
  const latest = useRef({ exterior, interior, wood, glass });
  useEffect(() => { latest.current = { exterior, interior, wood, glass }; });

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0);
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block", touchAction: "none" });
    el.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    scene.environment = env;
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 4, 5);
    scene.add(key);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.addEventListener("start", () => { controls.autoRotate = false; });

    const ext: THREE.MeshStandardMaterial[] = [];
    const int: THREE.MeshStandardMaterial[] = [];
    const glassM: THREE.MeshStandardMaterial[] = [];
    let root: THREE.Object3D | null = null;

    const paint = ({ exterior: e, interior: i, wood: w, glass: g }: Omit<Props, "src">) => {
      for (const m of ext) { m.color.set(e); m.roughness = w ? 0.7 : 0.38; m.metalness = 0.15; }
      for (const m of int) { m.color.set(i); m.roughness = 0.4; m.metalness = 0.15; }
      for (const m of glassM) { m.color.set(g); }
    };
    paintRef.current = paint;

    new GLTFLoader().load(src, (gltf) => {
      if (disposed) return;
      root = gltf.scene;
      root.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        const list = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of list) {
          if (!(m instanceof THREE.MeshStandardMaterial)) continue;
          if (EXTERIOR.test(m.name)) ext.push(m);
          else if (INTERIOR.test(m.name)) int.push(m);
          else if (/glass/i.test(m.name)) glassM.push(m);
        }
      });
      paint(latest.current);
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const c = box.getCenter(new THREE.Vector3());
      root.position.sub(c);
      scene.add(root);
      const d = Math.max(size.x, size.y, size.z) * 1.9;
      camera.position.set(d * 0.7, d * 0.35, d * 0.75);
      controls.target.set(0, 0, 0);
      camera.near = d / 100;
      camera.far = d * 20;
      camera.updateProjectionMatrix();
    });

    const fit = () => {
      const r = el.getBoundingClientRect();
      renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
      camera.aspect = Math.max(1, r.width) / Math.max(1, r.height);
      camera.updateProjectionMatrix();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
    };
    tick();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      root?.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [src]);

  useEffect(() => { paintRef.current({ exterior, interior, wood, glass }); }, [exterior, interior, wood, glass]);

  return <div ref={host} className="h-full w-full" />;
}
