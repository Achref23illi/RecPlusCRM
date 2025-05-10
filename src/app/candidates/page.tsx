// src/app/candidates/page.tsx (updated)
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
import KanbanBoard, { KanbanCandidate, RecruitmentStage } from '@/components/ui/recruitment/KanbanBoard';
import CandidateDetailModal from '@/components/candidates/CandidateDetailModal';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { Candidate } from '@/types';

type ViewMode = 'list' | 'kanban';
type FilterParams = {
  status: string;
  position: string;
  rating: string;
};

const CandidatesPage = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterParams>({
    status: 'all',
    position: 'all',
    rating: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch candidates based on user's office access
  const { data: candidates, loading, error, refetch } = useApiQuery<Candidate[]>(
    () => api.candidates.getAll(user?.role === 'super_admin' ? undefined : user?.officeId),
    [user?.officeId]
  );

  // Get unique positions for filter dropdown
  const uniquePositions = candidates
    ? Array.from(new Set(candidates.map(c => c.position)))
    : [];

  // Convert API candidates to Kanban candidates
  const getKanbanCandidates = (): KanbanCandidate[] => {
    if (!candidates) return [];

    const statusToStageMap: Record<string, RecruitmentStage> = {
      'new': 'received',
      'interview': 'interview_planned',
      'offer': 'interview_completed',
      'waiting': 'client_waiting',
      'hired': 'recruited',
      'rejected': 'recruited', // We'll filter these out in reality
    };

    return candidates
      .filter(candidate => {
        // Apply filtering
        if (filters.status !== 'all' && candidate.status !== filters.status) return false;
        if (filters.position !== 'all' && candidate.position !== filters.position) return false;
        if (filters.rating !== 'all') {
          const ratingNum = parseInt(filters.rating, 10);
          if (candidate.rating !== ratingNum) return false;
        }
        
        // Apply search
        if (searchTerm && !`${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        return candidate.status !== 'rejected'; // Filter out rejected candidates
      })
      .map(candidate => ({
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        position: candidate.position,
        stage: statusToStageMap[candidate.status] || 'received',
        company: 'Company Name', // This would come from a job relation in a real API
        date: candidate.updatedAt,
        assignedTo: candidate.assignedTo,
        tags: candidate.tags,
      }));
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle candidate click in Kanban board or table
  const handleCandidateClick = (id: string) => {
    const candidate = candidates?.find(c => c.id === id) || null;
    setSelectedCandidate(candidate);
    setShowDetailModal(true);
  };

  // Handle stage change in Kanban board
  const handleStageChange = async (candidateId: string, newStage: RecruitmentStage) => {
    try {
      // Define a local type that matches what the API actually accepts
      type CandidateStatus = 'new' | 'interview' | 'offer' | 'waiting' | 'hired' | 'rejected';
      
      const stageToStatusMap: Record<RecruitmentStage, CandidateStatus> = {
        'received': 'new',
        'interview_planned': 'interview',
        'interview_completed': 'offer',
        'client_waiting': 'waiting',
        'recruited': 'hired',
      };

      await api.candidates.update(candidateId, {
        status: stageToStatusMap[newStage] as Candidate['status'],
      });
      
      refetch();
    } catch (error) {
      console.error('Failed to update candidate stage:', error);
    }
  };

  // Handle save candidate from modal
  const handleSaveCandidate = async (candidate: Candidate) => {
    try {
      if (candidate.id.startsWith('temp-')) {
        // Create new candidate
        await api.candidates.create(candidate);
      } else {
        // Update existing candidate
        await api.candidates.update(candidate.id, candidate);
      }
      
      refetch();
    } catch (error) {
      console.error('Failed to save candidate:', error);
    }
  };

  // Define table columns for list view
  const tableColumns = [
    {
      key: 'name',
      title: 'Name',
      render: (_: unknown, record: Candidate) => (
        <div className="flex items-center">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2"
            style={{ backgroundColor: colors.primary }}
          >
            {record.firstName[0]}{record.lastName[0]}
          </div>
          <div>
            <div className="font-medium" style={{ color: colors.text }}>
              {record.firstName} {record.lastName}
            </div>
            <div className="text-xs" style={{ color: `${colors.text}99` }}>
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'position',
      title: 'Position',
      render: (value: unknown, record: Candidate) => <span>{record.position}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: unknown, record: Candidate) => {
        const statusVariant: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
          new: 'primary',
          interview: 'info',
          offer: 'warning',
          hired: 'success',
          rejected: 'danger',
          waiting: 'info',
        };
        
        const statusLabel: Record<string, string> = {
          new: 'New',
          interview: 'Interview',
          offer: 'Offer',
          hired: 'Hired',
          rejected: 'Rejected',
          waiting: 'Waiting',
        };
        
        return (
          <Badge variant={statusVariant[record.status] || 'default'}>
            {statusLabel[record.status] || record.status}
          </Badge>
        );
      },
    },
    {
      key: 'rating',
      title: 'Rating',
      render: (value: unknown, record: Candidate) => (
        <div className="flex">
          {[1, 2, 3, 4, 5].map(star => (
            <svg 
              key={star}
              className="w-4 h-4" 
              fill={star <= (record.rating || 0) ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: star <= (record.rating || 0) ? '#F59E0B' : '#D1D5DB' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ))}
        </div>
      ),
    },
    {
      key: 'tags',
      title: 'Skills',
      render: (value: unknown, record: Candidate) => (
        <div className="flex flex-wrap gap-1">
          {record.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${colors.secondary}20`, color: colors.secondary }}
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Date Added',
      render: (value: unknown, record: Candidate) => <span>{new Date(record.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: unknown, record: Candidate) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCandidateClick(record.id);
            }}
          >
            View
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Delete candidate (would show a confirmation dialog in reality)
              if (window.confirm('Are you sure you want to delete this candidate?')) {
                api.candidates.delete(record.id).then(() => refetch());
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
          <p>Error loading candidates: {error.message}</p>
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
          Candidates
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
          Add Candidate
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search candidates..."
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
            <Button 
              variant={showFilters ? 'primary' : 'outline'}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              }
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Filters'}
            </Button>
            
            <div className="border rounded-md flex" style={{ borderColor: colors.border }}>
              <button
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                onClick={() => setViewMode('list')}
                style={{ color: colors.text }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                className={`px-3 py-2 text-sm ${viewMode === 'kanban' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                onClick={() => setViewMode('kanban')}
                style={{ color: colors.text }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
            <Select
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'new', label: 'New' },
                { value: 'interview', label: 'Interview' },
                { value: 'offer', label: 'Offer' },
                { value: 'hired', label: 'Hired' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
            
            <Select
              label="Position"
              name="position"
              value={filters.position}
              onChange={handleFilterChange}
              options={[
                { value: 'all', label: 'All Positions' },
                ...uniquePositions.map(pos => ({ value: pos, label: pos })),
              ]}
            />
            
            <Select
              label="Rating"
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
              options={[
                { value: 'all', label: 'All Ratings' },
                { value: '5', label: '5 Stars' },
                { value: '4', label: '4 Stars' },
                { value: '3', label: '3 Stars' },
                { value: '2', label: '2 Stars' },
                { value: '1', label: '1 Star' },
              ]}
            />
          </div>
        )}
      </Card>

      {viewMode === 'list' ? (
        <Card noPadding>
          <Table
            columns={tableColumns}
            data={candidates?.filter(candidate => {
              // Apply filtering
              if (filters.status !== 'all' && candidate.status !== filters.status) return false;
              if (filters.position !== 'all' && candidate.position !== filters.position) return false;
              if (filters.rating !== 'all') {
                const ratingNum = parseInt(filters.rating, 10);
                if (candidate.rating !== ratingNum) return false;
              }
              
              // Apply search
              if (searchTerm && !`${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  !candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  !candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
              }
              
              return true;
            }) || []}
            loading={loading}
            rowKey={(record) => record.id}
            onRowClick={(record) => handleCandidateClick(record.id)}
            emptyText="No candidates found"
          />
        </Card>
      ) : (
        <KanbanBoard
          candidates={getKanbanCandidates()}
          onCandidateClick={handleCandidateClick}
          onStageChange={handleStageChange}
          loading={loading}
        />
      )}

      {/* Candidate Detail Modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onSave={handleSaveCandidate}
      />

      {/* Create Candidate Modal */}
      <CandidateDetailModal
        candidate={null}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveCandidate}
        isCreate={true}
      />
    </div>
  );
};

export default CandidatesPage;