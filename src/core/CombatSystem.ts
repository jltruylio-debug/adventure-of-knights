
import * as THREE from 'three';

export type CombatAction = 'attack' | 'dodge' | 'skill';

export class CombatSystem {
  private player: THREE.Group;

  private attackCooldown = 0;
  private dodgeCooldown = 0;
  private skillCooldown = 0;

  private attackDuration = 0;
  private dodgeDuration = 0;
  private skillDuration = 0;

  private dodgeDirection = new THREE.Vector3();
  private lastDirection = new THREE.Vector3(0, 0, 1);

  private slashEffect: THREE.Mesh;
  private skillEffect: THREE.Mesh;

  private onAction?: (action: CombatAction) => void;

  constructor(
    _scene: THREE.Scene,
    player: THREE.Group,
    onAction?: (action: CombatAction) => void
  ) {
    this.player = player;
    this.onAction = onAction;

    const slashGeometry = new THREE.TorusGeometry(
      1.1,
      0.055,
      6,
      24,
      Math.PI
    );

    const slashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffe3a0,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });

    this.slashEffect = new THREE.Mesh(
      slashGeometry,
      slashMaterial
    );

    this.slashEffect.rotation.x = Math.PI / 2;
    this.slashEffect.position.set(0, 1.1, -0.65);
    this.slashEffect.visible = false;

    this.player.add(this.slashEffect);

    const skillGeometry = new THREE.SphereGeometry(
      1,
      16,
      12
    );

    const skillMaterial = new THREE.MeshBasicMaterial({
      color: 0x73c9ff,
      transparent: true,
      opacity: 0,
      wireframe: true,
      depthWrite: false
    });

    this.skillEffect = new THREE.Mesh(
      skillGeometry,
      skillMaterial
    );

    this.skillEffect.position.y = 1;
    this.skillEffect.visible = false;

    this.player.add(this.skillEffect);
  }

  attack(): boolean {
    if (
      this.attackCooldown > 0 ||
      this.dodgeDuration > 0
    ) {
      return false;
    }

    this.attackCooldown = 0.45;
    this.attackDuration = 0.22;

    this.slashEffect.visible = true;
    this.slashEffect.rotation.z = Math.random() * Math.PI;
    this.slashEffect.scale.setScalar(0.7);

    this.onAction?.('attack');

    return true;
  }

  dodge(): boolean {
    if (
      this.dodgeCooldown > 0 ||
      this.dodgeDuration > 0
    ) {
      return false;
    }

    this.dodgeCooldown = 1;
    this.dodgeDuration = 0.24;

    this.dodgeDirection.copy(this.lastDirection);

    if (this.dodgeDirection.lengthSq() < 0.001) {
      this.dodgeDirection.set(0, 0, 1);
    }

    this.dodgeDirection.normalize();

    this.onAction?.('dodge');

    return true;
  }

  useSkill(): boolean {
    if (
      this.skillCooldown > 0 ||
      this.dodgeDuration > 0
    ) {
      return false;
    }

    this.skillCooldown = 4;
    this.skillDuration = 0.55;

    this.skillEffect.visible = true;
    this.skillEffect.scale.setScalar(0.2);

    this.onAction?.('skill');

    return true;
  }

  update(deltaTime: number): void {
    this.attackCooldown = Math.max(
      0,
      this.attackCooldown - deltaTime
    );

    this.dodgeCooldown = Math.max(
      0,
      this.dodgeCooldown - deltaTime
    );

    this.skillCooldown = Math.max(
      0,
      this.skillCooldown - deltaTime
    );

    this.updateAttack(deltaTime);
    this.updateDodge(deltaTime);
    this.updateSkill(deltaTime);
  }

  private updateAttack(deltaTime: number): void {
    if (this.attackDuration <= 0) return;

    this.attackDuration -= deltaTime;

    const progress = 1 - Math.max(
      0,
      this.attackDuration / 0.22
    );

    const material = this.slashEffect.material as THREE.MeshBasicMaterial;

    material.opacity = Math.sin(progress * Math.PI) * 0.9;

    this.slashEffect.scale.setScalar(
      0.7 + progress * 0.5
    );

    if (this.attackDuration <= 0) {
      this.slashEffect.visible = false;
      material.opacity = 0;
    }
  }

  private updateDodge(deltaTime: number): void {
    if (this.dodgeDuration <= 0) return;

    this.dodgeDuration -= deltaTime;

    const dodgeSpeed = 12;

    this.player.position.addScaledVector(
      this.dodgeDirection,
      dodgeSpeed * deltaTime
    );
  }

  private updateSkill(deltaTime: number): void {
    if (this.skillDuration <= 0) return;

    this.skillDuration -= deltaTime;

    const progress = 1 - Math.max(
      0,
      this.skillDuration / 0.55
    );

    const material = this.skillEffect.material as THREE.MeshBasicMaterial;

    this.skillEffect.scale.setScalar(
      0.2 + progress * 2.2
    );

    material.opacity = (1 - progress) * 0.8;

    if (this.skillDuration <= 0) {
      this.skillEffect.visible = false;
      material.opacity = 0;
    }
  }

  setMovementDirection(direction: THREE.Vector3): void {
    if (direction.lengthSq() > 0.01) {
      this.lastDirection.copy(direction).normalize();
    }
  }

  isDodging(): boolean {
    return this.dodgeDuration > 0;
  }

  getCooldowns(): {
    attack: number;
    dodge: number;
    skill: number;
  } {
    return {
      attack: this.attackCooldown,
      dodge: this.dodgeCooldown,
      skill: this.skillCooldown
    };
  }

  dispose(): void {
    this.player.remove(this.slashEffect);
    this.player.remove(this.skillEffect);

    this.slashEffect.geometry.dispose();
    this.skillEffect.geometry.dispose();

    (this.slashEffect.material as THREE.Material).dispose();
    (this.skillEffect.material as THREE.Material).dispose();
  }
}
