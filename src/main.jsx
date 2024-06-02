import { attachComponent } from "veles";

function App() {
  return (
    <div>
      <NestedComponent />
      <br />
      <NestedComponent />
      <br />
      <NestedComponent />
    </div>
  );
}

function NestedComponent() {
  return <span>hello, world</span>;
}

const element = document.getElementById("app");
if (element) {
  attachComponent({
    htmlElement: element,
    component: <App />,
  });
}
