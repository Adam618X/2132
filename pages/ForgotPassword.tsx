import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const handleReset = () => {
        setStep(2);
        setTimeout(() => {
            navigate('/login');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-orange-50">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl border border-white/50 shadow-xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 mb-4">
                    <i className="fa fa-key text-xl"></i>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">重置密码</h1>
                {step === 1 ? (
                    <div className="space-y-4 text-left mt-6">
                        <input type="tel" className="w-full px-4 py-3 bg-gray-50 border rounded-xl" placeholder="注册手机号" />
                        <div className="flex gap-2">
                             <input type="text" className="w-full px-4 py-3 bg-gray-50 border rounded-xl" placeholder="验证码" />
                             <button className="w-32 bg-orange-100 text-orange-600 rounded-xl text-sm font-bold">获取验证码</button>
                        </div>
                        <input type="password" className="w-full px-4 py-3 bg-gray-50 border rounded-xl" placeholder="新密码" />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => navigate('/login')} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold">取消</button>
                            <button onClick={handleReset} className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg">确认重置</button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 text-green-500 font-bold animate-in zoom-in">
                        <i className="fa fa-check-circle text-4xl mb-2 block"></i>
                        密码重置成功，正在跳转...
                    </div>
                )}
            </div>
        </div>
    );
};
export default ForgotPassword;