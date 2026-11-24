import { Hammer } from 'lucide-react';
import { Card, EmptyState, PageHeader } from '../components/ui';

export default function EnConstruction({ titre, texte }: { titre: string; texte: string }) {
  return (
    <>
      <PageHeader title={titre} />
      <Card>
        <EmptyState icon={Hammer} title="Écran en préparation" text={texte} />
      </Card>
    </>
  );
}
