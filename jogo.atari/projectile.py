import pygame
from settings import *

class Projectile(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        # Imagem do projétil (retângulo branco pequeno)
        self.image = pygame.Surface((PROJECTILE_WIDTH, PROJECTILE_HEIGHT))
        self.image.fill(PROJECTILE_COLOR)
        
        self.rect = self.image.get_rect()
        # Posiciona o projétil exatamente onde a nave estava
        self.rect.centerx = x
        self.rect.bottom = y

    def update(self):
        # O projétil se move sempre para cima
        self.rect.y += PROJECTILE_SPEED
        
        # Remover o projétil da memória se ele sair pela parte superior da tela
        if self.rect.bottom < 0:
            self.kill()
