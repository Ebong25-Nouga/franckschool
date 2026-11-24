import { Player, type PlayerRef } from '@remotion/player';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DUREE, HAUTEUR, LARGEUR, Presentation } from '@/video/Presentation';

const etapes = [
  { label: 'Inscrire', debut: 0 },
  { label: 'Noter', debut: 165 },
  { label: 'Bulletin', debut: 330 },
  { label: 'Encaisser', debut: 495 },
];

/*
 * Vidéo Remotion jouée directement dans la page (pas de fichier vidéo à télécharger).
 * Règles appliquées (ui-ux-pro-max, « Auto-Play Video ») :
 * - bouton pause toujours visible ;
 * - lecture arrêtée quand la vidéo sort de l'écran ;
 * - pas de lecture automatique si l'utilisateur a demandé moins d'animations.
 */
export function VideoPresentation() {
  const ref = useRef<PlayerRef>(null);
  const boite = useRef<HTMLDivElement>(null);
  const [lecture, setLecture] = useState(false);
  const [image, setImage] = useState(120);
  const reduit = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    let annule = false;
    let nettoyer = () => {};
    // Le lecteur est monté de façon asynchrone : on attend qu'il soit prêt.
    const attendre = () => {
      if (annule) return;
      const p = ref.current;
      if (!p || !boite.current) {
        requestAnimationFrame(attendre);
        return;
      }
      const onPlay = () => setLecture(true);
      const onPause = () => setLecture(false);
      const onFrame = (e: { detail: { frame: number } }) => setImage(e.detail.frame);
      p.addEventListener('play', onPlay);
      p.addEventListener('pause', onPause);
      p.addEventListener('frameupdate', onFrame);

      let obs: IntersectionObserver | undefined;
      if (!reduit) {
        obs = new IntersectionObserver(([e]) => (e.isIntersecting ? p.play() : p.pause()), { threshold: 0.15 });
        obs.observe(boite.current);
      }
      nettoyer = () => {
        p.removeEventListener('play', onPlay);
        p.removeEventListener('pause', onPause);
        p.removeEventListener('frameupdate', onFrame);
        obs?.disconnect();
      };
    };
    attendre();
    return () => {
      annule = true;
      nettoyer();
    };
  }, [reduit]);

  const actuelle = etapes.reduce((a, e, i) => (image >= e.debut ? i : a), 0);

  return (
    <div ref={boite} className="relative">
      <div className="overflow-hidden rounded-[20px] shadow-[0_60px_120px_-40px_rgb(0_0_0/0.7),0_0_0_1px_rgb(255_255_255/0.1)]">
        <Player
          ref={ref}
          component={Presentation}
          durationInFrames={DUREE}
          compositionWidth={LARGEUR}
          compositionHeight={HAUTEUR}
          fps={30}
          loop
          initiallyMuted
          numberOfSharedAudioTags={0}
          initialFrame={reduit ? 400 : 120}
          controls={false}
          clickToPlay
          style={{ width: '100%', aspectRatio: '16 / 9', display: 'block' }}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => (lecture ? ref.current?.pause() : ref.current?.play())}
          aria-label={lecture ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}
          className="rounded-full border-white/25 bg-white/[0.06] text-white hover:bg-white/15 hover:text-white"
        >
          {lecture ? <Pause /> : <Play />}
        </Button>
        <ol className="flex flex-wrap justify-center gap-1.5" aria-label="Étapes de la vidéo">
          {etapes.map((e, i) => (
            <li key={e.label}>
              <button
                onClick={() => {
                  ref.current?.seekTo(e.debut + 20);
                  ref.current?.play();
                }}
                aria-current={i === actuelle ? 'step' : undefined}
                className={`h-9 cursor-pointer rounded-full px-4 text-[13px] font-semibold transition-colors ${i === actuelle ? 'bg-white text-brand-900' : 'bg-white/[0.06] text-brand-100 ring-1 ring-inset ring-white/15 hover:bg-white/15'}`}
              >
                {i + 1}. {e.label}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
