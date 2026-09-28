import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Ban,
  Upload,
  FileText,
  Image as ImageIcon,
  Plus,
  X,
  Award,
  Sparkles,
  Shield,
  Briefcase,
  GraduationCap,
  ChevronDown,
} from 'lucide-react-native';
import SeniorMentorService, {
  SeniorMentorApplication,
} from '../../../services/senior-mentor.service';

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  dark: '#4a3728',
  mid: '#7a5c3e',
  light: '#8b7355',
  bg: '#FAF9F6',
  cardBg: '#FFFFFF',
  border: '#e8ddd5',
  borderDark: '#d4c4b5',
  gold: '#c9932a',
  textMuted: '#6b7280',
  emerald: '#15803d',
  emeraldBg: '#dcfce7',
  amber: '#b45309',
  amberBg: '#fef3c7',
  blue: '#1d4ed8',
  blueBg: '#dbeafe',
  red: '#b91c1c',
  redBg: '#fee2e2',
};

// ── Enums & Constants matching Web & Backend ─────────────────────────────────
export const EXPERIENCE_LEVELS = [
  { label: 'Junior Level', value: 'junior' },
  { label: 'Mid Level', value: 'mid' },
  { label: 'Senior Level', value: 'senior' },
  { label: 'Lead Level', value: 'lead' },
  { label: 'Principal Level', value: 'principal' },
  { label: 'Architect Level', value: 'architect' },
];

export const DOMAINS = [
  { label: 'Web Development', value: 'web_development' },
  { label: 'Mobile Development', value: 'mobile_development' },
  { label: 'Data Science', value: 'data_science' },
  { label: 'Machine Learning', value: 'machine_learning' },
  { label: 'DevOps & SRE', value: 'devops' },
  { label: 'Cloud Computing', value: 'cloud_computing' },
  { label: 'Cybersecurity', value: 'cybersecurity' },
  { label: 'Blockchain', value: 'blockchain' },
  { label: 'UI/UX Design', value: 'ui_ux_design' },
  { label: 'Product Management', value: 'product_management' },
  { label: 'Digital Marketing', value: 'digital_marketing' },
  { label: 'Business Analytics', value: 'business_analytics' },
  { label: 'Career Guidance', value: 'career_guidance' },
  { label: 'Interview Preparation', value: 'interview_prep' },
  { label: 'Leadership & Management', value: 'leadership' },
];

export const HELP_AREAS = [
  { id: 'dsa_problem_solving', label: 'DSA & Problem Solving', desc: 'Algorithms, data structures & contest prep' },
  { id: 'development_coding', label: 'Development & Coding', desc: 'Fullstack, mobile, frontend & backend architecture' },
  { id: 'project_guidance', label: 'Project Guidance', desc: 'Production-grade code reviews and architecture' },
  { id: 'resume_linkedin', label: 'Resume & LinkedIn Review', desc: 'ATS optimization and profile positioning' },
  { id: 'interview_preparation', label: 'Interview Preparation', desc: 'Mock technical & behavioral interview rounds' },
  { id: 'placement_preparation', label: 'Placement Preparation', desc: 'Campus & off-campus recruitment strategy' },
  { id: 'career_guidance', label: 'Career Guidance', desc: 'Roadmaps, salary negotiation & role switches' },
];

