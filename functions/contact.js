export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    const record = {
      fields: {
        "Nom":       data.nom || '',
        "Email":     data.email || '',
        "Téléphone": data.telephone || '',
        "Sujet":     data.sujet || '',
        "Message":   data.message || '',
        "Date":      new Date().toISOString().split('T')[0],
        "Lu":        false,
      }
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${context.env.AIRTABLE_BASE_ID}/Messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${context.env.AIRTABLE_TOKEN}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ records: [record] }),
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(result));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ erreur: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}