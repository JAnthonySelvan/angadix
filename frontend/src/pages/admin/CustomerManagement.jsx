import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Shield, Ban, CheckCircle, ShoppingBag, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchAdminUsers,
  toggleUserBlock,
  updateUserRole,
} from '../../features/admin/adminUsersThunks';
import { Skeleton } from '../../components/ui/Skeleton';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export const CustomerManagement = () => {
  const dispatch = useAppDispatch();
  const { users, pagination, loading } = useAppSelector((state) => state.adminUsers);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');

  // Customer order history modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    dispatch(
      fetchAdminUsers({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        page,
        limit: 10,
      })
    );
  }, [dispatch, search, roleFilter, page]);

  const handleToggleBlock = async (userId, currentName, isBlocked) => {
    if (
      !window.confirm(
        `Are you sure you want to ${isBlocked ? 'UNBLOCK' : 'BLOCK'} account '${currentName}'?`
      )
    )
      return;

    try {
      await dispatch(toggleUserBlock(userId)).unwrap();
      toast.success(`User account ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
    } catch (err) {
      toast.error(err || 'Action failed');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
      toast.success(`User role updated to '${newRole}'`);
    } catch (err) {
      toast.error(err || 'Role update failed');
    }
  };

  const handleViewOrders = async (user) => {
    setSelectedUser(user);
    try {
      setLoadingOrders(true);
      const res = await api.get('/reports/sales', {
        params: { format: 'json' },
      });
      // Filter orders by user ID
      const allOrders = res.data.data.orders || [];
      const userFiltered = allOrders.filter(
        (o) => (o.user?._id || o.user) === user._id
      );
      setUserOrders(userFiltered);
    } catch (err) {
      toast.error('Failed to load user order history');
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatCurrency = (val) =>
    `₹${(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-outfit">
            Customer Directory & Access Controls
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage user accounts, block access, upgrade permissions, and inspect order histories
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search users by name or email address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 text-slate-800 dark:text-slate-100 outline-none transition-all"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="py-2 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-transparent focus:border-primary-500 outline-none font-medium"
        >
          <option value="">All Roles</option>
          <option value="user">Standard User</option>
          <option value="admin">Administrator</option>
        </select>
      </div>

      {/* User Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4"><Skeleton className="h-10 w-48 rounded-xl" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20 rounded-md" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24 rounded-md" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16 rounded-md" /></td>
                    <td className="p-4"><Skeleton className="h-8 w-28 rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : users && users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase outline-none border transition-all ${
                          u.role === 'admin'
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          u.isBlocked
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewOrders(u)}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors"
                          title="View Order History"
                        >
                          <ShoppingBag size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(u._id, u.name, u.isBlocked)}
                          className={`p-1.5 rounded-xl font-bold transition-colors ${
                            u.isBlocked
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          }`}
                          title={u.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          {u.isBlocked ? <CheckCircle size={14} /> : <Ban size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No customers found matching search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalUsers} total users)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Order History Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full border border-slate-100 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                    Customer Order History
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
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
                  Loading order history...
                </div>
              ) : userOrders.length > 0 ? (
                <div className="space-y-3">
                  {userOrders.map((o) => (
                    <div
                      key={o._id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">
                          {o.orderNumber}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(o.createdAt).toLocaleDateString()} • {o.items?.length || 0} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(o.totalAmount)}
                        </p>
                        <span className="text-[10px] font-extrabold capitalize text-emerald-600">
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-8 text-center text-xs text-slate-400 font-semibold">
                  This user has not placed any orders yet.
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
