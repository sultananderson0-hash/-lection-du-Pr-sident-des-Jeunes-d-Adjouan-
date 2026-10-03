// ==========================================
// CONFIGURATION SUPABASE
// ==========================================
const SUPABASE_URL = 'https://qktfqpsqmcrgtmauntfj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdGZxcHNxbWNyZ3RtYXVudGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NzU1MDEsImV4cCI6MjEwNjU1MTUwMX0.sugP-f143yDuyUzY8FHZqTS-YuuM3JcGX4tLz2N_kuI'; 
// ⚠️ IMPORTANT : Remplacez la ligne ci-dessus par VOTRE clé anon complète.
// Je ne peux pas voir la fin de votre clé sur la capture, donc j'ai mis une clé fictive.
// Copiez votre vraie clé "anon public" depuis Supabase (Settings > API).

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variables globales
let currentElecteurId = null;
let currentElecteurNom = null;

// ==========================================
// FONCTIONS DE NAVIGATION
// ==========================================
function afficherPage(idPage) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const pageActive = document.getElementById(idPage);
    if (pageActive) {
        pageActive.classList.add('active');
        window.scrollTo(0, 0);
    }
}

// ==========================================
// GESTION DU SCRUTIN (TEMPS)
// ==========================================
// ⚠️ DATES DE TEST (Le vote est ouvert pour vos tests)
// Pour la mise en ligne finale, remplacez par :
// const DATE_OUVERTURE = new Date("2026-10-11T08:00:00");
// const DATE_FERMETURE = new Date("2026-10-11T18:00:00");

const DATE_OUVERTURE = new Date("2026-01-01T08:00:00"); 
const DATE_FERMETURE = new Date("2026-12-31T18:00:00");

function verifierStatutScrutin() {
    const maintenant = new Date();
    const btnVoter = document.getElementById('btn-voter');
    const badge = document.getElementById('badge-statut');
    const msg = document.getElementById('message-statut');

    if(!btnVoter) return; // Si on est sur la page admin

    if (maintenant < DATE_OUVERTURE) {
        badge.className = "status-badge status-waiting";
        badge.innerText = "⏳ Scrutin non ouvert";
        msg.innerText = "Le vote ouvrira le 11 Octobre 2026 à 08h00.";
        btnVoter.disabled = true;
        btnVoter.innerText = "🔒 Vote fermé";
        btnVoter.style.opacity = "0.5";
    } else if (maintenant >= DATE_OUVERTURE && maintenant < DATE_FERMETURE) {
        badge.className = "status-badge status-open";
        badge.innerText = "✅ Scrutin ouvert (TEST)";
        msg.innerText = "Le vote est en cours (phase de test).";
        btnVoter.disabled = false;
        btnVoter.innerText = "🗳️ Je veux voter";
        btnVoter.style.opacity = "1";
    } else {
        badge.className = "status-badge status-closed";
        badge.innerText = "🔒 Scrutin fermé";
        msg.innerText = "Le vote est terminé. Merci de votre participation.";
        btnVoter.disabled = true;
        btnVoter.innerText = "🔒 Vote fermé";
        btnVoter.style.opacity = "0.5";
    }
}

function verifierOuverture() {
    const maintenant = new Date();
    if (maintenant >= DATE_OUVERTURE && maintenant < DATE_FERMETURE) {
        afficherPage('page-inscription');
    } else {
        alert("Le vote n'est pas ouvert actuellement.");
    }
}

// ==========================================
// CÔTÉ ÉLECTEUR (INSCRIPTION ET VOTE)
// ==========================================
async function validerInscription(event) {
    event.preventDefault();
    const nom = document.getElementById('nom').value;
    const date_naissance = document.getElementById('date_naissance').value;
    const type_piece = document.getElementById('type_piece').value;
    const numero_piece = document.getElementById('numero_piece').value;

    // Vérifier si l'électeur existe déjà (par numéro de pièce)
    const { data: existant, error: errCheck } = await supabase
        .from('electeurs')
        .select('*')
        .eq('numero_piece', numero_piece)
        .single();

    if (existant) {
        alert("Cet électeur est déjà inscrit !");
        return;
    }

    // Insérer le nouvel électeur
    const { data, error } = await supabase
        .from('electeurs')
        .insert([{ 
            nom_prenom: nom, 
            date_naissance: date_naissance, 
            type_piece: type_piece, 
            numero_piece: numero_piece,
            est_verifie: false,
            a_vote: false
        }])
        .select();

    if (error) {
        alert("Erreur lors de l'inscription : " + error.message);
        return;
    }

    // Sauvegarder l'ID de l'électeur pour le vote
    currentElecteurId = data[0].id;
    currentElecteurNom = data[0].nom_prenom;

    document.getElementById('message-bienvenue').innerText = `Bienvenue ${nom}, veuillez choisir votre candidat.`;
    afficherPage('page-vote');
    chargerCandidatsPourVote();
}

