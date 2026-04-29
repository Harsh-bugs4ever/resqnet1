import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select, Textarea } from '../ui/FormFields';
import { Button } from '../ui/Button';
import { useCreateAlert } from '../../hooks/useData';
import { useUIStore } from '../../stores/uiStore';

export const CreateAlertModal = () => {
  const { closeModal, addNotification } = useUIStore();
  const { mutateAsync, isPending } = useCreateAlert();
  const [form, setForm] = useState({ title: '', message: '', alert_type: 'warning', target_role: 'all' });
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.message) { setError('Title and message are required'); return; }
    try {
      await mutateAsync(form);
      addNotification({ type: 'success', title: 'Alert broadcast', message: form.title });
      closeModal('createAlert');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal title="Broadcast Alert" onClose={() => closeModal('createAlert')}>
      <div className="space-y-4">
        {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>}
        <Input label="Alert Title *" placeholder="Evacuation order — Zone A" value={form.title} onChange={set('title')} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Alert Type" value={form.alert_type} onChange={set('alert_type')}>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="evacuation">Evacuation</option>
          </Select>
          <Select label="Target Role" value={form.target_role} onChange={set('target_role')}>
            <option value="all">All Personnel</option>
            <option value="rescue_team">Rescue Teams</option>
            <option value="ngo">NGO Teams</option>
            <option value="government">Government</option>
          </Select>
        </div>
        <Textarea label="Message *" placeholder="Detailed instructions for field teams..." value={form.message} onChange={set('message')} rows={4} />
        <div className="flex justify-end gap-3 pt-2 border-t border-[#21262d]">
          <Button variant="ghost" onClick={() => closeModal('createAlert')}>Cancel</Button>
          <Button variant="warning" onClick={handleSubmit} loading={isPending}>Broadcast Alert</Button>
        </div>
      </div>
    </Modal>
  );
};
