
import * as THREE from 'three';
import type { JoystickInput } from './VirtualJoystick';

export class PlayerController {
  private player: THREE.Group;
  private camera: THREE.Camera;

  private keys = new Set<string>();

  private direction = new THREE.Vector3();
  private forward = new THREE.Vector3();
  private right = new THREE.Vector3();

  private joystickInput: JoystickInput = {
    x: 0,
    y: 0,
    active: false
  };

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

  setJoystickInput(input: JoystickInput): void {
    this.joystickInput = { ...input };
  }

  update(deltaTime: number): void {
    const keyboardX =
      Number(this.keys.has('d') || this.keys.has('arrowright')) -
      Number(this.keys.has('a') || this.keys.has('arrowleft'));

    const keyboardY =
      Number(this.keys.has('s') || this.keys.has('arrowdown')) -
      Number(this.keys.has('w') || this.keys.has('arrowup'));

    const joystickActive = this.joystickInput.active;

    const inputX = joystickActive
      ? this.joystickInput.x
      : keyboardX;

    const inputY = joystickActive
      ? this.joystickInput.y
      : keyboardY;

    this.direction.set(inputX, 0, inputY);

    this.moving = this.direction.lengthSq() > 0.04;

    if (!this.moving) {
      return;
    }

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

    const intensity = Math.min(1, movement.length());

    movement.normalize();

    const sprinting = this.keys.has('shift');

    const currentSpeed = sprinting
      ? this.speed * this.sprintMultiplier
      : this.speed;

    this.player.position.addScaledVector(
      movement,
      currentSpeed * intensity * deltaTime
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
