import { useState } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch } from '../../../store';
import { addCreatedGroup, createStudyGroup } from '../../../store/groupsSlice';
import {
  CreateGroupFormData,
  DEFAULT_FORM,
} from '../types/createGroup.types';

export type ModalStep = 'form' | 'success';

export function useCreateGroup(onClose: () => void) {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<ModalStep>('form');
  const [form, setForm] = useState<CreateGroupFormData>(DEFAULT_FORM);
  const [groupLink, setGroupLink] = useState('');

  function patch(fields: Partial<CreateGroupFormData>) {
    setForm(prev => ({ ...prev, ...fields }));
  }

  function generateLink() {
    const id = Math.random().toString(36).substring(2, 11);
    return `https://throne8.app/join/${id}`;
  }

  function handleSubmit() {
    if (!form.title || !form.description || !form.category || !form.leader) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields');
      return;
    }
    const link = generateLink();
    setGroupLink(link);

    // 1. Optimistic UI update locally
    const localGroup = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      category: form.category,
      members: 1,
      capacity: Number(form.capacity) || 20,
      goalHours: Number(form.goalHours) || 8,
      cameraRequired: form.cameraOn,
      visibility: form.visibility,
      isCreator: true,
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
      streak: 0,
      studyTime: 0,
      rank: 0,
      attendance: 100,
    };
    dispatch(addCreatedGroup(localGroup));

    // 2. Persist to backend database
    dispatch(createStudyGroup({
      title: form.title,
      description: form.description,
      category: form.category,
      capacity: Number(form.capacity) || 20,
      goalHours: Number(form.goalHours) || 8,
      cameraRequired: form.cameraOn ?? false,
      visibility: form.visibility,
      attendanceRequired: form.attendanceRequired,
      minAttendancePercent: form.attendanceRequired ? form.attendanceAvg : undefined,
    }));


    setStep('success');
  }

  function handleClose() {
    setStep('form');
    setForm(DEFAULT_FORM);
    onClose();
  }

  return { step, form, patch, groupLink, handleSubmit, handleClose, resetToForm: () => setStep('form') };
}