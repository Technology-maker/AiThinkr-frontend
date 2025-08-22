// src/components/snipet/Hyperspeed.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const Hyperspeed = ({ effectOptions }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, animationId;

    // Initialize Scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      effectOptions.fov || 75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = effectOptions.cameraDistance || 5;

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add simple object (road-like plane)
    const geometry = new THREE.PlaneGeometry(100, 100, 32);
    const material = new THREE.MeshBasicMaterial({
      color: effectOptions.colors?.roadColor || 0x111111,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI / 2;
    scene.add(plane);

    // Animate
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [effectOptions]);

  return <div ref={mountRef} className="absolute inset-0 -z-10" />;
};

export default Hyperspeed;
