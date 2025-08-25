import { SafeAreaView, View, Image as RNImage } from "react-native";
import Svg, { Defs, ClipPath, Path, Image as SvgImage } from "react-native-svg";

export default function Academy() {
  const src = require("../../assets/images/academyCoverImage.jpg");
  const uri = RNImage.resolveAssetSource(src).uri;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="w-full h-2/5 bg-slate-900">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <ClipPath id="img-clip">
              {/* Curvy zig-zag (wave) path */}
              <Path
               d="
                M0,0 
                L100,0 
                L100,70 
                Q75,95 50,85 
                Q25,75 0,90 
                Z
                "
              />
            </ClipPath>
          </Defs>

          <SvgImage
            href={{ uri }}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#img-clip)"
          />
        </Svg>
      </View>

      {/* Your content below */}
      <View className="flex-1 items-center justify-center bg-white">
        <View className="w-full h-full bg-slate-900" />
      </View>
    </SafeAreaView>
  );
}
