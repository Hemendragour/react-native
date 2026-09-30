import React, { useState } from 'react';
import {
  View, Text, Modal, Pressable, TouchableOpacity,
  TextInput, Image, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { X, Users, User, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import ImagePicker from 'react-native-image-crop-picker';
import MentorshipService from '../../../services/mentorship.service';

// ─── Types ────────────────────────────────────────────────────────────────────

type Asset = {
  uri: string;
  type?: string;
  fileName?: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DOMAINS = [
  { label: 'Web Development', value: 'web_development' },
  { label: 'Mobile Development', value: 'mobile_development' },
  { label: 'Data Science', value: 'data_science' },
  { label: 'Machine Learning', value: 'machine_learning' },
  { label: 'DevOps', value: 'devops' },
  { label: 'Cloud Computing', value: 'cloud_computing' },
  { label: 'Cybersecurity', value: 'cybersecurity' },
  { label: 'Blockchain', value: 'blockchain' },
  { label: 'UI/UX Design', value: 'ui_ux_design' },
  { label: 'Product Management', value: 'product_management' },
  { label: 'Digital Marketing', value: 'digital_marketing' },
  { label: 'Business Analytics', value: 'business_analytics' },
  { label: 'Career Guidance', value: 'career_guidance' },
  { label: 'Interview Prep', value: 'interview_prep' },
  { label: 'Leadership', value: 'leadership' },
];

const inputCls =
  'w-full px-4 py-3 bg-[#f8f6f4] border border-[#ece7e2] rounded-2xl text-sm text-[#4a3728] mb-3';

// ─── Component ────────────────────────────────────────────────────────────────

const BecomeMentorModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [formStep, setFormStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [skills, setSkills] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [bio, setBio] = useState('');
  const [motivation, setMotivation] = useState('');
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [profileImage, setProfileImage] = useState<Asset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const resetForm = () => {
    setFormStep(1);
    setFullName('');
    setEmail('');
    setLocation('');
    setCurrentRole('');
    setSelectedDomains([]);
    setSkills('');
    setExperienceYears('');
    setBio('');
    setMotivation('');
    setProfileImage(null);
    setAgree1(false);
    setAgree2(false);
  };

  const handlePickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 500,
        height: 500,
        cropping: true,
        mediaType: 'photo',
      });
      if (image) {
        const pathParts = image.path.split('/');
        const fileName = pathParts[pathParts.length - 1];
        setProfileImage({
          uri: image.path,
          type: image.mime || 'image/jpeg',
          fileName: fileName,
        });
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('User cancelled')) {
        console.warn('Image picker error:', err);
      }
    }
  };

  const handleNextStep = () => {
    if (formStep === 1) {
      if (!profileImage) { Alert.alert('Required', 'Please upload a profile picture.'); return; }
      if (!fullName.trim() || fullName.trim().length < 5) {
        Alert.alert('Required', 'Full Name must be at least 5 characters.');
        return;
      }
      if (!email.trim() || !location.trim() || !currentRole.trim()) {
        Alert.alert('Required', 'Please fill all required fields in this step.');
        return;
      }
    }
    if (formStep === 2) {
      if (selectedDomains.length === 0) { Alert.alert('Required', 'Please select at least one domain.'); return; }
      const parsedCheck = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (parsedCheck.length === 0) { Alert.alert('Required', 'Please enter at least one skill.'); return; }
      if (!experienceYears.trim()) { Alert.alert('Required', 'Please enter your years of experience.'); return; }
      if (!bio.trim() || bio.trim().length < 50) { Alert.alert('Required', 'Bio must be at least 50 characters.'); return; }
    }
    setFormStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!profileImage) { Alert.alert('Required', 'Please upload a profile picture.'); return; }
    if (!fullName.trim() || fullName.trim().length < 5) { Alert.alert('Required', 'Full name must be at least 5 characters.'); return; }
    if (!currentRole.trim()) { Alert.alert('Required', 'Please enter your current role.'); return; }
    if (selectedDomains.length === 0) { Alert.alert('Required', 'Please select at least one domain.'); return; }
    const parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
    if (parsedSkills.length === 0) { Alert.alert('Required', 'Please enter at least one skill.'); return; }
    if (!experienceYears.trim()) { Alert.alert('Required', 'Please enter your years of experience.'); return; }
    if (!bio.trim() || bio.trim().length < 50) { Alert.alert('Required', 'Bio must be at least 50 characters.'); return; }
    if (!agree1 || !agree2) { Alert.alert('Required', 'Please agree to both terms and conditions.'); return; }

    setIsSubmitting(true);
    try {
      await MentorshipService.becomeMentor({
        title: fullName.trim(),
        bio: bio.trim(),
        ...(motivation.trim() ? { tagline: motivation.trim() } : {}),
        domains: selectedDomains,
        skills: parsedSkills,
        experienceTotal: Number(experienceYears) || 0,
        experienceCurrentRole: currentRole.trim(),
        profilePicUrl: profileImage.uri,
        profilePicType: profileImage.type || 'image/jpeg',
        profilePicName: profileImage.fileName || `mentor_pic_${Date.now()}.jpg`,
      } as any);
      MentorshipService.cachedIsMentor = true;
      Alert.alert('Success', 'Mentor application submitted successfully!');
      resetForm();
      onClose();
      onSuccess?.();
    } catch (e: any) {
      console.error('❌ Mentor submission error:', e);
      Alert.alert(
        'Error',
        e?.response?.data?.message ||
        e?.message ||
        'Failed to submit application. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 items-center justify-center px-4" onPress={onClose}>
        <Pressable
          className="w-full bg-white rounded-[32px] overflow-hidden shadow-2xl max-h-[90%]"
          onPress={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <View className="bg-[#4a3728] p-8 relative">
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-5 right-5 w-9 h-9 bg-white/20 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <X size={18} color="#fff" />
            </TouchableOpacity>
            <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mb-3">
              <Users size={28} color="#fff" />
            </View>
            <Text className="text-2xl font-black text-white mb-1">Become a Mentor</Text>
            <Text className="text-white/80 font-medium text-sm">
              Share your expertise and inspire the next generation
            </Text>
            {/* Step progress dots */}
            <View className="flex-row gap-x-2 mt-5">
              {[1, 2, 3].map(s => (
                <View
                  key={s}
                  className={`h-1.5 rounded-full flex-1 ${formStep >= s ? 'bg-white' : 'bg-white/30'}`}
                />
              ))}
            </View>
          </View>

          <ScrollView className="px-6 py-6" showsVerticalScrollIndicator={false}>
            {/* ── Step 1: Personal Info ── */}
            {formStep === 1 && (
              <View>
                {/* Profile picture */}
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <TouchableOpacity onPress={handlePickImage} activeOpacity={0.85}>
                    <View
                      style={{
                        width: 88, height: 88, borderRadius: 44,
                        overflow: 'hidden', borderWidth: 2,
                        borderColor: '#4a3728', backgroundColor: '#f8f6f4',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {profileImage ? (
                        <Image
                          source={{ uri: profileImage.uri }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={{
                            width: '100%', height: '100%',
                            backgroundColor: '#4a3728',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <User size={32} color="#fff" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  <Text style={{ marginTop: 8, fontSize: 12, fontWeight: '700', color: '#4a3728' }}>
                    Upload Profile Picture
                  </Text>
                  {!profileImage && (
                    <Text style={{ fontSize: 10, color: '#b0a090', marginTop: 2 }}>
                      Tap to select from gallery
                    </Text>
                  )}
                </View>

                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Full Name *</Text>
                <TextInput
                  value={fullName} onChangeText={setFullName}
                  placeholder="John Doe" placeholderTextColor="#b0a090"
                  className={inputCls}
                />

                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Email Address *</Text>
                <TextInput
                  value={email} onChangeText={setEmail}
                  placeholder="john@example.com" placeholderTextColor="#b0a090"
                  keyboardType="email-address" autoCapitalize="none"
                  className={inputCls}
                />

                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Location *</Text>
                <TextInput
                  value={location} onChangeText={setLocation}
                  placeholder="City, Country" placeholderTextColor="#b0a090"
                  className={inputCls}
                />

                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Current Role *</Text>
                <TextInput
                  value={currentRole} onChangeText={setCurrentRole}
                  placeholder="Software Engineer @ Company" placeholderTextColor="#b0a090"
                  className={inputCls}
                />
              </View>
            )}

            {/* ── Step 2: Professional Details ── */}
            {formStep === 2 && (
              <View>
                <Text className="text-xl font-black text-[#4a3728] mb-5">Professional Details</Text>

                <Text className="text-xs font-bold text-[#4a3728] mb-2">
                  Select Domain(s) *{' '}
                  <Text className="text-[#b0a090] font-normal">(choose 1–5)</Text>
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {DOMAINS.map(({ label, value }) => {
                    const selected = selectedDomains.includes(value);
                    return (
                      <TouchableOpacity
                        key={value}
                        activeOpacity={0.8}
                        onPress={() => {
                          if (selected) {
                            setSelectedDomains(prev => prev.filter(d => d !== value));
                          } else if (selectedDomains.length < 5) {
                            setSelectedDomains(prev => [...prev, value]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full border-2 ${selected ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-[#f8f6f4] border-[#ece7e2]'
                          }`}
                      >
                        <Text className={`text-[11px] font-bold ${selected ? 'text-white' : 'text-[#4a3728]'}`}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">
                  Skills *{' '}
                  <Text className="text-[#b0a090] font-normal">(comma-separated)</Text>
                </Text>
                <TextInput
                  value={skills} onChangeText={setSkills}
                  placeholder="React Native, TypeScript, Node.js"
                  placeholderTextColor="#b0a090"
                  className={inputCls}
                />

                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Years of Experience *</Text>
                <TextInput
                  value={experienceYears} onChangeText={setExperienceYears}
                  placeholder="e.g. 5" placeholderTextColor="#b0a090"
                  keyboardType="numeric" className={inputCls}
                />

                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">
                  Bio / About You *{' '}
                  <Text className="text-[#b0a090] font-normal">(min 50 chars)</Text>
                </Text>
                <TextInput
                  value={bio} onChangeText={setBio}
                  placeholder="Tell us about your journey, achievements, and passion... (at least 50 characters)"
                  placeholderTextColor="#b0a090"
                  multiline numberOfLines={5} textAlignVertical="top"
                  className={`${inputCls} h-28`}
                />
                <Text className={`text-[10px] -mt-2 mb-3 ${bio.length >= 50 ? 'text-[#4a3728]' : 'text-[#b0a090]'}`}>
                  {bio.length}/50 minimum
                </Text>
              </View>
            )}

            {/* ── Step 3: Terms & Submit ── */}
            {formStep === 3 && (
              <View>
                <Text className="text-xl font-black text-[#4a3728] mb-5">Terms & Conditions</Text>
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">
                  Why do you want to become a mentor?
                </Text>
                <TextInput
                  value={motivation} onChangeText={setMotivation}
                  placeholder="Share your motivation and goals..."
                  placeholderTextColor="#b0a090"
                  multiline numberOfLines={4} textAlignVertical="top"
                  className={`${inputCls} h-24`}
                />
                {[
                  { val: agree1, set: setAgree1 },
                  { val: agree2, set: setAgree2 },
                ].map(({ val, set }, i) => (
                  <TouchableOpacity
                    key={i} onPress={() => set(!val)} activeOpacity={0.8}
                    className="flex-row items-start gap-x-3 bg-[#f8f6f4] border border-[#ece7e2] rounded-2xl p-4 mb-3"
                  >
                    <View
                      className={`w-5 h-5 rounded border-2 items-center justify-center mt-0.5 ${val ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-gray-300'
                        }`}
                    >
                      {val && <Text className="text-white text-xs font-bold">✓</Text>}
                    </View>
                    <Text className="text-xs text-slate-600 font-medium flex-1 leading-4">
                      I agree to the terms and conditions and confirm that all information provided is accurate.
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* ── Footer: Back / Next / Submit ── */}
            <View className="flex-row items-center justify-between pt-4 border-t border-[#ece7e2] mt-4 mb-2">
              <View className="flex-row gap-x-2">
                {formStep > 1 && (
                  <TouchableOpacity
                    onPress={() => setFormStep(s => s - 1)}
                    activeOpacity={0.8}
                    className="px-5 py-3 bg-[#f8f6f4] rounded-2xl"
                  >
                    <Text className="text-[#4a3728] font-bold text-sm">Back</Text>
                  </TouchableOpacity>
                )}
              </View>

              {formStep < 3 ? (
                <TouchableOpacity
                  onPress={handleNextStep}
                  activeOpacity={0.85}
                  className="px-6 py-3 bg-[#4a3728] rounded-2xl flex-row items-center gap-x-2"
                >
                  <Text className="text-white font-bold text-sm">Next Step</Text>
                  <ArrowRight size={14} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                  className="px-6 py-3 bg-[#4a3728] rounded-2xl flex-row items-center gap-x-2"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text className="text-white font-bold text-sm">Submit Application</Text>
                      <CheckCircle2 size={14} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default BecomeMentorModal;
