# MPBCDC Role-Based Portal Architecture

## System Overview

The MPBCDC application implements a **7-role system** across **3 web portals** with multi-tenant support. Each role is strictly mapped to one portal and has specific capabilities within that portal.

---

## 7 System Roles

### 1. **SUPER_ADMIN** (Order: 1)
- **Portal**: Admin Portal (`frontend-admin`)
- **Scope**: System-wide
- **Description**: System administrator with full access to all companies and features
- **Key Capabilities**:
  - Manage all companies
  - View audit logs
  - Manage system configurations
  - Access dashboard with system-wide analytics
  - No tenant restriction (companyId can be null)

### 2. **CLIENT_ADMIN** (Order: 2)
- **Portal**: Client Portal (`frontend-client`)
- **Scope**: Company-level
- **Description**: Company administrator with full access to company data and users
- **Key Capabilities**:
  - Manage all company users and their roles
  - Configure company settings and module flags
  - View company-wide reports and analytics
  - Manage company data and configurations
  - Restricted to assigned company (companyId required)

### 3. **HR_OFFICER** (Order: 3)
- **Portal**: Client Portal (`frontend-client`)
- **Scope**: Company-level
- **Description**: HR personnel managing employee records, leaves, and documents
- **Key Capabilities**:
  - Manage employee records
  - Process leave requests and approvals
  - Manage employee documents
  - View HR analytics and reports
  - Restricted to assigned company (companyId required)

### 4. **FINANCE_OFFICER** (Order: 4)
- **Portal**: Client Portal (`frontend-client`)
- **Scope**: Company-level
- **Description**: Finance personnel managing financial records and transactions
- **Key Capabilities**:
  - Manage financial transactions
  - Generate financial reports
  - View expense tracking
  - Access financial analytics
  - Restricted to assigned company (companyId required)

### 5. **REPORTING_MANAGER** (Order: 5)
- **Portal**: Client Portal (`frontend-client`)
- **Scope**: Company-level
- **Description**: Manager viewing reports and team performance metrics
- **Key Capabilities**:
  - View team reports and analytics
  - Track team performance metrics
  - Generate team-specific reports
  - Access dashboard with team data
  - Restricted to assigned company (companyId required)

### 6. **REGIONAL_MANAGER** (Order: 6)
- **Portal**: Client Portal (`frontend-client`)
- **Scope**: Company-level
- **Description**: Regional manager overseeing multiple locations
- **Key Capabilities**:
  - View regional reports and analytics
  - Track regional performance metrics
  - Generate regional reports
  - Access dashboard with regional data
  - Restricted to assigned company (companyId required)

### 7. **EMPLOYEE** (Order: 7)
- **Portal**: Employee Portal (`frontend-employee`)
- **Scope**: Personal (self-service)
- **Description**: Company employee accessing personal dashboard and self-service features
- **Key Capabilities**:
  - View personal dashboard
  - Apply for leaves
  - Submit loan requests
  - View service records
  - Access personal documents and notifications
  - Restricted to assigned company (companyId required)

---

## Portal Architecture Mapping

### Admin Portal (`frontend-admin`)
- **Allowed Roles**: `SUPER_ADMIN`, `CLIENT_ADMIN`
- **Key Features**:
  - System administration dashboard
  - Company management
  - Audit logs
  - System-wide analytics
- **Entry Point**: Login with ADMIN_PORTAL_ROLES

### Client Portal (`frontend-client`)
- **Allowed Roles**: `CLIENT_ADMIN`, `HR_OFFICER`, `FINANCE_OFFICER`, `REPORTING_MANAGER`, `REGIONAL_MANAGER`
- **Key Features**:
  - Company dashboard
  - Employee management
  - Leave management
  - Service records
  - Loan management
  - Financial transactions
  - Reports and analytics
- **Entry Point**: Login with CLIENT_PORTAL_ROLES

### Employee Portal (`frontend-employee`)
- **Allowed Roles**: `EMPLOYEE`
- **Key Features**:
  - Personal dashboard
  - Leave requests
  - Loan applications
  - Service records
  - Documents
  - Notifications
  - Profile management
- **Entry Point**: Login with EMPLOYEE_PORTAL_ROLES

---

## Multi-Tenancy & Scoping

### Tenant Scope Rules

| Role | Tenant Restriction | companyId Required |
|------|--------------------|--------------------|
| SUPER_ADMIN | None (system-wide) | No (null allowed) |
| CLIENT_ADMIN | Company-level | Yes |
| HR_OFFICER | Company-level | Yes |
| FINANCE_OFFICER | Company-level | Yes |
| REPORTING_MANAGER | Company-level | Yes |
| REGIONAL_MANAGER | Company-level | Yes |
| EMPLOYEE | Company-level | Yes |

**Key Points**:
- SUPER_ADMIN operates at system level (no company restriction)
- All other roles are company-scoped and require a valid companyId
- Multi-tenancy is enforced via `tenantResolver` middleware
- Users can be assigned to only one company per user record
- Cross-company access is not supported in the current architecture

---

## Authentication & Authorization Flow

### 1. JWT Token Structure
```javascript
{
  userId: string,
  loginId: string,
  roles: string[], // Array of role strings from this list
  companyId: string | null, // null for SUPER_ADMIN, required for others
  employeeId: string | null, // reference to employee record if applicable
}
```

