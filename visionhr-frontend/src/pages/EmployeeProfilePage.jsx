import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, Mail, Phone, Calendar, Briefcase, MapPin, Building2, User, 
  Edit2, Check, X, FileText, Upload, Eye, Trash2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { employeesApi, departmentsApi } from '../features/employees/employeesApi.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';
import Input from '../components/common/Input.jsx';
import Select from '../components/common/Select.jsx';
import { formatDate } from '../utils/date.js';
import Modal from '../components/common/Modal.jsx';

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const isMe = location.pathname === '/profile';
  const { user } = useSelector((state) => state.auth);
  const isHR = ['SuperAdmin', 'HR'].includes(user?.role);

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Other');

  const queryKey = isMe ? ['employees', 'me'] : ['employees', id];

  const profileQuery = useQuery({
    queryKey,
    queryFn: () => isMe ? employeesApi.getMe() : employeesApi.byId(id),
  });

  const deptsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
    enabled: isHR && isEditing,
  });

  useEffect(() => {
    if (profileQuery.data) {
      setForm({
        phone: profileQuery.data.personalDetails?.phone || '',
        address: {
          street: profileQuery.data.personalDetails?.address?.street || '',
          city: profileQuery.data.personalDetails?.address?.city || '',
          state: profileQuery.data.personalDetails?.address?.state || '',
          pincode: profileQuery.data.personalDetails?.address?.pincode || '',
        },
        emergencyContact: {
          name: profileQuery.data.personalDetails?.emergencyContact?.name || '',
          relationship: profileQuery.data.personalDetails?.emergencyContact?.relationship || '',
          phone: profileQuery.data.personalDetails?.emergencyContact?.phone || '',
        },
        department: profileQuery.data.organization?.department?._id || '',
        designation: profileQuery.data.organization?.designation || '',
        employmentType: profileQuery.data.organization?.employmentType || '',
        basicSalary: profileQuery.data.salary?.basicSalary || 0,
        hra: profileQuery.data.salary?.hra || 0,
      });
    }
  }, [profileQuery.data, isEditing]);

  const updateMutation = useMutation({
    mutationFn: (payload) => isMe ? employeesApi.updateMe(payload) : employeesApi.update(id, payload),
    onSuccess: () => {
      toast.success('Profile updated successfully.');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
  });

  const uploadDocMutation = useMutation({
    mutationFn: (formData) => isMe ? employeesApi.uploadDocMe(formData) : employeesApi.uploadDoc(id, formData),
    onSuccess: () => {
      toast.success('Document uploaded.');
      setDocModalOpen(false);
      setDocFile(null);
      setDocName('');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed.'),
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId) => isMe ? employeesApi.deleteDocMe(docId) : employeesApi.deleteDoc(id, docId),
    onSuccess: () => {
      toast.success('Document deleted.');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed.'),
  });

  const handleUpdate = () => {
    const payload = {
      personalDetails: {
        phone: form.phone,
        address: form.address,
        emergencyContact: form.emergencyContact,
      }
    };
    if (isHR) {
      payload.organization = {
        department: form.department,
        designation: form.designation,
        employmentType: form.employmentType,
      };
      payload.salary = {
        basicSalary: Number(form.basicSalary),
        hra: Number(form.hra),
      };
    }
    updateMutation.mutate(payload);
  };

  const handleDocUpload = (e) => {
    e.preventDefault();
    if (!docFile || !docName) return toast.error('Please provide a file and a name.');
    const formData = new FormData();
    formData.append('document', docFile);
    formData.append('documentName', docName);
    formData.append('documentType', docType);
    uploadDocMutation.mutate(formData);
  };

  const viewDocument = async (docId) => {
    try {
      const res = isMe ? await employeesApi.viewDocMe(docId) : await employeesApi.viewDoc(id, docId);
      window.open(res.url, '_blank');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot view document.');
    }
  };

  if (profileQuery.isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Spinner className="scale-125" /></div>;
  }

  const emp = profileQuery.data;
  if (!emp) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-ink-soft">Employee profile not found.</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  const initials = `${emp.personalDetails?.firstName?.[0] || ''}${emp.personalDetails?.lastName?.[0] || ''}`;
  
  // Can edit if HR, OR if it's "Me" and we're looking at the personal tab.
  const canEditCurrentTab = isHR || (isMe && activeTab === 'personal');

  const myDocs = emp.documents?.filter(d => d.s3Key.startsWith('Employee/')) || [];
  const hrDocs = emp.documents?.filter(d => d.s3Key.startsWith('HR/')) || [];

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="animate-slide-up">
        {!isMe && (
          <button
            onClick={() => navigate('/directory')}
            className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink-faint transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Back to directory
          </button>
        )}

        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <div className="h-28 bg-gradient-to-r from-primary-600 to-primary-400"></div>
          <div className="px-6 pb-6 sm:px-8">
            <div className="-mt-12 mb-4 flex items-end justify-between sm:-mt-14">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface bg-primary-50 text-3xl font-bold text-primary-600 sm:h-28 sm:w-28 sm:text-4xl shadow-md">
                {initials}
              </div>
              {canEditCurrentTab && (
                <div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleUpdate} loading={updateMutation.isPending}>Save</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4" /> Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-ink">
                {emp.personalDetails?.firstName} {emp.personalDetails?.lastName}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-ink-faint">
                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {emp.employeeCode}</span>
                <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {emp.organization?.department?.name || 'No Dept'}</span>
                <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {emp.organization?.designation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-line overflow-x-auto pb-1">
          {[
            { id: 'personal', label: 'Personal Details' },
            { id: 'organization', label: 'Organization' },
            { id: 'attendance', label: 'Leave & Attendance' },
            { id: 'documents', label: 'Document Vault' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-ink-soft hover:text-ink hover:bg-canvas rounded-t-lg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="mb-4 text-base font-semibold text-ink border-b border-line pb-2">Contact Information</h2>
              <dl className="space-y-4">
                <Field label="Email Address" value={emp.userId?.email} />
                <Field 
                  label="Phone Number" 
                  value={emp.personalDetails?.phone} 
                  isEditing={isEditing} 
                  editElement={<Input value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} />}
                />
                <Field label="Date of Birth" value={formatDate(emp.personalDetails?.dateOfBirth)} />
              </dl>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-base font-semibold text-ink border-b border-line pb-2">Emergency Contact</h2>
              <dl className="space-y-4">
                <Field label="Name" value={emp.personalDetails?.emergencyContact?.name} isEditing={isEditing} editElement={<Input value={form.emergencyContact?.name} onChange={(e)=>setForm({...form, emergencyContact: {...form.emergencyContact, name: e.target.value}})} />} />
                <Field label="Relationship" value={emp.personalDetails?.emergencyContact?.relationship} isEditing={isEditing} editElement={<Input value={form.emergencyContact?.relationship} onChange={(e)=>setForm({...form, emergencyContact: {...form.emergencyContact, relationship: e.target.value}})} />} />
                <Field label="Phone" value={emp.personalDetails?.emergencyContact?.phone} isEditing={isEditing} editElement={<Input value={form.emergencyContact?.phone} onChange={(e)=>setForm({...form, emergencyContact: {...form.emergencyContact, phone: e.target.value}})} />} />
              </dl>
            </Card>

            <Card className="p-6 md:col-span-2">
              <h2 className="mb-4 text-base font-semibold text-ink border-b border-line pb-2">Residential Address</h2>
              {isEditing ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Street" value={form.address?.street} onChange={(e)=>setForm({...form, address: {...form.address, street: e.target.value}})} />
                  <Input label="City" value={form.address?.city} onChange={(e)=>setForm({...form, address: {...form.address, city: e.target.value}})} />
                  <Input label="State" value={form.address?.state} onChange={(e)=>setForm({...form, address: {...form.address, state: e.target.value}})} />
                  <Input label="Pincode" value={form.address?.pincode} onChange={(e)=>setForm({...form, address: {...form.address, pincode: e.target.value}})} />
                </div>
              ) : (
                <p className="text-sm text-ink">
                  {emp.personalDetails?.address?.street}, {emp.personalDetails?.address?.city}, <br/>
                  {emp.personalDetails?.address?.state}, {emp.personalDetails?.address?.country} - {emp.personalDetails?.address?.pincode}
                </p>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'organization' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="mb-4 text-base font-semibold text-ink border-b border-line pb-2">Role Details</h2>
              <dl className="space-y-4">
                <Field 
                  label="Department" 
                  value={emp.organization?.department?.name} 
                  isEditing={isHR && isEditing}
                  editElement={<Select value={form.department} onChange={(e)=>setForm({...form, department: e.target.value})} options={deptsQuery.data?.map(d=>({label:d.name,value:d._id}))} />}
                />
                <Field 
                  label="Designation" 
                  value={emp.organization?.designation} 
                  isEditing={isHR && isEditing}
                  editElement={<Input value={form.designation} onChange={(e)=>setForm({...form, designation: e.target.value})} />}
                />
                <Field 
                  label="Employment Type" 
                  value={emp.organization?.employmentType} 
                  isEditing={isHR && isEditing}
                  editElement={<Select value={form.employmentType} onChange={(e)=>setForm({...form, employmentType: e.target.value})} options={[{label:'Full-Time',value:'Full-Time'},{label:'Contract',value:'Contract'}]} />}
                />
                <Field label="Joining Date" value={formatDate(emp.organization?.joiningDate)} />
                <Field label="Reporting Manager" value={emp.organization?.reportingManager ? `${emp.organization.reportingManager.personalDetails?.firstName} ${emp.organization.reportingManager.personalDetails?.lastName}` : 'None'} />
              </dl>
            </Card>

            {isHR && (
              <Card className="p-6">
                <h2 className="mb-4 text-base font-semibold text-ink border-b border-line pb-2">Financials (HR Only)</h2>
                <dl className="space-y-4">
                  <Field 
                    label="Basic Salary (INR)" 
                    value={emp.salary?.basicSalary} 
                    isEditing={isEditing}
                    editElement={<Input type="number" value={form.basicSalary} onChange={(e)=>setForm({...form, basicSalary: e.target.value})} />}
                  />
                  <Field 
                    label="HRA (INR)" 
                    value={emp.salary?.hra} 
                    isEditing={isEditing}
                    editElement={<Input type="number" value={form.hra} onChange={(e)=>setForm({...form, hra: e.target.value})} />}
                  />
                </dl>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
              Current Leave Balance
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <BalanceCard title="Casual Leave" value={emp.leaveBalances?.casual} type="primary" />
              <BalanceCard title="Sick Leave" value={emp.leaveBalances?.sick} type="rose" />
              <BalanceCard title="Earned Leave" value={emp.leaveBalances?.earned} type="amber" />
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
                Secure Document Vault
              </h2>
              <Button size="sm" onClick={() => setDocModalOpen(true)}>
                <Upload className="h-4 w-4" /> Upload Document
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* My Uploads */}
              <div>
                <h3 className="text-base font-medium text-ink mb-3">Employee Uploads</h3>
                {myDocs.length === 0 ? (
                  <div className="rounded-lg border border-line border-dashed p-6 text-center text-sm text-ink-faint bg-surface/50">
                    No employee documents uploaded.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myDocs.map((doc) => (
                      <DocCard key={doc._id} doc={doc} canDelete={isMe || isHR} onDelete={() => deleteDocMutation.mutate(doc._id)} onView={() => viewDocument(doc._id)} isPending={deleteDocMutation.isPending && deleteDocMutation.variables === doc._id} />
                    ))}
                  </div>
                )}
              </div>

              {/* HR Uploads */}
              <div>
                <h3 className="text-base font-medium text-ink mb-3">Official Company Documents</h3>
                {hrDocs.length === 0 ? (
                  <div className="rounded-lg border border-line border-dashed p-6 text-center text-sm text-ink-faint bg-surface/50">
                    No official HR documents available.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hrDocs.map((doc) => (
                      <DocCard key={doc._id} doc={doc} canDelete={isHR} onDelete={() => deleteDocMutation.mutate(doc._id)} onView={() => viewDocument(doc._id)} isPending={deleteDocMutation.isPending && deleteDocMutation.variables === doc._id} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={docModalOpen} onClose={() => setDocModalOpen(false)} title="Upload Document to Vault">
        <form onSubmit={handleDocUpload} className="space-y-4">
          <Input label="Document Name" required value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="e.g. Identity Proof" />
          <Select label="Document Type" required value={docType} onChange={(e) => setDocType(e.target.value)} options={[
            {label: 'ID Proof', value: 'ID Proof'},
            {label: 'Medical Certificate', value: 'Medical Certificate'},
            {label: 'Employment Contract', value: 'Employment Contract'},
            {label: 'Other', value: 'Other'},
          ]} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">File (PDF, Image)</label>
            <input type="file" required onChange={(e) => setDocFile(e.target.files[0])} className="w-full text-sm text-ink-soft file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setDocModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={uploadDocMutation.isPending}>Secure Upload</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, value, isEditing = false, editElement = null }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-ink-faint">{label}</dt>
      <dd className="text-sm font-medium text-ink">
        {isEditing && editElement ? editElement : (value || '—')}
      </dd>
    </div>
  );
}

function BalanceCard({ title, value, type }) {
  const styles = {
    primary: 'border-primary-100 bg-primary-50/50 text-primary-700',
    rose: 'border-rose-100 bg-rose-50/50 text-rose-700',
    amber: 'border-amber-100 bg-amber-50/50 text-amber-700',
  };
  return (
    <div className={`rounded-xl border p-5 ${styles[type]}`}>
      <p className="text-3xl font-bold">{value ?? '—'}</p>
      <p className="mt-1 text-sm font-medium opacity-80">{title}</p>
    </div>
  );
}

function DocCard({ doc, canDelete, onDelete, onView, isPending }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-line bg-surface p-3 transition-colors hover:border-primary-200">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-canvas text-ink-soft">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{doc.documentName}</p>
          <p className="truncate text-xs text-ink-faint">{doc.documentType} · {formatDate(doc.uploadedAt)}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button size="sm" variant="ghost" onClick={onView}>
          <Eye className="h-4 w-4" />
        </Button>
        {canDelete && (
          <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" loading={isPending} onClick={() => { if(window.confirm('Delete this document forever?')) onDelete(); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