async function chargerCandidatsPourVote() {
    const container = document.getElementById('liste-candidats');
    container.innerHTML = '<p>Chargement des candidats...</p>';

    const { data: candidats, error } = await supabase.from('candidats').select('*');

    if (error || candidats.length === 0) {
        container.innerHTML = '<p style="color:red;">Aucun candidat n\'a été enregistré.</p>';
        return;
    }

    container.innerHTML = '';
    candidats.forEach((cand) => {
        const div = document.createElement('label');
        div.className = 'candidat-card';
        div.innerHTML = `
            <input type="radio" name="candidat" value="${cand.id}" required style="display:none;">
            <img src="${cand.photo_url}" alt="${cand.nom_prenom}" class="candidat-photo">
            <div class="candidat-nom">${cand.nom_prenom}</div>
            <div class="candidat-info">${cand.profession}</div>
            <div class="candidat-message">"${cand.programme}"</div>
        `;
        div.addEventListener('click', () => {
            document.querySelectorAll('.candidat-card').forEach(c => c.classList.remove('selected'));
            div.classList.add('selected');
            div.querySelector('input[type="radio"]').checked = true;
        });
        container.appendChild(div);
    });
}

async function validerVote(event) {
    event.preventDefault();
    const candidatSelectionne = document.querySelector('input[name="candidat"]:checked');
    
    if (!candidatSelectionne) {
        alert("Veuillez sélectionner un candidat.");
        return;
    }

    const candidatId = candidatSelectionne.value;
    const candidatNom = candidatSelectionne.closest('.candidat-card').querySelector('.candidat-nom').innerText;

    // Enregistrer le vote
    const { error: errVote } = await supabase
        .from('votes')
        .insert([{ candidat_id: candidatId, electeur_id: currentElecteurId }]);

    if (errVote) {
        alert("Erreur lors du vote : " + errVote.message);
        return;
    }

    // Mettre à jour l'électeur (a_vote = true)
    await supabase.from('electeurs').update({ a_vote: true }).eq('id', currentElecteurId);

    document.getElementById('nom-confirmation').innerText = currentElecteurNom;
    document.getElementById('candidat-confirmation').innerText = candidatNom;
    afficherPage('page-confirmation');
}

// ==========================================
// CÔTÉ ADMINISTRATEUR
// ==========================================
async function mettreAJourDashboard() {
    // Compter les candidats
    const { count: nbCandidats } = await supabase.from('candidats').select('*', { count: 'exact', head: true });
    document.getElementById('stat-nb-candidats').innerText = nbCandidats || 0;

    // Compter les votes
    const { count: nbVotes } = await supabase.from('votes').select('*', { count: 'exact', head: true });
    document.getElementById('stat-nb-votes').innerText = nbVotes || 0;

    // Lister les candidats
    const { data: candidats } = await supabase.from('candidats').select('*');
    const listeDiv = document.getElementById('admin-liste-candidats');
    if (candidats && candidats.length > 0) {
        listeDiv.innerHTML = candidats.map(c => 
            `<div style="padding: 8px; border-bottom: 1px solid #eee;">
                <strong>${c.nom_prenom}</strong> - ${c.profession}
            </div>`
        ).join('');
    } else {
        listeDiv.innerHTML = "<p>Aucun candidat.</p>";
    }
}

async function ajouterCandidat(event) {
    event.preventDefault();
    const nom = document.getElementById('cand-nom').value;
    const profession = document.getElementById('cand-profession').value;
    const programme = document.getElementById('cand-programme').value;
    const ambition = document.getElementById('cand-ambition').value;
    const photo_url = document.getElementById('cand-photo').value;

    const { error } = await supabase.from('candidats').insert([{ 
        nom_prenom: nom, 
        profession: profession, 
        programme: programme, 
        ambition: ambition,
        photo_url: photo_url
    }]);

    if (error) {
        alert("Erreur : " + error.message);
    } else {
        alert("Candidat ajouté !");
        document.getElementById('form-candidat').reset();
        afficherPage('page-admin-dashboard');
        mettreAJourDashboard();
    }
}

async function voirElecteurs() {
    afficherPage('page-admin-electeurs');
    const { data: electeurs, error } = await supabase.from('electeurs').select('*');
    const div = document.getElementById('admin-liste-electeurs');
    
    if (error || !electeurs || electeurs.length === 0) {
        div.innerHTML = "<p>Aucun électeur inscrit.</p>";
        return;
    }

    div.innerHTML = electeurs.map(e => 
        `<div style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${e.nom_prenom}</strong><br>
            Pièce: ${e.type_piece} - N° ${e.numero_piece}<br>
            A voté: ${e.a_vote ? '✅ Oui' : '❌ Non'}
        </div>`
    ).join('');
}

// ==========================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Si on est sur index.html
    if (document.getElementById('page-accueil')) {
        verifierStatutScrutin();
        setInterval(verifierStatutScrutin, 60000);
    }
    // Si on est sur admin.html
    if (document.getElementById('page-admin-dashboard')) {
        mettreAJourDashboard();
    }
});
