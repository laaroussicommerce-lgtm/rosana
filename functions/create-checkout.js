export async function onRequestPost(context) {
  try {
    const { panier, livraison, commande } = await context.request.json();

    const line_items = panier.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.nom },
        unit_amount: Math.round(item.prix * 100),
      },
      quantity: item.quantite,
    }));

    if (livraison.prix > 0) {
      line_items.push({
        price_data: {
          currency: 'eur',
          product_data: { name: `Livraison ${livraison.label}` },
          unit_amount: Math.round(livraison.prix * 100),
        },
        quantity: 1,
      });
    }

    // Construit les paramètres pour l'API Stripe via fetch
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', `${context.env.SITE_URL}/confirmation.html?session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${context.env.SITE_URL}/commande.html`);
    params.append('customer_email', commande.email);
    params.append('metadata[prenom]', commande.prenom);
    params.append('metadata[nom]', commande.nom);
    params.append('metadata[telephone]', commande.telephone);
    params.append('metadata[adresse]', commande.adresse);
    params.append('metadata[date]', commande.date);
    params.append('metadata[modeLivraison]', livraison.label);
    params.append('metadata[note]', commande.noteLivraison || '');

    line_items.forEach((item, i) => {
      params.append(`line_items[${i}][price_data][currency]`, item.price_data.currency);
      params.append(`line_items[${i}][price_data][product_data][name]`, item.price_data.product_data.name);
      params.append(`line_items[${i}][price_data][unit_amount]`, item.price_data.unit_amount);
      params.append(`line_items[${i}][quantity]`, item.quantity);
    });

    params.append('payment_method_types[0]', 'card');

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (!response.ok) throw new Error(session.error?.message || 'Erreur Stripe');

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ erreur: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}