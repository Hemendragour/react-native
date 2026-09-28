import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  ScrollView, Pressable, ActivityIndicator, Image, ImageBackground
} from 'react-native';
import {
  X, Save, ChevronDown, Plus, Check,
  Briefcase, Code, Globe, Camera, BadgeCheck, Star
} from 'lucide-react-native';
import PickerSheet from '../../auth/components/PickerSheet';

const DOMAINS_OPTIONS = [
  { value: 'web_development',     label: 'Web Development' },
  { value: 'mobile_development',  label: 'Mobile Development' },
  { value: 'data_science',        label: 'Data Science / AI' },
  { value: 'machine_learning',    label: 'Machine Learning' },
  { value: 'devops',              label: 'DevOps' },
  { value: 'cloud_computing',     label: 'Cloud Computing' },
  { value: 'cybersecurity',       label: 'Cybersecurity' },
  { value: 'blockchain',          label: 'Blockchain' },
  { value: 'ui_ux_design',        label: 'UI/UX Design' },
  { value: 'product_management',  label: 'Product Management' },
  { value: 'digital_marketing',   label: 'Digital Marketing' },
  { value: 'business_analytics',  label: 'Business Analytics' },
  { value: 'career_guidance',     label: 'Career Guidance' },
  { value: 'interview_prep',      label: 'Interview Prep' },
  { value: 'leadership',          label: 'Leadership' },
];

const EXPERIENCE_OPTIONS = [
  { label: '0–1 Years', value: 1 },
  { label: '1–3 Years', value: 2 },
  { label: '3–5 Years', value: 4 },
  { label: '5–8 Years', value: 6 },
  { label: '8–12 Years', value: 9 },
  { label: '12+ Years', value: 13 },
];

type TabKey = 'basic' | 'expertise' | 'social';
 
interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorData: any;
  editableData: any;
  validationErrors: Record<string, string>;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
  
  // Image props
  profilePicUri?: string;
  bannerImageUri?: string;
  onPickImage: (type: 'profile' | 'banner') => void;
}
const inputCls = 'w-full px-4 py-3 rounded-2xl border-2 border-[#e0d8cf] text-sm text-[#4a3728] bg-white mb-3';

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({
  isOpen, onClose, mentorData, editableData, validationErrors, onChange, onSave, saving,
  profilePicUri, bannerImageUri, onPickImage
}) =>{
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [skillInput, setSkillInput] = useState('');
  
  const finalBannerUri = bannerImageUri || editableData.bannerImage || mentorData.coverImage || mentorData.bannerImage || mentorData.coverPhoto;
  const finalProfilePicUri = profilePicUri || editableData.profilePic || mentorData.profilePic || mentorData.user?.profilePhotoId;

  const [showDomainPicker, setShowDomainPicker] = useState(false);
  const [showExpPicker, setShowExpPicker] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('basic');
    setSkillInput('');
  }, [isOpen]);

  const toggleDomain = (val: string) => {
    const current = editableData.domains || [];
    onChange('domains', current.includes(val) ? current.filter((d: string) => d !== val) : current.length < 5 ? [...current, val] : current);
  };
 
  const addSkill = () => {
    const t = skillInput.trim();
    const current = editableData.skills || [];
    if (t && !current.includes(t) && current.length < 20) {
      onChange('skills', [...current, t]);
      setSkillInput('');
    }
  };

  const goToTab = (dir: 1 | -1) => {
    const order: TabKey[] = ['basic', 'expertise', 'social'];
    const idx = order.indexOf(activeTab);
    const next = order[idx + dir];
    if (next) setActiveTab(next);
  };
  
  const TABS: { key: TabKey; label: string }[] = [
    { key: 'basic', label: '📋 Basic' },
    { key: 'expertise', label: '⚡ Expertise' },
    { key: 'social', label: '🔗 Social' },
  ];
 

  return (
    <>
      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
          <Pressable className="bg-white rounded-t-3xl overflow-hidden max-h-[92%]" onPress={e => e.stopPropagation()}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 bg-[#4a3728]">
              <Text className="text-xl font-black text-white">Update Profile</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}
                className="w-8 h-8 rounded-full bg-white/15 items-center justify-center">
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>
 
            {/* Tabs */}
            <View className="flex-row border-b border-[#e0d8cf] bg-[#fbf7f3]">
              {TABS.map(t => (
                <TouchableOpacity key={t.key} onPress={() => setActiveTab(t.key)} activeOpacity={0.8}
                  className={`flex-1 py-3 items-center border-b-2 ${activeTab === t.key ? 'border-[#4a3728]' : 'border-transparent'}`}>
                  <Text className={`text-xs font-bold ${activeTab === t.key ? 'text-[#4a3728]' : 'text-[#8a7a6a]'}`}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
 
            {/* Error */}
            {!!validationErrors.general && (
              <View className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                <Text className="text-red-600 text-xs font-semibold">⚠️ {validationErrors.general}</Text>
              </View>
            )}
 
            <ScrollView className="px-5 py-5" showsVerticalScrollIndicator={false}>
              
              {/* Mentor Hero Section */}
              <View className="mb-6 -mx-5 -mt-5">
                <View className="h-[250px] w-full rounded-b-[40px] overflow-hidden relative shadow-sm">
                  {finalBannerUri ? (
                    <ImageBackground source={{ uri: finalBannerUri }} className="flex-1" resizeMode="cover">
                      <View className="absolute inset-0 bg-black/45" />
                    </ImageBackground>
                  ) : (
                    <View className="flex-1 bg-[#4A3728]">
                      <View className="absolute inset-0 bg-black/20" />
                    </View>
                  )}

                  <View className="absolute inset-0 flex-1 justify-end items-center pb-6 px-5">
                    {/* Edit Banner Icon */}
                    <TouchableOpacity 
                      onPress={() => onPickImage('banner')}
                      className="absolute top-6 right-5 w-10 h-10 bg-black/40 rounded-full items-center justify-center border border-white/20"
                    >
                      <Camera size={18} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Circular Profile Picture */}
                    <View className="relative mb-3">
                      {finalProfilePicUri ? (
                        <Image 
                          source={{ uri: finalProfilePicUri }} 
                          className="w-24 h-24 rounded-full border-[3px] border-[#D4A24C]" 
                          resizeMode="cover" 
                        />
                      ) : (
                        <View className="w-24 h-24 rounded-full border-[3px] border-[#D4A24C] bg-[#FBF7F3] items-center justify-center">
                          <Text className="text-[#4A3728] text-3xl font-bold">
                            {(mentorData.title || mentorData.user?.fullName || 'M')[0].toUpperCase()}
                          </Text>
                        </View>
                      )}
                      
                      {mentorData.verification?.isVerified && (
                        <View className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm z-10">
                          <BadgeCheck size={20} color="#22C55E" />
                        </View>
                      )}
                      
                      {/* Edit Profile Pic Icon */}
                      <TouchableOpacity 
                        onPress={() => onPickImage('profile')}
                        className="absolute -bottom-2 left-1/2 -ml-4 w-8 h-8 bg-[#4A3728] rounded-full items-center justify-center border-2 border-[#FBF7F3] shadow-sm z-20"
                      >
                        <Camera size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>

                    {/* Mentor Details */}
                    <Text className="text-2xl font-bold text-white mb-1 tracking-tight">
                      {mentorData.title || mentorData.user?.fullName || 'Your Name'}
                    </Text>
                    <Text className="text-sm font-medium text-[#E5DED6] mb-2.5">
                      {editableData.currentRole || mentorData.experience?.currentRole || 'Mentor'}
                    </Text>
                    
                    <View className="flex-row items-center gap-x-2">
                      <View className="flex-row items-center gap-x-1">
                        <Star size={14} color="#D4A24C" fill="#D4A24C" />
                        <Text className="font-bold text-white text-xs">
                          {mentorData.stats?.averageRating?.toFixed(1) || '0.0'}
                        </Text>
                      </View>
                      <Text className="text-[#E5DED6] text-xs font-bold">•</Text>
                      <Text className="text-xs font-medium text-[#E5DED6]">{mentorData.stats?.totalReviews || 0} Reviews</Text>
                    </View>
                  </View>
                </View>
              </View>
 
              {/* ── Basic Tab ── */}
              {activeTab === 'basic' && (
                <View>
                  <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Title *</Text>
                  <TextInput value={editableData.title || ''} onChangeText={t => onChange('title', t)} placeholder="e.g. Senior Engineer @ Google" placeholderTextColor="#b0a090" className={inputCls} />
 
                  <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Bio * (min 50 chars)</Text>
                  <TextInput value={editableData.bio || ''} onChangeText={t => onChange('bio', t)} placeholder="Tell mentees about yourself..." placeholderTextColor="#b0a090" multiline numberOfLines={5} textAlignVertical="top" className={`${inputCls} h-28`} />
                  <Text className="text-xs text-[#8a7a6a] mb-3">{(editableData.bio || '').length} / 500 chars</Text>
 
                  <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Current Role</Text>
                  <TextInput value={editableData.currentRole || ''} onChangeText={t => onChange('currentRole', t)} placeholder="Software Engineer @ Company" placeholderTextColor="#b0a090" className={inputCls} />
 
                  <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Years of Experience</Text>
                  <TouchableOpacity onPress={() => setShowExpPicker(true)} activeOpacity={0.8}
                    className="w-full flex-row items-center justify-between px-4 py-3 rounded-2xl border-2 border-[#e0d8cf] bg-white mb-3">
                    <Text className="text-sm text-[#4a3728]">
                      {EXPERIENCE_OPTIONS.find(e => e.value === (editableData.experienceTotal || 1))?.label ?? '—'}
                    </Text>
                    <ChevronDown size={16} color="#4a3728" />
                  </TouchableOpacity>
                </View>
              )}
 
              {/* ── Expertise Tab ── */}
              {activeTab === 'expertise' && (
                <View>
                  <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Domains * (max 5)</Text>
                  <TouchableOpacity onPress={() => setShowDomainPicker(true)} activeOpacity={0.8}
                    className="w-full flex-row items-center justify-between px-4 py-3 rounded-2xl border-2 border-[#e0d8cf] bg-white mb-2">
                    <Text className={`text-sm ${(editableData.domains || []).length ? 'text-[#4a3728]' : 'text-[#b0a090]'}`}>
                      {(editableData.domains || []).length ? `${(editableData.domains || []).length} selected` : 'Select domains...'}
                    </Text>
                    <ChevronDown size={16} color="#4a3728" />
                  </TouchableOpacity>
                  {(editableData.domains || []).length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-3">
                      {(editableData.domains || []).map((d: string) => {
                        const label = DOMAINS_OPTIONS.find(o => o.value === d)?.label ?? d;
                        return (
                          <TouchableOpacity key={d} onPress={() => toggleDomain(d)} activeOpacity={0.8}
                            className="flex-row items-center gap-x-1 bg-[#4a3728] px-3 py-1.5 rounded-full">
                            <Text className="text-white text-xs font-bold">{label}</Text>
                            <Text className="text-white/70 text-xs ml-0.5">×</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
 
                  <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Skills * ({(editableData.skills || []).length}/20)</Text>
                  <View className="flex-row gap-x-2 mb-2">
                    <TextInput value={skillInput} onChangeText={setSkillInput} onSubmitEditing={addSkill}
                      placeholder="Type a skill and press +" placeholderTextColor="#b0a090" returnKeyType="done"
                      className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#e0d8cf] bg-white text-sm text-[#4a3728]" />
                    <TouchableOpacity onPress={addSkill} activeOpacity={0.8}
                      className="w-12 rounded-2xl bg-[#4a3728] items-center justify-center">
                      <Plus size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  {(editableData.skills || []).length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-3">
                      {(editableData.skills || []).map((s: string) => (
                        <TouchableOpacity key={s} onPress={() => onChange('skills', editableData.skills.filter((x: string) => x !== s))} activeOpacity={0.8}
                          className="flex-row items-center gap-x-1 bg-[#4a3728] px-3 py-1.5 rounded-2xl">
                          <Text className="text-white text-xs font-bold">{s}</Text>
                          <Text className="text-white/70 text-xs ml-0.5">×</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
 
              {/* ── Social Tab ── */}
              {activeTab === 'social' && (
                <View>
                  {[
                    { label: 'LinkedIn URL *', val: editableData.linkedinUrl || '', set: (v: string) => onChange('linkedinUrl', v), ph: 'https://linkedin.com/in/username', icon: <Briefcase size={16} color="#0a66c2" /> },
                    { label: 'GitHub URL (optional)', val: editableData.githubUrl || '', set: (v: string) => onChange('githubUrl', v), ph: 'https://github.com/username', icon: <Code size={16} color="#333" /> },
                    { label: 'Portfolio URL (optional)', val: editableData.portfolioUrl || '', set: (v: string) => onChange('portfolioUrl', v), ph: 'https://yourportfolio.com', icon: <Globe size={16} color="#7a5c3e" /> },
                  ].map(({ label, val, set, ph, icon }) => (
                    <View key={label} className="mb-4">
                      <Text className="text-xs font-bold text-[#4a3728] mb-1.5">{label}</Text>
                      <View className="flex-row items-center bg-white border-2 border-[#e0d8cf] rounded-2xl px-4 py-3">
                        {icon}
                        <TextInput value={val} onChangeText={set} placeholder={ph} placeholderTextColor="#b0a090"
                          autoCapitalize="none" autoCorrect={false} keyboardType="url"
                          className="flex-1 ml-3 text-sm text-[#4a3728]" />
                      </View>
                    </View>
                  ))}
 
                  {/* Preview */}
                  <View className="bg-[#fbf7f3] border border-[#e0d8cf] rounded-2xl p-4">
                    <Text className="text-xs font-bold text-[#7a5c3e] mb-3 uppercase tracking-wide">Preview</Text>
                    {[
                      { icon: <Briefcase size={14} color="#0a66c2" />, val: editableData.linkedinUrl, label: 'LinkedIn' },
                      { icon: <Code size={14} color="#333" />, val: editableData.githubUrl, label: 'GitHub' },
                      { icon: <Globe size={14} color="#7a5c3e" />, val: editableData.portfolioUrl, label: 'Portfolio' },
                    ].map(({ icon, val, label }) => (
                      <View key={label} className="flex-row items-center gap-x-3 mb-2">
                        {icon}
                        <Text className="text-sm text-[#4a3728] flex-1" numberOfLines={1}>
                          {val || <Text className="text-[#c0b0a0] italic text-xs">Not provided</Text>}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
 
              <View className="h-4" />
            </ScrollView>
 
            {/* Footer */}
            <View className="flex-row items-center justify-between px-5 py-4 border-t border-[#e0d8cf] bg-[#fdf9f6]">
              <TouchableOpacity onPress={onClose} activeOpacity={0.8}
                className="px-5 py-2.5 rounded-xl bg-[#f0ebe6]">
                <Text className="text-[#7a5c3e] font-semibold text-sm">Cancel</Text>
              </TouchableOpacity>
              <View className="flex-row gap-x-2">
                {activeTab !== 'basic' && (
                  <TouchableOpacity onPress={() => goToTab(-1)} activeOpacity={0.8}
                    className="px-4 py-2.5 rounded-xl border-2 border-[#e0d8cf]">
                    <Text className="text-[#7a5c3e] font-semibold text-sm">← Back</Text>
                  </TouchableOpacity>
                )}
                {activeTab !== 'social' && (
                  <TouchableOpacity onPress={() => goToTab(1)} activeOpacity={0.8}
                    className="px-5 py-2.5 rounded-xl border-2 border-[#4a3728]">
                    <Text className="text-[#4a3728] font-semibold text-sm">Next →</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onSave} disabled={saving} activeOpacity={0.85}
                  className={`px-5 py-2.5 rounded-xl bg-[#4a3728] flex-row items-center gap-x-2 ${saving ? 'opacity-60' : ''}`}>
                  {saving ? <ActivityIndicator size="small" color="#fff" /> :
                   <Save size={14} color="#fff" />}
                  <Text className="text-white font-bold text-sm">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
 
      {/* Domain multi-picker */}
      <Modal visible={showDomainPicker} transparent animationType="slide" onRequestClose={() => setShowDomainPicker(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setShowDomainPicker(false)}>
          <Pressable className="bg-white rounded-t-3xl px-5 py-5" onPress={e => e.stopPropagation()}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-black text-[#4a3728]">Select Domains (max 5)</Text>
              <TouchableOpacity onPress={() => setShowDomainPicker(false)}><X size={18} color="#4a3728" /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {DOMAINS_OPTIONS.map(opt => {
                const selected = (editableData.domains || []).includes(opt.value);
                const disabled = !selected && (editableData.domains || []).length >= 5;
                return (
                  <TouchableOpacity key={opt.value} onPress={() => !disabled && toggleDomain(opt.value)}
                    activeOpacity={disabled ? 1 : 0.8}
                    className={`flex-row items-center justify-between px-4 py-3.5 border-b border-[#e0d8cf]/50 ${selected ? 'bg-[#f6ede8]' : ''} ${disabled ? 'opacity-40' : ''}`}>
                    <Text className={`text-sm ${selected ? 'font-bold text-[#4a3728]' : 'text-[#4a3728]/80'}`}>{opt.label}</Text>
                    {selected && <Check size={16} color="#4a3728" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowDomainPicker(false)} activeOpacity={0.85}
              className="w-full py-3 bg-[#4a3728] rounded-2xl items-center mt-4">
              <Text className="text-white font-bold text-sm">Done ({(editableData.domains || []).length} selected)</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
 
      {/* Experience picker */}
      <PickerSheet 
        visible={showExpPicker} 
        onClose={() => setShowExpPicker(false)}
        title="Years of Experience"
        options={EXPERIENCE_OPTIONS.map(o => ({ label: o.label, value: String(o.value) }))}
        selected={String(editableData.experienceTotal || 1)}
        onSelect={v => onChange('experienceTotal', Number(v))}
      />
    </>
  );
}

export default UpdateProfileModal;