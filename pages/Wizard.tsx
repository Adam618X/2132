import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { channelService } from '../services/channel';

const wizardData = [
    {
        id: 'P1',
        title: '身体与节律',
        desc: '您的生物钟与能量状态是怎样的？(L1 生理层)',
        cards: [
            { name: '早C晚A', icon: '☕', tags: ['咖啡续命', '酒精依赖', '都市白领'], weight: { l1: -5, l2: 5 } },
            { name: '熬夜修仙', icon: '🌙', tags: ['夜猫子', '内分泌失调', '深夜食堂'], weight: { l1: -10 } },
            { name: '自律健身', icon: '💪', tags: ['健身狂魔', '高蛋白', '低卡'], weight: { l1: 15 } },
            { name: '起床困难', icon: '🛌', tags: ['拖延症', '早餐绝缘体', '碳水渴望'], weight: { l1: -2 } },
            { name: '情绪解压', icon: '😫', tags: ['暴饮暴食', '甜食控', '压力大'], weight: { l1: -5 } },
            { name: '朋克养生', icon: '💊', tags: ['养生达人', '保温杯', '熬夜护肤'], weight: { l1: 0 } },
            { name: '易瘦体质', icon: '🧬', tags: ['高代谢', '肉食动物', '令人嫉妒'], weight: { l1: 10 } },
            { name: '轻断食', icon: '🥗', tags: ['成分党', '自律', '清淡'], weight: { l1: 5 } },
            { name: '周末特种兵', icon: '🚄', tags: ['精力旺盛', '打卡狂人', '快节奏'], weight: { l1: 5 } }
        ]
    },
    {
        id: 'P2',
        title: '消费与阶层',
        desc: '您的消费决策是为了生存还是展示？(L2 资本层)',
        cards: [
            { name: '孤独美食家', icon: '🍜', tags: ['一人食', '品质控', '社恐'], weight: { l2: 5 } },
            { name: '拼单名媛', icon: '🤳', tags: ['精致穷', '拍照好看', '下午茶'], weight: { l2: -5, l3: 5 } },
            { name: '极致性价比', icon: '🏷️', tags: ['价格敏感', '羊毛党', '量大管饱'], weight: { l2: -10 } },
            { name: '商务局', icon: '🤝', tags: ['排面', '高客单', '私密性'], weight: { l2: 15 } },
            { name: '铲屎官', icon: '🐱', tags: ['有爱心', '月光族', '治愈系'], weight: { l2: -2 } },
            { name: '探店KOL', icon: '📸', tags: ['尝鲜派', '分享欲', '视觉系'], weight: { l3: 10 } },
            { name: '攒钱买房', icon: '🏠', tags: ['务实', '自己做饭', '低消费'], weight: { l2: 5 } },
            { name: '电子榨菜', icon: '📱', tags: ['外卖依赖', '宅', '下饭视频'], weight: { l1: -5 } }
        ]
    },
    {
        id: 'P3',
        title: '文化与符号',
        desc: '您属于哪个“文化部落”？(L3 文化层)',
        cards: [
            { name: '二次元', icon: '🎮', tags: ['ACG', '宅', '联名款'], weight: { l3: 10 } },
            { name: '国潮复古', icon: '🏮', tags: ['怀旧派', '中式点心', '文化自信'], weight: { l3: 5 } },
            { name: '赛博朋克', icon: '🤖', tags: ['科技感', '猎奇', '霓虹灯'], weight: { l3: 8 } },
            { name: '精致露营', icon: '⛺', tags: ['中产生活', '手冲咖啡', '户外'], weight: { l3: 8, l2: 5 } },
            { name: '市井烟火', icon: '🔥', tags: ['接地气', '大排档', '苍蝇馆子'], weight: { l3: 5, l2: -5 } },
            { name: '纯欲风', icon: '🍑', tags: ['颜值正义', '甜品', '网红打卡'], weight: { l3: 5 } },
            { name: '极客黑白', icon: '⌨️', tags: ['极简主义', '黑咖啡', '效率'], weight: { l3: 8 } },
            { name: '环保低碳', icon: '♻️', tags: ['素食主义', '自带杯', '健康'], weight: { l3: 10 } }
        ]
    },
    {
        id: 'P4',
        title: '饮食极性',
        desc: '剥离文化后，身体最诚实的欲望？(L1 本能层)',
        cards: [
            { name: '地狱辣', icon: '🌶️', tags: ['无辣不欢', '重口味', '解压'], weight: { l1: 5 } },
            { name: '全糖去冰', icon: '🥤', tags: ['嗜甜', '多巴胺', '快乐水'], weight: { l1: 5 } },
            { name: '碳水炸弹', icon: '🥖', tags: ['主食控', '满足感', '高热量'], weight: { l1: 5 } },
            { name: '纯肉盛宴', icon: '🥩', tags: ['肉食主义', '大口吃肉', '满足'], weight: { l1: 5 } },
            { name: '吃草一族', icon: '🥬', tags: ['轻食', '减脂', '自律'], weight: { l1: -5 } },
            { name: '重油重盐', icon: '🧂', tags: ['下饭', '北方胃', '重口'], weight: { l1: 5 } },
            { name: '海鲜至尊', icon: '🦞', tags: ['痛风套餐', '鲜美', '高蛋白'], weight: { l1: 2, l2: 5 } },
            { name: '原汁原味', icon: '🍲', tags: ['粤菜', '清淡', '食材本味'], weight: { l1: -2 } }
        ]
    }
];

