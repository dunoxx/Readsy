import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Countries
  await prisma.country.createMany({
    data: [
      { name: 'Brasil', code: 'BR', flag: '🇧🇷' },
      { name: 'Estados Unidos', code: 'US', flag: '🇺🇸' },
      { name: 'Portugal', code: 'PT', flag: '🇵🇹' },
      { name: 'Espanha', code: 'ES', flag: '🇪🇸' },
      { name: 'França', code: 'FR', flag: '🇫🇷' },
      { name: 'Alemanha', code: 'DE', flag: '🇩🇪' },
      { name: 'Itália', code: 'IT', flag: '🇮🇹' },
      { name: 'Japão', code: 'JP', flag: '🇯🇵' },
      { name: 'Reino Unido', code: 'GB', flag: '🇬🇧' },
      { name: 'Canadá', code: 'CA', flag: '🇨🇦' },
    ],
    skipDuplicates: true,
  });

  // Languages
  await prisma.language.createMany({
    data: [
      { name: 'Português', code: 'pt', flag: '🇧🇷' },
      { name: 'Inglês', code: 'en', flag: '🇺🇸' },
      { name: 'Espanhol', code: 'es', flag: '🇪🇸' },
      { name: 'Francês', code: 'fr', flag: '🇫🇷' },
      { name: 'Alemão', code: 'de', flag: '🇩🇪' },
      { name: 'Italiano', code: 'it', flag: '🇮🇹' },
      { name: 'Japonês', code: 'ja', flag: '🇯🇵' },
      { name: 'Chinês', code: 'zh', flag: '🇨🇳' },
      { name: 'Russo', code: 'ru', flag: '🇷🇺' },
      { name: 'Árabe', code: 'ar', flag: '🇸🇦' },
    ],
    skipDuplicates: true,
  });

  // Shop Items
  await prisma.shopItem.createMany({
    data: [
      { name: 'Avatar Leitor', type: 'avatar', price: 100, emojiIcon: '🧑‍🎓', description: 'Avatar especial para leitores.' },
      { name: 'Moldura Azul', type: 'frame', price: 50, emojiIcon: '🟦', description: 'Moldura azul para perfil.' },
      { name: 'Fundo Noturno', type: 'background', price: 80, emojiIcon: '🌃', description: 'Background escuro para o app.' },
      { name: 'PowerUp XP', type: 'powerup', price: 120, emojiIcon: '⚡', description: 'Ganhe XP extra temporariamente.' },
      { name: 'Cupom de Desconto', type: 'coupon', price: 200, emojiIcon: '🎟️', description: 'Cupom para descontos na loja.' },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 