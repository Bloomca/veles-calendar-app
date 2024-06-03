import { attachComponent } from "veles";
import { DataGenerator } from "./generator";
import { Calendar } from "./calendar";
import { createStoreState } from "./store";

function App() {
  const initializedState = createStoreState((state) => state.initialized);
  return (
    <div>
      {initializedState.useValue((isInitialized) =>
        isInitialized ? <Calendar /> : <DataGenerator />
      )}
    </div>
  );
}

const element = document.getElementById("app");
if (element) {
  attachComponent({
    htmlElement: element,
    component: <App />,
  });
}
