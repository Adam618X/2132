import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { RAW_DISH_DATA, SimplePinyin } from '../constants';
import { Dish, UserProfile } from '../types';
import { channelService } from '../services/channel';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [dishes, setDishes] = useState<Record<string, Dish[]>>({});
    const [recommendations, setRecommendations] = useState<Dish[]>([]);
    const [likedDishes, setLikedDishes] = useState<Dish[]>([]);
    const [dislikedDishes, setDislikedDishes] = useState<Dish[]>([]);
    const [currentWeights, setCurrentWeights] = useState<Record<string, number>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('recommendations');
    const [showReviewModal, setShowReviewModal] = useState<Dish | null>(null);
    const [radarData, setRadarData] = useState<any[]>([]);

    useEffect(() => {
        const profileStr = localStorage.getItem('finalUserProfile');
        if (profileStr) {
            setUserProfile(JSON.parse(profileStr));
        } else {
            navigate('/login');
        }
        
        const storedLikes = localStorage.getItem('likedDishes');
        if (storedLikes) setLikedDishes(JSON.parse(storedLikes));
        
        const storedDislikes = localStorage.getItem('dislikedDishes');
        if (storedDislikes) setDislikedDishes(JSON.parse(storedDislikes));

        parseDishData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (userProfile && Object.keys(dishes).length > 0) {
            calculateWeights();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProfile, dishes]);

    useEffect(() => {
        if (Object.keys(currentWeights).length > 0) {
            generateRecommendations();
            updateRadarChart();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentWeights, dislikedDishes]);

    const parseDishData = () => {
        const lines = RAW_DISH_DATA.split('\n');
        const parsed: Record<string, Dish[]> = {};
        
        lines.forEach(line => {
            if (!line) return;
            const parts = line.split('|');
            if (parts.length < 5) return;
            
            const [cuisine, name, flavor, ingredient, technique] = parts;
            let pinyin = "";
            for (let char of name) {
                pinyin += SimplePinyin[char] || char;
            }

            let price = 38;
            if (ingredient.includes('海鲜') || ingredient.includes('牛')) price = 88;
            if (ingredient.includes('素') || ingredient.includes('面')) price = 22;
            if (name.includes('佛跳墙') || name.includes('鲍')) price = 288;

            const dish: Dish = {
                name, cuisine, flavor, ingredient, technique, price, 
                score: (3.8 + Math.random() * 1.2).toFixed(1),
                pinyin, tag: cuisine,
                img: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
                time: (Math.floor(Math.random() * 40) + 10) + '分钟',
                desc: `${cuisine}经典代表，${flavor}风味，严选${ingredient}。`
            };

            if (!parsed[cuisine]) parsed[cuisine] = [];
            parsed[cuisine].push(dish);
        });
        setDishes(parsed);
    };

    const calculateWeights = () => {
        if (!userProfile) return;
        const weights: Record<string, number> = {};
        Object.keys(dishes).forEach(tag => {
            let score = 50;
            if (userProfile.origin && userProfile.origin !== userProfile.location) {
                const originMap: any = { 'Sichuan': '川菜', 'Hunan': '湘菜', 'Guangdong': '粤菜', 'Beijing': '京菜', 'Jiangsu': '苏菜' };
                if (originMap[userProfile.origin] === tag) score += 40;
            }
            if (userProfile.tags?.includes('重口味') && ['川菜', '湘菜'].includes(tag)) score += 30;
            if (userProfile.tags?.includes('清淡') && ['粤菜', '苏菜', '浙菜'].includes(tag)) score += 30;
            weights[tag] = Math.min(100, score);
        });
        setCurrentWeights(weights);
    };

    const generateRecommendations = () => {
        let list: Dish[] = [];
        Object.keys(dishes).forEach(tag => {
            const weight = currentWeights[tag] || 0;
            if (weight <= 0) return;
            dishes[tag].forEach(dish => {
                if (dislikedDishes.some(d => d.name === dish.name)) return;
                list.push({ ...dish, sortScore: Math.random() * weight });
            });
        });
        list.sort((a, b) => (b.sortScore || 0) - (a.sortScore || 0));
        setRecommendations(list.slice(0, 48));
    };

    const updateRadarChart = () => {
         let stats = [50, 50, 50, 50, 50, 50];
         if (userProfile?.metrics) {
             stats[0] = userProfile.metrics.l1;
             stats[1] = userProfile.metrics.l2;
             stats[4] = userProfile.metrics.l3;
         }
         // Simple simulation for other axes based on liked dishes or top recommendations
         const source = likedDishes.length > 0 ? likedDishes : recommendations.slice(0, 10);
         source.forEach(d => {
             if (d.flavor.match(/麻辣|酸辣/)) stats[0] += 2;
             if (d.ingredient.match(/海鲜|牛/)) stats[1] += 2;
             if (d.technique.match(/炖|发酵/)) stats[2] += 2; // Complexity
             if (d.ingredient.match(/面|粉|糕/)) stats[3] += 3; // Carbs
         });
         
         const labels = ['口味浓郁度', '资本投入度', '技法复杂度', '碳水依赖', '猎奇指数', '菜系探索'];
         const data = labels.map((label, i) => ({ subject: label, A: Math.min(100, Math.max(0, stats[i])) }));
         setRadarData(data);
    };

    const handleLike = (dish: Dish) => {
        const exists = likedDishes.some(d => d.name === dish.name);
        let newLikes = [...likedDishes];
        if (exists) {
            newLikes = newLikes.filter(d => d.name !== dish.name);
            channelService.postMessage('ACTION_UNLIKE', { dish: dish.name });
        } else {
            newLikes.push(dish);
            channelService.postMessage('ACTION_LIKE', { 
                dish: dish.name, 
                price: dish.price, 
                tags: [dish.tag, dish.flavor, dish.ingredient] 
            });
        }
        setLikedDishes(newLikes);
        localStorage.setItem('likedDishes', JSON.stringify(newLikes));
    };

    const handleDislike = (dish: Dish) => {
        const newDislikes = [...dislikedDishes, dish];
        setDislikedDishes(newDislikes);
        localStorage.setItem('dislikedDishes', JSON.stringify(newDislikes));
        // Recalculate will trigger via useEffect
    };

    const trackDwell = (dish: Dish) => {
        // Simple mock for dwell time
        channelService.postMessage('ACTION_DWELL', { 
            dish: dish.name, 
            duration: 3000, 
            price: dish.price,
            tags: [dish.tag, dish.flavor]
        });
    };

    const renderDishCard = (dish: Dish) => {
        const isLiked = likedDishes.some(d => d.name === dish.name);
        return (
            <div key={dish.name} className="bg-white rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-transform flex flex-col group">
                <div className="relative h-48 bg-gray-100 overflow-hidden cursor-pointer" onClick={() => { trackDwell(dish); setShowReviewModal(dish); }}>
                    <img src={dish.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={dish.name} />
                </div>
                <div className="p-4 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-800 leading-tight">{dish.name}</h3>
                        <span className="bg-orange-100 text-orange-600 text-sm font-bold px-2 py-1 rounded">¥{dish.price}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{dish.cuisine}</span>
                        <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{dish.flavor}</span>
                    </div>
                    <div className="mt-auto flex justify-between items-center border-t pt-3">
                         <button className="text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded hover:bg-primary/20" onClick={() => setShowReviewModal(dish)}>详情</button>
                         <div className="flex gap-3">
                            <button onClick={() => handleDislike(dish)} className="text-gray-300 hover:text-gray-500"><i className="fa fa-times"></i></button>
                            <button onClick={() => handleLike(dish)} className={`${isLiked ? 'text-red-500' : 'text-gray-300'} hover:text-red-500`}><i className={`fa ${isLiked ? 'fa-heart' : 'fa-heart-o'}`}></i></button>
                         </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-light pb-20 font-inter">
            <nav className="bg-white/95 backdrop-blur-md shadow-sm fixed top-0 w-full z-40">
                <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                        <i className="fa fa-cutlery"></i> SmartFood V
                    </h1>
                    <div className="flex items-center w-full max-w-xs ml-4">
                        <input 
                            type="text" 
                            placeholder="搜索美食..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>
            </nav>

            <div className="pt-20 container mx-auto px-4">
                 {/* Tabs */}
                 <div className="flex overflow-x-auto gap-6 mb-6 pb-2 border-b border-gray-200">
                    <button onClick={() => setActiveTab('recommendations')} className={`whitespace-nowrap pb-2 font-medium ${activeTab === 'recommendations' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>推荐列表</button>
                    <button onClick={() => setActiveTab('radar')} className={`whitespace-nowrap pb-2 font-medium ${activeTab === 'radar' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>惯习图谱</button>
                    <button onClick={() => setActiveTab('liked')} className={`whitespace-nowrap pb-2 font-medium ${activeTab === 'liked' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>我的收藏</button>
                 </div>

                 {activeTab === 'radar' && (
                     <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row items-center justify-center gap-8">
                         <div className="w-full h-[300px] max-w-md">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                    <Radar name="User" dataKey="A" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                         </div>
                         <div className="max-w-xs">
                             <h3 className="font-bold text-lg mb-2">饮食惯习模型</h3>
                             <p className="text-sm text-gray-500">基于您在生理、资本、文化三个维度的行为数据生成的实时图谱。</p>
                             <div className="mt-4 flex flex-wrap gap-2">
                                 {userProfile?.tags?.map(t => <span key={t} className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-600">{t}</span>)}
                             </div>
                         </div>
                     </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activeTab === 'recommendations' && recommendations
                        .filter(d => d.name.includes(searchTerm) || d.pinyin.includes(searchTerm.toLowerCase()))
                        .map(renderDishCard)}
                    
                    {activeTab === 'liked' && likedDishes.map(renderDishCard)}
                 </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReviewModal(null)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold">{showReviewModal.name}</h2>
                            <button onClick={() => setShowReviewModal(null)} className="text-gray-400 hover:text-gray-600"><i className="fa fa-times text-xl"></i></button>
                        </div>
                        <img src={showReviewModal.img} className="w-full h-48 object-cover rounded-lg mb-4" alt="food" />
                        <p className="text-gray-600 mb-4">{showReviewModal.desc}</p>
                        <div className="flex gap-2 mb-4">
                            {[1,2,3,4,5].map(star => (
                                <i key={star} 
                                   className="fa fa-star text-2xl text-gray-200 hover:text-yellow-400 cursor-pointer transition-colors"
                                   onClick={() => {
                                       channelService.postMessage('ACTION_REVIEW', { 
                                           dish: showReviewModal.name, 
                                           rating: star,
                                           keywords: star > 3 ? '好吃' : '难吃' 
                                        });
                                       setShowReviewModal(null);
                                   }}
                                ></i>
                            ))}
                        </div>
                        <p className="text-xs text-center text-gray-400">点击星星提交评价</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;