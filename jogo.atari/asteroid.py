import pygame
import random
from settings import *

class Asteroid(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        # Tamanho aleatório para dar variedade
        size = random.randint(ASTEROID_MIN_SIZE, ASTEROID_MAX_SIZE)
        self.image = pygame.Surface((size, size))
        self.image.fill(ASTEROID_COLOR)
        
        self.rect = self.image.get_rect()
        
        # Posição X aleatória
        self.rect.x = random.randint(0, WIDTH - size)
        
        # Nasce um pouco acima da tela para não aparecer do nada
        self.rect.y = random.randint(-100, -40) 
        
        # Velocidade aleatória de queda
        self.speed_y = random.randint(ASTEROID_SPEED_MIN, ASTEROID_SPEED_MAX)

    def update(self):
        # Cai em velocidade constante
        self.rect.y += self.speed_y
        # A remoção ao passar da tela principal será feita no main.py, 
        # pois resulta em Game Over
