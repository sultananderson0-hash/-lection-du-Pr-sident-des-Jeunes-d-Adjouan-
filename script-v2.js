// ==========================================
// CONFIGURATION SUPABASE
// ==========================================
const SUPABASE_URL = 'https://qktfqpsqmcrgtmauntfj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdGZxcHNxbWNyZ3RtYXVudGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NzU1MDEsImV4cCI6MjEwNjU1MTUwMX0.sugP-f143yDuyUzY8FHZqTS-YuuM3JcGX4tLz2N_kuI'; 

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentElecteurId = null;
let currentElecteurNom = null;

// ==========================================
// NAVIGATION
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
// GESTION DU SCRUTIN (MODE TEST - TOUJOURS OUVERT)
// ==========================================
function verifierStatutScrutin() {
    const btnVoter = document.getElementById('btn-voter');
    const badge = document.getElementById('badge-statut');
    const msg = document.getElementById('message-statut');

    if(!btnVoter) return;

    // 🔓 MODE TEST : On force l'ouverture du scrutin
    badge.className = "status-badge status-open";
    badge.innerText = "✅ Scrutin ouvert (TEST)";
    msg.innerText = "Le vote est en cours. Phase de test.";
    btnVoter.disabled = false;
    btnVoter.innerText = "🗳️ Je veux voter";
    btnVoter.style.opacity = "1";
}

function verifierOuverture() {
    // 🔓 MODE TEST : On ouvre directement la page d'inscription
    afficherPage('page-inscription');
}

// ==========================================
// ÉLECTEUR
// ==========================================
async function validerInscription(event) {
    event.preventDefault();
    const nom = document.getElementById('nom').value;
    const date_naissance = document.getElementById('date_naissance').value;
    const type_piece = document.getElementById('type_piece').value;
    const numero_piece = document.getElementById('numero_piece').value;

    const { data: existant } = await supabase
        .from('electeurs')
        .select('*')
        .eq('numero_piece', numero_piece)
        .single();

    if (existant) {
        alert("Cet électeur est déjà inscrit !");
        return;
    }

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

    const { error: errVote } = await supabase
        .from('votes')
        .insert([{ candidat_id: candidatId, electeur_id: currentElecteurId }]);

    if (errVote) {
        alert("Erreur lors du vote : " + errVote.message);
        return;
    }

    await supabase.from('electeurs').update({ a_vote: true }).eq('id', currentElecteurId);

    document.getElementById('nom-confirmation').innerText = currentElecteurNom;
    document.getElementById('candidat-confirmation').innerText = candidatNom;
    afficherPage('page-confirmation');
}

// ==========================================
// ADMIN
// ==========================================
async function mettreAJourDashboard() {
    const { count: nbCandidats } = await supabase.from('candidats').select('*', { count: 'exact', head: true });
    document.getElementById('stat-nb-candidats').innerText = nbCandidats || 0;

    const { count: nbVotes } = await supabase.from('votes').select('*', { count: 'exact', head: true });
    document.getElementById('stat-nb-votes').innerText = nbVotes || 0;

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
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('page-accueil')) {
        verifierStatutScrutin();
    }
    if (document.getElementById('page-admin-dashboard')) {
        mettreAJourDashboard();
    }
});
