import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import {
  X, Save, ChevronDown, Plus, Check,
  Linkedin, Github, Link2,
} from 'lucide-react-native';
import PickerSheet from '../../auth/components/PickerSheet';
 
// TODO: import { api } from '@/lib/api/auth.service';

const DOMAINS_OPTIONS = [
  { value: 'web_development',     label: 'Web Development' },
  { value: 'career_guidance',     label: 'Career Guidance' },
  { value: 'interview_prep',      label: 'Interview Prep' },
  { value: 'data_science',        label: 'Data Science / AI' },
  { value: 'product_management',  label: 'Product Management' },
  { value: 'design',              label: 'Design (UI/UX)' },
  { value: 'mobile_development',  label: 'Mobile Development' },
  { value: 'devops',              label: 'DevOps' },
  { value: 'blockchain',          label: 'Blockchain' },
  { value: 'cybersecurity',       label: 'Cybersecurity' },
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
  mentorId: string;
  onUpdateSuccess: (updated: any) => void;
}
const inputCls = 'w-full px-4 py-3 rounded-2xl border-2 border-[#e0d8cf] text-sm text-[#4a3728] bg-white mb-3';

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({
  isOpen, onClose, mentorData, mentorId, onUpdateSuccess,
}) =>{
    const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [experienceTotal, setExperienceTotal] = useState(1);
  const [domains, setDomains] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDomainPicker, setShowDomainPicker] = useState(false);
  const [showExpPicker, setShowExpPicker] = useState(false);

  useEffect(() => {
    if (!mentorData || !isOpen) return;
    setTitle(mentorData.title ?? '');
    setBio(mentorData.bio ?? '');
    setCurrentRole(mentorData.experience?.currentRole ?? '');
    setExperienceTotal(mentorData.experience?.total ?? 1);
    setDomains(mentorData.domains ?? []);
    setSkills(mentorData.skills ?? []);
    setLinkedinUrl(mentorData.socialProof?.linkedinUrl ?? '');
    setGithubUrl(mentorData.socialProof?.githubUrl ?? '');
    setPortfolioUrl(mentorData.socialProof?.portfolioUrl ?? '');
    setActiveTab('basic');
    setError(null);
    setSuccess(false);
  }, [mentorData, isOpen]);

  
  const toggleDomain = (val: string) => {
    setDomains(p => p.includes(val) ? p.filter(d => d !== val) : p.length < 5 ? [...p, val] : p);
  };
 
  const addSkill = () => {
    const t = skillInput.trim();
    if (t && !skills.includes(t) && skills.length < 20) {
      setSkills(p => [...p, t]);
      setSkillInput('');
    }
  };

  const goToTab = (dir: 1 | -1) => {
    const order: TabKey[] = ['basic', 'expertise', 'social'];
    const idx = order.indexOf(activeTab);
    const next = order[idx + dir];
    if (next) setActiveTab(next);
  };
 
  const handleSubmit = async () => {
    setError(null);
    if (!title.trim()) { setError('Title is required.'); setActiveTab('basic'); return; }
    if (!bio.trim() || bio.length < 50) { setError('Bio must be at least 50 characters.'); setActiveTab('basic'); return; }
    if (domains.length === 0) { setError('Select at least 1 domain.'); setActiveTab('expertise'); return; }
    if (skills.length === 0) { setError('Add at least 1 skill.'); setActiveTab('expertise'); return; }
 
    setSaving(true);
    try {
      const payload = { title, bio, domains, skills, experience: { total: experienceTotal, currentRole }, socialProof: { linkedinUrl, ...(githubUrl && { githubUrl }), ...(portfolioUrl && { portfolioUrl }) } };
      // TODO: await api.patch(`/mentors/${mentorId}`, payload);
      setSuccess(true);
      setTimeout(() => { onUpdateSuccess(payload); onClose(); }, 1000);
    } catch (e: any) {
      setError(e.message || 'Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };
   const TABS: { key: TabKey; label: string }[] = [
    { key: 'basic', label: '📋 Basic' },
    { key: 'expertise', label: '⚡ Expertise' },
    { key: 'social', label: '🔗 Social' },
  ];
 
  const expLabel = EXPERIENCE_OPTIONS.find(e => e.value === experienceTotal)?.label ?? '—';

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
            {!!error && (
              <View className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                <Text className="text-red-600 text-xs font-semibold">⚠️ {error}</Text>
              </View>
            )}
 
            <ScrollView className="px-5 py-5" showsVerticalScrollIndicator={false}>
 
              {/* ── Basic Tab ── */}
              {activeTab === 'basic' && (
                <View>
                  <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Title *</Text>
                  <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Senior Engineer @ Google" placeholderTextColor="#b0a090" className={inputCls} />
 
                  <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Bio * (min 50 chars)</Text>
                  <TextInput value={bio} onChangeText={setBio} placeholder="Tell mentees about yourself..." placeholderTextColor="#b0a090" multiline numberOfLines={5} textAlignVertical="top" className={`${inputCls} h-28`} />
                  <Text className="text-xs text-[#8a7a6a] mb-3">{bio.length} / 500 chars</Text>
 
                  <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Current Role</Text>
                  <TextInput value={currentRole} onChangeText={setCurrentRole} placeholder="Software Engineer @ Company" placeholderTextColor="#b0a090" className={inputCls} />
 
                  <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Years of Experience</Text>
                  <TouchableOpacity onPress={() => setShowExpPicker(true)} activeOpacity={0.8}
                    className="w-full flex-row items-center justify-between px-4 py-3 rounded-2xl border-2 border-[#e0d8cf] bg-white mb-3">
                    <Text className="text-sm text-[#4a3728]">{expLabel}</Text>
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
                    <Text className={`text-sm ${domains.length ? 'text-[#4a3728]' : 'text-[#b0a090]'}`}>
                      {domains.length ? `${domains.length} selected` : 'Select domains...'}
                    </Text>
                    <ChevronDown size={16} color="#4a3728" />
                  </TouchableOpacity>
                  {domains.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-3">
                      {domains.map(d => {
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
 
                  <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Skills * ({skills.length}/20)</Text>
                  <View className="flex-row gap-x-2 mb-2">
                    <TextInput value={skillInput} onChangeText={setSkillInput} onSubmitEditing={addSkill}
                      placeholder="Type a skill and press +" placeholderTextColor="#b0a090" returnKeyType="done"
                      className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#e0d8cf] bg-white text-sm text-[#4a3728]" />
                    <TouchableOpacity onPress={addSkill} activeOpacity={0.8}
                      className="w-12 rounded-2xl bg-[#4a3728] items-center justify-center">
                      <Plus size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  {skills.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-3">
                      {skills.map(s => (
                        <TouchableOpacity key={s} onPress={() => setSkills(p => p.filter(x => x !== s))} activeOpacity={0.8}
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
                    { label: 'LinkedIn URL *', val: linkedinUrl, set: setLinkedinUrl, ph: 'https://linkedin.com/in/username', icon: <Linkedin size={16} color="#0a66c2" /> },
                    { label: 'GitHub URL (optional)', val: githubUrl, set: setGithubUrl, ph: 'https://github.com/username', icon: <Github size={16} color="#333" /> },
                    { label: 'Portfolio URL (optional)', val: portfolioUrl, set: setPortfolioUrl, ph: 'https://yourportfolio.com', icon: <Link2 size={16} color="#7a5c3e" /> },
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
                      { icon: <Linkedin size={14} color="#0a66c2" />, val: linkedinUrl, label: 'LinkedIn' },
                      { icon: <Github size={14} color="#333" />, val: githubUrl, label: 'GitHub' },
                      { icon: <Link2 size={14} color="#7a5c3e" />, val: portfolioUrl, label: 'Portfolio' },
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
                <TouchableOpacity onPress={handleSubmit} disabled={saving || success} activeOpacity={0.85}
                  className={`px-5 py-2.5 rounded-xl bg-[#4a3728] flex-row items-center gap-x-2 ${(saving || success) ? 'opacity-60' : ''}`}>
                  {saving ? <ActivityIndicator size="small" color="#fff" /> :
                   success ? <Check size={14} color="#fff" /> :
                   <Save size={14} color="#fff" />}
                  <Text className="text-white font-bold text-sm">
                    {saving ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
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
                const selected = domains.includes(opt.value);
                const disabled = !selected && domains.length >= 5;
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
              <Text className="text-white font-bold text-sm">Done ({domains.length} selected)</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
 
      {/* Experience picker */}
      <PickerSheet
        visible={showExpPicker}
        title="Select Experience"
        options={EXPERIENCE_OPTIONS.map(e => ({ label: e.label, value: String(e.value) }))}
        selected={String(experienceTotal)}
        onSelect={v => setExperienceTotal(Number(v))}
        onClose={() => setShowExpPicker(false)}
      />
    </>
  );
}



export default UpdateProfileModal