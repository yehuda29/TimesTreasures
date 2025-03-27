// src/pages/AdminUsersTable/AdminUsersTable.jsx
import React, { useState, useEffect, useContext} from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import styles from './AdminUsersTable.module.css';

const AdminUsersTable = () => {
  const { token, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || user.role !== 'admin') return;
      try {

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`,
          {
            headers: {
                Authorization: `Bearer ${token}`,
            },
          }
        );
        const allusers = res.data.data;
        setUsers(allusers);
      } catch (error) {
        toast.error('Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, token]);
  

  return (
    <div className={styles.container}>
      <h2>Admin Users</h2>

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
            </tr>
          </thead>
          <tbody>
          {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.familyName || "None"}</td>
                <td>{u.email}</td>
                <td>
                  {new Date(u.birthDate).toLocaleDateString()} {/* format if desired */}
                </td>
                <td>{u.sex || "Invalid"}</td>
                <td>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
    
          </tbody>
        </table>
    </div>
  );
};


export default AdminUsersTable;