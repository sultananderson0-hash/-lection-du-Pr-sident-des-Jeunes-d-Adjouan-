// Données de démonstration (Exemple de candidats ajoutés par l'administrateur)
const candidats = [
  { id: 1, nom: "Kouassi Jean", numero: "N° 1" },
  { id: 2, nom: "Konan Awa", numero: "N° 2" },
  { id: 3, nom: "Yao N'Guessan", numero: "N° 3" }
];

// Éléments du DOM
const btnVoter = document.getElementById("btn-voter");
const btnRetour = document.getElementById("btn-retour");
const sectionFormulaire = document.getElementById("section-formulaire-vote");
const sectionCandidats = document.getElementById("section-candidats");
const candidatsContainer = document.getElementById("candidats-container");
const radioCandidatsContainer = document.getElementById("radio-candidats-container");
const voteForm = document.getElementById("vote-form");
const voteMessage = document.getElementById("vote-message");

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  afficherCandidatsAccueil();
  afficherCandidatsFormulaire();
});

// Afficher la liste des candidats entre "Je veux voter" et "Conditions pour voter"
function afficherCandidatsAccueil() {
  candidatsContainer.innerHTML = "";
  
  if (candidats.length === 0) {
    candidatsContainer.innerHTML = "<p>Aucun candidat n'a encore été ajouté par l'administrateur.</p>";
    return;
  }

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

// Générer la liste d'options radio dans le formulaire de vote
function afficherCandidatsFormulaire() {
  radioCandidatsContainer.innerHTML = "";
  
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

// Gestion des boutons
btnVoter.addEventListener("click", () => {
  sectionFormulaire.classList.remove("hidden");
  sectionFormulaire.scrollIntoView({ behavior: "smooth" });
});

btnRetour.addEventListener("click", () => {
  sectionFormulaire.classList.add("hidden");
  voteMessage.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Calcul strict de l'âge
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

// Validation du formulaire de vote
voteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  voteMessage.classList.add("hidden");
  voteMessage.className = "message-box hidden";

  const dobInput = document.getElementById("dob").value;
  if (!dobInput) {
    afficherMessage("Veuillez entrer votre date de naissance.", "error");
    return;
  }

  const age = calculerAge(dobInput);

  // Vérification de la condition d'âge (15 à 40 ans)
  if (age < 15 || age > 40) {
    afficherMessage(
      `❌ Vote non autorisé : Vous avez ${age} ans. Pour voter, vous devez avoir entre 15 et 40 ans.`, 
      "error"
    );
    return;
  }

  // Si l'âge est valide
  afficherMessage("✅ Votre vote a été enregistré avec succès !", "success");
  
  // Réinitialisation après succès
  setTimeout(() => {
    voteForm.reset();
  }, 2000);
});

function afficherMessage(message, type) {
  voteMessage.textContent = message;
  voteMessage.className = `message-box ${type}`;
  voteMessage.classList.remove("hidden");
}
