// src/app/companies/page.tsx (updated)
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { useAuth } from '@/app/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import CompanyDetailModal from '@/components/companies/CompanyDetailModal';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { Company, Job } from '@/types';

const CompaniesPage = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch companies based on user's office access
  const { data: companies, loading, error, refetch } = useApiQuery<Company[]>(
    () => api.companies.getAll(user?.role === 'super_admin' ? undefined : user?.officeId),
    [user?.officeId]
  );

  // Fetch jobs to show in company detail modal
  const { data: jobs } = useApiQuery<Job[]>(
    () => api.jobs.getAll(user?.role === 'super_admin' ? undefined : user?.officeId),
    [user?.officeId]
  );

  // Get unique industries for filter dropdown
  const uniqueIndustries = companies
    ? Array.from(new Set(companies.map(c => c.industry)))
    : [];

  // Filter companies based on search term and industry filter
  const filteredCompanies = companies
    ? companies.filter(
        company => {
          // Apply industry filter
          if (industryFilter !== 'all' && company.industry !== industryFilter) return false;
          
          // Apply search
          if (searchTerm && !company.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !company.industry.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
          }
          
          return true;
        }
      )
    : [];

  // Handle company click
  const handleCompanyClick = (id: string) => {
    const company = companies?.find(c => c.id === id) || null;
    setSelectedCompany(company);
    setShowDetailModal(true);
  };

  // Handle save company from modal
  const handleSaveCompany = async (company: Company) => {
    try {
      if (company.id.startsWith('temp-')) {
        // Create new company
        await api.companies.create(company);
      } else {
        // Update existing company
        await api.companies.update(company.id, company);
      }
      
      refetch();
    } catch (error) {
      console.error('Failed to save company:', error);
    }
  };

  // Define table columns
  const tableColumns = [
    {
      key: 'name',
      title: 'Company Name',
      render: (value: unknown) => (
        <div className="font-medium" style={{ color: colors.text }}>
          {value as string}
        </div>
      ),
    },
    {
      key: 'industry',
      title: 'Industry',
      render: (value: unknown) => (
        <Badge variant="primary">{value as string}</Badge>
      ),
    },
    {
      key: 'contactPerson',
      title: 'Contact Person',
      render: (value: unknown, record: Company) => (
        <div>
          <div style={{ color: colors.text }}>{value as string}</div>
          <div className="text-xs" style={{ color: `${colors.text}99` }}>
            {record.contactEmail}
          </div>
        </div>
      ),
    },
    {
      key: 'openPositions',
      title: 'Open Positions',
      render: (value: unknown) => (
        <Badge variant={(value as number) > 0 ? 'success' : 'default'}>
          {value as number}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Added On',
      render: (value: unknown) => <span>{(value as Date).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: unknown, record: Company) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCompanyClick(record.id);
            }}
          >
            View
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Add job for this company (would redirect to job creation in reality)
              console.log('Add job for company:', record.id);
            }}
          >
            Add Job
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Delete company (would show a confirmation dialog in reality)
              if (window.confirm('Are you sure you want to delete this company?')) {
                api.companies.delete(record.id).then(() => refetch());
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Handle error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <div
          className="p-4 rounded-md mb-4"
          style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
        >
          <p>Error loading companies: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          Companies
        </h1>
        <Button 
          variant="primary"
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
          onClick={() => setShowCreateModal(true)}
        >
          Add Company
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              options={[
                { value: 'all', label: 'All Industries' },
                ...uniqueIndustries.map(industry => ({ value: industry, label: industry })),
              ]}
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
              style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm" style={{ color: `${colors.text}99` }}>Total Companies</p>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>
                {loading ? '...' : companies?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
              style={{ backgroundColor: `${colors.secondary}20`, color: colors.secondary }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm" style={{ color: `${colors.text}99` }}>Open Positions</p>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>
                {loading
                  ? '...'
                  : companies?.reduce((sum, company) => sum + company.openPositions, 0) || 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
              style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm" style={{ color: `${colors.text}99` }}>Active Clients</p>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>
                {loading
                  ? '...'
                  : companies?.filter(company => company.openPositions > 0).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card noPadding>
        <Table
          columns={tableColumns}
          data={filteredCompanies}
          loading={loading}
          rowKey={(record) => record.id}
          onRowClick={(record) => handleCompanyClick(record.id)}
          emptyText="No companies found"
        />
      </Card>

      {/* Company Detail Modal */}
      <CompanyDetailModal
        company={selectedCompany}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onSave={handleSaveCompany}
        jobs={jobs || []}
      />

      {/* Create Company Modal */}
      <CompanyDetailModal
        company={null}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveCompany}
        isCreate={true}
      />
    </div>
  );
};

export default CompaniesPage;