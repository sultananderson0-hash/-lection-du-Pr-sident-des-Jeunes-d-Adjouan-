// La liste est vide car aucun candidat n'est encore inscrit
const candidats = [];

// Éléments du DOM
const btnVoter = document.getElementById("btn-voter");
const btnRetour = document.getElementById("btn-retour");
const sectionFormulaire = document.getElementById("section-formulaire-vote");
const candidatsContainer = document.getElementById("candidats-container");
const radioCandidatsContainer = document.getElementById("radio-candidats-container");
const voteForm = document.getElementById("vote-form");
const voteMessage = document.getElementById("vote-message");

// Lancement au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  if (candidatsContainer) afficherCandidatsAccueil();
  if (radioCandidatsContainer) afficherCandidatsFormulaire();
});

// 1. Afficher sur la page d'accueil
function afficherCandidatsAccueil() {
  candidatsContainer.innerHTML = "";
  
  if (candidats.length === 0) {
    // Affiche ton message s'il n'y a pas de candidat
    candidatsContainer.innerHTML = "<p style='text-align: center; font-style: italic; color: #64748b; padding: 10px;'>Pas de candidat inscrit pour le moment</p>";
    return;
  }

  // (Le code pour afficher les candidats plus tard restera ici en attente)
  candidats.forEach(candidat => {
    const card = document.createElement("div");
    card.className = "candidat-card";
    card.innerHTML = `
      <div class="candidat-avatar">👤</div>
      <div class="candidat-info">
        <h4>${candidat.numero} — ${candidat.nom}</h4>
      </div>
    `;
    candidatsContainer.appendChild(card);
  });
}

// 2. Afficher dans le formulaire de vote
function afficherCandidatsFormulaire() {
  radioCandidatsContainer.innerHTML = "";
  
  if (candidats.length === 0) {
    // Affiche ton message dans le formulaire
    radioCandidatsContainer.innerHTML = "<p style='font-style: italic; color: #64748b;'>Pas de candidat inscrit pour le moment</p>";
    return;
  }

  candidats.forEach((candidat, index) => {
    const label = document.createElement("label");
    label.className = "radio-item";
    label.innerHTML = `
      <input type="radio" name="candidat" value="${candidat.id}" ${index === 0 ? "checked" : ""}>
      <span>🗳️ ${candidat.numero} — ${candidat.nom}</span>
    `;
    radioCandidatsContainer.appendChild(label);
  });
}

// Boutons "Je veux voter" et "Retour"
if (btnVoter) {
  btnVoter.addEventListener("click", () => {
    sectionFormulaire.classList.remove("hidden");
    sectionFormulaire.scrollIntoView({ behavior: "smooth" });
  });
}

if (btnRetour) {
  btnRetour.addEventListener("click", () => {
    sectionFormulaire.classList.add("hidden");
    voteMessage.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Système de vérification de l'âge (15 à 40 ans)
function calculerAge(dateNaissance) {
  const aujourdhui = new Date();
  const dateNaissanceObj = new Date(dateNaissance);
  let age = aujourdhui.getFullYear() - dateNaissanceObj.getFullYear();
  const moisDiff = aujourdhui.getMonth() - dateNaissanceObj.getMonth();

  if (moisDiff < 0 || (moisDiff === 0 && aujourdhui.getDate() < dateNaissanceObj.getDate())) {
    age--;
  }
  return age;
}

if (voteForm) {
  voteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Bloquer le vote s'il n'y a pas de candidat
    if (candidats.length === 0) {
       afficherMessage("Impossible de voter : aucun candidat n'est inscrit pour le moment.", "error");
       return;
    }

    voteMessage.classList.add("hidden");
    voteMessage.className = "message-box hidden";

    const dobInput = document.getElementById("dob").value;
    if (!dobInput) {
      afficherMessage("Veuillez entrer votre date de naissance.", "error");
      return;
    }

    const age = calculerAge(dobInput);

    if (age < 15 || age > 40) {
      afficherMessage(
        `❌ Vote non autorisé : Vous avez ${age} ans. Pour voter, vous devez avoir entre 15 et 40 ans.`, 
        "error"
      );
      return;
    }

    afficherMessage("✅ Votre vote a été enregistré avec succès !", "success");
    
    setTimeout(() => {
      voteForm.reset();
    }, 2000);
  });
}

function afficherMessage(message, type) {
  voteMessage.textContent = message;
  voteMessage.className = `message-box ${type}`;
  voteMessage.classList.remove("hidden");
}
