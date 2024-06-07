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

function addNumbers(word) {
    let variations = [];
    for (let i = 0; i < 100; i++) {
        variations.push(word + i);
        variations.push(i + word);
        variations.push(i + word + i);
    }
    return variations;
}

function addSpecialChars(word, specialChars) {
    let variations = [];
    for (let char of specialChars) {
        variations.push(char + word);
        variations.push(word + char);
        variations.push(char + word + char);
    }
    return variations;
}

function capitalizeVariations(word) {
    let variations = [word];
    const length = word.length;
    for (let i = 0; i < (1 << length); i++) {
        let variation = word.split('').map((char, index) => (i & (1 << index)) ? char.toUpperCase() : char).join('');
        if (!variations.includes(variation)) {
            variations.push(variation);
        }
    }
    return variations;
}

function generateAllCombinations(word, replacements, specialChars) {
    let allVariations = generateVariations(word, replacements);
    let finalVariations = [];

    for (let variation of allVariations) {
        let capitalizedVariations = capitalizeVariations(variation);
        for (let capitalized of capitalizedVariations) {
            let numberVariations = addNumbers(capitalized);
            for (let numbered of numberVariations) {
                let specialCharVariations = addSpecialChars(numbered, specialChars);
                finalVariations.push(...specialCharVariations);
            }
        }
    }

    return finalVariations;
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(2);
    return `${minutes} minutes et ${seconds} secondes`;
}

async function checkPassword() {
    const password = document.getElementById("password").value;
    const commonPasswords = await loadPasswords();
    const specialChars = ['!', '@', '#', '$', '%', '&', '*'];

    const startTime = performance.now();

    for (let word of commonPasswords) {
        document.getElementById("status").textContent = `Test des variations pour le mot : ${word}`;
        console.log(`Test des variations pour le mot : ${word}`);

        let allVariations = generateAllCombinations(word, specialReplacements, specialChars);
        for (let guess of allVariations) {
            console.log("Test du mot de passe :", guess);
            document.getElementById("currentGuess").textContent = `Test du mot de passe : ${guess}`;
            document.getElementById("testedPasswords").textContent += `${guess}\n`;
            await new Promise(r => setTimeout(r, 10));

            if (guess === password) {
                const endTime = performance.now();
                const timeElapsed = endTime - startTime;
                const formattedTime = formatTime(timeElapsed);
                document.getElementById("status").textContent = "";
                document.getElementById("result").innerHTML = `
                    Mot de passe trouvé : ${guess} <br>
                    Temps écoulé : ${formattedTime} <br>
                    Tentatives : ${allVariations.indexOf(guess) + 1}
                `;
                console.log("Mot de passe trouvé :", guess);
                console.log("Temps écoulé :", formattedTime);
                console.log("Nombre de tentatives :", allVariations.indexOf(guess) + 1);
                return;
            }
        }
    }

    document.getElementById("status").textContent = "";
    document.getElementById("result").textContent = "Votre mot de passe est très solide, le programme n'a pas été capable de le forcer.";
    document.getElementById("currentGuess").textContent = "";
    console.log("Votre mot de passe est très solide, le programme n'a pas été capable de le forcer.");
}
