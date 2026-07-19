import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import UserHomePage from "./pages/UserHomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UserListPage from "./pages/UserListPage";
import CreateUserPage from "./pages/CreateUserPage";
import ItemPage from "./pages/ItemPage";
import DpcPage from "./pages/DpcPage";
import WarehousePage from "./pages/WarehousePage";
import VehiclePage from "./pages/VehiclePage";
import CustomerVendorPage from "./pages/CustomerVendorPage";
import LegalEntityPage from "./pages/LegalEntityPage";
import ProtectedRoute from "./components/ProtectedRoute";
import InwardPage from "./pages/InwardPage";
import InwardListPage from "./pages/InwardListPage";
import OutwardPage from "./pages/OutwardPage";
import OutwardListPage from "./pages/OutwardListPage";
import MonthlyReportPage from "./pages/MonthlyReportPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<LoginPage />}
        />

        <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/users"
  element={
    <ProtectedRoute>
      <UserListPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/create-user"
  element={
    <ProtectedRoute>
      <CreateUserPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/items"
  element={
    <ProtectedRoute>
      <ItemPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/dpcs"
  element={
    <ProtectedRoute>
      <DpcPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/warehouses"
  element={
    <ProtectedRoute>
      <WarehousePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/vehicles"
  element={
    <ProtectedRoute>
      <VehiclePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/customer-vendor"
  element={
    <ProtectedRoute>
      <CustomerVendorPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/legal-entity"
  element={
    <ProtectedRoute>
      <LegalEntityPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/inwards"
  element={
    <ProtectedRoute>
      <InwardPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/user-home"
  element={
    <ProtectedRoute>
      <UserHomePage />
    </ProtectedRoute>
  }
/>
<Route
  path="/inward-list"
  element={
    <ProtectedRoute>
      <InwardListPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/outwards"
  element={
    <ProtectedRoute>
      <OutwardPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/outward-list"
  element={
    <ProtectedRoute>
      <OutwardListPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/monthly-report"
  element={
    <ProtectedRoute>
      <MonthlyReportPage />
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;