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
import { Line, Pie } from "react-chartjs-2";
import { Eye, TrendingUp, AlertTriangle, Target, MessageSquare, Bell, Activity } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend
);

export default function ViewerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useLang();
  const t = translations[lang];

  useEffect(() => {
    fetch("/api/dashboard/viewer")
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
      <div className="skeleton w-full max-w-4xl h-[400px]"></div>
    </div>
  );
  if (!data) return <div className="p-8 text-center text-red-500 glass">{t.errLoadData}</div>;

  const lineData = {
    labels: data.charts.reputationEvolution.map((d: any) => d.date),
    datasets: [{
      label: t.kpiRepScore,
      data: data.charts.reputationEvolution.map((d: any) => d.score),
      borderColor: "#22c778",
      backgroundColor: "rgba(34,199,120,0.1)",
      tension: 0.4,
      fill: true
    }]
  };

  const pieData = {
    labels: data.charts.globalSentiments.map((d: any) => d.sentiment),
    datasets: [{
      data: data.charts.globalSentiments.map((d: any) => d._count.sentiment),
      backgroundColor: ["#22c778", "#f59e0b", "#ef4444"],
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

  const repScore = data.kpis.reputationScore;
  const repColor = repScore > 70 ? 'text-green-500' : repScore >= 40 ? 'text-orange-500' : 'text-red-500';

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-500">
            {t.viewerTitle}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 flex items-center gap-2">
            <Eye className="w-4 h-4 text-teal-500" />
            {t.viewerSub}
          </p>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card border-[var(--border-bright)] relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-colors ${
            repScore > 70 ? 'bg-green-500/10' : repScore >= 40 ? 'bg-orange-500/10' : 'bg-red-500/10'
          }`}></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiRepScore}</div>
            <div className={`p-2 rounded-lg ${repScore > 70 ? 'bg-green-500/10' : repScore >= 40 ? 'bg-orange-500/10' : 'bg-red-500/10'}`}>
              <Target className={`w-5 h-5 ${repColor}`} />
            </div>
          </div>
          <div className={`text-4xl font-bold relative z-10 ${repColor}`}>{repScore}<span className="text-xl text-[var(--text-muted)]">/100</span></div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiMentionsWeek}</div>
            <div className="p-2 bg-blue-500/10 rounded-lg"><MessageSquare className="w-5 h-5 text-blue-500" /></div>
          </div>
          <div className="text-4xl font-bold">{data.kpis.newMentionsWeek}</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiActiveAlerts}</div>
            <div className="p-2 bg-red-500/10 rounded-lg"><Bell className="w-5 h-5 text-red-500 animate-pulse" /></div>
          </div>
          <div className="text-4xl font-bold text-red-500">{data.kpis.unreadAlerts}</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.crisisRisk}</div>
            <div className="p-2 bg-orange-500/10 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-500" /></div>
          </div>
          <div className="text-4xl font-bold text-orange-500">{data.kpis.crisisRisk}%</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6">
          <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              {t.chartRepEvol}
            </h3>
          </div>
          <div className="h-[300px] w-full">
            {data.charts.reputationEvolution.length > 0 ? (
              <Line data={lineData} options={chartOptions as any} />
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--text-muted)]">{t.noEnoughData}</div>
            )}
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="text-lg font-semibold mb-6 border-b border-[var(--border)] pb-4">{t.chartSentiments}</h3>
          <div className="h-[300px] w-full">
            {data.charts.globalSentiments.length > 0 ? (
              <Pie data={pieData} options={pieOptions as any} />
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--text-muted)]">{t.noData}</div>
            )}
          </div>
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mentions */}
        <div className="glass p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              {t.listMentions}
            </h3>
          </div>
          <div className="overflow-y-auto pr-2 flex flex-col gap-3 flex-1">
            {data.lists.latestMentions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">{t.noData}</div>
            ) : (
              data.lists.latestMentions.map((m: any) => (
                <div key={m.id} className="p-4 rounded-xl bg-black/20 dark:bg-white/5 border border-[var(--border)] hover:border-[var(--border-bright)] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    {m.aiAnalysis ? (
                      <span className={`badge ${
                        m.aiAnalysis.sentiment === 'POSITIVE' ? 'badge-positive' :
                        m.aiAnalysis.sentiment === 'NEUTRAL' ? 'badge-neutral' :
                        'badge-negative'
                      }`}>{m.aiAnalysis.sentiment}</span>
                    ) : <span className="badge bg-gray-500/10 text-gray-400 border border-gray-500/20">{t.notAnalyzed}</span>}
                    <span className="text-xs text-[var(--text-secondary)]">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-[var(--text-primary)] leading-snug line-clamp-2">{m.content}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="glass p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-500" />
              {t.listAlerts}
            </h3>
            <Link href="/dashboard/alerts" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">{t.seeAll}</Link>
          </div>
          <div className="overflow-y-auto pr-2 flex flex-col gap-3 flex-1">
            {data.lists.latestAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">{t.noAlerts}</div>
            ) : (
              data.lists.latestAlerts.map((a: any) => (
                <div key={a.id} className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-xs text-red-500">{a.type}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{new Date(a.triggeredAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-[var(--text-primary)] mt-1">{a.message}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Missions */}
        <div className="glass p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              {t.listMissions}
            </h3>
          </div>
          <div className="overflow-y-auto pr-2 flex flex-col gap-3 flex-1">
            {data.lists.activeMissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">{t.noMissions}</div>
            ) : (
              data.lists.activeMissions.map((m: any) => (
                <div key={m.id} className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-colors">
                  <div className="font-medium text-sm text-[var(--text-primary)] mb-1">{m.title}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{t.managedBy} <span className="text-[var(--text-primary)]">{m.user.name}</span></div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
