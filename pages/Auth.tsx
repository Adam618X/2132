import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { channelService } from '../services/channel';
import { JOB_META, AGE_MAP } from '../constants';

const Auth: React.FC = () => {
    const navigate = useNavigate();
    const [view, setView] = useState<'login' | 'register'>('register');
    const [toast, setToast] = useState<{ msg: string; type: 'info' | 'error' | 'success' } | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        code: '',
        pwd: '',
        location: '',
        job: '',
        ageGroup: '',
        gender: ''
    });
    const [countdown, setCountdown] = useState(0);

    const showToast = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const sendCode = () => {
        if (!formData.phone || formData.phone.length !== 11) {
            showToast('请输入有效的11位手机号', 'error');
            return;
        }
        showToast('验证码已发送: 491001', 'success');
        setCountdown(60);
    };

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleRegister = () => {
        const { username, phone, code, location, job, ageGroup, gender } = formData;
        if (!username || !phone || !code || !location || !job || !ageGroup || !gender) {
            showToast('请完善所有必填信息', 'error');
            return;
        }
        if (code !== '491001') {
            showToast('验证码错误 (测试码: 491001)', 'error');
            return;
        }

        let origin = location;
        const phonePrefix = phone.substring(0, 3);
        if (!['138', '139', '136'].includes(phonePrefix)) {
            origin = Math.random() > 0.5 ? 'Sichuan' : 'Hunan';
        }

        const deviceTier = (window.screen.height > 800 && window.devicePixelRatio > 2) ? 'High' : 'Low';

        const userVector = {
            username,
            phone,
            location,
            origin,
            job,
            ageGroup,
            gender,
            age_approx: AGE_MAP[ageGroup] || 30,
            job_meta: JOB_META[job] || { sedentary: false, stress: 5 },
            device: deviceTier,
            is_migrant: origin !== location,
            timestamp: Date.now(),
            tags: [],
            metrics: { l1: 50, l2: 50, l3: 50 }
        };

        localStorage.setItem('finalUserProfile', JSON.stringify(userVector));
        channelService.postMessage('PROFILE_INIT', userVector);

        showToast('注册成功，正在跳转画像向导...', 'success');
        setTimeout(() => navigate('/wizard'), 1000);
    };

    const handleLogin = () => {
        alert('演示模式，请使用注册流程体验完整算法逻辑');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-orange-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100 via-orange-50 to-white">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl border border-white/50 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-red-500 to-purple-500"></div>

                <div className="pt-8 pb-4 px-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 mb-4 shadow-inner">
                        <i className="fa fa-utensils text-2xl"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">SmartFood <span className="text-orange-500">V</span></h1>
                    <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest font-medium">Algorithmic Social Profiling</p>
                </div>

                <div className="px-8 pb-8">
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                        <button
                            onClick={() => setView('login')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${view === 'login' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >账号登录</button>
                        <button
                            onClick={() => setView('register')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${view === 'register' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >注册新用户</button>
                    </div>

                    {view === 'register' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="relative">
                                <i className="fa fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input id="username" type="text" onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all" placeholder="您的专属昵称" />
                            </div>
                            <div className="relative">
                                <i className="fa fa-mobile-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input id="phone" type="tel" maxLength={11} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all" placeholder="11位手机号码" />
                            </div>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <i className="fa fa-shield-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                    <input id="code" type="text" maxLength={6} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all" placeholder="验证码" />
                                </div>
                                <button onClick={sendCode} disabled={countdown > 0} className="w-32 font-semibold text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 disabled:opacity-50 transition-colors">
                                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                                </button>
                            </div>
                             <div className="relative">
                                <i className="fa fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input id="pwd" type="password" onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all" placeholder="设置登录密码" />
                            </div>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">完善画像数据</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <i className="fa fa-venus-mars absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                    <select id="gender" onChange={handleInputChange} className="w-full pl-11 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none appearance-none text-gray-600">
                                        <option value="" disabled selected>性别</option>
                                        <option value="Male">男</option>
                                        <option value="Female">女</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <i className="fa fa-hourglass-half absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                    <select id="ageGroup" onChange={handleInputChange} className="w-full pl-11 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none appearance-none text-gray-600">
                                        <option value="" disabled selected>年龄段</option>
                                        <option value="00s">00后</option>
                                        <option value="95s">95后</option>
                                        <option value="90s">90后</option>
                                        <option value="80s">80后</option>
                                        <option value="70s">70后</option>
                                    </select>
                                </div>
                            </div>

                            <div className="relative">
                                <i className="fa fa-map-marker-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <select id="location" onChange={handleInputChange} className="w-full pl-11 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none appearance-none text-gray-600">
                                    <option value="" disabled selected>当前常驻省份</option>
                                    <option value="Beijing">北京</option>
                                    <option value="Shanghai">上海</option>
                                    <option value="Guangdong">广东</option>
                                    <option value="Sichuan">四川</option>
                                    <option value="Hunan">湖南</option>
                                    <option value="Zhejiang">浙江</option>
                                    <option value="Jiangsu">江苏</option>
                                    <option value="Shandong">山东</option>
                                </select>
                            </div>

                             <div className="relative">
                                <i className="fa fa-briefcase absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <select id="job" onChange={handleInputChange} className="w-full pl-11 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none appearance-none text-gray-600">
                                    <option value="" disabled selected>职业</option>
                                    <option value="Tech">互联网/程序员</option>
                                    <option value="Student">在校学生</option>
                                    <option value="Finance">金融/白领</option>
                                    <option value="Sales">市场销售</option>
                                    <option value="Medical">医护人员</option>
                                    <option value="Freelance">自由职业</option>
                                    <option value="Retiree">退休人员</option>
                                    <option value="Worker">工人/制造业</option>
                                </select>
                            </div>

                            <button onClick={handleRegister} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all">
                                立即注册并生成画像
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
                            <div className="relative">
                                <i className="fa fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input type="text" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none transition-all" placeholder="用户名 / 手机号" />
                            </div>
                            <div className="relative">
                                <i className="fa fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input type="password" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none transition-all" placeholder="密码" />
                            </div>
                            <div className="text-right">
                                <button onClick={() => navigate('/forgot-password')} className="text-sm text-orange-500 hover:text-orange-600 font-medium">忘记密码?</button>
                            </div>
                            <button onClick={handleLogin} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all">
                                登录
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <i className={`fa ${toast.type === 'error' ? 'fa-exclamation-circle text-red-400' : 'fa-check-circle text-green-400'}`}></i>
                    <span>{toast.msg}</span>
                </div>
            )}
        </div>
    );
};

export default Auth;