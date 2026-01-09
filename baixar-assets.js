const fs = require('fs');
const https = require('https');
const path = require('path');

// Carrega suas perguntas
const questions = require('./questions.json'); 

const OUTPUT_DIR = path.join(__dirname, 'assets', 'flags');

// Garante que a pasta existe
if (!fs.existsSync(OUTPUT_DIR)){
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

async function start() {
    console.log(`🔍 Encontradas ${questions.length} perguntas.`);
    
    // Cria uma lista única de códigos para não baixar repetido
    const codigosUnicos = [...new Set(questions.map(q => q.countryCode))];
    console.log(`⬇️ Baixando ${codigosUnicos.length} bandeiras únicas...`);

    for (const code of codigosUnicos) {
        // Usando PNG w320 como no seu código original
        const url = `https://flagcdn.com/w320/${code}.png`;
        const dest = path.join(OUTPUT_DIR, `${code}.png`);

        try {
            await downloadImage(url, dest);
            console.log(`✅ Salvo: ${code}.png`);
        } catch (err) {
            console.error(`❌ Erro em ${code}:`, err.message);
        }
    }
}

start();