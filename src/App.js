import React from "react";

import { Bulb, Button, Container, Grid } from "./components";

// base ensemble
// -------------
//
// 100 lights
// each light can be in one of 2 states: on / off
// any light which is on has a 50/50 chance of going off in the next second
// the system reach equilibrium and stops once all lights are off.
// how long would it take for the system to reach equilibrium?
//
// first scenario
// Connections are contructed so any light which is off has a 50/50 chance to go on in the next second, provided it is connected to a light the is on
// If the light is not connected to a light that is on it has no change of going on.
// If ever happens that al lights are off, then all lights stay off forever.
//
//
// second scenario
// there are no interconnections between lights.
// when a light goes off, it stays off forever.
//
//
// third scenario
// Lights can turn on or off as long as there is a single light on.
//

// TODOS:
// - Add explainer text
// - Fix single action reducer
// - Decouple code from framework. Turn useEffect into pure functions.

// NOTES"
// - Coupled code is harder to test.

function checkArrayEquality(arr1, arr2) {
  return arr1.every((value, index) => value === arr2[index]);
}

function bulbToggler(prevState, scenario, array) {
  const toggleChance = Math.random() <= 0.5 ? "on" : "off";

  const findSiblingStateOn = (bulb, array) => {
    const siblings = array.filter(
      (item) =>
        checkArrayEquality(item.coordinates, bulb.siblings.up) ||
        checkArrayEquality(item.coordinates, bulb.siblings.right) ||
        checkArrayEquality(item.coordinates, bulb.siblings.bottom) ||
        checkArrayEquality(item.coordinates, bulb.siblings.left)
    );

    const isSiblingOn = siblings.some((sibling) => sibling.state === "on");

    return isSiblingOn;
  };

  switch (scenario) {
    case "connected":
      if (findSiblingStateOn(prevState, array)) return toggleChance;
      break;
    case "disconnected":
      if (prevState.state !== "on") return toggleChance;
      break;
    case "random":
      return toggleChance;
    default:
      break;
  }
  return prevState.state;
}

function defineSiblings(rowIndex, itemIndex) {
  return {
    up: [rowIndex - 1, itemIndex],
    right: [rowIndex, itemIndex + 1],
    bottom: [rowIndex + 1, itemIndex],
    left: [rowIndex, itemIndex - 1],
  };
}

const initialState = [...Array(10)].reduce((grid, _, rowIndex, array) => {
  return grid.concat(
    array.map((_, itemIndex) => ({
      coordinates: [rowIndex, itemIndex],
      key: `${rowIndex}${itemIndex}`,
      siblings: defineSiblings(rowIndex, itemIndex),
      state: Math.random() <= 0.5 ? "on" : "off",
    }))
  );
}, []);

function useGrid(scenario, running, toggleFunction) {
  const [grid, setGrid] = React.useState(initialState);

  React.useEffect(() => {
    let toggleInterval;

    if (running) {
      toggleInterval = setInterval(() => {
        setGrid(
          grid.map((bulb) => ({
            ...bulb,
            state: toggleFunction(bulb, scenario, grid),
          }))
        );
      }, 100);
    }

    return () => clearInterval(toggleInterval);
  }, [grid, running, scenario, toggleFunction]);

  return grid;
}

const App = () => {
  const [scenario, setScenario] = React.useState("connected");
  const [running, setRunning] = React.useState(false);
  const grid = useGrid(scenario, running, bulbToggler);

  // const [lapse, setLapse] = React.useState(0);

  //  React.useEffect(() => {
  //    const allBulbsOn = state.every((item) => item.state === "on");
  //
  //    if (allBulbsOn) {
  //      setRunning(false);
  //    }
  //  }, [running, scenario, state]);
  //
  //  React.useEffect(() => {
  //    setLapse(Date.now());
  //    dispatch({ type: "toggle", scenario: scenario });
  //    setRunning(true);
  //  }, [scenario]);
  //
  const handleClick = (id) => {
    setRunning(true);
    setScenario(id);
    if (scenario === id) {
      setRunning(false);
    }
  };

  return (
    <Container>
      <Button.Container>
        <button onClick={() => setRunning(!running)}>Run</button>
        <Button onClick={() => handleClick("connected")}>Connected</Button>
        <Button onClick={() => handleClick("disconnected")}>
          Disconnected
        </Button>
        <Button onClick={() => handleClick("random")}>Random</Button>
      </Button.Container>
      <Grid>
        {grid.map((bulb) => (
          <Bulb {...bulb} />
        ))}
      </Grid>
    </Container>
  );
};

export default App;
