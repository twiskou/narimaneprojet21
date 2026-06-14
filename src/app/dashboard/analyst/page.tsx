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
import { Clock, Target, CheckCircle2, AlertTriangle, Activity, PlusCircle, BarChart2, TrendingUp } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend
);

export default function AnalystDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const { lang } = useLang();
  const t = translations[lang];

  const fetchData = () => {
    fetch("/api/dashboard/analyst")
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnalyze = async (id: string) => {
    setAnalyzingId(id);
    try {
      await fetch("/api/ai/analyze", { method: "POST", body: JSON.stringify({ mentionId: id }) });
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="skeleton w-full max-w-4xl h-[400px]"></div>
    </div>
  );
  if (!data) return <div className="p-8 text-center text-red-500 glass">{t.errLoadData}</div>;

  const lineData = {
    labels: data.charts.analysesEvolution.map((d: any) => d.date),
    datasets: [{
      label: t.btnAnalyses,
      data: data.charts.analysesEvolution.map((d: any) => d.count),
      borderColor: "#3A86FF",
      backgroundColor: "rgba(58,134,255,0.1)",
      tension: 0.4,
      fill: true,
    }]
  };

  const pieData = {
    labels: data.charts.mySentiments.map((d: any) => d.sentiment),
    datasets: [{
      data: data.charts.mySentiments.map((d: any) => d._count.sentiment),
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

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-yellow-500">
            {t.analystTitle}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" />
            {t.analystSub}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">

          <Link href="/dashboard/missions" className="btn-secondary">
            <PlusCircle className="w-4 h-4" />
            {t.btnCreateMission}
          </Link>
          <Link href="/dashboard/analytics" className="btn-secondary">
            <BarChart2 className="w-4 h-4" />
            {t.btnAnalyses}
          </Link>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiAnalyzedByMe}</div>
            <div className="p-2 bg-blue-500/10 rounded-lg"><CheckCircle2 className="w-5 h-5 text-blue-500" /></div>
          </div>
          <div className="text-3xl font-bold">{data.kpis.myAnalysesCount}</div>
        </div>
        
        <div className="stat-card border-[var(--border-bright)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-orange-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiPending}</div>
            <div className="p-2 bg-orange-500/10 rounded-lg"><Clock className="w-5 h-5 text-orange-500" /></div>
          </div>
          <div className="text-3xl font-bold text-orange-500 relative z-10">{data.kpis.pendingMentionsCount}</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiAvgScore}</div>
            <div className="p-2 bg-green-500/10 rounded-lg"><Target className="w-5 h-5 text-green-500" /></div>
          </div>
          <div className="text-3xl font-bold text-green-500">{data.kpis.avgScore}<span className="text-lg text-[var(--text-muted)]">/100</span></div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiAvgRisk}</div>
            <div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          </div>
          <div className="text-3xl font-bold text-red-500">{data.kpis.avgRisk}<span className="text-lg text-[var(--text-muted)]">%</span></div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-medium text-[var(--text-secondary)]">{t.kpiActiveMissions}</div>
            <div className="p-2 bg-purple-500/10 rounded-lg"><Activity className="w-5 h-5 text-purple-500" /></div>
          </div>
          <div className="text-3xl font-bold text-purple-400">{data.kpis.myActiveMissions}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6">
          <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              {t.chartMyAnalyses}
            </h3>
          </div>
          <div className="h-[300px] w-full">
            {data.charts.analysesEvolution.length > 0 ? (
              <Line data={lineData} options={chartOptions as any} />
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--text-muted)]">{t.noEnoughData}</div>
            )}
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="text-lg font-semibold mb-6 border-b border-[var(--border)] pb-4">{t.chartSentiments}</h3>
          <div className="h-[300px] w-full">
            {data.charts.mySentiments.length > 0 ? (
              <Pie data={pieData} options={pieOptions as any} />
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--text-muted)]">{t.noData}</div>
            )}
          </div>
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mentions to Analyze */}
        <div className="glass p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              {t.listMentionsAnalyze}
            </h3>
            <span className="badge badge-neutral">{data.lists.pendingMentions.length}</span>
          </div>
          <div className="overflow-y-auto pr-2 flex flex-col gap-3 flex-1">
            {data.lists.pendingMentions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-500/50" />
                <span>{t.allAnalyzed}</span>
              </div>
            ) : (
              data.lists.pendingMentions.map((m: any) => (
                <div key={m.id} className="w-full p-3 rounded-xl bg-black/20 dark:bg-white/5 border border-[var(--border)] hover:border-[var(--border-bright)] transition-colors flex justify-between items-center gap-4">
                  <div className="text-sm line-clamp-2 text-[var(--text-primary)] leading-snug flex-1 mr-2">{m.content}</div>
                  <button 
                    onClick={() => handleAnalyze(m.id)}
                    disabled={analyzingId === m.id}
                    className="btn-primary px-3 py-1.5 text-xs whitespace-nowrap shrink-0 disabled:opacity-50"
                  >
                    {analyzingId === m.id ? '...' : t.analyzeBtn}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="glass p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              {t.listRecentAnalyses}
            </h3>
          </div>
          <div className="overflow-y-auto pr-2 flex flex-col gap-3 flex-1">
            {data.lists.myLatestAnalyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">{t.noRecentAnalysis}</div>
            ) : (
              data.lists.myLatestAnalyses.map((a: any) => (
                <div key={a.id} className="w-full p-4 rounded-xl bg-black/20 dark:bg-white/5 border border-[var(--border)] hover:border-[var(--border-bright)] transition-colors">
                  <div className="flex justify-between items-start mb-3 gap-4">
                    <span className={`badge ${
                        a.sentiment === 'POSITIVE' ? 'badge-positive' :
                        a.sentiment === 'NEUTRAL' ? 'badge-neutral' :
                        'badge-negative'
                      }`}>{a.sentiment}</span>
                    <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {(a.score * 100).toFixed(0)}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--text-primary)] mb-3 line-clamp-2 leading-relaxed">{a.summary}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-[var(--text-muted)] w-24">{t.crisisRisk}</div>
                    <div className="flex-1 bg-black/30 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full transition-all" style={{ width: `${a.crisisRisk}%` }}></div>
                    </div>
                    <div className="text-xs font-medium text-red-400">{a.crisisRisk}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Missions */}
        <div className="glass p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              {t.listMyMissions}
            </h3>
            <Link href="/dashboard/missions" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              {t.manage} <TrendingUp className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-y-auto pr-2 flex flex-col gap-3 flex-1">
            {data.lists.myLatestMissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">{t.noMissions}</div>
            ) : (
              data.lists.myLatestMissions.map((m: any) => (
                <div key={m.id} className="w-full p-3 rounded-xl bg-black/20 dark:bg-white/5 border border-[var(--border)] hover:border-[var(--border-bright)] transition-colors flex justify-between items-center gap-4">
                  <div className="font-medium text-sm flex-1 mr-2">{m.title}</div>
                  <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20">{m.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
