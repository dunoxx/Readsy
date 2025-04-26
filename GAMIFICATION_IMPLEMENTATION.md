# Implementação do Sistema de Gamificação do Readsy

Este documento descreve a implementação do sistema de gamificação no Readsy, uma plataforma de leitura social que utiliza elementos de gamificação para incentivar hábitos de leitura.

## Módulos Implementados

1. **Gamificação Base**
   - Sistema de níveis e XP
   - Moedas virtuais
   - Temporadas de gamificação
   - Streaks de leitura diária

2. **Sistema de Quests**
   - Quests diárias com recompensas
   - Quests semanais com recompensas maiores
   - Atribuição automática de quests

3. **Sistema de Conquistas (Achievements)**
   - Conquistas para metas de leitura
   - Conquistas para check-ins
   - Conquistas para desafios completados
   - Recompensas em XP e moedas

4. **Sistema de Badges**
   - Badges visuais para conquistas especiais
   - Diferentes raridades e categorias

5. **Leaderboard**
   - Ranking global
   - Ranking por temporada
   - Recompensas sazonais

## Integrações

O sistema foi integrado com os seguintes módulos da aplicação:

1. **Check-ins**
   - XP concedido por páginas lidas e tempo de leitura
   - Verificação automática de quests e conquistas
   - Atualização de streaks de leitura

2. **Desafios**
   - Recompensas por completar desafios individuais
   - Recompensas por completar desafios em grupo
   - Recompensas por completar desafios globais

3. **Grupos**
   - XP para grupos quando membros completam desafios
   - Níveis de grupo com base no XP acumulado

## Recompensas e Balanceamento

- **XP por Atividade**
  - Check-in básico: 10 XP
  - Por página lida: 1 XP
  - Por minuto de leitura: 2 XP
  - Completar desafio individual: 100 XP + (50 XP × número de livros)
  - Completar quest diária: 10-50 XP
  - Completar quest semanal: 50-200 XP

- **Moedas por Atividade**
  - Subir de nível: 5-275 moedas (aumenta por nível)
  - Completar conquistas: 0-100 moedas
  - Completar desafios globais: 0-50 moedas

## Modelos de Dados

### Conquistas
```prisma
model Achievement {
  id          String
  name        String
  description String
  icon        String
  goal        Int
  xpReward    Int
  coinsReward Int
  badgeReward String?
  createdAt   DateTime
  users       UserAchievement[]
}
```

### Quests
```prisma
model DailyQuest {
  id             String
  title          String
  description    String?
  emoji          String
  baseXpReward   Int
  baseCoinReward Int
  isActive       Boolean
  createdAt      DateTime
  updatedAt      DateTime
  assignments    UserDailyQuest[]
}

model WeeklyQuest {
  id             String
  title          String
  description    String?
  emoji          String
  baseXpReward   Int
  baseCoinReward Int
  isActive       Boolean
  createdAt      DateTime
  updatedAt      DateTime
  assignments    UserWeeklyQuest[]
}
```

### Badges
```prisma
model Badge {
  id          String
  name        String
  description String
  icon        String
  category    BadgeCategory
  rarity      BadgeRarity
  createdAt   DateTime
  users       UserBadge[]
}
```

## Próximas Melhorias

1. **Sistema de Loja Virtual**
   - Permitir uso de moedas para comprar badges especiais
   - Temas de perfil
   - Avatares personalizados

2. **Eventos Sazonais**
   - Desafios especiais por temporada
   - Badges exclusivos de eventos

3. **Missões Progressivas**
   - Sequência de missões que contam uma história
   - Recompensas crescentes por progressão

4. **Melhorias no Leaderboard**
   - Ranking por país/região
   - Ranking por gênero de livro preferido 