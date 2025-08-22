import { useEffect, useRef, useCallback, useMemo } from "react";
import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from 'postprocessing';

const Hyperspeed = ({ effectOptions = {
  onSpeedUp: () => {},
  onSlowDown: () => {},
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0xFFFFFF,
    brokenLines: 0xFFFFFF,
    leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
    rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
    sticks: 0x03B3C3,
  }
}}) => {
  const containerRef = useRef(null);
  const appInstanceRef = useRef(null);
  const isDisposedRef = useRef(false);

  // Utility functions
  const nsin = useCallback((val) => Math.sin(val) * 0.5 + 0.5, []);
  
  const random = useCallback((base) => {
    if (Array.isArray(base)) return Math.random() * (base[1] - base) + base;
    return Math.random() * base;
  }, []);
  
  const pickRandom = useCallback((arr) => {
    if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
    return arr;
  }, []);
  
  const lerp = useCallback((current, target, speed = 0.1, limit = 0.001) => {
    let change = (target - current) * speed;
    if (Math.abs(change) < limit) {
      change = target - current;
    }
    return change;
  }, []);

  // Dispose function
  const disposeThreeJsResources = useCallback((scene) => {
    if (!scene) return;

    scene.traverse((object) => {
      if (object.isMesh) {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => {
              if (material.map) material.map.dispose();
              if (material.normalMap) material.normalMap.dispose();
              if (material.emissiveMap) material.emissiveMap.dispose();
              material.dispose();
            });
          } else {
            if (object.material.map) object.material.map.dispose();
            if (object.material.normalMap) object.material.normalMap.dispose();
            if (object.material.emissiveMap) object.material.emissiveMap.dispose();
            object.material.dispose();
          }
        }
      }
    });

    scene.clear();
  }, []);

  // Distortion configurations
  const distortions = useMemo(() => {
    const turbulentUniforms = {
      uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
      uAmp: { value: new THREE.Vector4(25, 5, 10, 10) }
    };

    return {
      turbulentDistortion: {
        uniforms: turbulentUniforms,
        getDistortion: `
          uniform vec4 uFreq;
          uniform vec4 uAmp;
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          #define PI 3.14159265358979
          float getDistortionX(float progress){
            return (
              cos(PI * progress * uFreq.r + uTime) * uAmp.r +
              pow(cos(PI * progress * uFreq.g + uTime * (uFreq.g / uFreq.r)), 2. ) * uAmp.g
            );
          }
          float getDistortionY(float progress){
            return (
              -nsin(PI * progress * uFreq.b + uTime) * uAmp.b +
              -pow(nsin(PI * progress * uFreq.a + uTime / (uFreq.b / uFreq.a)), 5.) * uAmp.a
            );
          }
          vec3 getDistortion(float progress){
            return vec3(
              getDistortionX(progress) - getDistortionX(0.0125),
              getDistortionY(progress) - getDistortionY(0.0125),
              0.
            );
          }
        `,
        getJS: (progress, time) => {
          const uFreq = turbulentUniforms.uFreq.value;
          const uAmp = turbulentUniforms.uAmp.value;

          const getX = (p) =>
            Math.cos(Math.PI * p * uFreq.x + time) * uAmp.x +
            Math.pow(Math.cos(Math.PI * p * uFreq.y + time * (uFreq.y / uFreq.x)), 2) * uAmp.y;

          const getY = (p) =>
            -nsin(Math.PI * p * uFreq.z + time) * uAmp.z -
            Math.pow(nsin(Math.PI * p * uFreq.w + time / (uFreq.z / uFreq.w)), 5) * uAmp.w;

          const distortion = new THREE.Vector3(
            getX(progress) - getX(progress + 0.007),
            getY(progress) - getY(progress + 0.007),
            0
          );
          const lookAtAmp = new THREE.Vector3(-2, -5, 0);
          const lookAtOffset = new THREE.Vector3(0, 0, -10);
          return distortion.multiply(lookAtAmp).add(lookAtOffset);
        }
      }
    };
  }, [nsin]);

  // Shader fragments
  const shaders = useMemo(() => ({
    carLightsFragment: `
      #define USE_FOG;
      ${THREE.ShaderChunk["fog_pars_fragment"]}
      varying vec3 vColor;
      varying vec2 vUv; 
      uniform vec2 uFade;
      void main() {
        vec3 color = vec3(vColor);
        float alpha = smoothstep(uFade.x, uFade.y, vUv.x);
        gl_FragColor = vec4(color, alpha);
        if (gl_FragColor.a < 0.0001) discard;
        ${THREE.ShaderChunk["fog_fragment"]}
      }
    `,
    carLightsVertex: `
      #define USE_FOG;
      ${THREE.ShaderChunk["fog_pars_vertex"]}
      attribute vec3 aOffset;
      attribute vec3 aMetrics;
      attribute vec3 aColor;
      uniform float uTravelLength;
      uniform float uTime;
      varying vec2 vUv; 
      varying vec3 vColor; 
      #include <getDistortion_vertex>
      void main() {
        vec3 transformed = position.xyz;
        float radius = aMetrics.r;
        float myLength = aMetrics.g;
        float speed = aMetrics.b;

        transformed.xy *= radius;
        transformed.z *= myLength;

        transformed.z += myLength - mod(uTime * speed + aOffset.z, uTravelLength);
        transformed.xy += aOffset.xy;

        float progress = abs(transformed.z / uTravelLength);
        transformed.xyz += getDistortion(progress);

        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vUv = uv;
        vColor = aColor;
        ${THREE.ShaderChunk["fog_vertex"]}
      }
    `,
    roadFragment: `
      #define USE_FOG;
      varying vec2 vUv; 
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uLanes;
      uniform vec3 uBrokenLinesColor;
      uniform vec3 uShoulderLinesColor;
      uniform float uShoulderLinesWidthPercentage;
      uniform float uBrokenLinesWidthPercentage;
      uniform float uBrokenLinesLengthPercentage;
      ${THREE.ShaderChunk["fog_pars_fragment"]}
      void main() {
        vec2 uv = vUv;
        vec3 color = vec3(uColor);
        
        uv.y = mod(uv.y + uTime * 0.05, 1.);
        float laneWidth = 1.0 / uLanes;
        float brokenLineWidth = laneWidth * uBrokenLinesWidthPercentage;
        float laneEmptySpace = 1. - uBrokenLinesLengthPercentage;

        float brokenLines = step(1.0 - brokenLineWidth, fract(uv.x * 2.0)) * step(laneEmptySpace, fract(uv.y * 10.0));
        float sideLines = step(1.0 - brokenLineWidth, fract((uv.x - laneWidth * (uLanes - 1.0)) * 2.0)) + step(brokenLineWidth, uv.x);

        brokenLines = mix(brokenLines, sideLines, uv.x);
        color = mix(color, uBrokenLinesColor, brokenLines);
        
        gl_FragColor = vec4(color, 1.);
        ${THREE.ShaderChunk["fog_fragment"]}
      }
    `,
    roadVertex: `
      #define USE_FOG;
      uniform float uTime;
      ${THREE.ShaderChunk["fog_pars_vertex"]}
      uniform float uTravelLength;
      varying vec2 vUv; 
      #include <getDistortion_vertex>
      void main() {
        vec3 transformed = position.xyz;
        vec3 distortion = getDistortion((transformed.y + uTravelLength / 2.) / uTravelLength);
        transformed.x += distortion.x;
        transformed.z += distortion.y;
        transformed.y += -1. * distortion.z;  
        
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vUv = uv;
        ${THREE.ShaderChunk["fog_vertex"]}
      }
    `,
    sideStickFragment: `
      #define USE_FOG;
      ${THREE.ShaderChunk["fog_pars_fragment"]}
      varying vec3 vColor;
      void main(){
        vec3 color = vec3(vColor);
        gl_FragColor = vec4(color,1.);
        ${THREE.ShaderChunk["fog_fragment"]}
      }
    `,
    sideStickVertex: `
      #define USE_FOG;
      ${THREE.ShaderChunk["fog_pars_vertex"]}
      attribute float aOffset;
      attribute vec3 aColor;
      attribute vec2 aMetrics;
      uniform float uTravelLength;
      uniform float uTime;
      varying vec3 vColor;
      mat4 rotationY( in float angle ) {
        return mat4(	cos(angle),		0,		sin(angle),	0,
                     0,		1.0,			 0,	0,
                -sin(angle),	0,		cos(angle),	0,
                0, 		0,				0,	1);
      }
      #include <getDistortion_vertex>
      void main(){
        vec3 transformed = position.xyz;
        float width = aMetrics.x;
        float height = aMetrics.y;

        transformed.xy *= vec2(width, height);
        float time = mod(uTime * 60. * 2. + aOffset, uTravelLength);

        transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;

        transformed.z += - uTravelLength + time;

        float progress = abs(transformed.z / uTravelLength);
        transformed.xyz += getDistortion(progress);

        transformed.y += height / 2.;
        transformed.x += -width / 2.;
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vColor = aColor;
        ${THREE.ShaderChunk["fog_vertex"]}
      }
    `
  }), []);

  // CarLights class
  const CarLights = useMemo(() => {
    return class {
      constructor(webgl, options, colors, speed, fade) {
        this.webgl = webgl;
        this.options = options;
        this.colors = colors;
        this.speed = speed;
        this.fade = fade;
        this.mesh = null;
      }

      init() {
        const curve = new THREE.LineCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, -1)
        );
        const geometry = new THREE.TubeGeometry(curve, 40, 1, 8, false);
        const instanced = new THREE.InstancedBufferGeometry().copy(geometry);
        instanced.instanceCount = this.options.lightPairsPerRoadWay * 2;

        const laneWidth = this.options.roadWidth / this.options.lanesPerRoad;
        const aOffset = [];
        const aMetrics = [];
        const aColor = [];

        let colors = this.colors;
        if (Array.isArray(colors)) {
          colors = colors.map(c => new THREE.Color(c));
        } else {
          colors = new THREE.Color(colors);
        }

        for (let i = 0; i < this.options.lightPairsPerRoadWay; i++) {
          const radius = random(this.options.carLightsRadius);
          const length = random(this.options.carLightsLength);
          const speed = random(this.speed);

          const carLane = i % this.options.lanesPerRoad;
          let laneX = carLane * laneWidth - this.options.roadWidth / 2 + laneWidth / 2;

          const carWidth = random(this.options.carWidthPercentage) * laneWidth;
          const carShiftX = random(this.options.carShiftX) * laneWidth;
          laneX += carShiftX;

          const offsetY = random(this.options.carFloorSeparation) + radius * 1.3;
          const offsetZ = -random(this.options.length);

          // Left light
          aOffset.push(laneX - carWidth / 2, offsetY, offsetZ);
          // Right light
          aOffset.push(laneX + carWidth / 2, offsetY, offsetZ);

          // Metrics for both lights
          aMetrics.push(radius, length, speed);
          aMetrics.push(radius, length, speed);

          // Color for both lights
          const color = pickRandom(colors);
          aColor.push(color.r, color.g, color.b);
          aColor.push(color.r, color.g, color.b);
        }

        instanced.setAttribute(
          "aOffset",
          new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false)
        );
        instanced.setAttribute(
          "aMetrics",
          new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false)
        );
        instanced.setAttribute(
          "aColor",
          new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false)
        );

        const material = new THREE.ShaderMaterial({
          fragmentShader: shaders.carLightsFragment,
          vertexShader: shaders.carLightsVertex,
          transparent: true,
          uniforms: Object.assign(
            {
              uTime: { value: 0 },
              uTravelLength: { value: this.options.length },
              uFade: { value: this.fade }
            },
            this.webgl.fogUniforms,
            this.options.distortion.uniforms
          )
        });

        material.onBeforeCompile = (shader) => {
          shader.vertexShader = shader.vertexShader.replace(
            "#include <getDistortion_vertex>",
            this.options.distortion.getDistortion
          );
        };

        this.mesh = new THREE.Mesh(instanced, material);
        this.mesh.frustumCulled = false;
        this.webgl.scene.add(this.mesh);
      }

      update(time) {
        if (this.mesh?.material?.uniforms?.uTime) {
          this.mesh.material.uniforms.uTime.value = time;
        }
      }

      dispose() {
        if (this.mesh) {
          if (this.mesh.geometry) this.mesh.geometry.dispose();
          if (this.mesh.material) this.mesh.material.dispose();
          if (this.mesh.parent) this.mesh.parent.remove(this.mesh);
          this.mesh = null;
        }
      }
    };
  }, [random, pickRandom, shaders]);

  // LightsSticks class
  const LightsSticks = useMemo(() => {
    return class {
      constructor(webgl, options) {
        this.webgl = webgl;
        this.options = options;
        this.mesh = null;
      }

      init() {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const instanced = new THREE.InstancedBufferGeometry().copy(geometry);
        const totalSticks = this.options.totalSideLightSticks;
        instanced.instanceCount = totalSticks;

        const stickoffset = this.options.length / (totalSticks - 1);
        const aOffset = [];
        const aColor = [];
        const aMetrics = [];

        let colors = this.options.colors.sticks;
        if (Array.isArray(colors)) {
          colors = colors.map(c => new THREE.Color(c));
        } else {
          colors = new THREE.Color(colors);
        }

        for (let i = 0; i < totalSticks; i++) {
          const width = random(this.options.lightStickWidth);
          const height = random(this.options.lightStickHeight);
          aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random());

          const color = pickRandom(colors);
          aColor.push(color.r, color.g, color.b);
          aMetrics.push(width, height);
        }

        instanced.setAttribute(
          "aOffset",
          new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1, false)
        );
        instanced.setAttribute(
          "aColor",
          new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false)
        );
        instanced.setAttribute(
          "aMetrics",
          new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false)
        );

        const material = new THREE.ShaderMaterial({
          fragmentShader: shaders.sideStickFragment,
          vertexShader: shaders.sideStickVertex,
          side: THREE.DoubleSide,
          uniforms: Object.assign(
            {
              uTravelLength: { value: this.options.length },
              uTime: { value: 0 }
            },
            this.webgl.fogUniforms,
            this.options.distortion.uniforms
          )
        });

        material.onBeforeCompile = (shader) => {
          shader.vertexShader = shader.vertexShader.replace(
            "#include <getDistortion_vertex>",
            this.options.distortion.getDistortion
          );
        };

        this.mesh = new THREE.Mesh(instanced, material);
        this.mesh.frustumCulled = false;
        this.webgl.scene.add(this.mesh);
      }

      update(time) {
        if (this.mesh?.material?.uniforms?.uTime) {
          this.mesh.material.uniforms.uTime.value = time;
        }
      }

      dispose() {
        if (this.mesh) {
          if (this.mesh.geometry) this.mesh.geometry.dispose();
          if (this.mesh.material) this.mesh.material.dispose();
          if (this.mesh.parent) this.mesh.parent.remove(this.mesh);
          this.mesh = null;
        }
      }
    };
  }, [random, pickRandom, shaders]);

  // Road class
  const Road = useMemo(() => {
    return class {
      constructor(webgl, options) {
        this.webgl = webgl;
        this.options = options;
        this.uTime = { value: 0 };
        this.leftRoadWay = null;
        this.rightRoadWay = null;
        this.island = null;
      }

      createPlane(side, width, isRoad) {
        const segments = 100;
        const geometry = new THREE.PlaneGeometry(
          isRoad ? this.options.roadWidth : this.options.islandWidth,
          this.options.length,
          20,
          segments
        );

        let uniforms = {
          uTravelLength: { value: this.options.length },
          uColor: { value: new THREE.Color(isRoad ? this.options.colors.roadColor : this.options.colors.islandColor) },
          uTime: this.uTime
        };

        if (isRoad) {
          uniforms = Object.assign(uniforms, {
            uLanes: { value: this.options.lanesPerRoad },
            uBrokenLinesColor: { value: new THREE.Color(this.options.colors.brokenLines) },
            uShoulderLinesColor: { value: new THREE.Color(this.options.colors.shoulderLines) },
            uShoulderLinesWidthPercentage: { value: this.options.shoulderLinesWidthPercentage },
            uBrokenLinesLengthPercentage: { value: this.options.brokenLinesLengthPercentage },
            uBrokenLinesWidthPercentage: { value: this.options.brokenLinesWidthPercentage }
          });
        }

        const material = new THREE.ShaderMaterial({
          fragmentShader: isRoad ? shaders.roadFragment : `
            #define USE_FOG;
            varying vec2 vUv; 
            uniform vec3 uColor;
            uniform float uTime;
            ${THREE.ShaderChunk["fog_pars_fragment"]}
            void main() {
              vec2 uv = vUv;
              vec3 color = vec3(uColor);
              gl_FragColor = vec4(color, 1.);
              ${THREE.ShaderChunk["fog_fragment"]}
            }
          `,
          vertexShader: shaders.roadVertex,
          side: THREE.DoubleSide,
          uniforms: Object.assign(
            uniforms,
            this.webgl.fogUniforms,
            this.options.distortion.uniforms
          )
        });

        material.onBeforeCompile = (shader) => {
          shader.vertexShader = shader.vertexShader.replace(
            "#include <getDistortion_vertex>",
            this.options.distortion.getDistortion
          );
        };

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.z = -this.options.length / 2;
        mesh.position.x += (this.options.islandWidth / 2 + this.options.roadWidth / 2) * side;
        this.webgl.scene.add(mesh);

        return mesh;
      }

      init() {
        this.leftRoadWay = this.createPlane(-1, this.options.roadWidth, true);
        this.rightRoadWay = this.createPlane(1, this.options.roadWidth, true);
        this.island = this.createPlane(0, this.options.islandWidth, false);
      }

      update(time) {
        this.uTime.value = time;
      }

      dispose() {
        [this.leftRoadWay, this.rightRoadWay, this.island].forEach(mesh => {
          if (mesh) {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
            if (mesh.parent) mesh.parent.remove(mesh);
          }
        });
        this.leftRoadWay = null;
        this.rightRoadWay = null;
        this.island = null;
      }
    };
  }, [shaders]);

  // App class
  const App = useMemo(() => {
    return class {
      constructor(container, options = {}) {
        this.options = options;
        this.container = container;
        this.disposed = false;
        
        this.renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: "high-performance"
        });
        this.renderer.setSize(container.offsetWidth, container.offsetHeight, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.composer = new EffectComposer(this.renderer);
        container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
          options.fov,
          container.offsetWidth / container.offsetHeight,
          0.1,
          10000
        );
        this.camera.position.set(0, 8, -5);

        this.scene = new THREE.Scene();
        this.scene.background = null;

        const fog = new THREE.Fog(
          options.colors.background,
          options.length * 0.2,
          options.length * 500
        );
        this.scene.fog = fog;
        this.fogUniforms = {
          fogColor: { value: fog.color },
          fogNear: { value: fog.near },
          fogFar: { value: fog.far }
        };

        this.clock = new THREE.Clock();

        this.road = new Road(this, options);
        this.leftCarLights = new CarLights(
          this,
          options,
          options.colors.leftCars,
          options.movingAwaySpeed,
          new THREE.Vector2(0, 1 - options.carLightsFade)
        );
        this.rightCarLights = new CarLights(
          this,
          options,
          options.colors.rightCars,
          options.movingCloserSpeed,
          new THREE.Vector2(1, 0 + options.carLightsFade)
        );
        this.leftSticks = new LightsSticks(this, options);

        this.fovTarget = options.fov;
        this.speedUpTarget = 0;
        this.speedUp = 0;
        this.timeOffset = 0;

        this.tick = this.tick.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);

        window.addEventListener("resize", this.onWindowResize);
      }

      initPasses() {
        this.renderPass = new RenderPass(this.scene, this.camera);
        
        this.bloomPass = new EffectPass(
          this.camera,
          new BloomEffect({
            luminanceThreshold: 0.2,
            luminanceSmoothing: 0,
            resolutionScale: 0.5
          })
        );

        const smaaPass = new EffectPass(
          this.camera,
          new SMAAEffect({
            preset: SMAAPreset.LOW
          })
        );

        this.renderPass.renderToScreen = false;
        this.bloomPass.renderToScreen = false;
        smaaPass.renderToScreen = true;

        this.composer.addPass(this.renderPass);
        this.composer.addPass(this.bloomPass);
        this.composer.addPass(smaaPass);
      }

      async init() {
        try {
          this.initPasses();
          
          this.road.init();
          
          this.leftCarLights.init();
          this.leftCarLights.mesh.position.setX(
            -this.options.roadWidth / 2 - this.options.islandWidth / 2
          );
          
          this.rightCarLights.init();
          this.rightCarLights.mesh.position.setX(
            this.options.roadWidth / 2 + this.options.islandWidth / 2
          );
          
          this.leftSticks.init();
          this.leftSticks.mesh.position.setX(
            -(this.options.roadWidth + this.options.islandWidth / 2)
          );

          this.container.addEventListener("mousedown", this.onMouseDown, { passive: true });
          this.container.addEventListener("mouseup", this.onMouseUp, { passive: true });
          this.container.addEventListener("mouseout", this.onMouseUp, { passive: true });
          this.container.addEventListener("touchstart", this.onTouchStart, { passive: true });
          this.container.addEventListener("touchend", this.onTouchEnd, { passive: true });
          this.container.addEventListener("touchcancel", this.onTouchEnd, { passive: true });
          this.container.addEventListener("contextmenu", this.onContextMenu);

          this.tick();
        } catch (error) {
          console.error("Failed to initialize Hyperspeed:", error);
        }
      }

      onWindowResize() {
        if (this.disposed || !this.container) return;
        
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;

        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.composer.setSize(width, height);
      }

      onMouseDown(ev) {
        ev.preventDefault();
        if (this.options.onSpeedUp) this.options.onSpeedUp(ev);
        this.fovTarget = this.options.fovSpeedUp;
        this.speedUpTarget = this.options.speedUp;
      }

      onMouseUp(ev) {
        ev.preventDefault();
        if (this.options.onSlowDown) this.options.onSlowDown(ev);
        this.fovTarget = this.options.fov;
        this.speedUpTarget = 0;
      }

      onTouchStart(ev) {
        if (this.options.onSpeedUp) this.options.onSpeedUp(ev);
        this.fovTarget = this.options.fovSpeedUp;
        this.speedUpTarget = this.options.speedUp;
      }

      onTouchEnd(ev) {
        if (this.options.onSlowDown) this.options.onSlowDown(ev);
        this.fovTarget = this.options.fov;
        this.speedUpTarget = 0;
      }

      onContextMenu(ev) {
        ev.preventDefault();
      }

      update(delta) {
        if (this.disposed) return;

        const lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
        this.speedUp += lerp(this.speedUp, this.speedUpTarget, lerpPercentage, 0.00001);
        this.timeOffset += this.speedUp * delta;

        const time = this.clock.elapsedTime + this.timeOffset;

        this.rightCarLights?.update(time);
        this.leftCarLights?.update(time);
        this.leftSticks?.update(time);
        this.road?.update(time);

        let updateCamera = false;
        const fovChange = lerp(this.camera.fov, this.fovTarget, lerpPercentage);
        if (Math.abs(fovChange) > 0.001) {
          this.camera.fov += fovChange * delta * 6;
          updateCamera = true;
        }

        if (this.options.distortion?.getJS) {
          const distortion = this.options.distortion.getJS(0.025, time);
          this.camera.lookAt(
            new THREE.Vector3(
              this.camera.position.x + distortion.x,
              this.camera.position.y + distortion.y,
              this.camera.position.z + distortion.z
            )
          );
          updateCamera = true;
        }

        if (updateCamera) {
          this.camera.updateProjectionMatrix();
        }
      }

      render(delta) {
        if (this.disposed) return;
        this.composer.render(delta);
      }

      tick() {
        if (this.disposed) return;

        if (this.resizeRendererToDisplaySize()) {
          const canvas = this.renderer.domElement;
          this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
          this.camera.updateProjectionMatrix();
        }

        const delta = Math.min(this.clock.getDelta(), 1/30);
        this.update(delta);
        this.render(delta);
        
        requestAnimationFrame(this.tick);
      }

      resizeRendererToDisplaySize() {
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize && !this.disposed) {
          this.composer.setSize(width, height, false);
        }
        return needResize;
      }

      dispose() {
        if (this.disposed) return;
        
        this.disposed = true;

        window.removeEventListener("resize", this.onWindowResize);
        
        if (this.container) {
          this.container.removeEventListener("mousedown", this.onMouseDown);
          this.container.removeEventListener("mouseup", this.onMouseUp);
          this.container.removeEventListener("mouseout", this.onMouseUp);
          this.container.removeEventListener("touchstart", this.onTouchStart);
          this.container.removeEventListener("touchend", this.onTouchEnd);
          this.container.removeEventListener("touchcancel", this.onTouchEnd);
          this.container.removeEventListener("contextmenu", this.onContextMenu);
        }

        // Dispose scene objects
        this.road?.dispose();
        this.leftCarLights?.dispose();
        this.rightCarLights?.dispose();
        this.leftSticks?.dispose();

        if (this.scene) {
          disposeThreeJsResources(this.scene);
        }

        if (this.composer) {
          this.composer.dispose();
        }

        if (this.renderer) {
          this.renderer.dispose();
          if (this.renderer.domElement && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
          }
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.road = null;
        this.leftCarLights = null;
        this.rightCarLights = null;
        this.leftSticks = null;
      }
    };
  }, [Road, CarLights, LightsSticks, lerp, disposeThreeJsResources]);

  // Main effect
  useEffect(() => {
    if (!containerRef.current || isDisposedRef.current) return;

    // Clear any existing content
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const options = { ...effectOptions };
    options.distortion = distortions[options.distortion] || distortions.turbulentDistortion;

    try {
      const app = new App(containerRef.current, options);
      appInstanceRef.current = app;
      app.init();
    } catch (error) {
      console.error("Failed to create Hyperspeed app:", error);
    }

    return () => {
      isDisposedRef.current = true;
      if (appInstanceRef.current) {
        appInstanceRef.current.dispose();
        appInstanceRef.current = null;
      }
    };
  }, [effectOptions, distortions, App]);

  // Container cleanup on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full" 
      style={{ 
        touchAction: 'none',
        userSelect: 'none'
      }}
    />
  );
};

export default Hyperspeed;
