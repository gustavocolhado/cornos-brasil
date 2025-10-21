const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function moveVipVideos() {
  try {
    const vipVideos = await prisma.video.findMany({
      where: {
        premium: true,
        duration: {
          lt: 120, // Menos de 2 minutos (120 segundos)
        },
        category: {
          has: "VIP", // Categoria "VIP"
        },
      },
    });

    console.log(`Foram encontrados ${vipVideos.length} vídeos que correspondem aos critérios.`);

    if (vipVideos.length === 0) {
      console.log("Nenhum vídeo para mover. Encerrando.");
      return;
    }

    // O usuário precisará confirmar a execução.
    // Por enquanto, apenas mostramos a contagem.
    // A lógica de atualização será adicionada após a confirmação.

  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

moveVipVideos();
