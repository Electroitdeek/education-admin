'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Plus,
  Save,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  CheckSquare,
  Square,
  Lock,
  Users,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { API_BASE } from '@/components/shared/ErpCrudView';

export interface ModulePermission {
  module: string;
  name: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface RoleItem {
  _id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: ModulePermission[];
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface RolesPermissionViewProps {
  onNavigate?: (viewId: string) => void;
}

const CATEGORIES = [
  'All',
  'Administration',
  'Finance',
  'Academics',
  'Examinations',
  'Communication',
  'Logistics',
  'System',
];

const MODULE_CATEGORY_MAP: Record<string, string> = {
  'front-office': 'Administration',
  'fees-collection': 'Finance',
  'income': 'Finance',
  'expense': 'Finance',
  'student-info': 'Academics',
  'attendance': 'Academics',
  'academics': 'Academics',
  'examinations': 'Examinations',
  'online-exam': 'Examinations',
  'online-class': 'Academics',
  'question-paper': 'Examinations',
  'other-programs': 'Academics',
  'download-center': 'Academics',
  'lesson-planner': 'Academics',
  'assignment': 'Academics',
  'communicate': 'Communication',
  'human-resource': 'Administration',
  'inventory': 'Logistics',
  'library': 'Logistics',
  'transport': 'Logistics',
  'hostel': 'Logistics',
  'certificate': 'Administration',
  'consent-letter': 'Administration',
  'digital-notice-board': 'Communication',
  'student-wallet': 'Finance',
  'bank-info': 'Finance',
  'reports': 'Administration',
  'front-cms': 'Administration',
  'subscription': 'System',
  'system-setting': 'System',
};

export default function RolesPermissionView({}: RolesPermissionViewProps) {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter
  const [roleSearch, setRoleSearch] = useState('');
  const [moduleSearch, setModuleSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Active role permissions edit state
  const [currentPermissions, setCurrentPermissions] = useState<ModulePermission[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [editRoleId, setEditRoleId] = useState('');
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDesc, setEditRoleDesc] = useState('');
  const [modalError, setModalError] = useState('');

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Fetch Roles from Backend API
  const fetchRoles = useCallback(async (selectId?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/roles`).catch(() => null);
      if (res && res.ok) {
        const data: RoleItem[] = await res.json().catch(() => []);
        setRoles(data);
        if (data.length > 0) {
          const target = selectId
            ? data.find((r) => r._id === selectId) || data[0]
            : data[0];
          setSelectedRoleId(target._id);
          setCurrentPermissions(JSON.parse(JSON.stringify(target.permissions || [])));
          setHasChanges(false);
        }
      }
    } catch {
      showToast('error', 'Unable to connect to backend to fetch roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // When selected role changes
  const handleSelectRole = (role: RoleItem) => {
    if (hasChanges) {
      if (!confirm('You have unsaved permission changes. Switch role without saving?')) {
        return;
      }
    }
    setSelectedRoleId(role._id);
    setCurrentPermissions(JSON.parse(JSON.stringify(role.permissions || [])));
    setHasChanges(false);
  };

  const selectedRole = useMemo(() => {
    return roles.find((r) => r._id === selectedRoleId) || null;
  }, [roles, selectedRoleId]);

  const isSuperAdmin = selectedRole?.name === 'Super Admin';

  // Toggle single permission
  const handleTogglePermission = (
    moduleKey: string,
    action: 'canView' | 'canAdd' | 'canEdit' | 'canDelete',
  ) => {
    if (isSuperAdmin) return;
    setCurrentPermissions((prev) =>
      prev.map((p) => {
        if (p.module === moduleKey) {
          return { ...p, [action]: !p[action] };
        }
        return p;
      }),
    );
    setHasChanges(true);
  };

  // Toggle entire row (all actions for a module)
  const handleToggleRow = (moduleKey: string, enableAll: boolean) => {
    if (isSuperAdmin) return;
    setCurrentPermissions((prev) =>
      prev.map((p) => {
        if (p.module === moduleKey) {
          return {
            ...p,
            canView: enableAll,
            canAdd: enableAll,
            canEdit: enableAll,
            canDelete: enableAll,
          };
        }
        return p;
      }),
    );
    setHasChanges(true);
  };

  // Toggle entire column (e.g. all "canView" or all "canAdd")
  const handleToggleColumn = (action: 'canView' | 'canAdd' | 'canEdit' | 'canDelete', enable: boolean) => {
    if (isSuperAdmin) return;
    setCurrentPermissions((prev) =>
      prev.map((p) => ({
        ...p,
        [action]: enable,
      })),
    );
    setHasChanges(true);
  };

  // Master Select All / Deselect All
  const handleMasterToggle = (enable: boolean) => {
    if (isSuperAdmin) return;
    setCurrentPermissions((prev) =>
      prev.map((p) => ({
        ...p,
        canView: enable,
        canAdd: enable,
        canEdit: enable,
        canDelete: enable,
      })),
    );
    setHasChanges(true);
  };

  // Reset to saved state
  const handleReset = () => {
    if (!selectedRole) return;
    setCurrentPermissions(JSON.parse(JSON.stringify(selectedRole.permissions || [])));
    setHasChanges(false);
  };

  // Save Permissions to API
  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/roles/${selectedRole._id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: currentPermissions }),
      }).catch(() => null);

      if (!res) {
        throw new Error('API server unreachable on port 5000.');
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update permissions');
      }

      const updated = await res.json();
      setRoles((prev) =>
        prev.map((r) => (r._id === selectedRole._id ? { ...r, permissions: updated.permissions } : r)),
      );
      setHasChanges(false);
      showToast('success', `Permissions for "${selectedRole.name}" updated successfully in database!`);
    } catch (err: any) {
      showToast('error', err.message || 'Error saving permissions');
    } finally {
      setSaving(false);
    }
  };

  // Create custom role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      setModalError('Role name is required');
      return;
    }
    setModalError('');
    try {
      const res = await fetch(`${API_BASE}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName.trim(),
          description: newRoleDesc.trim(),
        }),
      }).catch(() => null);

      if (!res) throw new Error('API server unreachable');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create role');
      }
      const created: RoleItem = await res.json();
      setShowAddModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
      await fetchRoles(created._id);
      showToast('success', `Role "${created.name}" created and stored in DB!`);
    } catch (err: any) {
      setModalError(err.message || 'Error creating role');
    }
  };

  // Edit custom role
  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoleName.trim()) {
      setModalError('Role name is required');
      return;
    }
    setModalError('');
    try {
      const res = await fetch(`${API_BASE}/roles/${editRoleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editRoleName.trim(),
          description: editRoleDesc.trim(),
        }),
      }).catch(() => null);

      if (!res) throw new Error('API server unreachable');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update role');
      }
      const updated: RoleItem = await res.json();
      setShowEditModal(false);
      setRoles((prev) =>
        prev.map((r) => (r._id === updated._id ? { ...r, name: updated.name, description: updated.description } : r)),
      );
      showToast('success', `Role updated successfully!`);
    } catch (err: any) {
      setModalError(err.message || 'Error updating role');
    }
  };

  // Delete custom role
  const handleDeleteRole = async (role: RoleItem) => {
    if (role.isSystem) {
      alert(`Cannot delete system role "${role.name}"`);
      return;
    }
    if (!confirm(`Are you sure you want to delete custom role "${role.name}"?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/roles/${role._id}`, {
        method: 'DELETE',
      }).catch(() => null);
      if (!res) throw new Error('API server unreachable');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete role');
      }
      showToast('success', `Role "${role.name}" deleted successfully.`);
      await fetchRoles();
    } catch (err: any) {
      showToast('error', err.message || 'Error deleting role');
    }
  };

  // Filtered roles list
  const filteredRoles = useMemo(() => {
    return roles.filter((r) =>
      r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(roleSearch.toLowerCase())),
    );
  }, [roles, roleSearch]);

  // Filtered permissions list
  const filteredPermissions = useMemo(() => {
    return currentPermissions.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(moduleSearch.toLowerCase()) ||
        p.module.toLowerCase().includes(moduleSearch.toLowerCase());
      const cat = MODULE_CATEGORY_MAP[p.module] || 'Other';
      const matchesCat = selectedCategory === 'All' || cat === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [currentPermissions, moduleSearch, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-[#80229a] flex items-center justify-center text-2xl shadow-sm">
            <ShieldCheck className="h-6 w-6 text-[#80229a]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Roles & Permissions (RBAC)</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage user roles, module-level authorization, and granular View / Add / Edit / Delete privileges stored in database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setNewRoleName('');
              setNewRoleDesc('');
              setModalError('');
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-900/10 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add New Role
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Left Roles Panel + Right Permissions Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Roles List */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4 flex flex-col h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-[#80229a]" />
              System Roles ({roles.length})
            </h2>
          </div>

          {/* Search Roles */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
            />
          </div>

          {/* Role Cards List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredRoles.map((role) => {
              const isSelected = role._id === selectedRoleId;
              return (
                <div
                  key={role._id}
                  onClick={() => handleSelectRole(role)}
                  className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-purple-50/80 border-[#80229a] shadow-sm'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          isSelected ? 'bg-[#80229a]' : 'bg-slate-300 group-hover:bg-[#80229a]/60'
                        }`}
                      />
                      <span className={`text-sm font-semibold ${isSelected ? 'text-[#80229a]' : 'text-slate-800'}`}>
                        {role.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {role.isSystem ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          System
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                          Custom
                        </span>
                      )}

                      {!role.isSystem && (
                        <div
                          className="flex items-center gap-1 ml-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            title="Edit Role Name"
                            onClick={() => {
                              setEditRoleId(role._id);
                              setEditRoleName(role.name);
                              setEditRoleDesc(role.description || '');
                              setModalError('');
                              setShowEditModal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-purple-600 rounded"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            title="Delete Role"
                            onClick={() => handleDeleteRole(role)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {role.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-100">
                    <span>
                      {role.permissions?.filter((p) => p.canView).length || 0} / {role.permissions?.length || 30} modules visible
                    </span>
                    <span className="font-medium text-slate-500">
                      {role.userCount || 0} user(s)
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredRoles.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                No roles found matching &quot;{roleSearch}&quot;.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Permissions Matrix */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4 flex flex-col">
          {selectedRole ? (
            <>
              {/* Header Info for Selected Role */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-800">
                      {selectedRole.name} Permissions
                    </h2>
                    {isSuperAdmin && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-[#80229a]">
                        <Lock className="h-3 w-3" /> Root Access
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedRole.description || 'Configure module read, write, update, and delete access.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {hasChanges && (
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-xl transition"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                  )}

                  {!isSuperAdmin && (
                    <button
                      onClick={handleSavePermissions}
                      disabled={saving || !hasChanges}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl shadow-md transition ${
                        hasChanges
                          ? 'bg-[#80229a] hover:bg-[#68167f] text-white shadow-purple-900/10 active:scale-95'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Save className="h-3.5 w-3.5" />
                      {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
                    </button>
                  )}
                </div>
              </div>

              {/* Notice for Super Admin */}
              {isSuperAdmin && (
                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-[#80229a] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Super Admin Policy:</span> The Super Admin role maintains absolute system authority with automatic root access to all modules and actions. Permissions cannot be revoked from Super Admin.
                  </div>
                </div>
              )}

              {/* Filters & Shortcuts Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
                {/* Search in modules */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter modules..."
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a] transition"
                  />
                </div>

                {/* Bulk Actions */}
                {!isSuperAdmin && (
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => handleMasterToggle(true)}
                      className="px-2.5 py-1 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg font-medium transition"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => handleMasterToggle(false)}
                      className="px-2.5 py-1 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition"
                    >
                      Deselect All
                    </button>
                  </div>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-[#80229a] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Permissions Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 backdrop-blur sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Module Name</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span>View</span>
                            {!isSuperAdmin && (
                              <button
                                onClick={() => {
                                  const allChecked = filteredPermissions.every((p) => p.canView);
                                  handleToggleColumn('canView', !allChecked);
                                }}
                                title="Toggle All View"
                                className="text-slate-400 hover:text-[#80229a]"
                              >
                                {filteredPermissions.every((p) => p.canView) ? (
                                  <CheckSquare className="h-3.5 w-3.5 text-[#80229a]" />
                                ) : (
                                  <Square className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </th>
                        <th className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span>Add</span>
                            {!isSuperAdmin && (
                              <button
                                onClick={() => {
                                  const allChecked = filteredPermissions.every((p) => p.canAdd);
                                  handleToggleColumn('canAdd', !allChecked);
                                }}
                                title="Toggle All Add"
                                className="text-slate-400 hover:text-[#80229a]"
                              >
                                {filteredPermissions.every((p) => p.canAdd) ? (
                                  <CheckSquare className="h-3.5 w-3.5 text-[#80229a]" />
                                ) : (
                                  <Square className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </th>
                        <th className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span>Edit</span>
                            {!isSuperAdmin && (
                              <button
                                onClick={() => {
                                  const allChecked = filteredPermissions.every((p) => p.canEdit);
                                  handleToggleColumn('canEdit', !allChecked);
                                }}
                                title="Toggle All Edit"
                                className="text-slate-400 hover:text-[#80229a]"
                              >
                                {filteredPermissions.every((p) => p.canEdit) ? (
                                  <CheckSquare className="h-3.5 w-3.5 text-[#80229a]" />
                                ) : (
                                  <Square className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </th>
                        <th className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span>Delete</span>
                            {!isSuperAdmin && (
                              <button
                                onClick={() => {
                                  const allChecked = filteredPermissions.every((p) => p.canDelete);
                                  handleToggleColumn('canDelete', !allChecked);
                                }}
                                title="Toggle All Delete"
                                className="text-slate-400 hover:text-[#80229a]"
                              >
                                {filteredPermissions.every((p) => p.canDelete) ? (
                                  <CheckSquare className="h-3.5 w-3.5 text-[#80229a]" />
                                ) : (
                                  <Square className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </th>
                        <th className="py-3 px-3 text-center">Row Quick</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPermissions.map((perm) => {
                        const allChecked = perm.canView && perm.canAdd && perm.canEdit && perm.canDelete;
                        const cat = MODULE_CATEGORY_MAP[perm.module] || 'Administration';

                        return (
                          <tr key={perm.module} className="hover:bg-purple-50/30 transition">
                            <td className="py-2.5 px-4 font-semibold text-slate-800">
                              {perm.name}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                {cat}
                              </span>
                            </td>

                            {/* View Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSuperAdmin || perm.canView}
                                disabled={isSuperAdmin}
                                onChange={() => handleTogglePermission(perm.module, 'canView')}
                                className="h-4 w-4 rounded text-[#80229a] focus:ring-[#80229a] border-slate-300 accent-[#80229a] cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>

                            {/* Add Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSuperAdmin || perm.canAdd}
                                disabled={isSuperAdmin}
                                onChange={() => handleTogglePermission(perm.module, 'canAdd')}
                                className="h-4 w-4 rounded text-[#80229a] focus:ring-[#80229a] border-slate-300 accent-[#80229a] cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>

                            {/* Edit Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSuperAdmin || perm.canEdit}
                                disabled={isSuperAdmin}
                                onChange={() => handleTogglePermission(perm.module, 'canEdit')}
                                className="h-4 w-4 rounded text-[#80229a] focus:ring-[#80229a] border-slate-300 accent-[#80229a] cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>

                            {/* Delete Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSuperAdmin || perm.canDelete}
                                disabled={isSuperAdmin}
                                onChange={() => handleTogglePermission(perm.module, 'canDelete')}
                                className="h-4 w-4 rounded text-[#80229a] focus:ring-[#80229a] border-slate-300 accent-[#80229a] cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>

                            {/* Quick row all/none */}
                            <td className="py-2.5 px-3 text-center">
                              {!isSuperAdmin ? (
                                <button
                                  onClick={() => handleToggleRow(perm.module, !allChecked)}
                                  className="text-[10px] font-medium text-slate-500 hover:text-[#80229a] px-2 py-0.5 rounded bg-slate-100 hover:bg-purple-50 transition"
                                >
                                  {allChecked ? 'None' : 'All'}
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400">Locked</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {filteredPermissions.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No modules found matching &quot;{moduleSearch}&quot;.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-400">
              Select a role on the left to view and configure permissions.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Add New Role */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#80229a]" />
                Create New Role
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Hostel Warden, Exam Officer, Transport Head"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Responsibilities
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the duties or scope of access for this role..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-xl shadow transition"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Custom Role */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-[#80229a]" />
                Edit Custom Role
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleEditRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editRoleDesc}
                  onChange={(e) => setEditRoleDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#80229a]/20 focus:border-[#80229a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-xl shadow transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

