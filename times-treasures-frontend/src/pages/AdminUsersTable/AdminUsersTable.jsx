import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { FaTrash, FaEdit } from 'react-icons/fa';
import styles from './AdminUsersTable.module.css';

const AdminUsersTable = () => {
  const { token, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUserData, setEditUserData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 4;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || user.role !== 'admin') return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.data);
      } catch (error) {
        toast.error('Error fetching users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user, token]);

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  const openEditModal = (user) => {
    setEditUserData(user);
  };

  const saveEditUser = async () => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/admin/users/${editUserData._id}`, editUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.map((u) => (u._id === editUserData._id ? res.data.data : u)));
      toast.success('User updated successfully');
      setEditUserData(null);
    } catch (error) {
      toast.error('Error updating user');
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className={styles.container}>
      <h2>Admin Users</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Family Name</th>
                <th>Email</th>
                <th>Birth Date</th>
                <th>Sex</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.familyName || 'None'}</td>
                  <td>{u.email}</td>
                  <td>{u.birthDate ? new Date(u.birthDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{u.sex || 'Invalid'}</td>
                  <td>{u.role}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <FaEdit className={styles.icon} onClick={() => openEditModal(u)} />
                    <FaTrash className={styles.icon} onClick={() => deleteUser(u._id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* פאגינציה */}
          <div className={styles.pagination}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
              Next
            </button>
          </div>
        </>
      )}

      {editUserData && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Edit User</h3>
            <label>Name:</label>
            <input type="text" value={editUserData.name} onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })} />

            <label>Family Name:</label>
            <input type="text" value={editUserData.familyName || ''} onChange={(e) => setEditUserData({ ...editUserData, familyName: e.target.value })} />

            <label>Email:</label>
            <input type="email" value={editUserData.email} onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })} />

            <label>Role:</label>
            <select value={editUserData.role} onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <div className={styles.modalActions}>
              <button onClick={saveEditUser}>Save</button>
              <button onClick={() => setEditUserData(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersTable;
