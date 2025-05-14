import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Image, StyleSheet } from "react-native";
import type { ReactElement } from "react";
import { ThemedView } from "@/components/ThemedView";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <ThemedView>{children}</ThemedView>
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
