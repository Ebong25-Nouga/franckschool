import { BookOpen, Plus, Star, Users } from 'lucide-react';
import { useState } from 'react';
import { Avatar, Badge, Button, Card, CardHeader, PageHeader, Table, Td } from '../../components/ui';
import { classes, matieresClasse, professeurs } from '../../data/demo';

export function Classes() {
  const [active, setActive] = useState(classes[4]);
  const total = matieresClasse.reduce((s, m) => s + m.coef, 0);
  return (
    <>
      <PageHeader title="Classes et matières" subtitle="Année 2026-2027 · les matières et coefficients sont définis pour chaque classe" actions={<Button icon={Plus}>Nouvelle classe</Button>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Classes" subtitle={`${classes.length} classes ouvertes`} />
          <ul className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-1">
            {classes.map((c, i) => (
              <li key={c}>
                <button onClick={() => setActive(c)} aria-pressed={active === c} className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors ${active === c ? 'bg-brand-800 text-white' : 'hover:bg-slate-50'}`}>
                  <span className="font-semibold">{c}</span>
                  <span className={`flex items-center gap-1 text-xs ${active === c ? 'text-brand-100' : 'text-slate-500'}`}><Users className="size-3.5" aria-hidden />{38 + ((i * 5) % 17)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader
            title={`Matières de la ${active}`}
            subtitle={`Professeur principal : ${professeurs.find((p) => p.principal === active)?.nom ?? 'non désigné'} · total des coefficients : ${total}`}
            action={<Button size="sm" variant="secondary" icon={Plus}>Ajouter une matière</Button>}
          />
          <Table caption={`Matières de la ${active}`} head={['Matière', 'Code', 'Groupe', 'Coefficient', 'Professeur']}>
            {matieresClasse.map((m, i) => (
              <tr key={m.code} className="hover:bg-slate-50/80">
                <Td><span className="flex items-center gap-2 font-semibold text-slate-900"><BookOpen className="size-4 text-brand-700" aria-hidden />{m.nom}</span></Td>
                <Td className="font-mono text-xs">{m.code}</Td>
                <Td>{m.groupe}<sup>{m.groupe === 1 ? 'er' : 'e'}</sup> groupe</Td>
                <Td className="font-semibold tabular-nums">{m.coef}</Td>
                <Td className="text-slate-600">{professeurs[i % professeurs.length].nom}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </>
  );
}

export function Professeurs() {
  return (
    <>
      <PageHeader title="Professeurs" subtitle="Comptes enseignants, matières et classes affectées" actions={<Button icon={Plus}>Ajouter un professeur</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {professeurs.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start gap-3">
              <Avatar name={p.nom} className="size-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{p.nom}</p>
                <p className="text-sm text-slate-500">{p.specialite}</p>
              </div>
              <Badge tone={p.contrat === 'Permanent' ? 'brand' : 'slate'}>{p.contrat}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.classes.map((c) => (
                <span key={c} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{c}</span>
              ))}
            </div>
            {p.principal && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <Star className="size-3.5" aria-hidden /> Professeur principal de la {p.principal}
              </p>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
