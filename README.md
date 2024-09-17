# Next.js CRUD Application with Prisma and MySQL

## Introduction

This guide will walk you through building a full-stack CRUD (Create, Read, Update, Delete) application using Next.js, Prisma, and MySQL. This application allows you to manage user records with a clean and user-friendly interface.

## Prerequisites

Before we start, make sure you have the following installed:

- **Node.js** (LTS version recommended)
- **MySQL** (local or remote database server)
- **Next.js** (create-next-app)
- **Prisma** (ORM for database management)
- **Tailwind CSS** (for styling)

## Project Setup

### 1. Initialize a Next.js Project

First, create a new Next.js project:

```bash
npx create-next-app@latest my-nextjs-crud
cd my-nextjs-crud
```

### 2. Install Dependencies

Install the necessary packages for Prisma and MySQL:

```bash
npm install prisma @prisma/client
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Configure Tailwind CSS

Update `tailwind.config.js` to include the paths for your Next.js files:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update `globals.css` in the `styles` directory to include Tailwind's base, components, and utilities:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #613737;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### 4. Set Up Prisma

1. **Initialize Prisma**:

    ```bash
    npx prisma init
    ```

2. **Configure the Database**:

    Update the `prisma/schema.prisma` file with your MySQL database credentials:

    ```prisma
    datasource db {
      provider = "mysql"
      url      = env("DATABASE_URL")
    }

    generator client {
      provider = "prisma-client-js"
    }

    model User {
      id    Int    @id @default(autoincrement())
      name  String
      email String @unique
    }
    ```

3. **Apply Migrations**:

    Create and apply migrations to set up your database schema:

    ```bash
    npx prisma migrate dev --name init
    ```

4. **Generate Prisma Client**:

    ```bash
    npx prisma generate
    ```

### 5. Create API Routes

Create the necessary API routes for CRUD operations in the `app/api/users` directory.

**`app/api/users/route.ts`**:

```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const { name, email } = await request.json();
  const newUser = await prisma.user.create({
    data: { name, email },
  });
  return NextResponse.json(newUser);
}
```

**`app/api/users/[id]/route.ts`**:

```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(params.id) },
  });
  return NextResponse.json(user);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { name, email } = await request.json();
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(params.id) },
    data: { name, email },
  });
  return NextResponse.json(updatedUser);
}

export async function DELETE({ params }: { params: { id: string } }) {
  await prisma.user.delete({
    where: { id: parseInt(params.id) },
  });
  return NextResponse.json({ message: 'User deleted' });
}
```

### 6. Create Pages

**Home Page (`app/page.tsx`)**:

```typescript
'use client';

import { useState, useEffect } from 'react';
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
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">User Management</h1>
      <Link href="/add-user" className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
        Add New User
      </Link>

      <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-md">
        <thead>
          <tr>
            <th className="py-3 px-4 border-b">Name</th>
            <th className="py-3 px-4 border-b">Email</th>
            <th className="py-3 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="py-3 px-4">{user.name}</td>
              <td className="py-3 px-4">{user.email}</td>
              <td className="py-3 px-4">
                <Link href={`/edit-user/${user.id}`} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">
                  Edit
                </Link>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
```

**Add User Page (`app/add-user/page.tsx`)**:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const AddUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
      if (!response.ok) throw new Error('Failed to add user');
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Add User</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange

={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Add User
        </button>
      </form>
    </div>
  );
};

export default AddUser;
```

**Edit User Page (`app/edit-user/[id]/page.tsx`)**:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const EditUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        const user = await res.json();
        setName(user.name);
        setEmail(user.email);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
      if (!response.ok) throw new Error('Failed to update user');
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Edit User</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Update User
        </button>
      </form>
    </div>
  );
};

export default EditUser;
```

## Conclusion

You now have a fully functional CRUD application built with Next.js, Prisma, and MySQL. This setup allows you to manage users through a clean and intuitive interface with proper data handling and CRUD operations. 

Feel free to extend and customize this application according to your needs.

