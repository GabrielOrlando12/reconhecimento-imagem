# pyrefly: ignore [missing-import]
import pygame
import sys
from settings import *
from player import Player
from projectile import Projectile
from asteroid import Asteroid

# Inicialização do Pygame
pygame.init()
pygame.mixer.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Jogo Atari - Nave vs Asteroides")
clock = pygame.time.Clock()

# Tentar encontrar uma fonte padrão do sistema
font_name = pygame.font.match_font('arial')

def draw_text(surf, text, size, x, y, align_center=False):
    """Função utilitária para desenhar texto na tela."""
    font = pygame.font.Font(font_name, size)
    text_surface = font.render(text, True, WHITE)
    text_rect = text_surface.get_rect()
    if align_center:
        text_rect.centerx = x
        text_rect.centery = y
    else:
        text_rect.topleft = (x, y)
    surf.blit(text_surface, text_rect)

def show_game_over_screen(score):
    """Exibe a tela de Game Over e aguarda o jogador decidir."""
    screen.fill(BLACK)
    draw_text(screen, "GAME OVER", 64, WIDTH / 2, HEIGHT / 4, align_center=True)
    draw_text(screen, f"Pontuação Final: {score}", 30, WIDTH / 2, HEIGHT / 2, align_center=True)
    draw_text(screen, "Pressione [R] para reiniciar ou qualquer outra tecla para sair", 22, WIDTH / 2, HEIGHT * 3 / 4, align_center=True)
    pygame.display.flip()
    
    waiting = True
    while waiting:
        clock.tick(FPS)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYUP:
                if event.key == pygame.K_r:
                    return True # Sinaliza para reiniciar
                else:
                    return False # Qualquer outra tecla sinaliza para sair

def run_game():
    """Loop principal do jogo."""
    # Grupos para organizar todos os sprites e facilitar checagem de colisão
    all_sprites = pygame.sprite.Group()
    asteroids = pygame.sprite.Group()
    projectiles = pygame.sprite.Group()

    player = Player()
    all_sprites.add(player)

    score = 0
    frame_count = 0
    current_spawn_rate = SPAWN_RATE
    running = True

    while running:
        # Garante que o jogo rode na taxa de FPS definida
        clock.tick(FPS)
        frame_count += 1

        # 1. Tratamento de Eventos (Inputs)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    # Cria um projétil na posição exata da nave
                    projectile = Projectile(player.rect.centerx, player.rect.top)
                    all_sprites.add(projectile)
                    projectiles.add(projectile)

        # 2. Atualização dos Sprites
        all_sprites.update()

        # Ajusta a dificuldade baseada na pontuação
        # A cada 20 pontos (2 asteroides destruídos), reduz o tempo de spawn para surgirem mais rápido
        current_spawn_rate = max(15, SPAWN_RATE - (score // 20) * 4)

        # Mecanismo de spawn de asteroides
        if frame_count % current_spawn_rate == 0:
            asteroid = Asteroid()
            all_sprites.add(asteroid)
            asteroids.add(asteroid)

        # 3. Verificações de Colisão
        # Colisão Projétil x Asteroide (Destrói ambos)
        hits = pygame.sprite.groupcollide(asteroids, projectiles, True, True)
        for hit in hits:
            score += 10 # 10 pontos por asteroide destruído

        # Colisão Nave x Asteroide (Game Over)
        hits_player = pygame.sprite.spritecollide(player, asteroids, False)
        if hits_player:
            running = False 
        
        # Asteroide passou do fundo da tela (Game Over)
        for ast in asteroids:
            if ast.rect.top > HEIGHT:
                running = False 

        # 4. Desenho e Renderização na Tela
        screen.fill(BLACK)
        all_sprites.draw(screen)
        
        # Mostrar o score
        draw_text(screen, f"Score: {score}", 24, 10, 10)

        # Atualiza a tela (Double Buffering)
        pygame.display.flip()
    
    # Chama a tela final e retorna a decisão do jogador (True para reiniciar, False para sair)
    return show_game_over_screen(score)

if __name__ == '__main__':
    while True:
        # Se run_game retornar True (apertou 'R'), o loop continua, caso contrário, sai do loop.
        if not run_game():
            break
    pygame.quit()
    sys.exit()
