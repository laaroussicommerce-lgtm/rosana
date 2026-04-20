const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const { panier, livraison, commande } = JSON.parse(event.body);

    // Crée les lignes de produits pour Stripe
    const line_items = panier.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.nom,
        },
        unit_amount: Math.round(item.prix * 100), // Stripe travaille en centimes
      },
      quantity: item.quantite,
    }));

    // Ajoute la livraison si non gratuite
    if (livraison.prix > 0) {
      line_items.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Livraison ${livraison.label}`,
          },
          unit_amount: Math.round(livraison.prix * 100),
        },
        quantity: 1,
      });
    }

    // Crée la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.SITE_URL}/confirmation.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.SITE_URL}/commande.html`,
      customer_email: commande.email,
      metadata: {
        prenom:        commande.prenom,
        nom:           commande.nom,
        telephone:     commande.telephone,
        adresse:       commande.adresse,
        date:          commande.date,
        modeLivraison: livraison.label,
        note:            commande.noteLivraison || '',
        recommandations: commande.recommandations || '',
        petitesFleurs:   commande.petitesFleurs || '',
        message:         commande.message || '',
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ erreur: err.message }),
    };
  }
};