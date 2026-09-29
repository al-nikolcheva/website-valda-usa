"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/** Plain viewer for the supplied factory model: its own colours, drag to orbit, scroll to zoom. */
export default function ModelViewer() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(60, 120, 40);
    scene.add(sun);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.5, 2000);
    camera.position.set(90, 110, 150);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, -10);

    let raf = 0;
    new OBJLoader().load("/models/valda-dolni-bogorov.obj", (obj) => {
      obj.rotation.x = -Math.PI / 2; // model is Z-up
      obj.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          c.geometry.computeVertexNormals();
          c.material = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide });
          const edges = new THREE.LineSegments(new THREE.EdgesGeometry(c.geometry, 30), new THREE.LineBasicMaterial({ color: 0x3a3a3d, transparent: true, opacity: 0.55 }));
          c.add(edges);
        }
      });
      scene.add(obj);
    });

    const size = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const loop = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} className="h-[80svh] w-full cursor-grab overflow-hidden rounded-lg bg-panel active:cursor-grabbing" />;
}
