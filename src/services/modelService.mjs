import { models } from "../config/models.mjs";
import { GENRES, TAALS, TONICS } from "../config/constants.mjs";

export async function predictAudioFeatures(audioTensor) {
  const genrePrediction = models.model_1.predict(audioTensor);
  const taalPrediction = models.model_2.predict(audioTensor);

  const genreResult = await genrePrediction.array();
  const taalResult = await taalPrediction.array();

  genrePrediction.dispose();
  taalPrediction.dispose();

  const genreIndex = genreResult[0].indexOf(Math.max(...genreResult[0]));
  const taalIndex = taalResult[0].indexOf(Math.max(...taalResult[0]));

  const results = {
    genre: GENRES[genreIndex],
    taal: TAALS[taalIndex],
    tonic: null,
  };

  if (results.genre !== "semiclassical" && results.genre !== "bollypop") {
    const tonicPrediction = models.model_3.predict(audioTensor);
    const tonicResult = await tonicPrediction.array();
    tonicPrediction.dispose();

    const tonicIndex = tonicResult[0].indexOf(Math.max(...tonicResult[0]));
    results.tonic = TONICS[tonicIndex];
  }

  audioTensor.dispose();
  return results;
}
