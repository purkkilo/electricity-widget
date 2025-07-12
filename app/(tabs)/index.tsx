import { Alert, Linking } from "react-native";
import { useCallback } from "react";
import ElectricityList from "@/components/ElectricityList";
import { ThemedText } from "@/components/ThemedText";
import BaseLayout from "@/components/BaseLayout";

type OpenURLButtonProps = {
  url: string;
  children: string;
};

const Link = ({ url, children }: OpenURLButtonProps) => {
  const handlePress = useCallback(async () => {
    // Checking if the link is supported
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  }, [url]);

  return (
    <ThemedText type="link" onPress={handlePress}>
      {children}
    </ThemedText>
  );
};

export default function HomeScreen() {
  const icon = {
    url: "https://www.flaticon.com/free-icons/thunder",
    text: "Thunder icons created by Freepik - Flaticon",
  };
  const api = {
    url: "https://www.sahkonhintatanaan.fi",
    text: "Electricity prices from sahkonhintatanaan.fi",
  };
  const links = [icon, api];

  return (
    <BaseLayout>
      <ElectricityList />
      <ThemedText type="subtitle">Credits:</ThemedText>
      {links.map((link, index) => (
        <Link key={index} url={link.url}>
          {link.text}
        </Link>
      ))}
    </BaseLayout>
  );
}
