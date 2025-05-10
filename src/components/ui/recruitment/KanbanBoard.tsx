// src/components/recruitment/KanbanBoard.tsx
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import Card from '../Card';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Button from '../Button';
import Badge from '../Badge';

// Define the recruitment stages according to the document
export type RecruitmentStage = 'received' | 'interview_planned' | 'interview_completed' | 'client_waiting' | 'recruited';

// Map stage IDs to display names
const stageNames: Record<RecruitmentStage, string> = {
  received: 'Candidate Received',
  interview_planned: 'Interview Planned',
  interview_completed: 'Interview Completed',
  client_waiting: 'Client Waiting',
  recruited: 'Recruited'
};

// Define the candidate type for the Kanban board
export interface KanbanCandidate {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  stage: RecruitmentStage;
  company: string;
  date: Date;
  assignedTo?: string;
  tags?: string[];
  avatarUrl?: string;
}

interface KanbanBoardProps {
  candidates: KanbanCandidate[];
  onCandidateClick: (id: string) => void;
  onStageChange: (candidateId: string, newStage: RecruitmentStage) => void;
  loading?: boolean;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  candidates,
  onCandidateClick,
  onStageChange,
  loading = false,
}) => {
  const { colors } = useTheme();
  const [draggedCandidate, setDraggedCandidate] = useState<string | null>(null);
  
  // Group candidates by stage
  const candidatesByStage = candidates.reduce((acc, candidate) => {
    if (!acc[candidate.stage]) {
      acc[candidate.stage] = [];
    }
    acc[candidate.stage].push(candidate);
    return acc;
  }, {} as Record<RecruitmentStage, KanbanCandidate[]>);
  
  // Ensure all stages are represented, even if empty
  const stages: RecruitmentStage[] = ['received', 'interview_planned', 'interview_completed', 'client_waiting', 'recruited'];
  stages.forEach(stage => {
    if (!candidatesByStage[stage]) {
      candidatesByStage[stage] = [];
    }
  });

  // Handle drag and drop events
  const handleDragStart = (candidateId: string) => {
    setDraggedCandidate(candidateId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (stage: RecruitmentStage) => {
    if (draggedCandidate) {
      onStageChange(draggedCandidate, stage);
      setDraggedCandidate(null);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: colors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max space-x-4">
        {stages.map(stage => (
          <div
            key={stage}
            className="w-80 flex-shrink-0"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage)}
          >
            <div 
              className="mb-3 px-3 py-2 rounded-md text-sm font-medium"
              style={{ backgroundColor: colors.primary, color: 'white' }}
            >
              <div className="flex justify-between items-center">
                <span>{stageNames[stage]}</span>
                <span className="rounded-full bg-white bg-opacity-20 px-2 py-1 text-xs">
                  {candidatesByStage[stage]?.length || 0}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              {candidatesByStage[stage]?.map(candidate => (
                <div
                  key={candidate.id}
                  draggable
                  onDragStart={() => handleDragStart(candidate.id)}
                  onClick={() => onCandidateClick(candidate.id)}
                  className="cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-md"
                >
                  <Card noPadding={false}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2"
                          style={{ backgroundColor: colors.primary }}
                        >
                          {candidate.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={candidate.avatarUrl} alt={`${candidate.firstName} ${candidate.lastName}`} className="w-8 h-8 rounded-full" />
                          ) : (
                            `${candidate.firstName[0]}${candidate.lastName[0]}`
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm" style={{ color: colors.text }}>
                            {candidate.firstName} {candidate.lastName}
                          </h4>
                          <p className="text-xs" style={{ color: `${colors.text}99` }}>
                            {candidate.position}
                          </p>
                        </div>
                      </div>
                      <Badge variant="primary">{candidate.company}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs" style={{ color: `${colors.text}99` }}>
                        {candidate.date instanceof Date 
                          ? candidate.date.toLocaleDateString() 
                          : new Date(candidate.date).toLocaleDateString()}
                      </div>
                      
                      {candidate.assignedTo && (
                        <div 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
                        >
                          {candidate.assignedTo}
                        </div>
                      )}
                    </div>
                    
                    {candidate.tags && candidate.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {candidate.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${colors.secondary}20`, color: colors.secondary }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              ))}
              
              {candidatesByStage[stage]?.length === 0 && (
                <div 
                  className="border-2 border-dashed rounded-md p-4 text-center text-sm"
                  style={{ borderColor: `${colors.border}60`, color: `${colors.text}60` }}
                >
                  No candidates in this stage
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;