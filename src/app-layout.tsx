import { Content } from "./content";
import { Sidebar } from "./sidebar";

function AppLayout() {
  return (
    <div class="layout">
      <div class="sidebar-container">
        <Sidebar />
      </div>
      <div class="content-container">
        <Content />
      </div>
    </div>
  );
}

export { AppLayout };
