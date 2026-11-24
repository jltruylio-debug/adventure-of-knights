
import * as THREE from 'three';

export class PlayerController {
  private player: THREE.Group;
  private camera: THREE.Camera;

  private keys = new Set<string>();

  private direction = new THREE.Vector3();
  private forward = new THREE.Vector3();
  private right = new THREE.Vector3();

  private speed = 4.2;
  private sprintMultiplier = 1.65;

  private moving = false;

  constructor(player: THREE.Group, camera: THREE.Camera) {
    this.player = player;
    this.camera = camera;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.clearKeys);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();

    if (
      ['w', 'a', 's', 'd', 'arrowup', 'arrowdown',
       'arrowleft', 'arrowright', ' '].includes(key)
    ) {
      event.preventDefault();
    }

    this.keys.add(key);
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.key.toLowerCase());
  };

  private clearKeys = (): void => {
    this.keys.clear();
  };

  update(deltaTime: number): void {
    const up =
      this.keys.has('w') || this.keys.has('arrowup');

    const down =
      this.keys.has('s') || this.keys.has('arrowdown');

    const left =
      this.keys.has('a') || this.keys.has('arrowleft');

    const right =
      this.keys.has('d') || this.keys.has('arrowright');

    this.direction.set(0, 0, 0);

    if (up) this.direction.z -= 1;
    if (down) this.direction.z += 1;
    if (left) this.direction.x -= 1;
    if (right) this.direction.x += 1;

    this.moving = this.direction.lengthSq() > 0;

    if (!this.moving) {
      return;
    }

    this.direction.normalize();

    this.forward.set(0, 0, -1);
    this.forward.applyQuaternion(this.camera.quaternion);
    this.forward.y = 0;
    this.forward.normalize();

    this.right.set(1, 0, 0);
    this.right.applyQuaternion(this.camera.quaternion);
    this.right.y = 0;
    this.right.normalize();

    const movement = new THREE.Vector3();

    movement.addScaledVector(
      this.forward,
      -this.direction.z
    );

    movement.addScaledVector(
      this.right,
      this.direction.x
    );

    movement.normalize();

    const sprinting = this.keys.has('shift');

    const currentSpeed = sprinting
      ? this.speed * this.sprintMultiplier
      : this.speed;

    this.player.position.addScaledVector(
      movement,
      currentSpeed * deltaTime
    );

    const targetRotation = Math.atan2(
      movement.x,
      movement.z
    );

    this.player.rotation.y = targetRotation;
  }

  isMoving(): boolean {
    return this.moving;
  }

  dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.clearKeys);

    this.clearKeys();
  }
}
