
import type { CombatAction } from './CombatSystem';

export class ActionButtons {
  private container: HTMLDivElement;
  private buttons: HTMLButtonElement[] = [];

  private onAction: (action: CombatAction) => void;

  constructor(
    parent: HTMLElement,
    onAction: (action: CombatAction) => void
  ) {
    this.onAction = onAction;

    this.container = document.createElement('div');
    this.container.id = 'combat-buttons';

    Object.assign(this.container.style, {
      position: 'absolute',
      right: '22px',
      bottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '13px',
      zIndex: '60',
      touchAction: 'none',
      userSelect: 'none',
      pointerEvents: 'auto'
    });

    this.createButton('skill', '✦', 'PODER', 58);
    this.createButton('dodge', '➤', 'ESQUIVA', 64);
    this.createButton('attack', '⚔', 'ATAQUE', 78);

    parent.appendChild(this.container);

    this.applyResponsiveStyle();
    window.addEventListener('resize', this.applyResponsiveStyle);
  }

  private createButton(
    action: CombatAction,
    symbol: string,
    label: string,
    size: number
  ): void {
    const button = document.createElement('button');

    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.title = label;

    button.innerHTML = `
      <span style="
        display:block;
        font-size:${action === 'attack' ? 30 : 23}px;
        line-height:1;
        margin-bottom:5px;
      ">${symbol}</span>
      <span style="
        display:block;
        font-size:8px;
        font-weight:bold;
        letter-spacing:1px;
      ">${label}</span>
    `;

    const colors: Record<CombatAction, string> = {
      attack: '#a64b35',
      dodge: '#526d81',
      skill: '#6652a0'
    };

    Object.assign(button.style, {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      border: '2px solid #d8bb7a',
      outline: '1px solid #624b2e',
      background: `radial-gradient(circle at 35% 25%, ${colors[action]}, #17130f 90%)`,
      color: '#fff0ca',
      boxShadow: '0 4px 12px #0009, inset 0 0 10px #ffffff22',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      padding: '5px',
      fontFamily: 'Georgia, serif',
      touchAction: 'none',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      transition: 'transform 0.08s ease, filter 0.08s ease'
    });

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      event.stopPropagation();

      button.style.transform = 'scale(0.88)';
      button.style.filter = 'brightness(1.5)';

      this.onAction(action);
    });

    const release = (): void => {
      button.style.transform = 'scale(1)';
      button.style.filter = 'brightness(1)';
    };

    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);

    this.container.appendChild(button);
    this.buttons.push(button);
  }

  private applyResponsiveStyle = (): void => {
    const isSmall = window.innerWidth < 600;

    this.container.style.right = isSmall ? '12px' : '28px';
    this.container.style.bottom = isSmall ? '18px' : '28px';
    this.container.style.gap = isSmall ? '8px' : '14px';

    this.buttons.forEach((button, index) => {
      const sizes = isSmall
        ? [48, 56, 68]
        : [58, 68, 82];

      button.style.width = `${sizes[index]}px`;
      button.style.height = `${sizes[index]}px`;
    });
  };

  dispose(): void {
    window.removeEventListener('resize', this.applyResponsiveStyle);
    this.container.remove();
    this.buttons = [];
  }
}
