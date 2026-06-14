"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Users, MessageSquare, Shield, Bell, AlertOctagon, Activity, UsersRound, Target, TrendingUp } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend
);

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useLang();
  const t = translations[lang];

  useEffect(() => {
    fetch("/api/dashboard/admin")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="skeleton w-full max-w-5xl h-[400px]"></div>
    </div>
  );
  if (!data) return <div className="p-8 text-center text-red-500 glass">{t.errLoadData}</div>;

  const lineData = {
    labels: data.charts.sentimentEvolution.map((d: any) => d.date),
    datasets: [
      { label: "Positive", data: data.charts.sentimentEvolution.map((d: any) => d.positive), borderColor: "#22c778", backgroundColor: "rgba(34,199,120,0.1)", tension: 0.4 },
      { label: "Neutral", data: data.charts.sentimentEvolution.map((d: any) => d.neutral), borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.1)", tension: 0.4 },
      { label: "Negative", data: data.charts.sentimentEvolution.map((d: any) => d.negative), borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", tension: 0.4 },
    ]
  };

  const barData = {
    labels: data.charts.mentionsBySource.map((d: any) => d.source),
    datasets: [{
      label: "Mentions",
      data: data.charts.mentionsBySource.map((d: any) => d._count.source),
      backgroundColor: ["#3A86FF", "#8338ec", "#ff006e"],
    }]
  };

  const pieData = {
    labels: data.charts.usersByRole.map((d: any) => d.role),
    datasets: [{
      data: data.charts.usersByRole.map((d: any) => d._count.role),
      backgroundColor: ["#ef4444", "#f59e0b", "#22c778"],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: 'var(--text-secondary)' } } },
    scales: {
      x: { ticks: { color: 'var(--text-muted)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: 'var(--text-muted)' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };
  const pieOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { color: 'var(--text-secondary)', padding: 20 } } }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
            {t.adminTitle}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-500" />
            {t.adminSub}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/settings/users" className="btn-secondary">
            <UsersRound className="w-4 h-4" />
            {t.btnManageUsers}
          </Link>
          <Link href="/dashboard/missions" className="btn-secondary">
            <Target className="w-4 h-4" />
            {t.btnAllMissions}
          </Link>
          <Link href="/dashboard/alerts" className="btn-danger">
            <Bell className="w-4 h-4" />
            {t.btnAllAlerts}
          </Link>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiRegisteredUsers}</div>
            <div className="p-2 bg-blue-500/10 rounded-lg"><Users className="w-5 h-5 text-blue-500" /></div>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-4xl font-bold">{data.kpis.totalUsers}</div>
            <div className="text-sm font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md mb-1">
              +{data.kpis.newUsersWeek} (7j)
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiTotalMentions}</div>
            <div className="p-2 bg-indigo-500/10 rounded-lg"><MessageSquare className="w-5 h-5 text-indigo-500" /></div>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-4xl font-bold">{data.kpis.totalMentions}</div>
            <div className={`text-sm font-medium px-2 py-0.5 rounded-md mb-1 ${data.kpis.mentionVariation >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
              {data.kpis.mentionVariation >= 0 ? '+' : ''}{data.kpis.mentionVariation}% (7j)
            </div>
          </div>
        </div>

        <div className="stat-card border-[var(--border-bright)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-green-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiGlobalScore}</div>
            <div className="p-2 bg-green-500/10 rounded-lg"><Shield className="w-5 h-5 text-green-500" /></div>
          </div>
          <div className="text-4xl font-bold text-green-500 relative z-10">
            {data.kpis.reputationScore}<span className="text-xl text-[var(--text-muted)]">/100</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiUnreadAlerts}</div>
            <div className="p-2 bg-red-500/10 rounded-lg"><Bell className="w-5 h-5 text-red-500 animate-pulse" /></div>
          </div>
          <div className="text-4xl font-bold text-red-500">{data.kpis.unreadAlerts}</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiAvgCrisisRisk}</div>
            <div className="p-2 bg-orange-500/10 rounded-lg"><AlertOctagon className="w-5 h-5 text-orange-500" /></div>
          </div>
          <div className="text-4xl font-bold text-orange-500">{data.kpis.crisisRisk}%</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiActiveMissions}</div>
            <div className="p-2 bg-cyan-500/10 rounded-lg"><Activity className="w-5 h-5 text-cyan-500" /></div>
          </div>
          <div className="text-4xl font-bold text-cyan-400">{data.kpis.activeMissions}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6">
          <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              {t.chartSentimentEvol}
            </h3>
          </div>
          <div className="h-[320px] w-full">
            {data.charts.sentimentEvolution.length > 0 ? (
              <Line data={lineData} options={chartOptions as any} />
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--text-muted)]">{t.noEnoughData}</div>
            )}
          </div>
        </div>
        
        <div className="glass p-6">
          <h3 className="text-lg font-semibold mb-6 border-b border-[var(--border)] pb-4">{t.chartMentionsSource}</h3>
          <div className="h-[320px] w-full">
            {data.charts.mentionsBySource.length > 0 ? (
              <Bar data={barData} options={chartOptions as any} />
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--text-muted)]">{t.noData}</div>
            )}
          </div>
        </div>
      </div>

      {/* Roles & Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass p-6">
          <h3 className="text-lg font-semibold mb-6 border-b border-[var(--border)] pb-4">{t.chartRoles}</h3>
          <div className="h-[250px] w-full">
             {data.charts.usersByRole.length > 0 ? (
               <Pie data={pieData} options={pieOptions as any} />
             ) : (
               <div className="flex items-center justify-center h-full text-[var(--text-muted)]">{t.noData}</div>
             )}
          </div>
        </div>

        <div className="lg:col-span-2 glass overflow-hidden flex flex-col">
          <div className="p-6 pb-4 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <UsersRound className="w-5 h-5 text-blue-400" />
              {t.listLatestUsers}
            </h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.tblName}</th>
                  <th>{t.tblEmail}</th>
                  <th>{t.tblRole}</th>
                  <th>{t.tblOrg}</th>
                  <th>{t.tblDate}</th>
                </tr>
              </thead>
              <tbody>
                {data.lists.latestUsers.map((u: any) => (
                  <tr key={u.id}>
                    <td className="font-medium text-[var(--text-primary)]">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${
                        u.role === 'ADMIN' ? 'badge-negative' :
                        u.role === 'ANALYST' ? 'badge-neutral' :
                        'badge-positive'
                      }`}>{u.role}</span>
                    </td>
                    <td>{u.orgName || '-'}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missions List */}
        <div className="glass p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              {t.listLatestMissions}
            </h3>
          </div>
          <div className="overflow-y-auto pr-2 flex flex-col gap-3 flex-1">
            {data.lists.latestMissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">{t.noMissions}</div>
            ) : 
              data.lists.latestMissions.map((m: any) => (
              <div key={m.id} className="w-full flex justify-between items-center p-4 rounded-xl bg-black/20 dark:bg-white/5 border border-[var(--border)] hover:border-[var(--border-bright)] transition-colors gap-4">
                <div className="flex-1">
                  <div className="font-medium text-sm text-[var(--text-primary)]">{m.title}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                    {t.by} <span className="text-white">{m.user.name}</span> • {new Date(m.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">{m.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="glass p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-500" />
              {t.listLatestAlerts}
            </h3>
          </div>
          <div className="overflow-y-auto pr-2 flex flex-col gap-3 flex-1">
            {data.lists.latestAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">{t.noAlerts}</div>
            ) : 
              data.lists.latestAlerts.map((a: any) => (
              <div key={a.id} className="flex justify-between items-center p-4 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors">
                <div className="flex gap-3 items-start">
                  <div className="mt-1.5"><AlertOctagon className="w-4 h-4 text-red-500" /></div>
                  <div>
                    <div className="font-medium text-sm text-[var(--text-primary)]">{a.message}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">{new Date(a.triggeredAt).toLocaleString()}</div>
                  </div>
                </div>
                <span className="badge badge-negative ml-2 shrink-0">{a.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