const Wizard: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedCardsData, setSelectedCardsData] = useState<any[]>([]);

    useEffect(() => {
        if (!localStorage.getItem('finalUserProfile')) {
            navigate('/login');
        }
    }, [navigate]);

    const currentData = wizardData[currentPage];
    const selectionsInCurrentPage = selectedCardsData.filter(c => 
        currentData.cards.some(card => card.name === c.name)
    );

    const toggleSelection = (card: any) => {
        const exists = selectedCardsData.some(c => c.name === card.name);
        if (exists) {
            setSelectedCardsData(prev => prev.filter(c => c.name !== card.name));
        } else {
            setSelectedCardsData(prev => [...prev, card]);
        }
    };

    const handleNext = () => {
        if (currentPage < 3) {
            setCurrentPage(p => p + 1);
        } else {
            finishAndRedirect();
        }
    };

    const finishAndRedirect = () => {
        const profileStr = localStorage.getItem('finalUserProfile');
        if (!profileStr) return;
        let profile = JSON.parse(profileStr);

        profile.explicit_cards = selectedCardsData;
        const newTags = new Set(profile.tags);
        
        selectedCardsData.forEach(card => {
            card.tags.forEach((t: string) => newTags.add(t));
            if (card.weight) {
                if (card.weight.l1) profile.metrics.l1 += card.weight.l1;
                if (card.weight.l2) profile.metrics.l2 += card.weight.l2;
                if (card.weight.l3) profile.metrics.l3 += card.weight.l3;
            }
        });
        
        profile.tags = Array.from(newTags);
        ['l1', 'l2', 'l3'].forEach((k: any) => {
            profile.metrics[k] = Math.max(0, Math.min(100, profile.metrics[k]));
        });

        localStorage.setItem('finalUserProfile', JSON.stringify(profile));
        
        channelService.postMessage('WIZARD_COMPLETE', {
            username: profile.username,
            cards: selectedCardsData,
            metrics: profile.metrics,
            isSkipped: selectedCardsData.length === 0,
            timestamp: Date.now()
        });

        navigate('/home');
    };

    return (
        <div className="min-h-screen bg-orange-50 flex flex-col font-noto">
            <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-orange-100">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-lg flex items-center gap-2 text-orange-600">
                        <i className="fa-solid fa-fingerprint"></i>
                        <span>构建画像</span>
                    </div>
                    <button onClick={finishAndRedirect} className="text-sm text-gray-400 hover:text-orange-500 font-medium transition-colors">
                        跳过 <i className="fa-solid fa-forward"></i>
                    </button>
                </div>
                <div className="h-1.5 w-full bg-orange-200">
                    <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${((currentPage + 1) / 4) * 100}%` }}></div>
                </div>
            </header>

            <main className="flex-grow max-w-md mx-auto w-full px-4 py-8 flex flex-col">
                <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{currentData.id}: {currentData.title}</h1>
                    <p className="text-sm text-gray-500">{currentData.desc}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {currentData.cards.map((card) => {
                        const isSelected = selectedCardsData.some(c => c.name === card.name);
                        return (
                            <div 
                                key={card.name} 
                                onClick={() => toggleSelection(card)}
                                className={`aspect-square bg-white border-2 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group
                                    ${isSelected ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-orange-200 hover:-translate-y-1 hover:shadow-lg'}
                                `}
                            >
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{card.icon}</div>
                                <div className={`text-xs font-bold text-center px-1 leading-tight ${isSelected ? 'text-orange-700' : 'text-gray-600'}`}>
                                    {card.name}
                                </div>
                                {isSelected && (
                                    <i className="fa-solid fa-check absolute top-2 right-2 text-orange-500 text-xs"></i>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-auto pt-10 pb-6">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-1 font-medium">
                        <span>本组已选 {selectionsInCurrentPage.length}</span>
                        <span>{currentPage + 1}/4</span>
                    </div>
                    <button 
                        onClick={handleNext}
                        className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg active:scale-95
                            ${currentPage === 3 ? 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-green-200' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-orange-200'}
                        `}
                    >
                        {currentPage === 3 ? <span>生成画像并进入 <i className="fa-solid fa-check"></i></span> : <span>下一组 <i className="fa-solid fa-arrow-right"></i></span>}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Wizard;