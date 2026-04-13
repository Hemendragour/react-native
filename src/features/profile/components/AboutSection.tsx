// src/components/profile/AboutSection.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import { launchImageLibrary } from 'react-native-image-picker';
import AuthService from '../../../services/auth.service';

interface AboutSectionProps {
  aboutData?: { aboutText?: string };
  isLoading?: boolean;
  onAboutCreated?: () => Promise<void>;
  aboutId?: string;
  videoUrl?: string;
  onVideoUpload?: (file: {
    uri: string;
    name: string;
    mimeType?: string;
  }) => Promise<void>;
  isUploadingVideo?: boolean;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  aboutData,
//   isLoading = false,
  onAboutCreated,
  aboutId,
  videoUrl,
  onVideoUpload,
  isUploadingVideo = false,
}) => {
  const [isEditMode, setIsEditMode]   = useState(false);
  const [aboutText, setAboutText]     = useState('');
  const [isSaving, setIsSaving]       = useState(false);
  const [error, setError]             = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (aboutData?.aboutText) setAboutText(aboutData.aboutText);
  }, [aboutData]);

  const handleOpenModal = (editMode = false) => {
    setIsEditMode(editMode);
    setAboutText(editMode && aboutData?.aboutText ? aboutData.aboutText : '');
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAboutText('');
    setError('');
    setIsEditMode(false);
  };

  const handleSave = async () => {
    const trimmed = aboutText.trim();
    if (!trimmed)                { setError('About text is required');                       return; }
    if (trimmed.length < 50)     { setError('About text must be at least 50 characters');   return; }
    if (trimmed.length > 2600)   { setError('About text cannot exceed 2600 characters');    return; }
    if (!/^[A-Z]/.test(trimmed)) { setError('About text must start with a capital letter'); return; }

    setIsSaving(true);
    setError('');
    try {
      if (isEditMode && aboutId) {
        await AuthService.updateAbout(aboutId, { aboutText: trimmed });
      } else {
        await AuthService.createAbout({ aboutText: trimmed });
      }
      if (onAboutCreated) await onAboutCreated();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Failed to save about text');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVideoPick = async () => {
    try {
      launchImageLibrary(
        { mediaType:'video',videoQuality:'high'},
        async (Response)=>{
          if(Response.didCancel)return;
          if(Response.errorCode){
            Alert.alert('Error', 'Could not pick video');
            return;
          }
          const asset=Response.assets?.[0]
          if(!asset)return;
          if(asset.fileSize && asset.fileSize > 50 * 1024 * 1024){
            Alert.alert("File too large");
            return;
          }
          if(onVideoUpload){
            await onVideoUpload({
              uri:asset.uri!,
              name:asset.fileName??'video.mp4',
              mimeType:asset.type??undefined,
            });
          }
        }
      )
    } catch {
      Alert.alert('Error', 'Could not pick video. Please try again.');
    }
  };

  return (
    <View className="bg-[#f6ede8]/80 rounded-2xl p-4 border border-[#e0d8cf]/50 mb-6 mx-3">

      {/* ── Header ── */}
      <View className="flex-row items-center gap-3 mb-4">
        
        <Text className="text-xl font-bold text-[#4a3728]">About</Text>
      </View>

      {/* ── About Me card ── */}
      <View className=" p-4 mb-3 bg-white/40 rounded-2xl border-2 border-dashed border-[#d4c4b5]">
        <Text className=" font-semibold text-[#4a3728] mb-2">About Me</Text>

        {aboutData?.aboutText ? (
          <>
            <Text className="text-sm text-brown/90 leading-relaxed tracking-wide">
              {aboutData.aboutText}
            </Text>
            <TouchableOpacity
              onPress={() => handleOpenModal(true)}
              className="self-end mt-3 bg-brown/20 px-3 py-1 rounded-md"
            >
              <Text className="text-xs text-brown font-medium">✏ Edit</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="items-center py-5">
            <Text className="text-sm text-[#8b6f47] mb-1">No about text added yet</Text>
            <TouchableOpacity
              onPress={() => handleOpenModal(false)}
              className="bg-brown px-5 py-2 rounded-full"
            >
              <Text className="text-xs text-black/50 font-semibold">+ Add About</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Video card ── */}
      <View className=" p-4 bg-white/40 rounded-2xl border-2 border-dashed border-[#d4c4b5]">
        <Text className="text-[#4a3728] font-semibold  mb-1">Introduction Video</Text>

        {videoUrl ? (
          <View>
            <Video
              source={{ uri: videoUrl }}
              className="w-full h-40 rounded-xl bg-black"
              controls={true}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={handleVideoPick}
              disabled={isUploadingVideo}
              className="absolute top-2 right-2 bg-brown/80 px-3 py-1 rounded-md"
            >
              <Text className="text-white text-xs font-medium">
                {isUploadingVideo ? 'Uploading...' : '🔄 Replace'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="h-40 rounded-xl bg-brown/10 border border-brown/30 items-center justify-center gap-2">
            <View className="w-11 h-11 rounded-full bg-brown/20 border border-brown/30 items-center justify-center">
              <Text className="text-xl">🎬</Text>
            </View>
            <Text className="text-sm text-[#8b6f47] text-center px-4">
              {isUploadingVideo ? 'Uploading video...' : 'Upload your introduction video'}
            </Text>
            {isUploadingVideo ? (
              <ActivityIndicator color="#4a3728" />
            ) : (
              <TouchableOpacity
                onPress={handleVideoPick}
                className="mt-1 bg-brown px-5 py-2 rounded-full"
              >
                <Text className="text-xs text-black/50 font-semibold">Choose Video</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ══════════════════════════════
          Modal
      ══════════════════════════════ */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        {/* Backdrop */}
        <TouchableOpacity
          className="absolute inset-0 bg-black/40"
          activeOpacity={1}
          onPress={handleCloseModal}
        />

        {/* Bottom sheet */}
        <View className="absolute bottom-0 left-0 right-0 bg-[#f6ede8] rounded-t-3xl max-h-[88%] overflow-hidden">

          {/* Header */}
          <View className="flex-row items-center justify-between bg-brown px-3 py-2">
            <View>
              <Text className="text-xl font-bold text-[#4a3728]">
                {isEditMode ? 'Edit About' : 'Add About'}
              </Text>
              <Text className="text-[#8b6f47] text-sm mt-1">
                Tell people about yourself
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCloseModal}
              disabled={isSaving}
              className="w-8 h-8 rounded-full bg-white/20 items-center justify-center"
            >
              <Text className="text-[#4a3728] text-base font-medium">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5 pt-5" keyboardShouldPersistTaps="handled">

            {/* Error banner */}
            {!!error && (
              <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <Text className="text-sm text-red-600">{error}</Text>
              </View>
            )}

            <Text className="text-sm font-medium text-[#4a3728] mb-2">
              About Text <Text className="text-red-500">*</Text>
            </Text>

            {/*
              ✅ PRODUCTION RULE — NativeWind ke liye:
              Dynamic className string concatenation mat karo.
              Iske bajaye do alag components render karo condition ke basis pe.
              NativeWind build time pe classes extract karta hai —
              runtime mein bani strings bundle mein nahi hoti.
            */}
            {error ? (
              <TextInput
                value={aboutText}
                onChangeText={(val) => { setAboutText(val); setError(''); }}
                placeholder="Tell people about yourself..."
                placeholderTextColor="#4a372899"
                multiline
                numberOfLines={8}
                maxLength={2600}
                textAlignVertical="top"
                className="border-2 border-red-500 bg-red-50 rounded-xl px-4 py-3 text-sm text-brown min-h-[180px]"
              />
            ) : (
              <TextInput
                value={aboutText}
                onChangeText={(val) => { setAboutText(val); setError(''); }}
                placeholder="Tell people about yourself... (min 50 chars, start with capital letter)"
                placeholderTextColor="#4a372899"
                multiline
                numberOfLines={8}
                maxLength={2600}
                textAlignVertical="top"
                className="border-2 border-beige bg-white/50 rounded-xl px-4 py-3 text-sm text-brown min-h-[180px]"
              />
            )}

            {/* Counter row — same pattern */}
            <View className="flex-row justify-between mt-2 mb-5">
              <Text className="text-xs text-brown/60 flex-1 mr-2">
                Must start with capital letter, min 50 characters
              </Text>
              {aboutText.length > 2600 ? (
                <Text className="text-xs text-red-500">{aboutText.length} / 2600</Text>
              ) : (
                <Text className="text-xs text-brown/60">{aboutText.length} / 2600</Text>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          {Platform.OS === 'ios' ? (
            <View className="flex-row gap-3 px-5 pt-3 pb-8 bg-white border-t border-beige/80">
              <FooterButtons
                isSaving={isSaving}
                canSave={!!aboutText.trim()}
                isEditMode={isEditMode}
                onCancel={handleCloseModal}
                onSave={handleSave}
              />
            </View>
          ) : (
            <View className="flex-row gap-3 px-5 pt-3 pb-5 bg-white border-t border-beige/80">
              <FooterButtons
                isSaving={isSaving}
                canSave={!!aboutText.trim()}
                isEditMode={isEditMode}
                onCancel={handleCloseModal}
                onSave={handleSave}
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

// ─────────────────────────────────────────────
// FooterButtons — alag component isliye nikala
// taaki disabled state ke liye bhi dynamic
// className avoid ho sake (NativeWind rule)
// ─────────────────────────────────────────────
interface FooterButtonsProps {
  isSaving: boolean;
  canSave: boolean;
  isEditMode: boolean;
  onCancel: () => void;
  onSave: () => void;
}

const FooterButtons: React.FC<FooterButtonsProps> = ({
  isSaving,
  canSave,
  isEditMode,
  onCancel,
  onSave,
}) => {
  const disabled = isSaving || !canSave;

  return (
    <>
      <TouchableOpacity
        onPress={onCancel}
        disabled={isSaving}
        className="flex-1 py-3.5 rounded-full border-2 border-beige items-center"
      >
        <Text className="text-base font-semibold text-brown">Cancel</Text>
      </TouchableOpacity>

      {disabled ? (
        <TouchableOpacity
          disabled
          className="flex-1 py-3.5 rounded-full bg-[#4a3728] items-center justify-center"
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">
              {isEditMode ? 'Update About' : 'Add About'}
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onSave}
          className="flex-1 py-3.5 rounded-full bg-brown items-center justify-center"
        >
          <Text className="text-base font-semibold text-white">
            {isEditMode ? 'Update About' : 'Add About'}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default AboutSection;