const STEPS = [
  { id: 1, title: 'Profile' },
  { id: 2, title: 'Professional' },
  { id: 3, title: 'Skills' },
  { id: 4, title: 'Motivation' },
  { id: 5, title: 'Verification' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:      { label: 'Application Pending',     color: C.amber,   bg: C.amberBg,   icon: Clock },
  under_review: { label: 'Under Review',            color: C.blue,    bg: C.blueBg,    icon: Clock },
  verified:     { label: 'Verified Senior Mentor',  color: C.emerald, bg: C.emeraldBg, icon: CheckCircle2 },
  approved:     { label: 'Approved Senior Mentor',  color: C.emerald, bg: C.emeraldBg, icon: CheckCircle2 },
  rejected:     { label: 'Application Rejected',    color: C.red,     bg: C.redBg,     icon: XCircle },
  withdrawn:    { label: 'Application Withdrawn',   color: '#6b7280', bg: '#f3f4f6',   icon: Ban },
};

// ── Main Component ────────────────────────────────────────────────────────────
export const SeniorMentorApplicationScreen: React.FC<{
  onBack?: () => void;
  isEmbedded?: boolean;
}> = ({ onBack, isEmbedded = false }) => {
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = useState(1);
  const [existingApplication, setExistingApplication] = useState<SeniorMentorApplication | null>(null);
  const [isLoadingInit, setIsLoadingInit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  // Pickers modal state
  const [showExpPicker, setShowExpPicker] = useState(false);
  const [showDomainPicker, setShowDomainPicker] = useState(false);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Basic Profile
    fullName: '',
    profilePhotoFile: null as { uri: string; name?: string; type?: string } | null,
    college: '',
    degree: '',
    fieldOfStudy: '',
    graduationYear: '',
    currentRole: '',
    currentCompany: '',
    shortBio: '',

    // Step 2: Professional Information
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    yearsOfExperience: '',
    experienceLevel: 'senior',
    primaryExpertise: 'web_development',

    // Step 3: Skills & Mentorship
    technologies: [] as string[],
    otherSkills: [] as string[],
    achievements: [] as string[],
    certifications: [] as string[],
    helpAreas: [] as string[],

    // Step 4: Motivation
    motivation: '',
    adviceToJuniorSelf: '',

    // Step 5: Verification
    resumeFile: null as { uri: string; name?: string; type?: string; size?: number } | null,
    proofDocumentFile: null as { uri: string; name?: string; type?: string; size?: number } | null,
  });

  // Tag inputs temporary text
  const [techInput, setTechInput] = useState('');
  const [otherSkillsInput, setOtherSkillsInput] = useState('');
  const [achievementsInput, setAchievementsInput] = useState('');
  const [certInput, setCertInput] = useState('');

  // ── Fetch existing application on mount ────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      setIsLoadingInit(true);
      const res = await SeniorMentorService.getMyApplication();
      const app = res?.data ?? res ?? null;
      if (app && app.verificationStatus) {
        setExistingApplication(app);
      } else if (app && app.status) {
        setExistingApplication({ ...app, verificationStatus: app.status });
      } else {
        setExistingApplication(null);
      }
    } catch {
      setExistingApplication(null);
    } finally {
      setIsLoadingInit(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleBackNavigation = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Mentorship');
    }
  };

  // ── Tag Handlers ────────────────────────────────────────────────────────────
  const addTag = (
    field: 'technologies' | 'otherSkills' | 'achievements' | 'certifications',
    value: string,
    clearFn: (v: string) => void
  ) => {
    const trimmed = value.trim();
    if (trimmed && !form[field].includes(trimmed)) {
      setForm((prev) => ({ ...prev, [field]: [...prev[field], trimmed] }));
      clearFn('');
    }
  };

  const removeTag = (
    field: 'technologies' | 'otherSkills' | 'achievements' | 'certifications',
    tagToRemove: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((t) => t !== tagToRemove),
    }));
  };

  const toggleHelpArea = (areaId: string) => {
    setForm((prev) => {
      const exists = prev.helpAreas.includes(areaId);
      if (exists) {
        return { ...prev, helpAreas: prev.helpAreas.filter((a) => a !== areaId) };
      }
      if (prev.helpAreas.length >= 7) {
        Alert.alert('Limit Reached', 'You can select up to 7 help areas.');
        return prev;
      }
      return { ...prev, helpAreas: [...prev.helpAreas, areaId] };
    });
  };

  // ── File Pickers ───────────────────────────────────────────────────────────
  const pickProfilePhoto = async () => {
    try {
      const { launchImageLibrary } = require('react-native-image-picker');
      launchImageLibrary(
        { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
        (res: any) => {
          if (!res.didCancel && res.assets && res.assets.length > 0) {
            const asset = res.assets[0];
            setForm((prev) => ({
              ...prev,
              profilePhotoFile: {
                uri: asset.uri,
                name: asset.fileName || 'profile_photo.jpg',
                type: asset.type || 'image/jpeg',
              },
            }));
          }
        }
      );
    } catch {
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  const pickResume = async () => {
    try {
      const DocumentPicker = require('react-native-document-picker').default;
      const res = await DocumentPicker.pickSingle({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
        ],
      });
      setForm((prev) => ({
        ...prev,
        resumeFile: {
          uri: res.uri,
          name: res.name || 'resume.pdf',
          type: res.type || 'application/pdf',
          size: res.size,
        },
      }));
    } catch (err: any) {
      const DocumentPicker = require('react-native-document-picker').default;
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick resume document.');
      }
    }
  };

  const pickProofDocument = async () => {
    try {
      const DocumentPicker = require('react-native-document-picker').default;
      const res = await DocumentPicker.pickSingle({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.images,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
        ],
      });
      setForm((prev) => ({
        ...prev,
        proofDocumentFile: {
          uri: res.uri,
          name: res.name || 'proof.pdf',
          type: res.type || 'application/pdf',
          size: res.size,
        },
      }));
    } catch (err: any) {
      const DocumentPicker = require('react-native-document-picker').default;
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick proof document.');
      }
    }
  };

  // ── Step Validation & Navigation ───────────────────────────────────────────
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!form.fullName.trim()) {
        Alert.alert('Validation', 'Please enter your full name.');
        return false;
      }
      if (!form.graduationYear || isNaN(Number(form.graduationYear))) {
        Alert.alert('Validation', 'Please enter a valid graduation year (e.g. 2022).');
        return false;
      }
      if (!form.college.trim()) {
        Alert.alert('Validation', 'Please enter your college / university name.');
        return false;
      }
      if (!form.degree.trim()) {
        Alert.alert('Validation', 'Please enter your degree (e.g. B.Tech, M.S.).');
        return false;
      }
      if (!form.fieldOfStudy.trim()) {
        Alert.alert('Validation', 'Please enter your field of study.');
        return false;
      }
      if (!form.currentRole.trim()) {
        Alert.alert('Validation', 'Please enter your current role / title.');
        return false;
      }
      if (!form.currentCompany.trim()) {
        Alert.alert('Validation', 'Please enter your current company.');
        return false;
      }
      if (form.shortBio.trim().length < 50) {
        Alert.alert('Validation', 'Short bio must be at least 50 characters.');
        return false;
      }
    } else if (step === 2) {
      if (!form.linkedinUrl.trim()) {
        Alert.alert('Validation', 'Please enter your LinkedIn profile URL.');
        return false;
      }
      if (!/^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(form.linkedinUrl.trim())) {
        Alert.alert('Validation', 'Please enter a valid LinkedIn URL (https://linkedin.com/in/...).');
        return false;
      }
      if (!form.yearsOfExperience || isNaN(Number(form.yearsOfExperience))) {
        Alert.alert('Validation', 'Please enter your years of experience.');
        return false;
      }
    } else if (step === 3) {
      if (form.helpAreas.length === 0) {
        Alert.alert('Validation', 'Please select at least 1 mentorship help area.');
        return false;
      }
    } else if (step === 4) {
      if (form.motivation.trim().length < 30) {
        Alert.alert('Validation', 'Motivation statement must be at least 30 characters.');
        return false;
      }
      if (form.adviceToJuniorSelf.trim().length < 10) {
        Alert.alert('Validation', 'Advice to junior self must be at least 10 characters.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // ── Final Submission ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }
    if (!form.resumeFile) {
      Alert.alert('Validation', 'Please upload your Resume / CV.');
      return;
    }
    if (!form.proofDocumentFile) {
      Alert.alert('Validation', 'Please upload proof of experience (offer letter, ID, or certificate).');
      return;
    }

    setIsSubmitting(true);
    try {
      await SeniorMentorService.apply({
        fullName: form.fullName.trim(),
        college: form.college.trim(),
        degree: form.degree.trim(),
        fieldOfStudy: form.fieldOfStudy.trim(),
        graduationYear: parseInt(form.graduationYear, 10),
        currentRole: form.currentRole.trim(),
        currentCompany: form.currentCompany.trim(),
        shortBio: form.shortBio.trim(),
        linkedinUrl: form.linkedinUrl.trim(),
        githubUrl: form.githubUrl.trim() || undefined,
        portfolioUrl: form.portfolioUrl.trim() || undefined,
        yearsOfExperience: parseFloat(form.yearsOfExperience),
        experienceLevel: form.experienceLevel,
        primaryExpertise: form.primaryExpertise,
        technologies: form.technologies,
        otherSkills: form.otherSkills,
        achievements: form.achievements,
        certifications: form.certifications,
        helpAreas: form.helpAreas,
        motivation: form.motivation.trim(),
        adviceToJuniorSelf: form.adviceToJuniorSelf.trim(),
        profilePhotoFile: form.profilePhotoFile || undefined,
        resumeFile: form.resumeFile,
        proofDocumentFile: form.proofDocumentFile,
      });

      setSuccessSubmitted(true);
    } catch (err: any) {
      Alert.alert('Application Failed', err?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Withdraw Flow ───────────────────────────────────────────────────────────
  const handleWithdraw = () => {
    Alert.alert('Withdraw Application', 'Are you sure you want to withdraw your Senior Mentor application?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          try {
            await SeniorMentorService.withdrawMyApplication();
            Alert.alert('Withdrawn', 'Your application has been withdrawn.');
            fetchStatus();
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Could not withdraw application.');
          }
        },
      },
    ]);
  };

  // ── Loading Screen ──────────────────────────────────────────────────────────
  if (isLoadingInit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <ActivityIndicator size="large" color={C.dark} />
        <Text style={{ marginTop: 14, fontSize: 14, fontWeight: '600', color: C.mid }}>
          Loading Senior Mentor Application…
        </Text>
      </SafeAreaView>
    );
  }

  // ── Success View ────────────────────────────────────────────────────────────
  if (successSubmitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: C.emeraldBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              borderWidth: 2,
              borderColor: C.emerald + '40',
            }}
          >
            <CheckCircle2 size={48} color={C.emerald} />
          </View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: C.dark, textAlign: 'center', marginBottom: 10 }}>
            Application Submitted!
          </Text>
          <Text style={{ fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22, maxWidth: 320, marginBottom: 28 }}>
            Your Senior Mentor application has been submitted successfully and is currently pending review. We will notify you once our team reviews your credentials.
          </Text>
          <TouchableOpacity
            onPress={handleBackNavigation}
            activeOpacity={0.85}
            style={{
              backgroundColor: C.dark,
              paddingHorizontal: 28,
              paddingVertical: 14,
              borderRadius: 14,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Return to Mentorship</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Existing Application Status Screen ──────────────────────────────────────
  if (existingApplication && existingApplication.verificationStatus !== 'rejected' && existingApplication.verificationStatus !== 'withdrawn') {
    const statusKey = existingApplication.verificationStatus || (existingApplication as any).status || 'pending';
    const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border }}>
          <TouchableOpacity onPress={handleBackNavigation} style={{ padding: 6, marginRight: 8 }}>
            <ArrowLeft size={22} color={C.dark} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '800', color: C.dark }}>Senior Mentor Application</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {/* Dark Hero Banner */}
          <View style={{ backgroundColor: '#2d1f14', borderRadius: 24, padding: 22, marginBottom: 16, borderWidth: 1, borderColor: '#4a3728' }}>
            <View style={{ backgroundColor: C.gold, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>Exclusive Tier</Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 6 }}>Senior Mentor Programme</Text>
            <Text style={{ fontSize: 13, color: '#c8b8a8', lineHeight: 20 }}>
              Your application is active and under review by our executive team.
            </Text>
          </View>

          {/* Status Badge Card */}
          <View style={{ backgroundColor: cfg.bg, borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16, borderWidth: 1, borderColor: cfg.color + '40' }}>
            <StatusIcon size={26} color={cfg.color} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: cfg.color }}>{cfg.label}</Text>
              <Text style={{ fontSize: 12, color: cfg.color + 'cc', marginTop: 3 }}>
                Submitted on {new Date(existingApplication.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Application Details Summary */}
          <View style={{ backgroundColor: C.cardBg, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.dark, marginBottom: 14 }}>Application Summary</Text>

            {[
              { label: 'Full Name', value: existingApplication.fullName },
              { label: 'Current Role', value: existingApplication.currentRole },
              { label: 'Company', value: existingApplication.currentCompany },
              { label: 'College', value: existingApplication.college },
              { label: 'Experience', value: `${existingApplication.yearsOfExperience} years` },
              { label: 'Expertise', value: existingApplication.primaryExpertise?.replace(/_/g, ' ').toUpperCase() },
            ].filter((r) => r.value).map(({ label, value }) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#f5f0eb' }}>
                <Text style={{ fontSize: 13, color: C.light, fontWeight: '500' }}>{label}</Text>
                <Text style={{ fontSize: 13, color: C.dark, fontWeight: '700', maxWidth: '55%', textAlign: 'right' }}>{value}</Text>
              </View>
            ))}

            {existingApplication.helpAreas?.length > 0 && (
              <View style={{ marginTop: 14 }}>
                <Text style={{ fontSize: 12, color: C.light, fontWeight: '600', marginBottom: 8 }}>Help Areas</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {existingApplication.helpAreas.map((area: string) => {
                    const match = HELP_AREAS.find((h) => h.id === area);
                    return (
                      <View key={area} style={{ backgroundColor: '#f5f0eb', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: C.mid }}>
                          {match ? match.label : area.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Withdraw Button */}
          {(statusKey === 'pending' || statusKey === 'under_review') && (
            <TouchableOpacity
              onPress={handleWithdraw}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#fff',
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#fca5a5',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.red }}>Withdraw Application</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Form Header Stepper ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Top Bar */}
      {!isEmbedded && (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border }}>
          <TouchableOpacity onPress={handleBackNavigation} style={{ padding: 6, marginRight: 8 }}>
            <ArrowLeft size={22} color={C.dark} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: C.dark }}>Become a Senior Mentor</Text>
            <Text style={{ fontSize: 11, color: C.light, fontWeight: '600' }}>Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].title}</Text>
          </View>
        </View>
      )}

      {/* Stepper Progress Indicator */}
      <View style={{ backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          {STEPS.map((s) => {
            const isCurrent = s.id === currentStep;
            const isPast = s.id < currentStep;
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => {
                  if (s.id < currentStep) setCurrentStep(s.id);
                }}
                style={{ alignItems: 'center', flex: 1 }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCurrent ? C.dark : isPast ? C.emerald : '#f3f4f6',
                    borderWidth: isCurrent ? 2 : 1,
                    borderColor: isCurrent ? C.gold : isPast ? C.emerald : '#d1d5db',
                    marginBottom: 4,
                  }}
                >
                  {isPast ? (
                    <Check size={14} color="#fff" />
                  ) : (
                    <Text style={{ fontSize: 12, fontWeight: '800', color: isCurrent ? '#fff' : '#6b7280' }}>
                      {s.id}
                    </Text>
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 10,
                    fontWeight: isCurrent ? '800' : '600',
                    color: isCurrent ? C.dark : '#9ca3af',
                  }}
                >
                  {s.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Progress Line */}
        <View style={{ height: 4, backgroundColor: '#f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
          <View
            style={{
              height: '100%',
              backgroundColor: C.gold,
              width: `${(currentStep / STEPS.length) * 100}%`,
              borderRadius: 2,
            }}
          />
        </View>
      </View>

      {/* Main Content Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {/* Rejection Notice if re-applying */}
          {existingApplication && existingApplication.verificationStatus === 'rejected' && currentStep === 1 && (
            <View style={{ backgroundColor: C.redBg, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#fca5a5' }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: C.red, marginBottom: 4 }}>Previous Application Note</Text>
              <Text style={{ fontSize: 12, color: '#4b5563', lineHeight: 18 }}>
                {existingApplication.rejectionReason || 'Your previous submission required revisions. Please review all fields and re-submit.'}
              </Text>
            </View>
          )}

          {/* ──────────────── STEP 1: Basic Profile ──────────────── */}
          {currentStep === 1 && (
            <View style={{ backgroundColor: C.cardBg, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: C.dark, marginBottom: 4 }}>Basic Profile</Text>
              <Text style={{ fontSize: 12, color: C.textMuted, marginBottom: 18 }}>Personal and academic background</Text>

              {/* Profile Photo */}
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={pickProfilePhoto}
                  activeOpacity={0.8}
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 44,
                    backgroundColor: '#f5f0eb',
                    borderWidth: 2,
                    borderColor: C.borderDark,
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {form.profilePhotoFile ? (
                    <Image source={{ uri: form.profilePhotoFile.uri }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <ImageIcon size={28} color={C.light} />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: C.mid, marginTop: 4 }}>Upload</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>Profile Photo (JPG, PNG • Max 5MB)</Text>
              </View>

              {/* Full Name */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Full Name *</Text>
              <TextInput
                value={form.fullName}
                onChangeText={(t) => setForm((p) => ({ ...p, fullName: t }))}
                placeholder="e.g. Alex Henderson"
                placeholderTextColor="#9ca3af"
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: C.dark,
                  marginBottom: 14,
                }}
              />

              {/* Graduation Year */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Graduation Year *</Text>
              <TextInput
                value={form.graduationYear}
                onChangeText={(t) => setForm((p) => ({ ...p, graduationYear: t }))}
                placeholder="e.g. 2022"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: C.dark,
                  marginBottom: 14,
                }}
              />

              {/* College / University */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>College / University *</Text>
              <TextInput
                value={form.college}
                onChangeText={(t) => setForm((p) => ({ ...p, college: t }))}
                placeholder="e.g. Stanford University"
                placeholderTextColor="#9ca3af"
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: C.dark,
                  marginBottom: 14,
                }}
              />

              {/* Degree */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Degree *</Text>
              <TextInput
                value={form.degree}
                onChangeText={(t) => setForm((p) => ({ ...p, degree: t }))}
                placeholder="e.g. B.Tech / B.S. in Computer Science"
                placeholderTextColor="#9ca3af"
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: C.dark,
                  marginBottom: 14,
                }}
              />

              {/* Field of Study */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Field of Study *</Text>
              <TextInput
                value={form.fieldOfStudy}
                onChangeText={(t) => setForm((p) => ({ ...p, fieldOfStudy: t }))}
                placeholder="e.g. Computer Science & Engineering"
                placeholderTextColor="#9ca3af"
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: C.dark,
                  marginBottom: 14,
                }}
              />

              {/* Current Role */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Current Role *</Text>
              <TextInput
                value={form.currentRole}
                onChangeText={(t) => setForm((p) => ({ ...p, currentRole: t }))}
                placeholder="e.g. Staff Software Engineer"
                placeholderTextColor="#9ca3af"
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: C.dark,
                  marginBottom: 14,
                }}
              />

              {/* Current Company */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Current Company *</Text>
              <TextInput
                value={form.currentCompany}
                onChangeText={(t) => setForm((p) => ({ ...p, currentCompany: t }))}
                placeholder="e.g. Google, Microsoft, Throne8"
                placeholderTextColor="#9ca3af"
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: C.dark,
                  marginBottom: 14,
                }}
              />

              {/* Short Bio */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark }}>Short Bio *</Text>
                <Text style={{ fontSize: 11, color: form.shortBio.length < 50 ? C.red : C.textMuted }}>
                  {form.shortBio.length} / 1000 (min 50)
                </Text>
              </View>
              <TextInput
                value={form.shortBio}
                onChangeText={(t) => setForm((p) => ({ ...p, shortBio: t }))}
                placeholder="Briefly describe your background, career trajectory, and expertise..."
                placeholderTextColor="#9ca3af"
                multiline
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 13,
                  color: C.dark,
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
              />
            </View>
          )}

          {/* ──────────────── STEP 2: Professional Information ──────────────── */}
          {currentStep === 2 && (
            <View style={{ backgroundColor: C.cardBg, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: C.dark, marginBottom: 4 }}>Professional Information</Text>
              <Text style={{ fontSize: 12, color: C.textMuted, marginBottom: 18 }}>Online presence and expertise level</Text>

              {/* LinkedIn URL */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>LinkedIn URL *</Text>
              <TextInput
                value={form.linkedinUrl}
                onChangeText={(t) => setForm((p) => ({ ...p, linkedinUrl: t }))}
                placeholder="https://linkedin.com/in/username"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: C.dark,
                  marginBottom: 14,
                }}
              />

              {/* GitHub URL */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>GitHub URL (Optional)</Text>
              <TextInput
                value={form.githubUrl}
                onChangeText={(t) => setForm((p) => ({ ...p, githubUrl: t }))}
                placeholder="https://github.com/username"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: C.dark,
                  marginBottom: 14,
                }}
              />

              {/* Portfolio URL */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Portfolio URL (Optional)</Text>
              <TextInput
                value={form.portfolioUrl}
                onChangeText={(t) => setForm((p) => ({ ...p, portfolioUrl: t }))}
                placeholder="https://yourportfolio.com"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: C.dark,
                  marginBottom: 14,
                }}
              />

              {/* Years of Experience */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Years of Experience *</Text>
              <TextInput
                value={form.yearsOfExperience}
                onChangeText={(t) => setForm((p) => ({ ...p, yearsOfExperience: t }))}
                placeholder="e.g. 5"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: C.dark,
                  marginBottom: 14,
                }}
              />

              {/* Experience Level */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Experience Level *</Text>
              <TouchableOpacity
                onPress={() => setShowExpPicker(true)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.dark }}>
                  {EXPERIENCE_LEVELS.find((e) => e.value === form.experienceLevel)?.label || 'Select Level'}
                </Text>
                <ChevronDown size={18} color={C.light} />
              </TouchableOpacity>

              {/* Primary Expertise */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Primary Expertise *</Text>
              <TouchableOpacity
                onPress={() => setShowDomainPicker(true)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.dark }}>
                  {DOMAINS.find((d) => d.value === form.primaryExpertise)?.label || 'Select Domain'}
                </Text>
                <ChevronDown size={18} color={C.light} />
              </TouchableOpacity>
            </View>
          )}

          {/* ──────────────── STEP 3: Skills & Mentorship ──────────────── */}
          {currentStep === 3 && (
            <View style={{ backgroundColor: C.cardBg, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: C.dark, marginBottom: 4 }}>Skills & Mentorship Areas</Text>
              <Text style={{ fontSize: 12, color: C.textMuted, marginBottom: 18 }}>Select your focus areas and top skills</Text>

              {/* Technologies */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Technologies</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <TextInput
                  value={techInput}
                  onChangeText={setTechInput}
                  placeholder="e.g. React Native, Node.js, AWS"
                  placeholderTextColor="#9ca3af"
                  style={{
                    flex: 1,
                    backgroundColor: '#f9f6f3',
                    borderWidth: 1,
                    borderColor: C.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    fontSize: 13,
                    color: C.dark,
                  }}
                />
                <TouchableOpacity
                  onPress={() => addTag('technologies', techInput, setTechInput)}
                  style={{ backgroundColor: C.light, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Add</Text>
                </TouchableOpacity>
              </View>
              {form.technologies.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {form.technologies.map((t) => (
                    <View key={t} style={{ backgroundColor: '#f5f0eb', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: C.dark }}>{t}</Text>
                      <TouchableOpacity onPress={() => removeTag('technologies', t)}>
                        <X size={13} color={C.light} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Other Skills */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Other Skills</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <TextInput
                  value={otherSkillsInput}
                  onChangeText={setOtherSkillsInput}
                  placeholder="e.g. System Design, Agile, Microservices"
                  placeholderTextColor="#9ca3af"
                  style={{
                    flex: 1,
                    backgroundColor: '#f9f6f3',
                    borderWidth: 1,
                    borderColor: C.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    fontSize: 13,
                    color: C.dark,
                  }}
                />
                <TouchableOpacity
                  onPress={() => addTag('otherSkills', otherSkillsInput, setOtherSkillsInput)}
                  style={{ backgroundColor: C.light, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Add</Text>
                </TouchableOpacity>
              </View>
              {form.otherSkills.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {form.otherSkills.map((t) => (
                    <View key={t} style={{ backgroundColor: '#f5f0eb', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: C.dark }}>{t}</Text>
                      <TouchableOpacity onPress={() => removeTag('otherSkills', t)}>
                        <X size={13} color={C.light} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Achievements */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Achievements (Optional)</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <TextInput
                  value={achievementsInput}
                  onChangeText={setAchievementsInput}
                  placeholder="e.g. Top Engineer 2024, Hackathon Winner"
                  placeholderTextColor="#9ca3af"
                  style={{
                    flex: 1,
                    backgroundColor: '#f9f6f3',
                    borderWidth: 1,
                    borderColor: C.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    fontSize: 13,
                    color: C.dark,
                  }}
                />
                <TouchableOpacity
                  onPress={() => addTag('achievements', achievementsInput, setAchievementsInput)}
                  style={{ backgroundColor: C.light, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Add</Text>
                </TouchableOpacity>
              </View>
              {form.achievements.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {form.achievements.map((t) => (
                    <View key={t} style={{ backgroundColor: '#f5f0eb', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: C.dark }}>{t}</Text>
                      <TouchableOpacity onPress={() => removeTag('achievements', t)}>
                        <X size={13} color={C.light} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Certifications */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Certifications (Optional)</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <TextInput
                  value={certInput}
                  onChangeText={setCertInput}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  placeholderTextColor="#9ca3af"
                  style={{
                    flex: 1,
                    backgroundColor: '#f9f6f3',
                    borderWidth: 1,
                    borderColor: C.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    fontSize: 13,
                    color: C.dark,
                  }}
                />
                <TouchableOpacity
                  onPress={() => addTag('certifications', certInput, setCertInput)}
                  style={{ backgroundColor: C.light, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Add</Text>
                </TouchableOpacity>
              </View>
              {form.certifications.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {form.certifications.map((t) => (
                    <View key={t} style={{ backgroundColor: '#f5f0eb', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: C.dark }}>{t}</Text>
                      <TouchableOpacity onPress={() => removeTag('certifications', t)}>
                        <X size={13} color={C.light} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Help Areas Selection */}
              <View style={{ marginTop: 10, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: C.dark }}>Help Areas (Select 1 to 7) *</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: form.helpAreas.length > 0 ? C.light : C.red }}>
                    {form.helpAreas.length}/7 Selected
                  </Text>
                </View>

                {HELP_AREAS.map((area) => {
                  const selected = form.helpAreas.includes(area.id);
                  return (
                    <TouchableOpacity
                      key={area.id}
                      onPress={() => toggleHelpArea(area.id)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: selected ? '#8b735515' : '#fafafa',
                        borderRadius: 14,
                        padding: 12,
                        marginBottom: 8,
                        borderWidth: 1.5,
                        borderColor: selected ? C.light : '#e5e7eb',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          backgroundColor: selected ? C.dark : '#fff',
                          borderWidth: selected ? 0 : 1.5,
                          borderColor: '#d1d5db',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {selected && <Check size={14} color="#fff" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: selected ? C.dark : '#374151' }}>
                          {area.label}
                        </Text>
                        <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{area.desc}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ──────────────── STEP 4: Motivation ──────────────── */}
          {currentStep === 4 && (
            <View style={{ backgroundColor: C.cardBg, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: C.dark, marginBottom: 4 }}>Motivation</Text>
              <Text style={{ fontSize: 12, color: C.textMuted, marginBottom: 18 }}>Share your mentoring passion and values</Text>

              {/* Motivation textarea */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark }}>
                  Why do you want to become a Senior Mentor? *
                </Text>
                <Text style={{ fontSize: 11, color: form.motivation.length < 30 ? C.red : C.textMuted }}>
                  {form.motivation.length} / 1000
                </Text>
              </View>
              <TextInput
                value={form.motivation}
                onChangeText={(t) => setForm((p) => ({ ...p, motivation: t }))}
                placeholder="Share what drives you to mentor, how you approach guiding learners, and why senior tier mentorship matters to you..."
                placeholderTextColor="#9ca3af"
                multiline
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 13,
                  color: C.dark,
                  minHeight: 120,
                  textAlignVertical: 'top',
                  marginBottom: 18,
                }}
              />

              {/* Advice to Junior Self textarea */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark }}>
                  One piece of advice you'd give your junior self? *
                </Text>
                <Text style={{ fontSize: 11, color: form.adviceToJuniorSelf.length < 10 ? C.red : C.textMuted }}>
                  {form.adviceToJuniorSelf.length} / 500
                </Text>
              </View>
              <TextInput
                value={form.adviceToJuniorSelf}
                onChangeText={(t) => setForm((p) => ({ ...p, adviceToJuniorSelf: t }))}
                placeholder="Share high-impact career wisdom or lessons learned early in your journey..."
                placeholderTextColor="#9ca3af"
                multiline
                style={{
                  backgroundColor: '#f9f6f3',
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 13,
                  color: C.dark,
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
              />
            </View>
          )}

          {/* ──────────────── STEP 5: Verification Documents ──────────────── */}
          {currentStep === 5 && (
            <View style={{ backgroundColor: C.cardBg, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: C.dark, marginBottom: 4 }}>Verification Documents</Text>
              <Text style={{ fontSize: 12, color: C.textMuted, marginBottom: 18 }}>Proof of experience and resume</Text>

              {/* Resume / CV Picker */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>Resume / CV *</Text>
              <TouchableOpacity
                onPress={pickResume}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#f9f6f3',
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: form.resumeFile ? C.emerald : C.borderDark,
                  borderStyle: form.resumeFile ? 'solid' : 'dashed',
                  padding: 16,
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <FileText size={32} color={form.resumeFile ? C.emerald : C.light} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginTop: 8 }}>
                  {form.resumeFile ? form.resumeFile.name : 'Tap to select Resume (PDF, DOC, DOCX)'}
                </Text>
                <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Max 5MB</Text>
              </TouchableOpacity>

              {/* Proof Document Picker */}
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 6 }}>
                Proof of Experience / Offer Letter / ID *
              </Text>
              <TouchableOpacity
                onPress={pickProofDocument}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#f9f6f3',
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: form.proofDocumentFile ? C.emerald : C.borderDark,
                  borderStyle: form.proofDocumentFile ? 'solid' : 'dashed',
                  padding: 16,
                  alignItems: 'center',
                  marginBottom: 18,
                }}
              >
                <Shield size={32} color={form.proofDocumentFile ? C.emerald : C.light} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginTop: 8 }}>
                  {form.proofDocumentFile ? form.proofDocumentFile.name : 'Tap to select Proof Document (PDF, JPG, PNG)'}
                </Text>
                <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Max 5MB</Text>
              </TouchableOpacity>

              {/* Disclaimer Notice */}
              <View style={{ backgroundColor: C.amberBg, borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: '#fde68a' }}>
                <AlertCircle size={18} color={C.amber} style={{ marginTop: 2 }} />
                <Text style={{ fontSize: 11, color: '#92400e', lineHeight: 17, flex: 1, fontWeight: '500' }}>
                  By submitting, you agree to our mentorship terms. All submitted documents are strictly encrypted and used solely for credential verification.
                </Text>
              </View>
            </View>
          )}

          {/* Navigation Buttons (Prev / Next / Submit) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            {currentStep > 1 ? (
              <TouchableOpacity
                onPress={handlePrev}
                style={{
                  paddingVertical: 13,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: C.borderDark,
                  backgroundColor: '#fff',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.dark }}>Previous</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}

            {currentStep < STEPS.length ? (
              <TouchableOpacity
                onPress={handleNext}
                activeOpacity={0.85}
                style={{
                  backgroundColor: C.dark,
                  paddingVertical: 13,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Next Step</Text>
                <ArrowRight size={16} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
                style={{
                  backgroundColor: C.dark,
                  paddingVertical: 13,
                  paddingHorizontal: 28,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Upload size={16} color="#fff" />
                )}
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                  {isSubmitting ? 'Submitting…' : 'Submit Application'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Experience Level Picker Modal */}
      <Modal visible={showExpPicker} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: C.dark }}>Select Experience Level</Text>
              <TouchableOpacity onPress={() => setShowExpPicker(false)}>
                <X size={20} color={C.mid} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {EXPERIENCE_LEVELS.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    setForm((p) => ({ ...p, experienceLevel: item.value }));
                    setShowExpPicker(false);
                  }}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: form.experienceLevel === item.value ? '800' : '500', color: form.experienceLevel === item.value ? C.dark : '#4b5563' }}>
                    {item.label}
                  </Text>
                  {form.experienceLevel === item.value && <Check size={18} color={C.dark} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Domain / Primary Expertise Picker Modal */}
      <Modal visible={showDomainPicker} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: C.dark }}>Select Primary Expertise</Text>
              <TouchableOpacity onPress={() => setShowDomainPicker(false)}>
                <X size={20} color={C.mid} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {DOMAINS.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    setForm((p) => ({ ...p, primaryExpertise: item.value }));
                    setShowDomainPicker(false);
                  }}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: form.primaryExpertise === item.value ? '800' : '500', color: form.primaryExpertise === item.value ? C.dark : '#4b5563' }}>
                    {item.label}
                  </Text>
                  {form.primaryExpertise === item.value && <Check size={18} color={C.dark} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SeniorMentorApplicationScreen;
