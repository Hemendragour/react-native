// features/profile/components/EducationMenuPopup.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, ActivityIndicator, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EducationMenuPopupProps {
  educationId: string;
  isOpen: boolean;
  onClose: () => void;
  onEducationDeleted?: () => void;
  onEducationArchived?: () => void;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ArchiveIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIcon = ({ color = '#dc2626' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WarningIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="#dc2626" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const EducationMenuPopup: React.FC<EducationMenuPopupProps> = ({
  educationId, isOpen, onClose, onEducationDeleted, onEducationArchived,
}) => {
  const [isArchiving, setIsArchiving]           = useState(false);
  const [isDeleting, setIsDeleting]             = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleArchive = async () => {
    if (isArchiving) return;
    try {
      setIsArchiving(true);
      // await archiveEducationRecord(educationId).unwrap();  ← uncomment when API ready
      onEducationArchived?.();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to archive education');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      // await removeEducation(educationId).unwrap();  ← uncomment when API ready
      onEducationDeleted?.();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete education');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/30" onPress={onClose}>

        {/* Menu card — top right position */}
        <Pressable
          className="absolute top-14 right-4 bg-[#f6ede8]/80 rounded-2xl border border-[#e0d8cf]/50 w-52 overflow-hidden"
          style={{ elevation: 8 }}
          onPress={() => {}}
        >
          {!showDeleteConfirm ? (
            <>
              {/* Archive button */}
              <TouchableOpacity
                className="flex-row items-center gap-3 px-4 py-3.5 border-b border-brand-border/30"
                onPress={handleArchive}
                disabled={isArchiving || isDeleting}
                activeOpacity={0.7}
              >
                {isArchiving ? (
                  <ActivityIndicator size="small" color="#4a3728" />
                ) : (
                  <ArchiveIcon />
                )}
                <Text className="text-brand-dark/80 text-sm font-medium flex-1">
                  {isArchiving ? 'Archiving...' : 'Archive Education'}
                </Text>
              </TouchableOpacity>

              {/* Delete button */}
              <TouchableOpacity
                className="flex-row items-center gap-3 px-4 py-3.5"
                onPress={() => setShowDeleteConfirm(true)}
                disabled={isArchiving || isDeleting}
                activeOpacity={0.7}
              >
                <TrashIcon />
                <Text className="text-red-600 text-sm font-medium flex-1">Delete Education</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Delete confirmation */
            <View >
              <View className="p-4 bg-red-50 border-b border-red-200">
                <View className="flex-row items-center gap-2 mb-1">
                  <WarningIcon />
                  <Text className="text-red-900 text-base font-bold">Delete Education?</Text>
                </View>
              </View>
              <View className="p-4">
                <Text className="text-gray-700 text-sm mb-1">
                  This action cannot be undone.
                </Text>
                <Text className="text-red-700 text-sm mb-4">
                  Are you sure you want to proceed?
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 py-2.5 bg-gray-100 rounded-xl items-center"
                    onPress={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-700 text-sm font-medium">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-2.5 bg-red-600 rounded-xl items-center flex-row justify-center gap-1.5"
                    onPress={handleDelete}
                    disabled={isDeleting}
                    activeOpacity={0.8}
                  >
                    {isDeleting
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <TrashIcon color="#fff" />
                    }
                    <Text className="text-white text-sm font-medium">
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default EducationMenuPopup;