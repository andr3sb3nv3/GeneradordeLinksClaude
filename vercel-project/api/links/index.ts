import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Asegura que la tabla exista (se ejecuta en cada cold start, es idempotente)
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS links (
      slug TEXT PRIMARY KEY,
      desktop_payload TEXT NOT NULL,
      mobile_payload TEXT NOT NULL,
      client_name TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

function generateSlug(): string {
  return Math.random().toString(36).substring(2, 7);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await ensureTable();

    const { clientName, desktopPayload, mobilePayload } = req.body;

    if (!clientName || !desktopPayload || !mobilePayload) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: clientName, desktopPayload, mobilePayload' });
    }

    // Generar slug único con reintentos
    let slug = generateSlug();
    let attempts = 0;

    while (attempts < 10) {
      const { rows } = await sql`SELECT slug FROM links WHERE slug = ${slug}`;
      if (rows.length === 0) break;
      slug = generateSlug();
      attempts++;
    }

    if (attempts >= 10) {
      return res.status(500).json({ error: 'No se pudo generar un código único. Intentá de nuevo.' });
    }

    await sql`
      INSERT INTO links (slug, desktop_payload, mobile_payload, client_name)
      VALUES (${slug}, ${desktopPayload}, ${mobilePayload}, ${clientName})
    `;

    console.log(`Link creado: ${slug} para ${clientName}`);
    return res.status(200).json({ slug });

  } catch (error) {
    console.error('Error creando link:', error);
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: `Error interno: ${message}` });
  }
}
