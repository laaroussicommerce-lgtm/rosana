// ===== GESTION DU PANIER ROSANA =====

function chargerPanier() {
  try {
    return JSON.parse(localStorage.getItem('rosana-panier')) || [];
  } catch(e) { return []; }
}

function sauvegarderPanier(panier) {
  localStorage.setItem('rosana-panier', JSON.stringify(panier));
  mettreAJourCompteur();
}

function mettreAJourCompteur() {
  const panier = chargerPanier();
  const total = panier.reduce((sum, item) => sum + item.quantite, 0);
  const el = document.getElementById('nb-panier');
  if (el) el.textContent = total;
}

function ajouterAuPanier(id, nom, prix) {
  const idStr = String(id);
  const panier = chargerPanier();
  const existant = panier.find(item => String(item.id) === idStr);
  if (existant) {
    existant.quantite += 1;
  } else {
    panier.push({ id: idStr, nom, prix, quantite: 1 });
  }
  sauvegarderPanier(panier);

  // Notification
  const msg = document.createElement('div');
  msg.textContent = '✅ Ajouté au panier !';
  msg.style.cssText = `
    position:fixed; bottom:30px; right:30px;
    background:#b5546a; color:white;
    padding:12px 24px; border-radius:25px;
    font-size:0.95rem; z-index:9999;
    box-shadow:0 4px 15px rgba(181,84,106,0.3);
    transition:opacity 0.4s; font-family:'Georgia',serif;
  `;
  document.body.appendChild(msg);
  setTimeout(() => {
    msg.style.opacity = '0';
    setTimeout(() => msg.remove(), 400);
  }, 2000);
}

function supprimerDuPanier(id) {
  const idStr = String(id);
  let panier = chargerPanier();
  panier = panier.filter(item => String(item.id) !== idStr);
  sauvegarderPanier(panier);
  afficherPanier();
}

function modifierQuantite(id, delta) {
  const idStr = String(id);
  const panier = chargerPanier();
  const item = panier.find(i => String(i.id) === idStr);
  if (!item) return;
  item.quantite += delta;
  if (item.quantite <= 0) { supprimerDuPanier(id); return; }
  sauvegarderPanier(panier);
  afficherPanier();
}

function afficherPanier() {
  const panier = chargerPanier();
  const container = document.getElementById('contenu-panier');
  if (!container) return;

  if (panier.length === 0) {
    container.innerHTML = '<p style="color:#999;text-align:center;padding:30px 0;">Votre panier est vide.</p>';
    document.getElementById('total-panier').textContent = '0€';
    return;
  }

  let html = '';
  let total = 0;

  panier.forEach(item => {
    const soustotal = item.prix * item.quantite;
    total += soustotal;

    const imageUrl  = localStorage.getItem('rosana-image-'          + item.id);
    const reco      = localStorage.getItem('rosana-reco-'           + item.id);
    const msg       = localStorage.getItem('rosana-message-'        + item.id);
    const petites   = localStorage.getItem('rosana-petitesfleurs-'  + item.id);

    let visuel = '';
    if (imageUrl) {
      visuel = `<img src="${imageUrl}"
        style="width:75px;height:75px;border-radius:12px;
               object-fit:cover;border:2px solid #f0e6e6;flex-shrink:0;">`;
    } else {
      visuel = `<div style="width:75px;height:75px;border-radius:12px;
                background:#fdf0f3;border:2px solid #f0e6e6;flex-shrink:0;
                display:flex;align-items:center;justify-content:center;
                font-size:1.8rem;">🌸</div>`;
    }

    let extras = '';
    if (reco)    extras += `<div style="font-size:0.8rem;color:#999;margin-top:3px;">📝 ${reco}</div>`;
    if (petites) extras += `<div style="font-size:0.8rem;color:#999;margin-top:3px;">🌸 ${petites}</div>`;
    if (msg)     extras += `<div style="font-size:0.8rem;color:#999;margin-top:3px;">💌 ${msg}</div>`;

    html += `
      <div class="ligne-panier" style="gap:15px;align-items:flex-start;">
        ${visuel}
        <div style="flex:1;">
          <strong style="font-size:0.95rem;">${item.nom}</strong>
          <div style="font-size:0.85rem;color:#999;margin-top:3px;">${item.prix}€ / unité</div>
          ${extras}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <button onclick="modifierQuantite('${item.id}', -1)"
              style="width:30px;height:30px;border-radius:50%;border:2px solid #b5546a;
                     background:white;color:#b5546a;font-size:1.1rem;cursor:pointer;
                     display:flex;align-items:center;justify-content:center;transition:all 0.2s;"
              onmouseover="this.style.background='#b5546a';this.style.color='white'"
              onmouseout="this.style.background='white';this.style.color='#b5546a'">−</button>
            <span style="font-size:1rem;font-weight:bold;min-width:20px;text-align:center;">
              ${item.quantite}
            </span>
            <button onclick="modifierQuantite('${item.id}', +1)"
              style="width:30px;height:30px;border-radius:50%;border:2px solid #b5546a;
                     background:white;color:#b5546a;font-size:1.1rem;cursor:pointer;
                     display:flex;align-items:center;justify-content:center;transition:all 0.2s;"
              onmouseover="this.style.background='#b5546a';this.style.color='white'"
              onmouseout="this.style.background='white';this.style.color='#b5546a'">+</button>
          </div>
          <strong style="color:#b5546a;">${soustotal}€</strong>
          <button onclick="supprimerDuPanier('${item.id}')"
            style="background:none;border:none;color:#ccc;cursor:pointer;
                   font-size:0.82rem;transition:color 0.2s;"
            onmouseover="this.style.color='#b5546a'"
            onmouseout="this.style.color='#ccc'">🗑 Supprimer</button>
        </div>
      </div>`;
  });

  container.innerHTML = html;
  document.getElementById('total-panier').textContent = total + '€';
}

mettreAJourCompteur();
