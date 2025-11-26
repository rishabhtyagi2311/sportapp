import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Image } from "react-native";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Background color animation
  const bgAnim = useRef(new Animated.Value(0)).current;
  
  // Center logo animations
  const centerScale = useRef(new Animated.Value(0.5)).current;
  const centerOpacity = useRef(new Animated.Value(0)).current;
  
  // Top image animations
  const topTranslateY = useRef(new Animated.Value(-150)).current;
  const topRotate = useRef(new Animated.Value(0)).current;
  const topOpacity = useRef(new Animated.Value(0)).current;
  
  // Bottom image animations
  const bottomTranslateY = useRef(new Animated.Value(150)).current;
  const bottomRotate = useRef(new Animated.Value(0)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  
  // Final fade out
  const finalFadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log("[SplashScreen] starting animations");
    
    Animated.sequence([
      // Step 1: Background color transition + all images fade in + center grows
      Animated.parallel([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        // Top image: slide down + rotate + fade in
        Animated.timing(topTranslateY, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(topRotate, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(topOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        // Center image: scale up + fade in
        Animated.timing(centerScale, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(centerOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        // Bottom image: slide up + rotate + fade in
        Animated.timing(bottomTranslateY, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(bottomRotate, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      
      // Step 2: Hold for display
      Animated.delay(1500),
      
      // Step 3: Fade out all images (with random stagger)
      Animated.parallel([
        Animated.timing(topOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          delay: Math.random() * 300,
        }),
        Animated.timing(centerOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          delay: Math.random() * 300,
        }),
        Animated.timing(bottomOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          delay: Math.random() * 300,
        }),
      ]),
      
      // Step 4: Final fade out of entire screen
      Animated.timing(finalFadeOut, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log("[SplashScreen] animation complete -> onFinish");
      onFinish();
    });
  }, []);

  // Interpolate background color
  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", "#1a1a2e"],
  });

  // Interpolate rotations
  const topRotation = topRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const bottomRotation = bottomRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          backgroundColor,
          opacity: finalFadeOut,
        },
      ]}
    >
      {/* Top Image - animates from top */}
      <Animated.View
        style={[
          styles.topImageContainer,
          {
            transform: [
              { translateY: topTranslateY },
              { rotate: topRotation },
            ],
            opacity: topOpacity,
          },
        ]}
      >
        <Image
          source={require("@/assets/images/logo1.png")}
          style={styles.image}
        />
      </Animated.View>

      {/* Center Image - scales and fades in */}
      <Animated.View
        style={[
          styles.centerImageContainer,
          {
            transform: [{ scale: centerScale }],
            opacity: centerOpacity,
          },
        ]}
      >
        <Image
          source={require("@/assets/images/logo2.png")}
          style={styles.image}
        />
      </Animated.View>

      {/* Bottom Image - animates from bottom */}
      <Animated.View
        style={[
          styles.bottomImageContainer,
          {
            transform: [
              { translateY: bottomTranslateY },
              { rotate: bottomRotation },
            ],
            opacity: bottomOpacity,
          },
        ]}
      >
        <Image
          source={require("@/assets/images/logo3.png")}
          style={styles.image}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  topImageContainer: {
    position: "absolute",
    top: 80,
    width: "100%",
    alignItems: "center",
  },
  centerImageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  bottomImageContainer: {
    position: "absolute",
    bottom: 80,
    width: "100%",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
});

export default SplashScreen;