const specialReplacements = {
    'a': ['@', '4'],
    'l': ['1', '!'],
    'o': ['0'],
    'i': ['1'],
    'I': ['l'],
    's': ['$']
};

async function loadPasswords() {
    const response = await fetch('passwords.txt');
    const text = await response.text();
    return text.split('\n').map(p => p.trim()).filter(p => p);
}

function generateVariations(word, replacements) {
    let variations = [word];
    for (let [key, values] of Object.entries(replacements)) {
        let regex = new RegExp(key, 'gi');
        let newVariations = [];
        for (let variation of variations) {
            for (let value of values) {
                let newVariation = variation.replace(regex, value);
                if (!variations.includes(newVariation) && !newVariations.includes(newVariation)) {
                    newVariations.push(newVariation);
                }
            }
        }
        variations = variations.concat(newVariations);
    }
    return variations;
}

function addNumbers(words) {
    let newWords = [];
    for (let word of words) {
        for (let i = 0; i < 10; i++) { // Limite les chiffres de 0 à 9
            newWords.push(word + i);
        }
    }
    return newWords;
}

function addSpecialChars(words, specialChars) {
    let newWords = [];
    for (let word of words) {
        for (let char of specialChars) {
            newWords.push(char + word); // Ajoute le caractère spécial au début
            newWords.push(word + char); // Ajoute le caractère spécial à la fin
            for (let i = 1; i < word.length; i++) { // Ajoute le caractère spécial à diverses positions à l'intérieur du mot
                newWords.push(word.slice(0, i) + char + word.slice(i));
            }
        }
    }
    return newWords;
}

async function checkPassword() {
    const password = document.getElementById("password").value;
    const commonPasswords = await loadPasswords();
    console.log("Mots de passe communs chargés :", commonPasswords);
    let allGuesses = [...commonPasswords];
    
    document.getElementById("status").textContent = "Génération des variations avec des caractères spéciaux...";
    console.log("Génération des variations avec des caractères spéciaux...");
    for (let word of commonPasswords) {
        allGuesses = allGuesses.concat(generateVariations(word, specialReplacements));
    }
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

    for (let i = 0; i < allGuesses.length; i += 100) { // Traite par lots de 100 mots de passe pour éviter de bloquer l'UI
        let batch = allGuesses.slice(i, i + 100);
        for (let guess of batch) {
            console.log("Test du mot de passe :", guess);
            document.getElementById("currentGuess").textContent = `Test du mot de passe : ${guess}`;
            document.getElementById("testedPasswords").textContent += `${guess}\n`; // Affiche le mot de passe testé
            await new Promise(r => setTimeout(r, 10)); // Simule un délai pour visualiser chaque mot de passe testé
            if (guess === password) {
                const endTime = performance.now();
                const timeElapsed = endTime - startTime;
                document.getElementById("status").textContent = "";
                document.getElementById("result").innerHTML = `
                    Mot de passe trouvé : ${guess} <br>
                    Temps écoulé : ${timeElapsed.toFixed(2)} ms <br>
                    Tentatives : ${i + batch.indexOf(guess) + 1}
                `;
                console.log("Mot de passe trouvé :", guess);
                console.log("Temps écoulé :", timeElapsed.toFixed(2), "ms");
                console.log("Nombre de tentatives :", i + batch.indexOf(guess) + 1);
                return;
            }
        }
    }

    document.getElementById("status").textContent = "";
    document.getElementById("result").textContent = "Mot de passe non trouvé.";
    document.getElementById("currentGuess").textContent = "";
    console.log("Mot de passe non trouvé.");
}
