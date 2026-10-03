// Liste des candidats (actuellement vide)
const candidats = [];

// Éléments du DOM
const btnVoter = document.getElementById("btn-voter");
const sectionFormulaire = document.getElementById("section-formulaire-vote");

const etape1 = document.getElementById("etape-1-infos");
const etape2 = document.getElementById("etape-2-candidats");

const btnVersEtape2 = document.getElementById("btn-vers-etape-2");
const btnRetourEtape1 = document.getElementById("btn-retour-etape-1");
const btnRetourAccueil = document.getElementById("btn-retour-accueil");

const radioCandidatsContainer = document.getElementById("radio-candidats-container");
const formEtape2 = document.getElementById("form-etape-2");
const voteMessage = document.getElementById("vote-message");

// Calcul de l'âge (15 à 40 ans)
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

// Affichage du message d'erreur ou succès
function afficherMessage(message, type) {
  voteMessage.textContent = message;
  voteMessage.className = `message-box ${type}`;
  voteMessage.classList.remove("hidden");
}

function masquerMessage() {
  voteMessage.classList.add("hidden");
}

// Affichage dynamique des candidats à l'étape 2
function chargerCandidats() {
  radioCandidatsContainer.innerHTML = "";

  if (candidats.length === 0) {
    radioCandidatsContainer.innerHTML = `
      <p style="text-align: center; color: #64748b; font-style: italic; padding: 15px;">
        Pas de candidat inscrit pour le moment
      </p>
    `;
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

// Action : "Je veux voter"
if (btnVoter) {
  btnVoter.addEventListener("click", () => {
    sectionFormulaire.classList.remove("hidden");
    etape1.classList.remove("hidden");
    etape2.classList.add("hidden");
    masquerMessage();
    sectionFormulaire.scrollIntoView({ behavior: "smooth" });
  });
}

// Action : Passage de l'Étape 1 à l'Étape 2
if (btnVersEtape2) {
  btnVersEtape2.addEventListener("click", () => {
    masquerMessage();

    const nomPrenoms = document.getElementById("nom-prenoms").value.trim();
    const dobInput = document.getElementById("dob").value;
    const typeDoc = document.getElementById("type-document").value;
    const fileDoc = document.getElementById("file-document").files.length;

    if (!nomPrenoms || !dobInput || !typeDoc || fileDoc === 0) {
      afficherMessage("Veuillez remplir tous les champs et ajouter votre document.", "error");
      return;
    }

    const age = calculerAge(dobInput);
    if (age < 15 || age > 40) {
      afficherMessage(`❌ Vote non autorisé : Vous avez ${age} ans. Seules les personnes âgées de 15 à 40 ans peuvent voter.`, "error");
      return;
    }

    // Si tout est bon, on affiche l'étape 2
    etape1.classList.add("hidden");
    etape2.classList.remove("hidden");
    chargerCandidats();
  });
}

// Action : Retour à l'Étape 1
if (btnRetourEtape1) {
  btnRetourEtape1.addEventListener("click", () => {
    etape2.classList.add("hidden");
    etape1.classList.remove("hidden");
    masquerMessage();
  });
}

// Action : Retour Accueil
if (btnRetourAccueil) {
  btnRetourAccueil.addEventListener("click", () => {
    sectionFormulaire.classList.add("hidden");
    masquerMessage();
  });
}

// Action : Validation finale du Vote
if (formEtape2) {
  formEtape2.addEventListener("submit", (e) => {
    e.preventDefault();

    if (candidats.length === 0) {
      afficherMessage("Impossible de valider : aucun candidat n'est inscrit pour le moment.", "error");
      return;
    }

    const candidatChoisi = document.querySelector('input[name="candidat"]:checked');
    if (!candidatChoisi) {
      afficherMessage("Veuillez choisir un candidat.", "error");
      return;
    }

    afficherMessage("✅ Votre vote a été enregistré avec succès !", "success");
    setTimeout(() => {
      location.reload();
    }, 3000);
  });
}
