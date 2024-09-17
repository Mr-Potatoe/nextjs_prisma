'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
}

const Home = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
  }, []);

  const deleteUser = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">User Management</h1>
      <Link href="/add-user" className="bg-blue-600 text-white px-6 py-3 rounded shadow-md hover:bg-blue-700 transition duration-300 mb-6 inline-block">
        Add New User
      </Link>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="py-3 px-6 text-center">Name</th>
              <th className="py-3 px-6 text-center">Email</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-300">
                <td className="py-4 px-6 text-gray-800">{user.name}</td>
                <td className="py-4 px-6 text-gray-600">{user.email}</td>
                <td className="py-4 px-6 flex space-x-2">
                  <Link href={`/edit-user/${user.id}`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300">
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
