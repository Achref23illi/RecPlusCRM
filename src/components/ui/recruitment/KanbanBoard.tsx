// src/components/recruitment/KanbanBoard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/context/ThemeContext';

// Define the recruitment stages according to the document
export type RecruitmentStage = 'received' | 'interview_planned' | 'interview_completed' | 'client_waiting' | 'recruited';

// Define the candidate type for the Kanban board
export interface KanbanCandidate {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  stage: RecruitmentStage;
  company?: string;
  date?: string | Date;
  assignedTo?: string;
  tags?: string[];
}

interface KanbanBoardProps {
  candidates: KanbanCandidate[];
  onCandidateClick: (id: string) => void;
  onStageChange: (candidateId: string, newStage: RecruitmentStage) => void;
  loading: boolean;
  renderCard?: (candidate: KanbanCandidate, index: number, stage: RecruitmentStage) => React.ReactNode;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  candidates,
  onCandidateClick,
  onStageChange,
  loading,
  renderCard
}) => {
  const { colors, theme } = useTheme();
  
  const stageConfig = [
    { id: 'received', label: 'Applications' },
    { id: 'interview_planned', label: 'Interview Scheduled' },
    { id: 'interview_completed', label: 'Interview Completed' },
    { id: 'client_waiting', label: 'Client Review' },
    { id: 'recruited', label: 'Hired' },
  ];
  
  const getCandidatesByStage = (stage: RecruitmentStage) => {
    return candidates.filter(c => c.stage === stage);
  };

  const renderDefaultCard = (candidate: KanbanCandidate, index: number) => (
    <div 
      key={candidate.id}
      className="bg-white dark:bg-gray-800 p-3 rounded-lg mb-2 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      onClick={() => onCandidateClick(candidate.id)}
    >
      <div className="font-medium text-sm">
        {candidate.firstName} {candidate.lastName}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
        {candidate.position}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-2">
        {stageConfig.map(stage => (
          <div 
            key={stage.id} 
            className="kanban-column bg-gray-50 dark:bg-gray-900 p-3 rounded-lg shadow-sm min-h-[400px] h-full"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium" style={{ color: colors.text }}>
                {stage.label}
              </h3>
              <span 
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', 
                  color: `${colors.text}99` 
                }}
              >
                {getCandidatesByStage(stage.id as RecruitmentStage).length}
              </span>
            </div>
            
            <div className="space-y-2">
              {getCandidatesByStage(stage.id as RecruitmentStage).map((candidate, index) => (
                renderCard 
                  ? renderCard(candidate, index, stage.id as RecruitmentStage)
                  : renderDefaultCard(candidate, index)
              ))}
            </div>
            
            {/* Drop indicator for drag and drop visual feedback */}
            <div className="kanban-drop-indicator" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;