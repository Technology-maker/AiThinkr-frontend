// src/components/snipet/Hyperspeed.jsx
import React, { useEffect } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const Hyperspeed = () => {
  useEffect(() => {
    class App {
      constructor(container) {
        this.container = container;

        // ✅ Ensure non-zero dimensions
        const width = Math.max(container.offsetWidth, 1);
        const height = Math.max(container.offsetHeight, 1);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        this.renderer.setSize(width, height, false);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.container.appendChild(this.renderer.domElement);

        // ✅ Postprocessing
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(width, height),
          1.5,
          0.4,
          0.85
        );
        bloomPass.threshold = 0;
        bloomPass.strength = 1.5;
        bloomPass.radius = 0;
        this.composer.addPass(bloomPass);

        this.stars = this.createStars();
        this.scene.add(this.stars);

        window.addEventListener("resize", () => this.onWindowResize());

        this.animate();
      }

      createStars() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i < 20000; i++) {
          const x = (Math.random() - 0.5) * 2000;
          const y = (Math.random() - 0.5) * 2000;
          const z = -Math.random() * 2000;
          vertices.push(x, y, z);
        }

        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(vertices, 3)
        );

        const material = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.7,
        });

        return new THREE.Points(geometry, material);
      }

      onWindowResize() {
        const width = Math.max(this.container.offsetWidth, 1);
        const height = Math.max(this.container.offsetHeight, 1);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
      }

      animate() {
        requestAnimationFrame(() => this.animate());

        // Move stars
        this.stars.rotation.z += 0.001;

        const positions = this.stars.geometry.attributes.position.array;
        for (let i = 2; i < positions.length; i += 3) {
          positions[i] += 2;
          if (positions[i] > 0) positions[i] = -2000;
        }
        this.stars.geometry.attributes.position.needsUpdate = true;

        this.composer.render();
      }
    }

    const container = document.getElementById("lights");
    if (container) {
      new App(container);
    }
  }, []);

  return (
    <div
      id="lights"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        background: "black", // ✅ keeps bg black
      }}
    />
  );
};

export default Hyperspeed;
