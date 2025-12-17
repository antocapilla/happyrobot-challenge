import "dotenv/config";
import { db } from "../src/server/db";

/**
 * Script profesional para limpiar todos los datos de la base de datos
 * sin afectar el esquema ni las migraciones.
 * 
 * Usa SQL directo para asegurar que se borre todo correctamente.
 */
async function main() {
  console.log("🧹 Iniciando limpieza de datos...\n");

  try {
    // Verificar estado inicial
    const initialCalls = await db.call.count();
    const initialLoads = await db.load.count();
    
    if (initialCalls === 0 && initialLoads === 0) {
      console.log("   ℹ️  La base de datos ya está vacía (0 calls, 0 loads)");
      console.log("\n✨ No hay datos que borrar.");
      return;
    }

    console.log(`   Estado inicial: ${initialCalls} calls, ${initialLoads} loads\n`);

    // Usar transacción para asegurar atomicidad
    await db.$transaction(async (tx) => {
      // 1. Borrar Calls primero usando SQL directo (más confiable)
      if (initialCalls > 0) {
        console.log("  [1/2] Borrando Calls...");
        await tx.$executeRawUnsafe('DELETE FROM "Call"');
        console.log(`      ✅ ${initialCalls} calls eliminados`);
      } else {
        console.log("  [1/2] Saltando Calls (ya vacío)");
      }

      // 2. Borrar Loads después usando SQL directo
      if (initialLoads > 0) {
        console.log("  [2/2] Borrando Loads...");
        await tx.$executeRawUnsafe('DELETE FROM "Load"');
        console.log(`      ✅ ${initialLoads} loads eliminados`);
      } else {
        console.log("  [2/2] Saltando Loads (ya vacío)");
      }
    });

    // Verificar que realmente se borró todo
    const remainingCalls = await db.call.count();
    const remainingLoads = await db.load.count();

    if (remainingCalls > 0 || remainingLoads > 0) {
      console.error(`\n❌ Error: Quedan ${remainingCalls} calls y ${remainingLoads} loads sin borrar!`);
      process.exit(1);
    }

    console.log(`\n   Estado final: ${remainingCalls} calls, ${remainingLoads} loads`);
    console.log("\n✨ Limpieza completada exitosamente!");
    console.log("\n💡 Para poblar datos nuevamente, ejecuta: bun run db:seed");
  } catch (error) {
    console.error("\n❌ Error durante la limpieza:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

