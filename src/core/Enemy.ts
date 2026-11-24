
import * as THREE from 'three';

export interface EnemyConfig {
  health?: number;
  speed?: number;
  detectionRange?: number;
  damage?: number;
}

export class Enemy {
  readonly group: THREE.Group;

  private scene: THREE.Scene;
  private health: number;
  private maxHealth: number;
  private speed: number;
  private detectionRange: number;
  private damage: number;

  private alive = true;
  private attackCooldown = 0;
  private animationTime = 0;

  private healthBarFill: THREE.Mesh;
  private healthBarBackground: THREE.Mesh;

  private materials: THREE.Material[] = [];
  private geometries: THREE.BufferGeometry[] = [];

  constructor(
    scene: THREE.Scene,
    position: THREE.Vector3,
    config: EnemyConfig = {}
  ) {
    this.scene = scene;

    this.maxHealth = config.health ?? 60;
    this.health = this.maxHealth;
    this.speed = config.speed ?? 2;
    this.detectionRange = config.detectionRange ?? 11;
    this.damage = config.damage ?? 8;

    this.group = new THREE.Group();
    this.group.position.copy(position);

    this.createGoblin();

    const barGroup = new THREE.Group();

    const backgroundGeometry = new THREE.PlaneGeometry(1.1, 0.12);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
      color: 0x281b18,
      side: THREE.DoubleSide,
      depthTest: false
    });

    this.healthBarBackground = new THREE.Mesh(
      backgroundGeometry,
      backgroundMaterial
    );

    this.healthBarBackground.position.y = 2.45;
    this.healthBarBackground.renderOrder = 10;

    const fillGeometry = new THREE.PlaneGeometry(1, 0.075);
    const fillMaterial = new THREE.MeshBasicMaterial({
      color: 0xb83d35,
      side: THREE.DoubleSide,
      depthTest: false
    });

    this.healthBarFill = new THREE.Mesh(
      fillGeometry,
      fillMaterial
    );

    this.healthBarFill.position.set(0, 2.45, 0.01);
    this.healthBarFill.renderOrder = 11;

    barGroup.add(this.healthBarBackground);
    barGroup.add(this.healthBarFill);

    this.group.add(barGroup);

    this.scene.add(this.group);
  }

  private createMaterial(
    color: number,
    roughness = 1
  ): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness,
      flatShading: true
    });

    this.materials.push(material);

    return material;
  }

  private createPart(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: THREE.Vector3,
    scale?: THREE.Vector3
  ): THREE.Mesh {
    this.geometries.push(geometry);

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.copy(position);

    if (scale) {
      mesh.scale.copy(scale);
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.group.add(mesh);

    return mesh;
  }

  private createGoblin(): void {
    const greenSkin = this.createMaterial(0x648b42);
    const darkGreen = this.createMaterial(0x385b2d);
    const leather = this.createMaterial(0x59402c);
    const metal = this.createMaterial(0x777d79, 0.7);
    const yellow = this.createMaterial(0xe4c45a);
    const black = this.createMaterial(0x171813);

    // Corpo
    this.createPart(
      new THREE.BoxGeometry(0.75, 0.9, 0.48),
      leather,
      new THREE.Vector3(0, 1.05, 0)
    );

    // Cabeça
    this.createPart(
      new THREE.SphereGeometry(0.39, 8, 6),
      greenSkin,
      new THREE.Vector3(0, 1.82, 0)
    );

    // Orelhas
    const leftEar = this.createPart(
      new THREE.ConeGeometry(0.18, 0.55, 5),
      darkGreen,
      new THREE.Vector3(-0.48, 1.93, 0)
    );

    leftEar.rotation.z = Math.PI / 2;

    const rightEar = this.createPart(
      new THREE.ConeGeometry(0.18, 0.55, 5),
      darkGreen,
      new THREE.Vector3(0.48, 1.93, 0)
    );

    rightEar.rotation.z = -Math.PI / 2;

    // Olhos
    this.createPart(
      new THREE.SphereGeometry(0.075, 8, 6),
      yellow,
      new THREE.Vector3(-0.15, 1.88, 0.34)
    );

    this.createPart(
      new THREE.SphereGeometry(0.075, 8, 6),
      yellow,
      new THREE.Vector3(0.15, 1.88, 0.34)
    );

    this.createPart(
      new THREE.SphereGeometry(0.035, 6, 4),
      black,
      new THREE.Vector3(-0.15, 1.88, 0.405)
    );

    this.createPart(
      new THREE.SphereGeometry(0.035, 6, 4),
      black,
      new THREE.Vector3(0.15, 1.88, 0.405)
    );

    // Braços
    const leftArm = this.createPart(
      new THREE.BoxGeometry(0.23, 0.72, 0.25),
      greenSkin,
      new THREE.Vector3(-0.5, 1.08, 0)
    );

    leftArm.rotation.z = -0.2;

    const rightArm = this.createPart(
      new THREE.BoxGeometry(0.23, 0.72, 0.25),
      greenSkin,
      new THREE.Vector3(0.5, 1.08, 0)
    );

    rightArm.rotation.z = 0.2;

    // Pernas
    this.createPart(
      new THREE.BoxGeometry(0.27, 0.55, 0.3),
      darkGreen,
      new THREE.Vector3(-0.2, 0.35, 0)
    );

    this.createPart(
      new THREE.BoxGeometry(0.27, 0.55, 0.3),
      darkGreen,
      new THREE.Vector3(0.2, 0.35, 0)
    );

    // Ombreiras
    this.createPart(
      new THREE.BoxGeometry(0.32, 0.23, 0.4),
      metal,
      new THREE.Vector3(-0.4, 1.48, 0)
    );

    this.createPart(
      new THREE.BoxGeometry(0.32, 0.23, 0.4),
      metal,
      new THREE.Vector3(0.4, 1.48, 0)
    );

    // Cinto
    this.createPart(
      new THREE.BoxGeometry(0.78, 0.13, 0.5),
      leather,
      new THREE.Vector3(0, 0.73, 0)
    );
  }

  update(
    deltaTime: number,
    playerPosition: THREE.Vector3
  ): void {
    if (!this.alive) return;

    this.animationTime += deltaTime;
    this.attackCooldown = Math.max(
      0,
      this.attackCooldown - deltaTime
    );

    const direction = new THREE.Vector3(
      playerPosition.x - this.group.position.x,
      0,
      playerPosition.z - this.group.position.z
    );

    const distance = direction.length();

    if (distance < this.detectionRange && distance > 1.5) {
      direction.normalize();

      this.group.position.addScaledVector(
        direction,
        this.speed * deltaTime
      );

      this.group.rotation.y = Math.atan2(
        direction.x,
        direction.z
      );
    }

    // Movimento vertical suave.
    this.group.position.y =
      Math.sin(this.animationTime * 5) * 0.035;

    // Mantém a barra de vida voltada para a câmera.
    const bar = this.group.children.find(
      child => child instanceof THREE.Group
    );

    if (bar) {
      bar.quaternion.copy(
        new THREE.Quaternion()
      );
    }
  }

  takeDamage(amount: number): boolean {
    if (!this.alive || amount <= 0) {
      return false;
    }

    this.health = Math.max(
      0,
      this.health - amount
    );

    const percentage = this.health / this.maxHealth;

    this.healthBarFill.scale.x = percentage;
    this.healthBarFill.position.x =
      -0.5 * (1 - percentage);

    if (this.health <= 0) {
      this.die();
    }

    return true;
  }

  private die(): void {
    this.alive = false;
    this.scene.remove(this.group);
  }

  isAlive(): boolean {
    return this.alive;
  }

  getHealth(): number {
    return this.health;
  }

  getDamage(): number {
    return this.damage;
  }

  canAttack(): boolean {
    if (!this.alive || this.attackCooldown > 0) {
      return false;
    }

    this.attackCooldown = 1.2;
    return true;
  }

  dispose(): void {
    this.scene.remove(this.group);

    for (const geometry of this.geometries) {
      geometry.dispose();
    }

    for (const material of this.materials) {
      material.dispose();
    }

    this.geometries = [];
    this.materials = [];
  }
}
