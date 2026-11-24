
import * as THREE from 'three';

export class Game {
  private container: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private player: THREE.Group;
  private animationFrame = 0;
  private running = false;

  constructor(container: HTMLDivElement) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x91b8a0);
    this.scene.fog = new THREE.Fog(0x91b8a0, 35, 95);

    this.camera = new THREE.OrthographicCamera(
      -12, 12, 12, -12, 0.1, 150
    );

    this.camera.position.set(14, 18, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false
    });

    this.renderer.setPixelRatio(1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.player = new THREE.Group();
  }

  async init(): Promise<void> {
    this.setupRenderer();
    this.createLighting();
    this.createTerrain();
    this.createPath();
    this.createForest();
    this.createRuins();
    this.createPlayer();
    this.createEnvironmentDetails();

    window.addEventListener('resize', this.handleResize);

    this.handleResize();
    this.running = true;
    this.animate();
  }

  private setupRenderer(): void {
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.imageRendering = 'pixelated';
    this.renderer.domElement.style.display = 'block';
  }

  private createLighting(): void {
    const ambient = new THREE.HemisphereLight(
      0xc9e7d0,
      0x536044,
      2.1
    );

    this.scene.add(ambient);

    const sunlight = new THREE.DirectionalLight(0xffe4ad, 3.2);
    sunlight.position.set(-12, 24, 10);
    sunlight.castShadow = true;

    sunlight.shadow.mapSize.set(1024, 1024);
    sunlight.shadow.camera.left = -30;
    sunlight.shadow.camera.right = 30;
    sunlight.shadow.camera.top = 30;
    sunlight.shadow.camera.bottom = -30;

    this.scene.add(sunlight);
  }

  private createTerrain(): void {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x547b43,
      roughness: 1,
      flatShading: true
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.12;
    ground.receiveShadow = true;

    this.scene.add(ground);

    const grassColors = [
      0x668d4b,
      0x729653,
      0x496e3d,
      0x819b58
    ];

    for (let i = 0; i < 180; i++) {
      const x = Math.random() * 70 - 35;
      const z = Math.random() * 70 - 35;

      if (Math.abs(x) < 4 && Math.abs(z) < 4) {
        continue;
      }

      const geometry = new THREE.BoxGeometry(
        0.12,
        0.08 + Math.random() * 0.12,
        0.12
      );

      const material = new THREE.MeshStandardMaterial({
        color: grassColors[
          Math.floor(Math.random() * grassColors.length)
        ],
        flatShading: true
      });

      const grass = new THREE.Mesh(geometry, material);
      grass.position.set(x, 0, z);
      grass.rotation.y = Math.random() * Math.PI;

      this.scene.add(grass);
    }
  }

  private createPath(): void {
    const pathMaterial = new THREE.MeshStandardMaterial({
      color: 0xa58a5e,
      roughness: 1,
      flatShading: true
    });

    for (let i = 0; i < 18; i++) {
      const stone = new THREE.Mesh(
        new THREE.BoxGeometry(
          2.5 + Math.random() * 0.8,
          0.08,
          1.2 + Math.random() * 0.5
        ),
        pathMaterial
      );

      stone.position.set(
        0,
        -0.015,
        -12 + i * 1.45
      );

      stone.rotation.y = (Math.random() - 0.5) * 0.12;
      stone.receiveShadow = true;

      this.scene.add(stone);
    }
  }

  private createTree(x: number, z: number, scale: number): void {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.22 * scale,
        0.34 * scale,
        2.2 * scale,
        5
      ),
      new THREE.MeshStandardMaterial({
        color: 0x68452b,
        flatShading: true
      })
    );

    trunk.position.y = 1.1 * scale;
    trunk.castShadow = true;
    tree.add(trunk);

    const leaves = [
      { y: 2.5, radius: 1.25, color: 0x315f38 },
      { y: 3.35, radius: 0.95, color: 0x477b42 },
      { y: 4.05, radius: 0.62, color: 0x638f4b }
    ];

    for (const layer of leaves) {
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(
          layer.radius * scale,
          1.8 * scale,
          6
        ),
        new THREE.MeshStandardMaterial({
          color: layer.color,
          flatShading: true
        })
      );

      crown.position.y = layer.y * scale;
      crown.castShadow = true;
      tree.add(crown);
    }

    tree.position.set(x, 0, z);
    tree.rotation.y = Math.random() * Math.PI;

    this.scene.add(tree);
  }

  private createForest(): void {
    const trees = [
      [-9, -9, 1.4],
      [-13, -3, 1.1],
      [-10, 5, 1.5],
      [-16, 12, 1.3],
      [10, -10, 1.5],
      [14, -4, 1.1],
      [11, 5, 1.4],
      [16, 12, 1.6],
      [-22, 0, 1.8],
      [23, 2, 1.7],
      [-20, 18, 1.5],
      [20, 20, 1.8]
    ];

    for (const [x, z, scale] of trees) {
      this.createTree(x, z, scale);
    }

    for (let i = 0; i < 35; i++) {
      const x = (Math.random() - 0.5) * 42;
      const z = (Math.random() - 0.5) * 42;

      if (Math.abs(x) < 7 && Math.abs(z) < 7) {
        continue;
      }

      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(
          0.25 + Math.random() * 0.55,
          0
        ),
        new THREE.MeshStandardMaterial({
          color: 0x777b6c,
          flatShading: true
        })
      );

      rock.position.set(x, 0.25, z);
      rock.rotation.set(
        Math.random(),
        Math.random(),
        Math.random()
      );

      rock.castShadow = true;
      rock.receiveShadow = true;

      this.scene.add(rock);
    }
  }

  private createRuins(): void {
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x777b70,
      roughness: 1,
      flatShading: true
    });

    const pillarPositions = [
      [-5, -5],
      [-5, -8],
      [5, -5],
      [5, -8]
    ];

    for (const [x, z] of pillarPositions) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 3.2, 0.8),
        stoneMaterial
      );

      pillar.position.set(x, 1.6, z);
      pillar.rotation.z = (Math.random() - 0.5) * 0.08;
      pillar.castShadow = true;

      this.scene.add(pillar);
    }

    const arch = new THREE.Mesh(
      new THREE.BoxGeometry(10.8, 0.7, 1.2),
      stoneMaterial
    );

    arch.position.set(0, 3.3, -6.5);
    arch.castShadow = true;

    this.scene.add(arch);
  }

  private createPlayer(): void {
    const skin = new THREE.MeshStandardMaterial({
      color: 0xe5b68a,
      flatShading: true
    });

    const armor = new THREE.MeshStandardMaterial({
      color: 0x526c86,
      flatShading: true
    });

    const darkArmor = new THREE.MeshStandardMaterial({
      color: 0x303c4b,
      flatShading: true
    });

    const gold = new THREE.MeshStandardMaterial({
      color: 0xd6ae5d,
      metalness: 0.35,
      roughness: 0.65,
      flatShading: true
    });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.05, 0.48),
      armor
    );

    body.position.y = 1.25;
    body.castShadow = true;
    this.player.add(body);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.58, 0.58),
      skin
    );

    head.position.y = 2.12;
    head.castShadow = true;
    this.player.add(head);

    const helmet = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.24, 0.68),
      darkArmor
    );

    helmet.position.y = 2.47;
    helmet.castShadow = true;
    this.player.add(helmet);

    const leftLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.7, 0.35),
      darkArmor
    );

    leftLeg.position.set(-0.24, 0.35, 0);
    leftLeg.castShadow = true;
    this.player.add(leftLeg);

    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.24;
    this.player.add(rightLeg);

    const leftArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.85, 0.32),
      darkArmor
    );

    leftArm.position.set(-0.58, 1.28, 0);
    leftArm.rotation.z = -0.12;
    this.player.add(leftArm);

    const rightArm = leftArm.clone();
    rightArm.position.x = 0.58;
    rightArm.rotation.z = 0.12;
    this.player.add(rightArm);

    const sword = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 1.25, 0.16),
      gold
    );

    sword.position.set(0.82, 1.15, 0.1);
    sword.rotation.z = -0.35;
    sword.castShadow = true;
    this.player.add(sword);

    const swordHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.25, 0.22),
      darkArmor
    );

    swordHandle.position.set(0.82, 0.52, 0.1);
    this.player.add(swordHandle);

    this.player.position.set(0, 0, 2);
    this.scene.add(this.player);
  }

  private createEnvironmentDetails(): void {
    const flowerColors = [0xf1d47b, 0xd98c9c, 0xe9e5c0];

    for (let i = 0; i < 45; i++) {
      const flower = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.14, 0.14),
        new THREE.MeshStandardMaterial({
          color: flowerColors[
            Math.floor(Math.random() * flowerColors.length)
          ],
          flatShading: true
        })
      );

      const x = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;

      if (Math.abs(x) < 4 && Math.abs(z) < 5) {
        continue;
      }

      flower.position.set(x, 0.12, z);
      this.scene.add(flower);
    }
  }

  private handleResize = (): void => {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);

    const aspect = width / height;
    const viewSize = 12;

    this.camera.left = -viewSize * aspect;
    this.camera.right = viewSize * aspect;
    this.camera.top = viewSize;
    this.camera.bottom = -viewSize;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      Math.max(1, Math.floor(width * 0.65)),
      Math.max(1, Math.floor(height * 0.65)),
      false
    );

    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
  };

  private animate = (): void => {
    if (!this.running) return;

    this.animationFrame = requestAnimationFrame(this.animate);

    const elapsed = this.clock.getElapsedTime();

    this.player.position.y = Math.abs(Math.sin(elapsed * 2.5)) * 0.035;

    this.camera.position.x = 14 + Math.sin(elapsed * 0.12) * 0.15;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    this.running = false;
    cancelAnimationFrame(this.animationFrame);

    window.removeEventListener('resize', this.handleResize);

    this.renderer.dispose();

    this.container.removeChild(this.renderer.domElement);
  }
}
