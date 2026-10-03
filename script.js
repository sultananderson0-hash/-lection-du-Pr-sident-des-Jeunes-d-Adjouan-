document.addEventListener("DOMContentLoaded", () => {
  // === RÉCUPÉRATION DES ÉLÉMENTS DE LA PAGE ===
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

  // === 1. ACTION DU BOUTON VERT "JE VEUX VOTER" ===
  if (btnVoter && sectionFormulaire) {
    btnVoter.addEventListener("click", () => {
      sectionFormulaire.classList.remove("hidden"); // Affiche la section
      
      if (etape1) etape1.classList.remove("hidden");
      if (etape2) etape2.classList.add("hidden");
      if (voteMessage) voteMessage.classList.add("hidden");
      
      // Fait défiler l'écran vers le formulaire doucement
      sectionFormulaire.scrollIntoView({ behavior: "smooth" });
    });
  }

  // === CALCUL DE L'ÂGE ===
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

  // === GESTION DES MESSAGES D'ERREUR ===
  function afficherMessage(message, type) {
    if (!voteMessage) return;
    voteMessage.textContent = message;
    voteMessage.className = `message-box ${type}`;
    voteMessage.classList.remove("hidden");
  }

  // === 2. BOUTON "CONTINUER VERS LES CANDIDATS" (ÉTAPE 1 -> ÉTAPE 2) ===
  if (btnVersEtape2) {
    btnVersEtape2.addEventListener("click", () => {
      if (voteMessage) voteMessage.classList.add("hidden");

      // Récupérer les valeurs des champs
      const nomPrenoms = document.getElementById("nom-prenoms") ? document.getElementById("nom-prenoms").value.trim() : "";
      const dobInput = document.getElementById("dob") ? document.getElementById("dob").value : "";
      const typeDoc = document.getElementById("type-document") ? document.getElementById("type-document").value : "";
      const fileDocElement = document.getElementById("file-document");
      const fileDoc = (fileDocElement && fileDocElement.files) ? fileDocElement.files.length : 0;

      // Vérifier que tout est rempli
      if (!nomPrenoms || !dobInput || !typeDoc || fileDoc === 0) {
        afficherMessage("Veuillez remplir tous les champs et ajouter votre document.", "error");
        return;
      }

      // Vérifier la condition d'âge
      const age = calculerAge(dobInput);
      if (age < 15 || age > 40) {
        afficherMessage(`❌ Vote non autorisé : Vous avez ${age} ans. Seules les personnes de 15 à 40 ans peuvent voter.`, "error");
        return;
      }

      // Si tout est bon, on affiche l'étape 2
      if (etape1) etape1.classList.add("hidden");
      if (etape2) etape2.classList.remove("hidden");

      // Afficher le message d'absence de candidat
      if (radioCandidatsContainer) {
        radioCandidatsContainer.innerHTML = `
          <p style="text-align: center; color: #64748b; font-style: italic; padding: 15px;">
            Pas de candidat inscrit pour le moment
          </p>
        `;
      }
    });
  }

  // === 3. BOUTONS DE RETOUR ===
  if (btnRetourAccueil) {
    btnRetourAccueil.addEventListener("click", () => {
      if (sectionFormulaire) sectionFormulaire.classList.add("hidden");
      if (voteMessage) voteMessage.classList.add("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (btnRetourEtape1) {
    btnRetourEtape1.addEventListener("click", () => {
      if (etape2) etape2.classList.add("hidden");
      if (etape1) etape1.classList.remove("hidden");
      if (voteMessage) voteMessage.classList.add("hidden");
    });
  }

  // === 4. VALIDATION FINALE DU VOTE ===
  if (formEtape2) {
    formEtape2.addEventListener("submit", (e) => {
      e.preventDefault();
      // On bloque le vote car il n'y a pas de candidats pour l'instant
      afficherMessage("Impossible de valider : aucun candidat n'est inscrit pour le moment.", "error");
    });
  }
});
        
