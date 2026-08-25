import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { DataTable, Column } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { listLands } from '../../services/landService';
import { getErrorMessage } from '../../services/api';
import { Land } from '../../types';
import { LandForm } from './LandForm';

export function MyLandsPage() {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  function load() {
    setLoading(true);
    setError('');
    listLands({ limit: 50 })
      .then((res) => setLands(res.items))
      .catch((err) => {
        setLands([]);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const columns: Column<Land>[] = [
    { header: 'Land Title', accessor: (l) => l.landTitle },
    { header: 'Location', accessor: (l) => `${l.district}, ${l.state}` },
    { header: 'Area', accessor: (l) => `${l.totalArea} ${l.areaUnit}` },
    { header: 'Status', accessor: (l) => <StatusBadge status={l.status} /> },
    { header: 'Submitted', accessor: (l) => new Date(l.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader
        title="My Lands"
        description="Track your land submissions and their review status."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Submit Land
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={lands}
        loading={loading}
        error={error}
        keyExtractor={(l) => l._id}
        emptyLabel="You haven't submitted any land yet"
        showSerial
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Submit Land" size="lg" showBack>
        <LandForm
          onSuccess={() => {
            setModalOpen(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}
