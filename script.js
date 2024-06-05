async function loadPasswords() {
    const response = await fetch('passwords.txt');
    const text = await response.text();
    return text.split('\n').map(p => p.trim()).filter(p => p);
}

function generateVariations(word, replacements) {
    let variations = [word];
    for (let [key, values] of Object.entries(replacements)) {
        let regex = new RegExp(key, 'gi');
        for (let i = 0; i < variations.length; i++) {
            for (let value of values) {
                let newVariation = variations[i].replace(regex, value);
                if (!variations.includes(newVariation)) {
                    variations.push(newVariation);
                }
            }
        }
    }
    return variations;
}

async function checkPassword() {
    const password = document.getElementById("password").value;
    const commonPasswords = await loadPasswords();
    console.log("Mots de passe communs chargés :", commonPasswords);
    let allGuesses = [...commonPasswords];
    
    document.getElementById("status").textContent = "Génération des variations avec des caractères spéciaux...";
    console.log("Génération des variations avec des caractères spéciaux...");
    allGuesses = allGuesses.concat(...commonPasswords.map(word => generateVariations(word, specialReplacements)));
    console.log("Variations générées :", allGuesses);
    
    document.getElementById("status").textContent = "Ajout de chiffres aux variations...";
    console.log("Ajout de chiffres aux variations...");
    allGuesses = allGuesses.concat(addNumbers(allGuesses));
    console.log("Chiffres ajoutés :", allGuesses);

    const specialChars = ['!', '@', '#', '$', '%', '&', '*'];
    document.getElementById("status").textContent = "Ajout de caractères spéciaux aux variations...";
    console.log("Ajout de caractères spéciaux aux variations...");
    allGuesses = allGuesses.concat(addSpecialChars(allGuesses, specialChars));
    console.log("Caractères spéciaux ajoutés :", allGuesses);
    
    document.getElementById("status").textContent = "Début du test de brute force...";
    console.log("Début du test de brute force...");
    const startTime = performance.now();

    for (let guess of allGuesses) {
        console.log("Test du mot de passe :", guess);
        document.getElementById("currentGuess").textContent = `Test du mot de passe : ${guess}`;
        await new Promise(r => setTimeout(r, 10)); // Simule un délai pour visualiser chaque mot de passe testé
        if (guess === password) {
            const endTime = performance.now();
            const timeElapsed = endTime - startTime;
            document.getElementById("status").textContent = "";
            document.getElementById("result").innerHTML = `
                Mot de passe trouvé : ${guess} <br>
                Temps écoulé : ${timeElapsed.toFixed(2)} ms <br>
                Tentatives : ${allGuesses.indexOf(guess) + 1}
            `;
            console.log("Mot de passe trouvé :", guess);
            console.log("Temps écoulé :", timeElapsed.toFixed(2), "ms");
            console.log("Nombre de tentatives :", allGuesses.indexOf(guess) + 1);
            return;
        }
    }

    document.getElementById("status").textContent = "";
    document.getElementById("result").textContent = "Mot de passe non trouvé.";
    document.getElementById("currentGuess").textContent = "";
    console.log("Mot de passe non trouvé.");
}
