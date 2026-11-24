
export interface JoystickInput {
  x: number;
  y: number;
  active: boolean;
}

export class VirtualJoystick {
  private container: HTMLDivElement;
  private base: HTMLDivElement;
  private stick: HTMLDivElement;

  private pointerId: number | null = null;
  private centerX = 0;
  private centerY = 0;
  private radius = 48;

  private input: JoystickInput = {
    x: 0,
    y: 0,
    active: false
  };

  private onMove?: (input: JoystickInput) => void;

  constructor(
    container: HTMLElement,
    onMove?: (input: JoystickInput) => void
  ) {
    this.onMove = onMove;

    this.container = document.createElement('div');
    this.container.id = 'virtual-joystick';

    this.base = document.createElement('div');
    this.base.className = 'joystick-base';

    this.stick = document.createElement('div');
    this.stick.className = 'joystick-stick';

    this.base.appendChild(this.stick);
    this.container.appendChild(this.base);
    container.appendChild(this.container);

    this.container.addEventListener(
      'pointerdown',
      this.handlePointerDown
    );

    window.addEventListener(
      'pointermove',
      this.handlePointerMove
    );

    window.addEventListener(
      'pointerup',
      this.handlePointerUp
    );

    window.addEventListener(
      'pointercancel',
      this.handlePointerUp
    );

    this.updateStyle();
  }

  private handlePointerDown = (event: PointerEvent): void => {
    if (this.pointerId !== null) return;

    this.pointerId = event.pointerId;

    const rect = this.base.getBoundingClientRect();

    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;

    this.base.setPointerCapture(event.pointerId);

    this.input.active = true;

    this.updatePosition(event.clientX, event.clientY);
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;

    this.updatePosition(event.clientX, event.clientY);
  };

  private handlePointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;

    this.pointerId = null;

    this.input.x = 0;
    this.input.y = 0;
    this.input.active = false;

    this.stick.style.transform = 'translate(-50%, -50%)';

    this.onMove?.({ ...this.input });
  };

  private updatePosition(x: number, y: number): void {
    let dx = x - this.centerX;
    let dy = y - this.centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.radius) {
      dx = (dx / distance) * this.radius;
      dy = (dy / distance) * this.radius;
    }

    this.input.x = dx / this.radius;
    this.input.y = dy / this.radius;

    this.stick.style.transform =
      `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

    this.onMove?.({ ...this.input });
  }

  private updateStyle(): void {
    Object.assign(this.container.style, {
      position: 'absolute',
      left: '25px',
      bottom: '30px',
      width: '120px',
      height: '120px',
      zIndex: '50',
      touchAction: 'none'
    });

    Object.assign(this.base.style, {
      position: 'absolute',
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      background: 'rgba(20, 25, 20, 0.55)',
      border: '2px solid rgba(225, 200, 140, 0.55)',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
      touchAction: 'none'
    });

    Object.assign(this.stick.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'linear-gradient(145deg, #e8d3a0, #9e7845)',
      border: '2px solid #f4dfad',
      boxShadow: '0 3px 12px rgba(0,0,0,0.5)',
      transform: 'translate(-50%, -50%)',
      touchAction: 'none'
    });
  }

  getInput(): JoystickInput {
    return { ...this.input };
  }

  dispose(): void {
    this.container.removeEventListener(
      'pointerdown',
      this.handlePointerDown
    );

    window.removeEventListener(
      'pointermove',
      this.handlePointerMove
    );

    window.removeEventListener(
      'pointerup',
      this.handlePointerUp
    );

    window.removeEventListener(
      'pointercancel',
      this.handlePointerUp
    );

    this.container.remove();
  }
}
