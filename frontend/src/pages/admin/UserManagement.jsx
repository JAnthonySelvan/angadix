import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Ban, CheckCircle, ShoppingBag, X, Calendar, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchAdminUsers,
  toggleUserBlock,
  updateUserRole,
} from '../../features/admin/adminUsersThunks';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminSearchBar } from '../../components/admin/AdminSearchBar';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { StatusBadge } from '../../components/admin/StatusBadge';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export const UserManagement = () => {
  const dispatch = useAppDispatch();
  const { users, pagination, loading } = useAppSelector((state) => state.adminUsers);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [blockedFilter, setBlockedFilter] = useState('');
  const [page, setPage] = useState(1);

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
  });

  // Customer order history drawer state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    dispatch(
      fetchAdminUsers({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        isBlocked: blockedFilter !== '' ? blockedFilter : undefined,
        page,
        limit: 10,
      })
    );
  }, [dispatch, search, roleFilter, blockedFilter, page]);

  const handleToggleBlockClick = (user) => {
    const isBlk = user.isBlocked;
    setConfirmState({
      isOpen: true,
      title: isBlk ? 'Unblock User Account' : 'Block User Account',
      message: `Are you sure you want to ${isBlk ? 'unblock' : 'block'} ${user.name} (${user.email})? ${
        !isBlk ? 'They will immediately be barred from logging in.' : ''
      }`,
      action: async () => {
        try {
          await dispatch(toggleUserBlock(user._id)).unwrap();
          toast.success(`Account ${isBlk ? 'unblocked' : 'blocked'} successfully`);
        } catch (err) {
          toast.error(err || 'Failed to update user block status');
        } finally {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleRoleChangeClick = (user, newRole) => {
    if (user.role === newRole) return;
    setConfirmState({
      isOpen: true,
      title: 'Change User Permissions',
      message: `Are you sure you want to change ${user.name}'s role from '${user.role}' to '${newRole}'?`,
      action: async () => {
        try {
          await dispatch(updateUserRole({ userId: user._id, role: newRole })).unwrap();
          toast.success(`User role updated to '${newRole}'`);
        } catch (err) {
          toast.error(err || 'Failed to update user role');
        } finally {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleViewOrders = async (user) => {
    setSelectedUser(user);
    try {
      setLoadingOrders(true);
      const res = await api.get(`/admin/users/${user._id}/orders`);
      setUserOrders(res.data.data.orders || []);
    } catch (err) {
      toast.error('Failed to load customer order history');
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatCurrency = (val) =>
    `₹${(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (u) => (
        <select
          value={u.role}
          onChange={(e) => handleRoleChangeClick(u, e.target.value)}
          className={`px-2 py-1 rounded-xl text-[10px] font-black uppercase outline-none border transition-all cursor-pointer ${
            u.role === 'admin'
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 text-amber-700 dark:text-amber-300'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300'
          }`}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined Date',
      render: (u) => (
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
          {new Date(u.createdAt).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      render: (u) => (
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
          {u.lastLoginAt
            ? new Date(u.lastLoginAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Never'}
        </span>
      ),
    },
    {
      key: 'isBlocked',
      label: 'Status',
      render: (u) => <StatusBadge type="blocked" value={u.isBlocked} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleViewOrders(u)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors"
            title="View Customer Orders"
          >
            <ShoppingBag size={14} />
          </button>
          <button
            onClick={() => handleToggleBlockClick(u)}
            className={`p-1.5 rounded-xl font-bold transition-colors ${
              u.isBlocked
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40'
                : 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40'
            }`}
            title={u.isBlocked ? 'Unblock Account' : 'Block Account'}
          >
            {u.isBlocked ? <CheckCircle size={14} /> : <Ban size={14} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Skeleton Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
            Customer & Account Directory
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage user roles, block suspended accounts, and review customer order history
          </p>
        </div>
      </div>

      {/* Admin Search Bar & Filters */}
      <AdminSearchBar
        placeholder="Search customers by name or email..."
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
      >
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="py-2 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-transparent outline-none font-medium"
        >
          <option value="">All Roles</option>
          <option value="user">Standard User</option>
          <option value="admin">Administrator</option>
        </select>

        <select
          value={blockedFilter}
          onChange={(e) => {
            setBlockedFilter(e.target.value);
            setPage(1);
          }}
          className="py-2 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-transparent outline-none font-medium"
        >
          <option value="">All Statuses</option>
          <option value="false">Active Only</option>
          <option value="true">Blocked Only</option>
        </select>
      </AdminSearchBar>

      {/* Admin Data Table */}
      <AdminTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No customer accounts matching query filter criteria."
      />

      {/* Shared Pagination */}
      <AdminPagination
        currentPage={pagination?.currentPage || 1}
        totalPages={pagination?.totalPages || 1}
        totalItems={pagination?.totalUsers || 0}
        onPageChange={(p) => setPage(p)}
      />

      {/* Destructive Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.action}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Proceed"
      />

      {/* Customer Order History Slide-over Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md h-full border-l border-slate-100 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                    Customer Order History
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {selectedUser.name} ({selectedUser.email})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {loadingOrders ? (
                <div className="p-8 text-center text-xs text-slate-400 font-semibold">
                  Fetching customer order records...
                </div>
              ) : userOrders.length > 0 ? (
                <div className="space-y-3">
                  {userOrders.map((o) => (
                    <div
                      key={o._id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-black text-slate-900 dark:text-white">
                          {o.orderNumber}
                        </span>
                        <StatusBadge type="order" value={o.orderStatus} />
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(o.totalAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                  This user has not placed any orders yet.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
