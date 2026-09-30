import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';

import ProgressSteps from '../../components/ProgressSteps';
import CreateAccount from '../../components/CreateAccount';
import PersonalDetails from '../../components/PersonalDetails';
import CurrentStatus from '../../components/CurrentStatus';
import WorkingJobDetails from '../../components/WorkingJobDetails';
import StudentEducation from '../../components/StudentEducation';
import FresherEducationRole from '../../components/FresherEducationRole';
import Skills from '../../components/Skills';
import SocialButtons from '../../components/SocialButtons';
import { AuthStackParamList, AppStackParamlist } from '../../types/Types'; // adjust path
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AuthService from '../../../../services/auth.service';
import { useAuth } from '../../../../store/hooks/useAuth';

// ── TODO: Uncomment when Redux store is ready ─────────────────────────────────
// import { useRegister } from '@/store/hooks/useRegister';

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  location: string;
  status: string;
  userType: string;
  jobTitle?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string;
  collegeName?: string;
  degree?: string;
  fieldOfStudy?: string;
  graduationYear?: string;
  highestEducation?: string;
  preferredRole?: string;
  cgpa?: string;
  skills?: string[];
}


// old code: SignupScreen accepted setIsLoggedIn prop
// type SignupScreenNavigationProp = NativeStackScreenProps<AuthStackParamList, 'Signup'> & {
//   setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
// };
// const SignupScreen: React.FC<SignupScreenNavigationProp> = ({ navigation, setIsLoggedIn }) => {

// ✅ new code: no setIsLoggedIn prop — Redux handles it
type SignupScreenNavigationProp = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

