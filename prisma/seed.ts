// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Admin por defecto
  const email = "Fannyaleman0312@gmail.com";
  const password = "FloBribri2024!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      username: "admin",
      email,
      passwordHash,
      role: "super_admin",
      isActive: true,
    },
  });

  // Categorías demo
  const cats = await prisma.category.createMany({
    data: [
      { name: "Rosas", icon: "fas fa-rose", color: "from-pink-100 to-pink-200", productCount: 0 },
      { name: "Ramos", icon: "fas fa-leaf", color: "from-green-100 to-green-200", productCount: 0 },
      { name: "Arreglos", icon: "fas fa-seedling", color: "from-yellow-100 to-orange-200", productCount: 0 },
      { name: "Ocasiones", icon: "fas fa-gift", color: "from-purple-100 to-pink-200", productCount: 0 },
    ],
    skipDuplicates: true,
  });

  const categories = await prisma.category.findMany();

  // Productos demo (1 por categoría)
  if (categories.length > 0) {
    await prisma.product.createMany({
      data: [
        {
          name: "Ramo de Rosas Rojas Premium",
          price: "15000",
          description: "12 rosas rojas premium",
          image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&h=600",
          rating: "5.0",
          reviewCount: 24,
          inStock: true,
          categoryId: categories[0].id,
        },
        {
          name: "Ramo Mixto Primaveral",
          price: "12000",
          description: "Rosas, lirios y aliento de bebé",
          image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&h=600",
          rating: "4.0",
          reviewCount: 18,
          inStock: true,
          categoryId: categories[1].id,
        },
      ],
      skipDuplicates: true,
    });

    // Actualiza conteo por categoría
    for (const c of categories) {
      const count = await prisma.product.count({ where: { categoryId: c.id } });
      await prisma.category.update({
        where: { id: c.id },
        data: { productCount: count },
      });
    }
  }

  // Cupones demo
  await prisma.coupon.createMany({
    data: [
      { code: "BRIBRI10", discount: "10.00", isActive: true },
      { code: "PRIMAVERA15", discount: "15.00", isActive: true },
      { code: "AMOR20", discount: "20.00", isActive: true },
    ],
    skipDuplicates: true,
  });

  console.log("Seed OK");
}

main().finally(async () => {
  await prisma.$disconnect();
});
