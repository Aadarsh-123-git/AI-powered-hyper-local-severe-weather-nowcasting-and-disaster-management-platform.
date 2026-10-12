'use client';

import React from 'react';
import AiNowcastSimulatorModal from './AiNowcastSimulatorModal';
import { AlertItem } from '@/lib/types';

interface AiRiskSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDistrict?: string;
  onSelectDistrict?: (district: string) => void;
  onGenerateAlert?: (simulatedAlert: Partial<AlertItem>) => void;
  onGenerateSimulatedAlert?: (simulatedAlert: Partial<AlertItem>) => void;
  onOpenSmsDispatch?: (simulatedAlert: Partial<AlertItem>) => void;
}

export default function AiRiskSimulatorModal({
  isOpen,
  onClose,
  initialDistrict,
  onSelectDistrict,
  onGenerateAlert,
  onGenerateSimulatedAlert,
  onOpenSmsDispatch,
}: AiRiskSimulatorModalProps) {
  return (
    <AiNowcastSimulatorModal
      isOpen={isOpen}
      onClose={onClose}
      initialDistrict={initialDistrict}
      onSelectDistrict={onSelectDistrict}
      onGenerateAlert={onGenerateAlert}
      onGenerateSimulatedAlert={onGenerateSimulatedAlert}
      onOpenSmsDispatch={onOpenSmsDispatch}
    />
  );
}
