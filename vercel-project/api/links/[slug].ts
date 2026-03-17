import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Slug inválido' });
    }

    const { rows } = await sql`
      SELECT desktop_payload, mobile_payload FROM links WHERE slug = ${slug}
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Enlace no encontrado o expirado' });
    }

    // Devolvemos con los nombres que espera el frontend
    return res.status(200).json({
      desktopPayload: rows[0].desktop_payload,
      mobilePayload: rows[0].mobile_payload,
    });

  } catch (error) {
    console.error('Error obteniendo link:', error);
    return res.status(500).json({ error: 'Error al recuperar el enlace' });
  }
}
