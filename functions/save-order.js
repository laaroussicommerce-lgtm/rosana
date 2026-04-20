export async function onRequestPost(context) {
  try {
    const commande = await context.request.json();

    const record = {
      fields: {
        "Numéro":          commande.numero,
        "Date de commande": new Date().toISOString().split('T')[0],
        "Client":          `${commande.prenom} ${commande.nom}`,
        "Email":           commande.email || '',
        "Téléphone":       commande.telephone || '',
        "Articles":        String(commande.articles || ''),
        "Motif":           commande.motif || '',
        "Couleurs":        commande.couleurs || '',
        "Recommandations": commande.recommandations || '',
        "Petites fleurs":  commande.petitesFleurs || '',
        "Message carte":   commande.messageCarte || '',
        "Mode livraison":  commande.modeLivraison || '',
        "Adresse":         commande.adresse || '',
        "Date livraison":  commande.dateLivraison || '',
        "Note livraison":  commande.noteLivraison || '',
        "Frais livraison": parseFloat(commande.fraisLivraison) || 0,
        "Total":           parseFloat(commande.total) || 0,
        "Aperçu bouquet":  commande.apercuBouquet || '',
      }
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${context.env.AIRTABLE_BASE_ID}/Commandes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${context.env.AIRTABLE_TOKEN}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ records: [record] }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));

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