### 2. Authorization Checks
- **Auth Middleware** (`authMiddleware.js`): Validates JWT and extracts user context
- **Role Authorization** (`authorizeRoles.js`): Checks if user has required role(s)
- **Tenant Resolution** (`tenantResolver.js`): Enforces company-level scoping

### 3. Usage Pattern
```javascript
// Single role check
router.get(
  '/endpoint',
  authMiddleware,
  authorizeRoles(ROLES.HR_OFFICER),
  controller
);

// Multiple roles (OR logic)
router.post(
  '/endpoint',
  authMiddleware,
  authorizeRoles(ROLES.CLIENT_ADMIN, ROLES.HR_OFFICER),
  controller
);

// Multi-role with tenant scoping
router.get(
  '/endpoint',
  authMiddleware,
  tenantResolver,
  authorizeRoles(ROLES.CLIENT_ADMIN, ROLES.HR_OFFICER),
  controller
);
```

---

## Role Implementation Details

### Role Constants Location
- **File**: `/backend/utils/roles.js`
- **Exports**:
  - `ROLES`: Role definitions (7 constants)
  - `ALL_ROLES`: Array of all valid role strings
  - `ADMIN_PORTAL_ROLES`: Roles for admin portal
  - `CLIENT_PORTAL_ROLES`: Roles for client portal
  - `EMPLOYEE_PORTAL_ROLES`: Roles for employee portal
  - `ROLE_METADATA`: Role descriptions and metadata

### User Model Support
- **File**: `/backend/models/User.js`
- **Field**: `roles` (String array with enum validation)
- **Features**:
  - Supports multiple roles per user
  - Enum validation against ALL_ROLES
  - Requires at least one role
  - Indexed with companyId for multi-tenancy

### Database Constraints
```javascript
// User collection unique constraint
db.users.createIndex({ loginId: 1, companyId: 1 }, { unique: true })
// Allows same loginId across different companies
```

---

## No Breaking Changes

✅ **Existing authentication system preserved**:
- JWT generation and validation unchanged
- Login flow unchanged
- Password hashing and comparison unchanged
- Session management unchanged

✅ **Backward compatible**:
- All 7 roles already defined in the system
- Multi-role support already implemented
- Authorization middleware already supports multiple roles
- No changes to token structure required

✅ **Ready for portal routing**:
- Frontend applications can use role information from JWT to route users to correct portal
- Role-based access control already functional
- Authorization checks can be extended with minimal changes

---

## Development Guidelines

### Adding New Role-Protected Routes
```javascript
const { authorizeRoles } = require('../middleware/authorizeRoles');
const { ROLES } = require('../utils/roles');

// Single role
router.get('/hr-data', 
  authMiddleware,
  authorizeRoles(ROLES.HR_OFFICER),
  controller
);

// Multiple roles
router.get('/reports',
  authMiddleware,
  tenantResolver,
  authorizeRoles(ROLES.CLIENT_ADMIN, ROLES.REPORTING_MANAGER),
  controller
);
```

### Creating New Users with Roles
```javascript
const user = await User.create({
  loginId: 'emp001',
  passwordHash: await User.hashPassword('password'),
  roles: [ROLES.EMPLOYEE], // or [ROLES.HR_OFFICER, ROLES.EMPLOYEE]
  companyId: companyObjectId,
  status: 'Active'
});
```

### Frontend Portal Routing
```javascript
// Redirect based on roles
if (user.roles.includes(ROLES.SUPER_ADMIN)) {
  navigate('/admin');
} else if (user.roles.some(r => CLIENT_PORTAL_ROLES.includes(r))) {
  navigate('/client');
} else if (user.roles.includes(ROLES.EMPLOYEE)) {
  navigate('/employee');
}
```

---

## Testing Role Authorization

### Unit Test Example
```javascript
describe('Authorization Middleware', () => {
  it('should allow HR_OFFICER access to HR endpoints', async () => {
    const req = { user: { roles: [ROLES.HR_OFFICER] } };
    const middleware = authorizeRoles(ROLES.HR_OFFICER);
    // Should call next()
  });

  it('should deny EMPLOYEE access to HR endpoints', async () => {
    const req = { user: { roles: [ROLES.EMPLOYEE] } };
    const middleware = authorizeRoles(ROLES.HR_OFFICER);
    // Should call sendError with 403
  });
});
```

---

## Future Enhancements

1. **Granular Permissions**: Define specific permissions beyond role names
2. **Role Hierarchies**: Map role precedence (e.g., CLIENT_ADMIN > HR_OFFICER)
3. **Feature Toggles**: Link roles to company moduleFlags
4. **Audit Trail**: Log role-based access to sensitive operations
5. **Cross-Company Management**: Allow SUPER_ADMIN to assign companyId context
6. **Sub-roles**: Create role variants for specialized access patterns

---

## Summary

The MPBCDC application has a **robust 7-role system** with:
- ✅ All roles defined in centralized constants
- ✅ Multi-role support per user
- ✅ Multi-tenant isolation
- ✅ JWT-based authentication
- ✅ Authorization middleware ready for use
- ✅ Portal-level role grouping
- ✅ No breaking changes to existing code

**Ready to proceed with TASK 2**: Portal-specific routing and frontend implementation.
