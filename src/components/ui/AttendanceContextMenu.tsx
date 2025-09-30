'use client';

import React from 'react';

interface AttendanceContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'present' | 'absent' | 'justified' | 'pedagogical') => void;
  studentName: string;
  currentStatus: 'present' | 'absent_justified' | 'absent_unjustified';
  hasPedagogicalNotes: boolean;
}

export function AttendanceContextMenu({
  isOpen,
  onClose,
  onSelectOption,
  studentName,
  currentStatus,
  hasPedagogicalNotes
}: AttendanceContextMenuProps) {
  if (!isOpen) return null;

  const handleOptionClick = (option: 'present' | 'absent' | 'justified' | 'pedagogical') => {
    onSelectOption(option);
    onClose();
  };

  return (
    <>
      {/* Overlay pour fermer le menu */}
      <div 
        className="attendance-overlay"
        onClick={onClose}
      />
      
      {/* Menu contextuel */}
      <div className="attendance-context-menu">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h3 className="font-semibold text-gray-900">Statut de présence</h3>
          <p className="text-sm text-gray-600">{studentName}</p>
        </div>
        
        {/* Options */}
        <div className="py-2">
          {/* Présent */}
          <button
            onClick={() => handleOptionClick('present')}
            className={`attendance-option present ${currentStatus === 'present' ? 'bg-green-50' : ''}`}
          >
            <div className="attendance-option-icon">✓</div>
            <div className="attendance-option-text">
              <div className="attendance-option-title">Présent</div>
              <div className="attendance-option-description">L&apos;élève est présent en cours</div>
            </div>
          </button>
          
          {/* Absent */}
          <button
            onClick={() => handleOptionClick('absent')}
            className={`attendance-option absent ${currentStatus === 'absent_unjustified' ? 'bg-red-50' : ''}`}
          >
            <div className="attendance-option-icon">✗</div>
            <div className="attendance-option-text">
              <div className="attendance-option-title">Absent</div>
              <div className="attendance-option-description">L&apos;élève est absent sans justification</div>
            </div>
          </button>
          
          {/* Absent justifié */}
          <button
            onClick={() => handleOptionClick('justified')}
            className={`attendance-option justified ${currentStatus === 'absent_justified' ? 'bg-amber-50' : ''}`}
          >
            <div className="attendance-option-icon">📝</div>
            <div className="attendance-option-text">
              <div className="attendance-option-title">Absent justifié</div>
              <div className="attendance-option-description">L&apos;élève est absent avec justification</div>
            </div>
          </button>
          
          {/* Note pédagogique */}
          <button
            onClick={() => handleOptionClick('pedagogical')}
            className="attendance-option pedagogical"
          >
            <div className="attendance-option-icon">📚</div>
            <div className="attendance-option-text">
              <div className="attendance-option-title">Note pédagogique</div>
              <div className="attendance-option-description">
                {hasPedagogicalNotes ? 'Voir/modifier les notes' : 'Ajouter une note pédagogique'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
