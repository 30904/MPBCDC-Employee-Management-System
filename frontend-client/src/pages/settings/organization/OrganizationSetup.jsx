import { Navigate, Route, Routes } from 'react-router-dom';
import ModuleShell from '../../../components/ModuleShell.jsx';
import DepartmentList from './DepartmentList.jsx';
import DesignationList from './DesignationList.jsx';
import DistrictList from './DistrictList.jsx';
import GradeList from './GradeList.jsx';
import RegionList from './RegionList.jsx';

const TABS = [
  { path: 'departments', label: 'Departments', end: true },
  { path: 'designations', label: 'Designations', end: true },
  { path: 'grades', label: 'Grades', end: true },
  { path: 'regions', label: 'Regions', end: true },
  { path: 'districts', label: 'Districts', end: true },
];

export default function OrganizationSetup() {
  return (
    <Routes>
      <Route
        element={
          <ModuleShell
            title="Organization Setup"
            subtitle="Department, Designation, Grade, Region, District masters"
            tabs={TABS}
          />
        }
      >
        <Route index element={<Navigate to="departments" replace />} />
        <Route path="departments" element={<DepartmentList />} />
        <Route path="designations" element={<DesignationList />} />
        <Route path="grades" element={<GradeList />} />
        <Route path="regions" element={<RegionList />} />
        <Route path="districts" element={<DistrictList />} />
      </Route>
    </Routes>
  );
}
