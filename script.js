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

function isValidPassword(password) {
    const hasMinLength = password.length > 8;
    const hasDigit = /\d/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#\$%\^&\*]/.test(password);

    return hasMinLength && hasDigit && hasUpperCase && hasLowerCase && hasSpecialChar;
}

function generateVariations(word, replacements) {
    let variations = new Set();
    variations.add(word);

    // Substitutions de caractères
    for (let [key, values] of Object.entries(replacements)) {
        let regex = new RegExp(key, 'gi');
        let tempVariations = new Set();
        for (let variant of variations) {
            for (let value of values) {
                tempVariations.add(variant.replace(regex, value));
            }
        }
        for (let temp of tempVariations) {
            variations.add(temp);
        }
    }

    // Variations majuscules/minuscules
    let capitalizedVariations = capitalizeVariations([...variations]);
    capitalizedVariations.forEach(variant => variations.add(variant));

    // Ajout de chiffres
    let numberedVariations = addNumbers([...variations]);
    numberedVariations.forEach(variant => variations.add(variant));

    // Ajout de caractères spéciaux
    const specialChars = ['!', '@', '#', '$', '%', '&', '*'];
    let specialCharVariations = addSpecialChars([...variations], specialChars);
    specialCharVariations.forEach(variant => variations.add(variant));

    // Filtrage des variations pour ne garder que les mots de passe valides
    return [...variations].filter(isValidPassword);
}

function capitalizeVariations(words) {
    let variations = new Set();
    for (let word of words) {
        let length = word.length;
        let combinations = 1 << length; // 2^length combinations
        for (let i = 0; i < combinations; i++) {
            let variant = word.split('').map((char, index) => {
                return (i & (1 << index)) ? char.toUpperCase() : char.toLowerCase();
            }).join('');
            variations.add(variant);
        }
    }
    return [...variations];
}

function addNumbers(words) {
    let newWords = new Set();
    for (let word of words) {
        for (let i = 0; i < 100; i++) { // Ajoute des chiffres de 0 à 99
            newWords.add(i + word);
            newWords.add(word + i);
        }
    }
    return [...newWords];
}

function addSpecialChars(words, specialChars) {
    let newWords = new Set();
    for (let word of words) {
        for (let char of specialChars) {
            newWords.add(char + word); // Ajoute le caractère spécial au début
            newWords.add(word + char); // Ajoute le caractère spécial à la fin
            for (let i = 1; i < word.length; i++) { // Ajoute le caractère spécial à diverses positions à l'intérieur du mot
                newWords.add(word.slice(0, i) + char + word.slice(i));
            }
        }
    }
    return [...newWords];
}

function formatTime(ms) {
    let minutes = Math.floor(ms / 60000);
    let seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + " minutes et " + (seconds < 10 ? '0' : '') + seconds + " secondes";
}

async function testPassword(password, guess) {
    document.getElementById("currentGuess").textContent = `Test du mot de passe : ${guess}`;
    document.getElementById("testedPasswords").textContent += `${guess}\n`; // Affiche le mot de passe testé
    await new Promise(r => setTimeout(r, 10)); // Simule un délai pour visualiser chaque mot de passe testé
    return guess === password;
}

async function checkPassword() {
    const password = document.getElementById("password").value;

    if (!isValidPassword(password)) {
        document.getElementById("status").textContent = "";
        document.getElementById("result").innerHTML = `
            Votre mot de passe ne remplit pas les critères minimum de sécurité : <br>
            - Plus de 8 caractères <br>
            - Au moins un chiffre <br>
            - Au moins une majuscule <br>
            - Au moins une minuscule <br>
            - Au moins un caractère spécial
        `;
        return;
    }

    const commonPasswords = await loadPasswords();
    console.log("Mots de passe communs chargés :", commonPasswords);
    let allGuesses = [];
    let testedCount = 0;

    const startTime = performance.now();
    const batchSize = 10000; // Taille du lot

    for (let word of commonPasswords) {
        let variations = generateVariations(word, specialReplacements);
        allGuesses = allGuesses.concat(variations);

        for (let i = 0; i < variations.length; i += batchSize) {
            const batch = variations.slice(i, i + batchSize);
            const testPromises = batch.map(guess => testPassword(password, guess));
            const results = await Promise.all(testPromises);
            testedCount += batch.length;
            document.getElementById("testedCount").textContent = `Nombre de combinaisons testées : ${testedCount}`;

            const foundIndex = results.findIndex(result => result);

            if (foundIndex !== -1) {
                const endTime = performance.now();
                const timeElapsed = endTime - startTime;
                const formattedTime = formatTime(timeElapsed);
                const foundPassword = batch[foundIndex];
                document.getElementById("status").textContent = "";
                document.getElementById("result").innerHTML = `
                    Mot de passe trouvé : ${foundPassword} <br>
                    Temps écoulé : ${formattedTime} <br>
                    Tentatives : ${testedCount}
                `;
                console.log("Mot de passe trouvé :", foundPassword);
                console.log("Temps écoulé :", formattedTime);
                console.log("Nombre de tentatives :", testedCount);
                return;
            }
        }
    }

    const endTime = performance.now();
    const timeElapsed = endTime - startTime;
    const formattedTime = formatTime(timeElapsed);
    document.getElementById("status").textContent = "";
    document.getElementById("result").textContent = "Votre mot de passe est très solide, le programme n'a pas été capable de le forcer.";
    document.getElementById("currentGuess").textContent = "";
    document.getElementById("testedCount").textContent = `Nombre de combinaisons testées : ${testedCount}`;
    console.log("Votre mot de passe est très solide, le programme n'a pas été capable de le forcer.");
    console.log("Temps écoulé :", formattedTime);
}
