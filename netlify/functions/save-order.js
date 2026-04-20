exports.handler = async (event) => {
  try {
    console.log('1. Function appelée');
    
    const commande = JSON.parse(event.body);
    console.log('2. Commande parsée:', JSON.stringify(commande).substring(0, 100));

    const baseId = process.env.AIRTABLE_BASE_ID;
    const token  = process.env.AIRTABLE_TOKEN;
    console.log('3. BaseID existe:', !!baseId);
    console.log('4. Token existe:', !!token);

    const url = `https://api.airtable.com/v0/${baseId}/Commandes`;
    console.log('5. URL:', url);

    const record = {
      fields: {
        "Numéro":          commande.numero || 'test',
        "Date de commande":   new Date().toISOString().split('T')[0],
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
        "Note livraison":  commande.noteLivraison || '',
        "Frais livraison": parseFloat(commande.fraisLivraison) || 0,
        "Total":           parseFloat(commande.total) || 0,
        "Date livraison":  commande.dateLivraison || '',
        // "Statut":          "En attente",
        "Aperçu bouquet":  commande.apercuBouquet || '',
      }
    };

    console.log('6. Record créé, envoi vers Airtable...');

    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ records: [record] }),
      }
    );

    console.log('7. Status Airtable:', response.status);
    const data = await response.json();
    console.log('8. Réponse Airtable:', JSON.stringify(data).substring(0, 200));

    if (!response.ok) throw new Error(JSON.stringify(data));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (err) {
    console.log('ERREUR:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ erreur: err.message }),
    };
  }
};