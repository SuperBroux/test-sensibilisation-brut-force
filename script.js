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

function addNumbers(words) {
    let newWords = [];
    for (let word of words) {
        for (let i = 0; i < 100; i++) { // Ajoute des chiffres de 0 à 99
            newWords.push(word + i);
            newWords.push(i + word);
            newWords.push(i + word + i);
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
            newWords.push(char + word + char); // Ajoute le caractère spécial au début et à la fin
        }
    }
    return newWords;
}

async function checkPassword() {
    const password = document.getElementById("password").value;
    const commonPasswords = await loadPasswords();
    let allGuesses = [...commonPasswords];

    const steps = [
        { message: "Test des mots de la liste...", func: () => commonPasswords },
        { message: "Test des substitutions...", func: () => allGuesses.concat(...commonPasswords.flatMap(word => generateVariations(word, specialReplacements))) },
        { message: "Ajout de chiffres en début de mot...", func: () => addNumbers(commonPasswords).concat(allGuesses) },
        { message: "Ajout de chiffres en fin de mot...", func: () => addNumbers(allGuesses).concat(allGuesses) },
        { message: "Ajout de chiffres avant et après les mots...", func: () => addNumbers(allGuesses) },
        { message: "Ajout de caractères spéciaux avant les mots...", func: () => addSpecialChars(allGuesses, specialChars) },
        { message: "Ajout de caractères spéciaux après les mots...", func: () => addSpecialChars(allGuesses, specialChars) },
        { message: "Ajout de caractères spéciaux avant et après les mots...", func: () => addSpecialChars(allGuesses, specialChars) },
        { message: "Cumul ajout de chiffres avant et substitution de lettres dans les mots...", func: () => addNumbers(generateVariations(allGuesses, specialReplacements)) },
        { message: "Cumul ajout de chiffres après et substitution de lettres dans les mots...", func: () => addNumbers(generateVariations(allGuesses, specialReplacements)) },
        { message: "Cumul ajout de chiffres avant et après et substitution de lettres dans les mots...", func: () => addNumbers(generateVariations(allGuesses, specialReplacements)) },
        { message: "Cumul ajout de chiffres après et ajout de caractères spéciaux après les mots...", func: () => addSpecialChars(addNumbers(allGuesses), specialChars) },
        { message: "Cumul ajout de chiffres après et ajout de caractères spéciaux avant les mots...", func: () => addSpecialChars(addNumbers(allGuesses), specialChars) },
        { message: "Cumul ajout de chiffres après et ajout de caractères spéciaux avant et après les mots...", func: () => addSpecialChars(addNumbers(allGuesses), specialChars) },
        { message: "Cumul ajout de chiffres après et ajout de caractères spéciaux après les mots et substitution des caractères...", func: () => addSpecialChars(addNumbers(generateVariations(allGuesses, specialReplacements)), specialChars) },
        { message: "Cumul ajout de chiffres après et ajout de caractères spéciaux avant les mots et substitution des caractères...", func: () => addSpecialChars(addNumbers(generateVariations(allGuesses, specialReplacements)), specialChars) },
        { message: "Cumul ajout de chiffres après et ajout de caractères spéciaux avant et après les mots et substitution des caractères...", func: () => addSpecialChars(addNumbers(generateVariations(allGuesses, specialReplacements)), specialChars) },
        { message: "Cumul ajout de chiffres avant et ajout de caractères spéciaux après les mots...", func: () => addSpecialChars(addNumbers(allGuesses), specialChars) },
        { message: "Cumul ajout de chiffres avant et ajout de caractères spéciaux avant les mots...", func: () => addSpecialChars(addNumbers(allGuesses), specialChars) },
        { message: "Cumul ajout de chiffres avant et ajout de caractères spéciaux avant et après les mots...", func: () => addSpecialChars(addNumbers(allGuesses), specialChars) },
        { message: "Cumul ajout de chiffres avant et ajout de caractères spéciaux après les mots et substitution des caractères...", func: () => addSpecialChars(addNumbers(generateVariations(allGuesses, specialReplacements)), specialChars) },
        { message: "Cumul ajout de chiffres avant et ajout de caractères spéciaux avant les mots et substitution des caractères...", func: () => addSpecialChars(addNumbers(generateVariations(allGuesses, specialReplacements)), specialChars) },
        { message: "Cumul ajout de chiffres avant et ajout de caractères spéciaux avant et après les mots et substitution des caractères...", func: () => addSpecialChars(addNumbers(generateVariations(allGuesses, specialReplacements)), specialChars) },
        { message: "Cumul ajout de chiffres avant et après et ajout de caractères spéciaux après les mots...", func: () => addSpecialChars(addNumbers(allGuesses), specialChars) },
        { message: "Cumul ajout de chiffres avant et après et ajout de caractères spéciaux avant les mots...", func: () => addSpecialChars(addNumbers(allGuesses), specialChars) },
        { message: "Cumul ajout de chiffres avant et après et ajout de caractères spéciaux avant et après les mots...", func: () => addSpecialChars(addNumbers(allGuesses), specialChars) },
        { message: "Cumul ajout de chiffres avant et après et ajout de caractères spéciaux après les mots et substitution des caractères...", func: () => addSpecialChars(addNumbers(generateVariations(allGuesses, specialReplacements)), specialChars) },
        { message: "Cumul ajout de chiffres avant et après et ajout de caractères spéciaux avant les mots et substitution des caractères...", func: () => addSpecialChars(addNumbers(generateVariations(allGuesses, specialReplacements)), specialChars) },
        { message: "Cumul ajout de chiffres avant et après et ajout de caractères spéciaux avant et après les mots et substitution des caractères...", func: () => addSpecialChars(addNumbers(generateVariations(allGuesses, specialReplacements)), specialChars) }
    ];

    const startTime = performance.now();

    for (const step of steps) {
        document.getElementById("status").textContent = step.message;
        console.log(step.message);
        allGuesses = step.func();

        for (let guess of allGuesses) {
            console.log("Test du mot de passe :", guess);
            document.getElementById("currentGuess").textContent = `Test du mot de passe : ${guess}`;
            document.getElementById("testedPasswords").textContent += `${guess}\n`;
            await new Promise(r => setTimeout(r, 10));
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
    }

    document.getElementById("status").textContent = "";
    document.getElementById("result").textContent = "Votre mot de passe est très solide, le programme n'a pas été capable de le forcer.";
    document.getElementById("currentGuess").textContent = "";
    console.log("Votre mot de passe est très solide, le programme n'a pas été capable de le forcer.");
}
