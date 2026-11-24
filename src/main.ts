
import './style.css';

const gameContainer = document.querySelector<HTMLDivElement>(
  '#game-container'
);

const loadingScreen = document.querySelector<HTMLElement>(
  '#loading-screen'
);

const errorMessage = document.querySelector<HTMLElement>(
  '#error-message'
);

if (!gameContainer || !loadingScreen || !errorMessage) {
  throw new Error('Não foi possível inicializar a estrutura do jogo.');
}

async function startGame(): Promise<void> {
  try {
    const { Game } = await import('./core/Game');

    const game = new Game(gameContainer);

    await game.init();

    loadingScreen.style.display = 'none';

    console.log('ADVENTURE OF KNIGTHS iniciado!');
  } catch (error) {
    console.error('Erro ao iniciar o jogo:', error);

    loadingScreen.style.display = 'none';
    errorMessage.style.display = 'block';
    errorMessage.textContent =
      'ERRO AO INICIAR O JOGO\n\n' + String(error);
  }
}

void startGame();
