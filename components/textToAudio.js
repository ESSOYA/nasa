

// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import gTTS from 'gtts';
// import ffmpeg from 'fluent-ffmpeg';

// // Définir __dirname pour ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Fonction pour convertir texte en audio OGG (Opus)
// export async function textToAudio(text, lang = 'fr') {
//   return new Promise((resolve, reject) => {
//     try {
//       // Chemins temporaires
//       const timestamp = Date.now();
//       const tmpMp3 = path.join(__dirname, `tts_${timestamp}.mp3`);
//       const tmpOgg = path.join(__dirname, `tts_${timestamp}.ogg`);

//       // Générer le MP3 avec gTTS
//       const speech = new gTTS(text, lang);
//       speech.save(tmpMp3, (err) => {
//         if (err) return reject(err);

//         // Conversion MP3 -> OGG Opus
//         ffmpeg(tmpMp3)
//           .audioCodec('libopus')
//           .format('ogg')
//           .on('end', () => {
//             try {
//               const buffer = fs.readFileSync(tmpOgg);
//               // Nettoyer les fichiers temporaires
//               fs.unlinkSync(tmpMp3);
//               fs.unlinkSync(tmpOgg);
//               resolve(buffer);
//             } catch (err) {
//               reject(err);
//             }
//           })
//           .on('error', (err) => reject(err))
//           .save(tmpOgg);
//       });
//     } catch (err) {
//       reject(err);
//     }
//   });
// }











import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Charger la clé API depuis le fichier .env
dotenv.config();

// Définir __dirname pour ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialisation du client ElevenLabs
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Fonction de conversion texte → audio (MP3)
export async function textToAudio(text, voiceId = "JBFqnCBsd6RMkjVDRZzb") {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error("⚠️ Clé API ElevenLabs manquante dans le fichier .env");
    }

    const timestamp = Date.now();
    const tmpMp3 = path.join(__dirname, `tts_${timestamp}.mp3`);

    console.log("🎤 Génération de la voix avec ElevenLabs...");

    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128", // ✅ format valide
    });

    // Convertir le flux en Buffer
    const buffer = Buffer.from(await audio.arrayBuffer());
    fs.writeFileSync(tmpMp3, buffer);

    console.log(`✅ Audio généré : ${tmpMp3}`);

    const output = fs.readFileSync(tmpMp3);
    fs.unlinkSync(tmpMp3);

    return output;
  } catch (err) {
    console.error("❌ Erreur lors de la génération audio :", err.message);
    throw err;
  }
}
