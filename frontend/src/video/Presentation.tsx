import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { SceneBulletin, SceneFin, SceneInscription, SceneNotes, ScenePaiement } from './Scenes';

/*
 * Vidéo de présentation de Franck School : 1920 × 1080, 30 images/s.
 * 4 scènes de 6 s + une fin de 3 s, avec 4 transitions de 0,5 s.
 */
export const LARGEUR = 1920;
export const HAUTEUR = 1080;
export const DUREE = 180 * 4 + 90 - 15 * 4; // 750 images = 25 s

export function Presentation() {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="Inscription" durationInFrames={180}>
        <SceneInscription />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence name="Notes" durationInFrames={180}>
        <SceneNotes />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence name="Bulletin" durationInFrames={180}>
        <SceneBulletin />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence name="Paiement" durationInFrames={180}>
        <ScenePaiement />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence name="Fin" durationInFrames={90}>
        <SceneFin />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
}
