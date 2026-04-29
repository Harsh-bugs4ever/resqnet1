import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select, Textarea } from '../ui/FormFields';
import { Button } from '../ui/Button';
import { useCreateResource, useIncidents } from '../../hooks/useData';
import { useUIStore } from '../../stores/uiStore';
import { RESOURCE_TYPES } from '../../lib/utils';

export const CreateResourceModal = () => {
  const { closeModal, addNotification } = useUIStore();
  const { mutateAsync, isPending } = useCreateResource();
  const { data: incidents = [] } = useIncidents();
  const [form, setForm] = useState({ incident_id: '', resource_type: 'food', quantity: '', priority: 'medium', notes: '' });
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.incident_id || !form.quantity) { setError('Incident and quantity are required'); return; }
    try {
      await mutateAsync({ ...form, quantity: parseInt(form.quantity) });
      addNotification({ type: 'success', title: 'Resource request submitted' });
      closeModal('createResource');
    } catch (err) {
      setError(err.message);
    }
  };

  const activeIncidents = incidents.filter((i) => i.status === 'active');

  return (
    <Modal title="Request Resources" onClose={() => closeModal('createResource')}>
      <div className="space-y-4">
        {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>}
        <Select label="Incident *" value={form.incident_id} onChange={set('incident_id')}>
          <option value="">Select incident...</option>
          {activeIncidents.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Resource Type *" value={form.resource_type} onChange={set('resource_type')}>
            {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </Select>
          <Input label="Quantity *" type="number" min="1" placeholder="100" value={form.quantity} onChange={set('quantity')} />
        </div>
        <Select label="Priority" value={form.priority} onChange={set('priority')}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>
        <Textarea label="Notes" placeholder="Additional context..." value={form.notes} onChange={set('notes')} />
        <div className="flex justify-end gap-3 pt-2 border-t border-[#21262d]">
          <Button variant="ghost" onClick={() => closeModal('createResource')}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={isPending}>Submit Request</Button>
        </div>
      </div>
    </Modal>
  );
};
