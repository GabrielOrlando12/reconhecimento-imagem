# settings.py

# Dimensões da tela
WIDTH = 800
HEIGHT = 600

# Taxa de quadros
FPS = 60

# Cores
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)

# Configurações do Jogador
PLAYER_WIDTH = 50
PLAYER_HEIGHT = 30
PLAYER_SPEED = 8
PLAYER_COLOR = GREEN

# Configurações do Projétil
PROJECTILE_WIDTH = 5
PROJECTILE_HEIGHT = 15
PROJECTILE_SPEED = -10 # Move para cima (y diminui)
PROJECTILE_COLOR = WHITE

# Configurações do Asteroide
ASTEROID_MIN_SIZE = 20
ASTEROID_MAX_SIZE = 50
ASTEROID_SPEED_MIN = 3
ASTEROID_SPEED_MAX = 7
ASTEROID_COLOR = RED
SPAWN_RATE = 90 # A cada quantos frames um asteroide aparece (começa em 1.5s a 60 FPS)
