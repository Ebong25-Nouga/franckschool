import { Check, Info, Minus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

/*
 * TARIFS PROVISOIRES — exemples à remplacer par les offres définitives du propriétaire.
 * Le cahier des charges (document maître V1, § 12) indique que les plans et tarifs ne sont pas encore définis.
 */
type Offre = { id: string; nom: string; pour: string; mensuel: number | null; eleves: string; secretaires: string; recommande?: boolean; inclus: string[] };

const offres: Offre[] = [
  {
    id: 'essentiel',
    nom: 'Essentiel',
    pour: 'Pour une petite école qui démarre',
    mensuel: 25000,
    eleves: 'Jusqu’à 300 élèves',
    secretaires: '2 comptes secrétaires',
    inclus: ['Élèves et inscriptions', 'Notes, séquences et bulletins PDF', 'Caisse : espèces et Mobile Money', 'Espace enseignants'],
  },
  {
    id: 'etablissement',
    nom: 'Établissement',
    pour: 'Pour un collège ou un lycée',
    mensuel: 60000,
    eleves: 'Jusqu’à 1 000 élèves',
    secretaires: '5 comptes secrétaires',
    recommande: true,
    inclus: ['Tout ce qui est dans Essentiel', 'Espace parents', 'Notifications', 'Rapports financiers PDF', 'Journal d’activités'],
  },
  {
    id: 'groupe',
    nom: 'Groupe scolaire',
    pour: 'Pour plusieurs établissements',
    mensuel: null,
    eleves: 'Élèves illimités',
    secretaires: 'Secrétaires illimités',
    inclus: ['Tout ce qui est dans Établissement', 'Plusieurs établissements', 'Reprise de vos données Excel', 'Accompagnement à la rentrée'],
  },
];

const comparaison: [string, (boolean | string)[]][] = [
  ['Élèves', ['300', '1 000', 'Illimité']],
  ['Comptes secrétaires', ['2', '5', 'Illimité']],
  ['Notes, séquences, bulletins PDF', [true, true, true]],
  ['Caisse et reçus PDF', [true, true, true]],
  ['Espace enseignants', [true, true, true]],
  ['Espace parents', [false, true, true]],
  ['Rapports financiers PDF', [false, true, true]],
  ['Journal d’activités', [false, true, true]],
  ['Plusieurs établissements', [false, false, true]],
];

const fcfa = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

export function Tarifs({ onDemo }: { onDemo: () => void }) {
  const [periode, setPeriode] = useState<'mois' | 'annee'>('annee');

  return (
    <section id="tarifs" className="scroll-mt-20 bg-white py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-[36px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[48px]">Des tarifs à la taille de votre école.</h2>
            <p className="mt-5 text-lg leading-relaxed text-encre-doux">Un abonnement par établissement, sans frais d’installation. Payez au mois ou pour l’année scolaire entière.</p>
          </div>
          <ToggleGroup
            type="single"
            value={periode}
            onValueChange={(v) => v && setPeriode(v as 'mois' | 'annee')}
            variant="outline"
            aria-label="Période de facturation"
            className="rounded-xl bg-papier p-1"
          >
            <ToggleGroupItem value="mois" className="h-10 px-4 text-[14px] data-[state=on]:bg-white data-[state=on]:shadow-feuille">Au mois</ToggleGroupItem>
            <ToggleGroupItem value="annee" className="h-10 gap-2 px-4 text-[14px] data-[state=on]:bg-white data-[state=on]:shadow-feuille">
              À l’année scolaire
              <Badge className="bg-valide text-white">2 mois offerts</Badge>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <p className="mt-8 flex items-start gap-2.5 rounded-xl bg-feutre-50 px-4 py-3 text-[14px] text-encre">
          <Info className="mt-0.5 size-4 shrink-0 text-feutre-700" aria-hidden />
          Tarifs provisoires, donnés à titre d’exemple. Les offres définitives vous seront confirmées lors de la démonstration.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {offres.map((o) => {
            const prix = o.mensuel === null ? null : periode === 'mois' ? o.mensuel : o.mensuel * 10;
            return (
              <article
                key={o.id}
                className={cn(
                  'relative flex flex-col rounded-3xl p-7',
                  o.recommande ? 'seyes bg-brand-950 text-white shadow-leve lg:-my-4 lg:py-11' : 'bg-papier',
                )}
              >
                {o.recommande && <Badge className="absolute -top-3 left-7 h-7 bg-feutre px-3 text-[13px] font-semibold text-encre">Le plus choisi</Badge>}
                <h3 className="font-display text-2xl font-bold tracking-[-0.02em]">{o.nom}</h3>
                <p className={cn('mt-1 text-[15px]', o.recommande ? 'text-brand-200' : 'text-encre-doux')}>{o.pour}</p>
                <div className="mt-7 min-h-[88px]">
                  {prix === null ? (
                    <>
                      <p className="font-display text-[40px] font-extrabold leading-none tracking-[-0.04em]">Sur devis</p>
                      <p className={cn('mt-2 text-[14px]', o.recommande ? 'text-brand-200' : 'text-encre-doux')}>Selon le nombre d’établissements</p>
                    </>
                  ) : (
                    <>
                      <p className="flex items-baseline gap-2">
                        <span className="font-display text-[44px] font-extrabold leading-none tracking-[-0.04em] chiffres">{fcfa(prix)}</span>
                        <span className={cn('text-[15px] font-semibold', o.recommande ? 'text-brand-200' : 'text-encre-doux')}>FCFA / {periode === 'mois' ? 'mois' : 'année'}</span>
                      </p>
                      <p className={cn('mt-2 text-[14px]', o.recommande ? 'text-brand-200' : 'text-encre-doux')}>
                        {periode === 'annee' ? `Soit ${fcfa(o.mensuel! * 2)} FCFA économisés sur 12 mois` : `Ou ${fcfa(o.mensuel! * 10)} FCFA pour l’année scolaire`}
                      </p>
                    </>
                  )}
                </div>
                <p className={cn('mt-6 text-[15px] font-semibold', o.recommande ? 'text-white' : 'text-encre')}>{o.eleves} · {o.secretaires}</p>
                <ul className="mt-4 flex flex-1 flex-col gap-3">
                  {o.inclus.map((i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[15px]">
                      <Check className={cn('mt-0.5 size-4 shrink-0', o.recommande ? 'text-feutre' : 'text-brand-700')} aria-hidden />
                      {i}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={onDemo}
                  variant={o.recommande ? 'default' : 'outline'}
                  className={cn('mt-8 h-12 text-[15px] font-semibold', o.recommande && 'bg-feutre text-encre hover:bg-[#FFD93A]')}
                >
                  {o.mensuel === null ? 'Demander un devis' : 'Demander une démonstration'}
                </Button>
              </article>
            );
          })}
        </div>

        {/* Comparaison détaillée */}
        <div className="mt-16 overflow-x-auto rounded-3xl ring-1 ring-papier-ligne">
          <table className="w-full min-w-[640px] text-left text-[15px]">
            <caption className="sr-only">Comparaison des offres</caption>
            <thead>
              <tr className="border-b border-papier-ligne bg-papier">
                <th scope="col" className="px-6 py-4 font-semibold">Comparer les offres</th>
                {offres.map((o) => <th key={o.id} scope="col" className="px-6 py-4 text-center font-display font-bold">{o.nom}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-papier-ligne">
              {comparaison.map(([ligne, valeurs]) => (
                <tr key={ligne}>
                  <th scope="row" className="px-6 py-3.5 font-medium">{ligne}</th>
                  {valeurs.map((v, i) => (
                    <td key={i} className={cn('px-6 py-3.5 text-center', i === 1 && 'bg-brand-50/50')}>
                      {v === true ? <Check className="mx-auto size-5 text-valide" aria-label="Inclus" /> : v === false ? <Minus className="mx-auto size-5 text-encre-pale" aria-label="Non inclus" /> : <span className="font-semibold chiffres">{v}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
