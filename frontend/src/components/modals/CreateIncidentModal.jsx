import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select, Textarea } from '../ui/FormFields';
import { Button } from '../ui/Button';
import { useCreateIncident } from '../../hooks/useData';
import { useUIStore } from '../../stores/uiStore';
import { INCIDENT_TYPES } from '../../lib/utils';
import { MapPin } from 'lucide-react';

export const CreateIncidentModal = () => {
  const { closeModal, addNotification } = useUIStore();
  const { mutateAsync, isPending } = useCreateIncident();
  const [form, setForm] = useState({
    title: '', description: '', severity: 'medium', incident_type: 'other',
    latitude: '', longitude: '', address: '',
  });
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.latitude || !form.longitude) {
      setError('Title, latitude, and longitude are required');
      return;
    }
    try {
      await mutateAsync({
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      addNotification({ type: 'success', title: 'Incident created', message: form.title });
      closeModal('createIncident');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal title="Report New Incident" onClose={() => closeModal('createIncident')} size="md">
      <div className="space-y-4">
        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>
        )}
        <Input label="Incident Title *" placeholder="Flood in Sector 4, Mumbai" value={form.title} onChange={set('title')} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Severity *" value={form.severity} onChange={set('severity')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
          <Select label="Type" value={form.incident_type} onChange={set('incident_type')}>
            {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </Select>
        </div>
        <Textarea label="Description" placeholder="Describe the situation..." value={form.description} onChange={set('description')} />
        <div>
          <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1">
            <MapPin size={12} /> Location Coordinates *
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Latitude (e.g. 19.0760)" value={form.latitude} onChange={set('latitude')} />
            <Input placeholder="Longitude (e.g. 72.8777)" value={form.longitude} onChange={set('longitude')} />
          </div>
        </div>
        <Input label="Address / Location Description" placeholder="Dharavi, Mumbai, MH" value={form.address} onChange={set('address')} />

        <div className="flex justify-end gap-3 pt-2 border-t border-[#21262d]">
          <Button variant="ghost" onClick={() => closeModal('createIncident')}>Cancel</Button>
          <Button variant="danger" onClick={handleSubmit} loading={isPending}>Create Incident</Button>
        </div>
      </div>
    </Modal>
  );
};
