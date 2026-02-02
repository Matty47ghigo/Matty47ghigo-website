import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3001/api/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h2><User /> Utenti Registrati</h2>
            <ul style={{ marginTop: '1rem', listStyle: 'none' }}>
                {users.map(user => (
                    <li key={user.id} style={{ padding: '1rem', background: 'var(--card-bg)', marginBottom: '0.5rem', borderRadius: '5px' }}>
                        <strong>{user.name}</strong> - {user.email}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Users;
