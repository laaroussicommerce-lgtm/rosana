export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    console.log('Body reçu:', JSON.stringify(body).substring(0, 100));
    
    return new Response(JSON.stringify({ test: 'ok', recu: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.log('Erreur:', err.message);
    return new Response(JSON.stringify({ erreur: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}