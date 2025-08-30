// components/EnhancedCertificate.tsx
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Certificate } from '@/types';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path, G, Polygon } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const CERT_WIDTH = screenWidth - 32;
const CERT_HEIGHT = CERT_WIDTH * 0.707; // A4 ratio

interface EnhancedCertificateProps {
  certificate: Certificate;
  template?: 'achievement' | 'participation' | 'excellence';
}

const EnhancedCertificate: React.FC<EnhancedCertificateProps> = ({ certificate, template = 'achievement' }) => {
  const getTemplateColors = () => {
    switch (template) {
      case 'achievement':
        return { primary: '#FFD700', secondary: '#FFA500', accent: '#B8860B' };
      case 'participation':
        return { primary: '#4A90E2', secondary: '#2E5BBA', accent: '#1E3A8A' };
      case 'excellence':
        return { primary: '#DC2626', secondary: '#991B1B', accent: '#7F1D1D' };
      default:
        return { primary: '#FFD700', secondary: '#FFA500', accent: '#B8860B' };
    }
  };

  const colors = getTemplateColors();

  return (
    <View className="mx-4 my-2 rounded-2xl shadow-xl" style={{ width: CERT_WIDTH, height: CERT_HEIGHT, backgroundColor: 'white' }}>
      {/* SVG Borders & Decorations */}
      <Svg width={CERT_WIDTH} height={CERT_HEIGHT} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <LinearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="50%" stopColor={colors.secondary} />
            <Stop offset="100%" stopColor={colors.primary} />
          </LinearGradient>
        </Defs>
        <Rect x={10} y={10} width={CERT_WIDTH - 20} height={CERT_HEIGHT - 20} fill="none" stroke="url(#borderGradient)" strokeWidth={8} rx={15} />
      </Svg>

      {/* Certificate Content */}
      <View className="flex-1 p-10 justify-between items-center">
        <Text style={{ color: colors.primary, fontSize: 28, fontWeight: 'bold', fontFamily: 'serif' }}>CERTIFICATE</Text>
        <Text style={{ color: colors.accent, fontSize: 20, fontWeight: '600' }}>OF {template.toUpperCase()}</Text>

        <View className="items-center mt-8">
          <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#374151' }}>This is to certify that</Text>
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginVertical: 10, color: colors.accent }}>{certificate.studentName}</Text>
          <Text style={{ fontSize: 16, fontStyle: 'italic', marginTop: 10 }}>has successfully</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', marginVertical: 10, color: colors.secondary }}>
            {certificate.achievement}
          </Text>
          <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#374151' }}>at {certificate.academyName}</Text>
        </View>

        <View className="flex-row justify-between w-full mt-6">
          <View>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>Date:</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.accent }}>
              {new Date(certificate.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>

          <View className="items-center">
            <View style={{ width: 80, height: 1, backgroundColor: colors.accent, marginBottom: 2 }} />
            <Text style={{ fontSize: 12, color: '#6B7280' }}>Director's Signature</Text>
          </View>
        </View>

        <Text style={{ fontSize: 12, marginTop: 10, color: colors.accent }}>Certificate No: {certificate.certificateNumber}</Text>
      </View>
    </View>
  );
};

export default EnhancedCertificate;
