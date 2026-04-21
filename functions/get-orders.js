export async function onRequestGet(context) {
  try {
    const response = await fetch(
      'https://api.stripe.com/v1/checkout/sessions?limit=50&expand[]=data.line_items',
      {
        headers: {
          'Authorization': `Bearer ${context.env.STRIPE_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    const commandes = data.data.map(session => ({
      id:            session.id,
      numero:        'ROS-' + session.id.slice(-8).toUpperCase(),
      date:          new Date(session.created * 1000).toLocaleDateString('fr-FR'),
      client:        (session.metadata?.prenom || '') + ' ' + (session.metadata?.nom || ''),
      email:         session.customer_details?.email || '',
      telephone:     session.metadata?.telephone || '',
      adresse:       session.metadata?.adresse || '',
      modeLivraison: session.metadata?.modeLivraison || '',
      dateLivraison: session.metadata?.date || '',
      note:          session.metadata?.note || '',
      total:         (session.amount_total / 100).toFixed(2),
      statut:        session.payment_status === 'paid' ? 'paid' : 'pending',
      articles:      session.line_items?.data?.map(item => ({
        nom:      item.description,
        quantite: item.quantity,
        prix:     (item.amount_total / 100).toFixed(2),
      })) || [],
    }));

    return new Response(JSON.stringify(commandes), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ erreur: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}