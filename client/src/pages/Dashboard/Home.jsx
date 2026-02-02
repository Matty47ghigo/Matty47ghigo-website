import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardHome = () => {
    const [stats, setStats] = useState({ visitors: 0, registeredUsers: 0, orders: 0 });

    useEffect(() => {
        // Fetch stats from API
        axios.get('http://localhost:3001/api/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, []);

    const lineData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Visitatori',
                data: [120, 190, 300, 500, 200, stats.visitors], // Mock logic
                borderColor: '#fca311',
                backgroundColor: 'rgba(252, 163, 17, 0.5)',
            },
        ],
    };

    const doughnutData = {
        labels: ['Registrati', 'Guest'],
        datasets: [
            {
                data: [stats.registeredUsers, stats.visitors - stats.registeredUsers],
                backgroundColor: ['#4caf50', '#14213d'],
                borderColor: ['#fff', '#fff'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div>
            <div className="welcome-banner" style={{ marginBottom: '2rem' }}>
                <h1 className="title" style={{ marginBottom: '0.5rem' }}>Benvenuto Mattia Ghigo</h1>
                <p style={{ fontSize: '1.2rem', color: '#888' }}>Cosa facciamo oggi?</p>
            </div>

            <div className="grid-dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '10px' }}>
                    <h3>Andamento Visitatori</h3>
                    <div style={{ height: '300px' }}>
                        <Line options={{ maintainAspectRatio: false }} data={lineData} />
                    </div>
                </div>
                <div className="card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '10px' }}>
                    <h3>Utenti vs Guest</h3>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut options={{ maintainAspectRatio: false }} data={doughnutData} />
                    </div>
                </div>
                 <div className="card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '10px' }}>
                    <h3>Statistiche Rapide</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                            <span>Visitatori Totali:</span>
                            <span style={{ color: 'var(--primary-color)' }}>{stats.visitors}</span>
                        </div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                            <span>Utenti Registrati:</span>
                            <span style={{ color: 'var(--primary-color)' }}>{stats.registeredUsers}</span>
                        </div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                            <span>Ordini Pendenti:</span>
                            <span style={{ color: 'var(--primary-color)' }}>{stats.orders}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
