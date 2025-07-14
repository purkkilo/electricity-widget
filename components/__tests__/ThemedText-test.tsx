import renderer from "react-test-renderer";
import { ThemedText } from "../ThemedText";
import { act } from "react";

it(`renders correctly with style`, () => {
  act(() => {
    // This is necessary to ensure that the component is rendered before taking the snapshot
    const tree = renderer
      .create(
        <ThemedText style={{ color: "red", fontSize: 20 }}>
          Snapshot test with style!
        </ThemedText>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});

// Test that ThemedView renders correctly with text
it(`renders correctly with text`, () => {
  act(() => {
    const tree = renderer
      .create(<ThemedText>Snapshot test with text!</ThemedText>)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
