import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import CdrAnalysisView from './components/CdrAnalysisView';
import NetworkGraphView from './components/NetworkGraphView';
import TowerTimelineView from './components/TowerTimelineView';
import IpdrAnalysisView from './components/IpdrAnalysisView';
import AssistantView from './components/AssistantView';
import ReportsView from './components/ReportsView';
import { fetchDashboard, resetDemoData } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [targetNumber, setTargetNumber] = useState('+91 98765 43210');
  const [dashboardData, setDashboardData] = useState(null);
  const [availableNumbers, setAvailableNumbers] = useState([
    '+91 98765 43210',
    '+91 91234 56789',
    '+91 99887 76655',
    '+91 97711 22334',
    '+91 98111 22233',
    '+91 94455 66778'
  ]);
  const [isResetting, setIsResetting] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadData = async () => {
    try {
      const data = await fetchDashboard();
      setDashboardData(data);
      if (data.defaultTargetNumber && !targetNumber) {
        setTargetNumber(data.defaultTargetNumber);
      }
      if (data.charts?.topCallers?.length > 0) {
        const topNums = data.charts.topCallers.map(c => c.number);
        setAvailableNumbers(prev => [...new Set([...topNums, ...prev])]);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetData = async () => {
    try {
      setIsResetting(true);
      await resetDemoData();
      await loadData();
      setNotification('Datasets reset to default baseline synthetic demo records.');
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      alert(`Error resetting: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <Header 
          targetNumber={targetNumber}
          setTargetNumber={setTargetNumber}
          availableNumbers={availableNumbers}
          caseId={dashboardData?.caseId || 'CASE-2026-X88'}
        />

        {notification && (
          <div style={{
            margin: '1rem 2rem 0 2rem',
            padding: '0.65rem 1rem',
            borderRadius: 6,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{notification}</span>
            <button 
              onClick={() => setNotification(null)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}
            >
              ×
            </button>
          </div>
        )}

        <div className="content-body">
          {activeTab === 'dashboard' && (
            <DashboardView 
              dashboardData={dashboardData}
              onNavigate={(tab) => setActiveTab(tab)}
              setTargetNumber={setTargetNumber}
            />
          )}

          {activeTab === 'cdr' && (
            <CdrAnalysisView 
              targetNumber={targetNumber}
              setTargetNumber={setTargetNumber}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'network' && (
            <NetworkGraphView 
              targetNumber={targetNumber}
              setTargetNumber={setTargetNumber}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'towers' && (
            <TowerTimelineView 
              targetNumber={targetNumber}
            />
          )}

          {activeTab === 'ipdr' && (
            <IpdrAnalysisView 
              targetNumber={targetNumber}
            />
          )}

          {activeTab === 'assistant' && (
            <AssistantView 
              targetNumber={targetNumber}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView 
              targetNumber={targetNumber}
            />
          )}
        </div>
      </main>
    </div>
  );
}
