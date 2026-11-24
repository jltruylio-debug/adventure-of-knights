
export class PlayerHealth {
  private readonly maxHealth: number;
  private currentHealth: number;

  private invulnerabilityTime = 0;
  private readonly invulnerabilityDuration = 0.65;

  private container: HTMLDivElement;
  private healthFill: HTMLDivElement;
  private healthText: HTMLDivElement;
  private statusText: HTMLDivElement;

  constructor(maxHealth = 100) {
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;

    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      top: 22px;
      left: 22px;
      width: 260px;
      padding: 14px;
      z-index: 100;
      background: linear-gradient(135deg, rgba(18, 20, 25, 0.94), rgba(35, 29, 24, 0.92));
      border: 1px solid rgba(210, 174, 105, 0.7);
      border-radius: 8px;
      box-shadow: 0 5px 22px rgba(0, 0, 0, 0.45);
      font-family: Georgia, serif;
      pointer-events: none;
      box-sizing: border-box;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 9px;
      color: #f0d7a0;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 1px;
    `;

    const title = document.createElement('span');
    title.textContent = 'VITALIDADE';

    this.healthText = document.createElement('div');
    this.healthText.style.cssText = `
      color: #ffffff;
      font-size: 13px;
      letter-spacing: 0;
    `;

    header.append(title, this.healthText);

    const healthBackground = document.createElement('div');
    healthBackground.style.cssText = `
      width: 100%;
      height: 15px;
      overflow: hidden;
      background: #241b1b;
      border: 1px solid #80604b;
      border-radius: 3px;
    `;

    this.healthFill = document.createElement('div');
    this.healthFill.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #8d1717, #e13b32);
      transition: width 0.18s ease, background 0.18s ease;
    `;

    healthBackground.appendChild(this.healthFill);

    this.statusText = document.createElement('div');
    this.statusText.style.cssText = `
      margin-top: 7px;
      min-height: 15px;
      color: #c9b99d;
      font-size: 11px;
      letter-spacing: 1px;
    `;

    this.container.append(header, healthBackground, this.statusText);
    document.body.appendChild(this.container);

    this.updateDisplay();
  }

  takeDamage(amount: number): boolean {
    if (this.isDead() || this.invulnerabilityTime > 0) {
      return false;
    }

    const damage = Math.max(0, amount);

    if (damage === 0) {
      return false;
    }

    this.currentHealth = Math.max(0, this.currentHealth - damage);
    this.invulnerabilityTime = this.invulnerabilityDuration;

    this.updateDisplay();
    return true;
  }

  heal(amount: number): void {
    if (this.isDead()) {
      return;
    }

    this.currentHealth = Math.min(
      this.maxHealth,
      this.currentHealth + Math.max(0, amount)
    );

    this.updateDisplay();
  }

  update(deltaTime: number): void {
    this.invulnerabilityTime = Math.max(
      0,
      this.invulnerabilityTime - deltaTime
    );
  }

  getHealth(): number {
    return this.currentHealth;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getHealthPercentage(): number {
    return (this.currentHealth / this.maxHealth) * 100;
  }

  isDead(): boolean {
    return this.currentHealth <= 0;
  }

  private updateDisplay(): void {
    const percentage = this.getHealthPercentage();

    this.healthFill.style.width = `${percentage}%`;
    this.healthText.textContent =
      `${Math.ceil(this.currentHealth)} / ${this.maxHealth}`;

    if (percentage > 60) {
      this.healthFill.style.background =
        'linear-gradient(90deg, #8d1717, #e13b32)';
    } else if (percentage > 30) {
      this.healthFill.style.background =
        'linear-gradient(90deg, #a34b13, #e78b26)';
    } else {
      this.healthFill.style.background =
        'linear-gradient(90deg, #6d0808, #ff2020)';
    }

    if (this.isDead()) {
      this.statusText.textContent = 'VOCÊ FOI DERROTADO';
      this.statusText.style.color = '#ff5555';
    } else if (percentage <= 30) {
      this.statusText.textContent = 'CUIDADO! VIDA CRÍTICA';
      this.statusText.style.color = '#ff7777';
    } else {
      this.statusText.textContent = 'GUERREIRO DE ELDORIA';
      this.statusText.style.color = '#c9b99d';
    }
  }

  dispose(): void {
    this.container.remove();
  }
}
