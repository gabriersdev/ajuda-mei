import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("ERRO: A variável de ambiente DATABASE_URL não foi definida.");
  console.error(
    "Adicione-a no seu arquivo .env (ex: DATABASE_URL=postgresql://postgres:senha@localhost:5432/ajuda_mei)",
  );
  process.exit(1);
}

// Validação de Segurança: Garantir que roda apenas localmente
try {
  const parsedUrl = new URL(dbUrl);
  const allowedHosts = ["localhost", "127.0.0.1", "::1"];

  if (!allowedHosts.includes(parsedUrl.hostname)) {
    console.error("Alerta de segurança: A execução foi bloqueada!");
    console.error(`Você está tentando rodar o script em um banco externo: ${parsedUrl.hostname}`);
    console.error(
      "Para evitar a sobrescrita acidental do banco de produção, este script permite apenas conexões locais (localhost ou 127.0.0.1).",
    );
    process.exit(1);
  }
} catch (e) {
  console.error("ERRO: A DATABASE_URL fornecida não é uma URL válida.");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: dbUrl,
});

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");

  try {
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort(); // Garante a ordem alfabética (cronológica, pelos timestamps)

    if (files.length === 0) {
      console.log("Nenhuma migration encontrada.");
      process.exit(0);
    }

    const client = await pool.connect();

    console.log(`Conectado ao banco de dados. Encontradas ${files.length} migrations.`);

    try {
      await client.query("BEGIN"); // Inicia a transação

      for (const file of files) {
        console.log(`Executando migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, "utf8");

        await client.query(sql);
        console.log(`Concluído: ${file}`);
      }

      await client.query("COMMIT");
      console.log("Todas as estruturas foram criadas com sucesso!");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Erro ao executar migrations. Operação revertida (Rollback).");
      console.error(err);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Erro de conexão ou leitura:", err);
  } finally {
    await pool.end();
  }
}

runMigrations();
