// src/components/companies/CompanyDetailModal.tsx
import React, { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { useAuth } from '@/app/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import TextArea from '@/components/ui/TextArea';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import { useFormValidation, required } from '@/hooks/useFormValidation';
import { Company, Job } from '@/types';

function email() {
  return (value: unknown): string | undefined => {
    if (!value) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof value === 'string' && emailRegex.test(value) ? undefined : 'Invalid email address';
  };
}

function phoneNumber() {
  return (value: unknown): string | undefined => {
    if (!value) return undefined;
    // Simple phone validation - adjust according to your needs
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return typeof value === 'string' && phoneRegex.test(value) ? undefined : 'Invalid phone number';
  };
}

interface CompanyDetailModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: Company) => void;
  isCreate?: boolean;
  jobs?: Job[];
}

const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  company,
  isOpen,
  onClose,
  onSave,
  isCreate = false,
  jobs = [],
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  
  // Initialize form with company data or empty values for new company
  const initialValues = company ? {
    name: company.name,
    industry: company.industry,
    website: company.website || '',
    contactPerson: company.contactPerson,
    contactEmail: company.contactEmail,
    contactPhone: company.contactPhone || '',
    address: company.address || '',
    notes: company.notes || '',
    officeId: company.officeId,
  } : {
    name: '',
    industry: '',
    website: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    notes: '',
    officeId: user?.officeId || '1',
  };
  
  // Validation rules
  const validationRules = {
    name: [required('Company name')],
    industry: [required('Industry')],
    contactPerson: [required('Contact person')],
    contactEmail: [required('Contact email'), email()],
    contactPhone: [phoneNumber()],
  };
  
  const { 
    values, 
    errors, 
    handleChange, 
    validate,
  } = useFormValidation(initialValues, validationRules);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Convert form values back to company object
    const updatedCompany: Company = {
      id: company?.id || `temp-${Date.now()}`,
      name: values.name,
      industry: values.industry,
      website: values.website || undefined,
      contactPerson: values.contactPerson,
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone || undefined,
      address: values.address || undefined,
      notes: values.notes || undefined,
      officeId: values.officeId,
      createdAt: company?.createdAt || new Date(),
      updatedAt: new Date(),
      openPositions: company?.openPositions || 0,
    };
    
    onSave(updatedCompany);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
        style={{ backgroundColor: colors.card }}
      >
        <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: colors.border }}>
          <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
            {isCreate ? 'Add New Company' : company?.name}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex border-b" style={{ borderColor: colors.border }}>
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'details' ? 'border-b-2' : ''}`}
            style={{ 
              borderColor: activeTab === 'details' ? colors.primary : 'transparent',
              color: activeTab === 'details' ? colors.primary : colors.text
            }}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          
          {!isCreate && (
            <button
              className={`px-6 py-3 font-medium text-sm ${activeTab === 'jobs' ? 'border-b-2' : ''}`}
              style={{ 
                borderColor: activeTab === 'jobs' ? colors.primary : 'transparent',
                color: activeTab === 'jobs' ? colors.primary : colors.text
              }}
              onClick={() => setActiveTab('jobs')}
            >
              Jobs
            </button>
          )}
          
          {!isCreate && (
            <button
              className={`px-6 py-3 font-medium text-sm ${activeTab === 'activity' ? 'border-b-2' : ''}`}
              style={{ 
                borderColor: activeTab === 'activity' ? colors.primary : 'transparent',
                color: activeTab === 'activity' ? colors.primary : colors.text
              }}
              onClick={() => setActiveTab('activity')}
            >
              Activity
            </button>
          )}
        </div>
        
        <div className="overflow-y-auto p-6 flex-grow">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  error={errors.name}
                  fullWidth
                />
                
                <Input
                  label="Industry"
                  name="industry"
                  value={values.industry}
                  onChange={handleChange}
                  error={errors.industry}
                  fullWidth
                />
                
                <Input
                  label="Website"
                  name="website"
                  value={values.website}
                  onChange={handleChange}
                  fullWidth
                />
                
                <Input
                  label="Contact Person"
                  name="contactPerson"
                  value={values.contactPerson}
                  onChange={handleChange}
                  error={errors.contactPerson}
                  fullWidth
                />
                
                <Input
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  value={values.contactEmail}
                  onChange={handleChange}
                  error={errors.contactEmail}
                  fullWidth
                />
                
                <Input
                  label="Contact Phone"
                  name="contactPhone"
                  value={values.contactPhone}
                  onChange={handleChange}
                  error={errors.contactPhone}
                  fullWidth
                />
                
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    fullWidth
                  />
                </div>
                
                {user?.role === 'super_admin' && (
                  <Select
                    label="Office"
                    name="officeId"
                    value={values.officeId}
                    onChange={handleChange}
                    options={[
                      { value: '1', label: 'Office 1' },
                      { value: '2', label: 'Office 2' },
                      { value: '3', label: 'Office 3' },
                    ]}
                    fullWidth
                  />
                )}
                
                <div className="md:col-span-2">
                  <TextArea
                    label="Notes"
                    name="notes"
                    value={values.notes}
                    onChange={handleChange}
                    rows={4}
                    fullWidth
                  />
                </div>
              </div>
            </form>
          )}
          
          {/* Jobs Tab */}
          {activeTab === 'jobs' && !isCreate && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium" style={{ color: colors.text }}>Open Positions</h3>
                <Button 
                  variant="primary" 
                  size="sm"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Add Job
                </Button>
              </div>
              
              <Table
                columns={[
                  {
                    key: 'title',
                    title: 'Position',
                    render: (value: unknown) => (
                      <div className="font-medium" style={{ color: colors.text }}>
                        {value as string}
                      </div>
                    ),
                  },
                  {
                    key: 'location',
                    title: 'Location',
                  },
                  {
                    key: 'status',
                    title: 'Status',
                    render: (value: unknown) => {
                      const statusValue = value as string;
                      const statusVariant: Record<string, 'primary' | 'success' | 'danger'> = {
                        open: 'primary',
                        filled: 'success',
                        closed: 'danger',
                      };
                      
                      return (
                        <Badge variant={statusVariant[statusValue] || 'default'}>
                          {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
                        </Badge>
                      );
                    },
                  },
                  {
                    key: 'createdAt',
                    title: 'Date',
                    render: (value: unknown) => {
                      if (value instanceof Date) {
                        return <span>{value.toLocaleDateString()}</span>;
                      }
                      return <span>{String(value)}</span>;
                    },
                  },
                  {
                    key: 'actions',
                    title: 'Actions',
                    render: (_, record: Job) => (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => console.log(record)}>View</Button>
                        <Button variant="danger" size="sm">Delete</Button>
                      </div>
                    ),
                  },
                ]}
                data={jobs.filter(job => job.companyId === company?.id)}
                rowKey={(record) => record.id}
                emptyText="No open positions"
              />
            </div>
          )}
          
          {/* Activity Tab */}
          {activeTab === 'activity' && !isCreate && (
            <div className="space-y-4">
              <h3 className="font-medium" style={{ color: colors.text }}>Recent Activity</h3>
              
              <div className="relative pl-8 border-l-2" style={{ borderColor: `${colors.primary}60` }}>
                {[
                  { 
                    action: 'New job added', 
                    details: 'Frontend Developer position was added', 
                    user: 'John Doe', 
                    date: '2 days ago' 
                  },
                  { 
                    action: 'Contact updated', 
                    details: 'Contact information was updated', 
                    user: 'Sarah Smith', 
                    date: '1 week ago' 
                  },
                  { 
                    action: 'Company created', 
                    details: 'Company was added to the system', 
                    user: 'John Doe', 
                    date: '1 month ago' 
                  },
                ].map((activity, index) => (
                  <div key={index} className="mb-6 relative">
                    <div 
                      className="w-4 h-4 rounded-full absolute -left-10 top-0.5"
                      style={{ backgroundColor: colors.primary }}
                    ></div>
                    <div className="font-medium text-sm" style={{ color: colors.text }}>
                      {activity.action}
                    </div>
                    <div className="text-sm" style={{ color: `${colors.text}99` }}>
                      {activity.details}
                    </div>
                    <div className="text-xs mt-1" style={{ color: `${colors.text}60` }}>
                      {activity.user} · {activity.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 p-6 border-t" style={{ borderColor: colors.border }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {activeTab === 'details' && (
            <Button variant="primary" onClick={handleSubmit}>
              {isCreate ? 'Create Company' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailModal;