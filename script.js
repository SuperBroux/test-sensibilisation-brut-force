    <script>
        const specialReplacements = {
            'a': ['@', '4'],
            'l': ['1', '!'],
            'o': ['0'],
            'i': ['1'],
            'I': ['l'],
            's': ['$']
        };

        function meetsCriteria(password) {
            const minLength = 8;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasDigit = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            return password.length >= minLength && hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
        }

        async function loadPasswords() {
            const response = await fetch('passwords.txt');
            const text = await response.text();
            return text.split('\n').map(p => p.trim()).filter(p => p && meetsCriteria(p));
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
            if (!meetsCriteria(password)) {
                document.getElementById("result").textContent = "Votre mot de passe ne remplit pas les critères minimum de sécurité.";
                return;
            }

            const commonPasswords = await loadPasswords();
            console.log("Mots de passe communs chargés :", commonPasswords);
            let allGuesses = [...commonPasswords];
            
            document.getElementById("status").textContent = "Génération des variations avec des caractères spéciaux...";
            console.log("Génération des variations avec des caractères spéciaux...");
            allGuesses = allGuesses.concat(...commonPasswords.flatMap(word => generateVariations(word, specialReplacements)));
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

            let testedPasswordsCount = 0;
            document.getElementById("status").textContent = "Début du test de brute force...";
            console.log("Début du test de brute force...");
            const startTime = performance.now();

            for (let guess of allGuesses) {
                if (guess === password) {
                    const endTime = performance.now();
                    const timeElapsed = endTime - startTime;
                    document.getElementById("status").textContent = "";
                    document.getElementById("result").innerHTML = `
                        Mot de passe trouvé : ${guess} <br>
                        Temps écoulé : ${Math.floor(timeElapsed / 60000)} min ${Math.floor((timeElapsed % 60000) / 1000)} sec <br>
                        Tentatives : ${testedPasswordsCount}
                    `;
                    console.log("Mot de passe trouvé :", guess);
                    console.log("Temps écoulé :", timeElapsed, "ms");
                    console.log("Nombre de tentatives :", testedPasswordsCount);
                    return;
                }
                testedPasswordsCount++;
                document.getElementById("testedPasswordsCount").textContent = `Nombre de combinaisons testées : ${testedPasswordsCount}`;

                const elapsedTime = performance.now() - startTime;
                document.getElementById("elapsedTime").textContent = `Temps écoulé : ${Math.floor(elapsedTime / 60000)} min ${Math.floor((elapsedTime % 60000) / 1000)} sec`;

                const estimatedTotalTime = (elapsedTime / testedPasswordsCount) * allGuesses.length;
                const estimatedRemainingTime = estimatedTotalTime - elapsedTime;
                document.getElementById("estimatedTime").textContent = `Temps estimé restant : ${Math.floor(estimatedRemainingTime / 60000)} min ${Math.floor((estimatedRemainingTime % 60000) / 1000)} sec`;
            }

            document.getElementById("status").textContent = "";
            document.getElementById("result").textContent = "Mot de passe non trouvé. Votre mot de passe est très solide, le programme n'a pas été capable de le forcer.";
            document.getElementById("currentGuess").textContent = "";
            console.log("Mot de passe non trouvé.");
        }
    </script>
</body>
</html>

