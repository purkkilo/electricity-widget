import { Image, StyleSheet } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import ElectricityList from "@/components/ElectricityList";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: "rgb(126, 212, 255)",
        dark: "rgb(11, 22, 32)",
      }}
      headerImage={
        <Image
          source={require("@/assets/images/lightning.png")}
          style={styles.logo}
        />
      }
    >
      <ElectricityList />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: 230,
    width: 250,
    top: 10,
    position: "absolute",
  },
});
