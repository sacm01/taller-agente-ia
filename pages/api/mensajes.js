import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { usuario, mensaje, tipo } = req.body;
    const { data, error } = await supabase
      .from('mensajes')
      .insert([{ usuario, mensaje, tipo }]);
    if (error) return res.status(500).json({ error });
    return res.status(200).json({ data });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .order('fecha', { ascending: true });
    if (error) return res.status(500).json({ error });
    return res.status(200).json({ data });
  }
}
