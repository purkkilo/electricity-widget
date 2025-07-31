import { render } from "@testing-library/react-native";

import { ThemedText } from "../ThemedText";

describe("<ThemedText />", () => {
  test("Text renders correctly", () => {
    const tree = render(<ThemedText>Some text</ThemedText>).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