const SignupScreen = ({ navigation, route }: SignupScreenNavigationProp) => {

  const isGoogleOnboarding = route.params?.isGoogleOnboarding || false;
  const googleIdToken = route.params?.idToken || '';
  const initialGoogleData = route.params?.initialData || {};

  // ✅ Redux auth hook
  const { register: reduxRegister, setLoggedIn } = useAuth();

  // ── Local state (mirrors Redux shape) ────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(isGoogleOnboarding ? 2 : 1);
  const [formData, setFormData] = useState<Partial<RegistrationData>>(initialGoogleData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.isGoogleOnboarding) {
      setCurrentStep(2);
      if (route.params.initialData) {
        setFormData((prev) => ({ ...prev, ...route.params?.initialData }));
      }
    }
  }, [route.params?.isGoogleOnboarding, route.params?.idToken]);

  const saveFormData = (stepData: any) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  const goNext = () => setCurrentStep((prev) => prev + 1);
  const goBack = () => {
    if (currentStep === 2 && isGoogleOnboarding) {
      navigation.goBack();
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };
  const clearErrors = () => setError(null);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNext = (stepData: any) => {
    // Step 2: map phone → phoneNumber (same as web)
    if (currentStep === 2 && stepData.phone) {
      stepData.phoneNumber = stepData.phone;
      delete stepData.phone;
    }
    saveFormData(stepData);
    goNext();
  };

  const handleRegistration = async (finalData: RegistrationData) => {
    clearErrors();
    setLoading(true);
    try {
      const cleanData = {
        email: finalData.email,
        password: finalData.password,
        confirmPassword: finalData.confirmPassword,
        firstName: finalData.firstName,
        lastName: finalData.lastName || '',
        phoneNumber: finalData.phoneNumber || '',
        location: finalData.location,
        userType: finalData.userType,

        ...(finalData.userType === 'working' && {
          jobTitle: finalData.jobTitle,
          companyName: finalData.companyName,
          startDate: finalData.startDate,
          endDate: finalData.endDate || undefined,
        }),
        ...(finalData.userType === 'student' && {
          collegeName: finalData.collegeName,
          degree: finalData.degree,
          fieldOfStudy: finalData.fieldOfStudy,
          graduationYear: finalData.graduationYear,
        }),
        ...(finalData.userType === 'fresher' && {
          highestEducation: finalData.highestEducation,
          preferredRole: finalData.preferredRole,
          cgpa: finalData.cgpa,
        }),
      };

      console.log('Sending to API:', JSON.stringify(cleanData, null, 2));

      if (isGoogleOnboarding) {
        console.log('🔐 Performing Google Registration...');
        const response = await AuthService.googleNativeRegister({
          idToken: googleIdToken,
          ...cleanData,
        });
        console.log('✅ Google registration successful:', response);
        setLoggedIn(true);
      } else {
        const result = await reduxRegister(cleanData);
        console.log('Register successful via Redux:', result);
      }

    } catch (err: any) {

      console.error('Registration Error:', err);
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {

      setLoading(false);
    }
    // TODO: Replace with Redux register thunk:
    // await register(cleanData);

    // Stub: simulate API
    //   await new Promise((res) => setTimeout(res, 1500));
    //   console.log('✅ Registration payload:', cleanData);

    //   await new Promise((res) => setTimeout(res, 100));
    //   setIsLoggedIn(true);
    // } catch (err: any) {
    //   console.error('❌ Registration Error:', err);
    //   setError(err?.message || 'Registration failed. Please try again.');
    // } finally {
    //   setLoading(false);
    // }
  };

  // ── Step Renderer ─────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CreateAccount onNext={handleNext} />;
      case 2:
        return <PersonalDetails onNext={handleNext} onBack={goBack} initialValues={formData} />;
      case 3:
        return <CurrentStatus onNext={handleNext} onBack={goBack} />;
      case 4:
        return (
          <>
            {formData.userType === 'working' && (
              <WorkingJobDetails onNext={handleNext} onBack={goBack} />
            )}
            {formData.userType === 'student' && (
              <StudentEducation onNext={handleNext} onBack={goBack} />
            )}
            {formData.userType === 'fresher' && (
              <FresherEducationRole onNext={handleNext} onBack={goBack} />
            )}
          </>
        );
      case 5:
        return (
          <Skills
            onBack={goBack}
            onNext={async (skillsData: any) => {
              const finalData = {
                ...formData,
                skills: skillsData.skills || [],
              } as RegistrationData;
              await handleRegistration(finalData);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-amber-50">
      <StatusBar barStyle="light-content" backgroundColor="#4a3728" />

      {/* ── Decorative top diagonal cover ── */}
      <View className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden">
        <View
          className="absolute bg-[#4a3728]"
          style={{
            width: Dimensions.get('window').width * 2,
            height: Dimensions.get('window').height * 0.75,
            top: -Dimensions.get('window').height * 0.4,
            left: -Dimensions.get('window').width * 0.5,
            transform: [{ rotate: '-18deg' }],
          }}
        />

        {/* THRONE8 brand on the arc */}
        <View className="absolute inset-x-0 top-0 items-center justify-center mt-10">
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── White card ── */}
          <View className="mx-4 bg-white rounded-3xl shadow-2xl px-6 py-16">

            {/* Progress Steps */}
            <ProgressSteps currentStep={currentStep} />

            {/* Active Step */}
            {renderStep()}

            {/* Social Buttons (step 1 only) */}
            {currentStep === 1 && <SocialButtons />}

            {/* Sign in link (step 1 only) */}
            {currentStep === 1 && (
              <View className="flex-row items-center justify-center mt-6 gap-x-1">
                <Text className="text-gray-500 text-sm">Already have an account?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <Text className="text-[#4a3728] font-semibold text-sm"> Sign In</Text>

                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Loading Overlay ── */}
      <Modal visible={loading} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white px-8 py-6 rounded-2xl shadow-2xl flex-row items-center gap-x-4">
            <ActivityIndicator size="large" color="#4a3728" />
            <Text className="text-gray-900 font-semibold text-base">Creating your account...</Text>
          </View>
        </View>
      </Modal>

      {/* ── Error Toast ── */}
      {!!error && (
        <View className="absolute bottom-6 left-4 right-4 bg-red-500 px-4 py-4 rounded-2xl shadow-xl flex-row items-start gap-x-3 z-50">
          <Text className="text-2xl">⚠️</Text>
          <View className="flex-1">
            <Text className="text-white font-semibold text-sm">Registration Failed</Text>
            <Text className="text-white/90 text-xs mt-0.5 leading-4">{error}</Text>
          </View>
          <TouchableOpacity onPress={clearErrors} activeOpacity={0.7}>
            <X size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SignupScreen;