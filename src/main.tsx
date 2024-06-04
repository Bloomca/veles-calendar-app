import { attachComponent } from "veles";
import { DataGenerator } from "./generator";
import { AppLayout } from "./app-layout";
import { createStoreState } from "./store";

function App() {
  const initializedState = createStoreState((state) => state.initialized);
  return (
    <div>
      {initializedState.useValue((isInitialized) =>
        isInitialized ? <AppLayout /> : <DataGenerator />
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
