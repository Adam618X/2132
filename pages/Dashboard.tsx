import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { channelService } from '../services/channel';
import { LogEntry, UserProfile, REGION_STATS } from '../types';

const Dashboard: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [metrics, setMetrics] = useState({ l1: 50, l2: 50, l3: 50 });
    const [tags, setTags] = useState<string[]>([]);
    const [online, setOnline] = useState(false);
    const [stats, setStats] = useState({
        height: '--',
        bmi: '--',
        conflict: '--',
        job: '--'
    });

    useEffect(() => {
        channelService.onMessage((event) => {
            const { type, payload } = event.data;
            setOnline(true);
            const newLog: LogEntry = { type, payload, timestamp: new Date().toLocaleTimeString(), id: Math.random().toString() };
            setLogs(prev => [newLog, ...prev]);

            if (type === 'PROFILE_INIT') handleInit(payload);
            if (type === 'WIZARD_COMPLETE') {
                if (payload.metrics) setMetrics(payload.metrics);
                if (payload.cards) {
                    payload.cards.forEach((c: any) => c.tags.forEach((t: string) => addTag(t)));
                }
            }
            if (type === 'ACTION_LIKE') {
                 addTag('主动表达');
                 setMetrics(m => ({ ...m, l3: Math.min(100, m.l3 + 5) }));
            }
            if (type === 'ACTION_REVIEW') {
                if (payload.rating > 3) {
                     addTag('美食鉴赏家');
                     setMetrics(m => ({ ...m, l3: Math.min(100, m.l3 + 10) }));
                }
            }
        });

        // Check for existing local profile in case dashboard is opened later
        const storedProfile = localStorage.getItem('finalUserProfile');
        if (storedProfile) {
            handleInit(JSON.parse(storedProfile));
        }

        return () => channelService.close();
    }, []);

    const handleInit = (data: UserProfile) => {
        setUserProfile(data);
        const rStat = REGION_STATS[data.origin] || { baseHeight: 170 };
        setStats({
            height: `~${rStat.baseHeight}cm`,
            bmi: (data.job_meta?.sedentary ? 'Risk: High' : 'Risk: Low'),
            conflict: data.origin === data.location ? 'Low' : 'High',
            job: data.job
        });
        if (data.metrics) setMetrics(data.metrics);
        if (data.tags) setTags(data.tags);
    };

    const addTag = (tag: string) => {
        setTags(prev => prev.includes(tag) ? prev : [...prev, tag]);
    };

    const radarData = [
        { subject: 'L1 生理', A: metrics.l1, fullMark: 100 },
        { subject: 'L2 资本', A: metrics.l2, fullMark: 100 },
        { subject: 'L3 文化', A: metrics.l3, fullMark: 100 },
    ];

    return (
        <div className="bg-slate-950 text-slate-400 font-mono min-h-screen grid grid-cols-[300px_1fr_300px] overflow-hidden h-screen">
            {/* Left: Logs */}
            <div className="border-r border-slate-800 flex flex-col bg-slate-900">
                <div className="p-3 border-b border-slate-800 bg-slate-950 flex justify-between items-center text-xs font-bold">
                    <span><i className="fa-solid fa-satellite-dish mr-2 text-blue-500"></i>实时数据流</span>
                    <span className={online ? "text-emerald-500 animate-pulse" : "text-red-500"}>● {online ? 'Online' : 'Offline'}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin flex flex-col-reverse">
                    {logs.map(log => (
                        <div key={log.id} className="text-[10px] p-2 border-l-2 border-blue-500 bg-blue-500/5 animate-in slide-in-from-left-2">
                            <span className="opacity-50 mr-2">[{log.timestamp}]</span>
                            <span className="text-blue-300 font-bold">{log.type}</span>
                            <div className="text-slate-500 truncate">{JSON.stringify(log.payload)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Middle: Engine */}
            <div className="flex flex-col bg-slate-950 relative overflow-y-auto scrollbar-thin p-6">
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded mb-6 relative overflow-hidden">
                     <i className="fa-solid fa-fingerprint absolute top-2 right-4 text-6xl opacity-10"></i>
                     <div className="flex justify-between">
                         <div>
                             <div className="text-[10px] uppercase">主体身份</div>
                             <div className="text-xl font-bold text-white tracking-wider">{userProfile?.username || 'Waiting...'}</div>
                         </div>
                         <div className="text-right">
                             <div className="text-[10px] uppercase">Device</div>
                             <div className="font-bold text-xs text-blue-300">{userProfile?.device || '--'}</div>
                         </div>
                     </div>
                     <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                         {Object.entries(stats).map(([k, v]) => (
                             <div key={k} className="bg-slate-900 p-2 rounded border border-slate-800">
                                 <div className="text-[10px] uppercase text-slate-500">{k}</div>
                                 <div className="text-xs font-bold text-emerald-400">{v}</div>
                             </div>
                         ))}
                     </div>
                </div>

                <div className="h-64 mb-6 relative w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                            <Radar name="Profile" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="border-t border-slate-800 pt-4">
                     <div className="text-[10px] uppercase font-bold mb-2 text-slate-500">推演触发器</div>
                     <div className="bg-slate-900 border border-slate-700 p-3 rounded text-xs border-l-2 border-red-500">
                         <div className="font-bold text-red-400 mb-1">系统状态</div>
                         {userProfile ? '画像构建完成，正在进行行为修正。' : '等待用户接入...'}
                     </div>
                </div>
            </div>

            {/* Right: Matrix */}
            <div className="bg-slate-900 border-l border-slate-800 flex flex-col">
                <div className="p-3 border-b border-slate-800 bg-slate-950 font-bold text-xs text-purple-400">
                    <i className="fa-solid fa-cube mr-2"></i>三维60标签矩阵
                </div>
                <div className="p-4 flex-1 overflow-y-auto scrollbar-thin">
                    <div className="flex flex-wrap gap-2 content-start">
                        {tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-1 bg-slate-800 border border-slate-700 rounded text-purple-300 animate-in zoom-in duration-300">
                                {tag}
                            </span>
                        ))}
                        {tags.length === 0 && <span className="text-xs text-slate-600">No tags generated yet.</span>}
                    </div>
                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-950">
                    <div className="text-[10px] uppercase text-slate-500 mb-1">隐式画像反推</div>
                    <div className="text-lg font-bold text-white">{tags.includes('口嫌体正直') ? '纠结的享乐主义者' : '分析中...'}</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;