import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginService } from './loginService';
import { ROUTE_PATHS } from '../../routes/routePaths';
import { useLanguage } from '../../utils/LanguageContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { lang, changeLang, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const result = loginService.login(email, password);
    if (result.success) {
      navigate(ROUTE_PATHS.DASHBOARD);
      window.location.reload();
    } else {
      setError(t('login.incorrectCreds'));
    }
  };

  const handleQuickAccess = (emailVal, passVal) => {
    setEmail(emailVal);
    setPassword(passVal);
    const result = loginService.login(emailVal, passVal);
    if (result.success) {
      navigate(ROUTE_PATHS.DASHBOARD);
      window.location.reload();
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex antialiased w-full text-slate-800 relative">
      {/* Language Switch Button */}
      <div className="absolute top-4 right-4 flex gap-1 z-20 bg-white border border-outline-variant/60 rounded-lg p-1 shadow-sm">
        <button
          onClick={() => changeLang('en')}
          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
            lang === 'en' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => changeLang('vi')}
          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
            lang === 'vi' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          VI
        </button>
      </div>

      {/* Left Banner Illustration - Light Mode Polished */}
      <div className="hidden lg:flex w-[60%] relative bg-[#F8FAFC] items-center justify-center overflow-hidden border-r border-outline-variant/30">
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30" 
          style={{ 
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCSu_O056QPcT0x16SaD2U72Je0TfVIxUky6-rWI0evNjs4LNdJEkV-W37Xm7mL7Rt_5peGA6QfBjSqarTx4DtKiWFUSs4_9dQYnuYBDYxTdb615LJbZTKzJ40jUSCduLitb72YtjUcO7sWj1tpCk0rFuaOEOwBEL2B6T5o3lrlcKYN7CEbn6aoA5YOrWsE7YcHzdq6ZOx571-sAumP4aoc5fHMTyWcSRisj2hLWeFAucUfV6yE1W9aHZ9U7Jfj87zqfPAiAGDunUM")` 
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#F1F5F9] via-[#F8FAFC]/90 to-primary/5"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-12 -mt-12">
          <div className="w-32 h-32 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center mb-8 shadow-sm">
            <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: '"FILL" 1' }}>precision_manufacturing</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-slate-800 mb-4 tracking-tight max-w-lg font-bold">{t('login.title')}</h2>
          <p className="text-slate-600 font-body-md max-w-lg mb-8 leading-relaxed">{t('login.desc')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary font-semibold text-xs">{t('login.badgeAi')}</span>
            <span className="px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary font-semibold text-xs">{t('login.badgeRealtime')}</span>
            <span className="px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary font-semibold text-xs">{t('login.badgeRole')}</span>
          </div>
        </div>
      </div>

      {/* Right Login Form - Light Mode Card */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center items-center p-6 sm:p-12 bg-white relative">
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-outline-variant/60 p-8 sm:p-10 relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <img 
              alt="AI Parking Command Logo" 
              className="w-auto object-contain mb-6 drop-shadow-sm h-24" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7DLgS8D3XCMEEBNEj68W89edaHjYcJRhf9R6Yw9KHuW7kTcZPcGu0XtB_TRCjlIdtQ7IZlvVzL0a4NS7gyTvXKz8GZu6RNFDcRGHeO96x9M7RJFrPirMh05g1O-xRyG5iKcmiEMjf6eWYYWMYgaGmfa93h8NheXABAQOt-qqGuNo0vIV9rLVIIKjkP4ytl4o3MdT2C0IhHGDyLA_5IOjdfaXQ1sFEIPL7dsbUu5NZWUor_HWtuBICnsT-Sp-txH1hc8zvYnEYpUA"
            />
            <h1 className="font-headline-md text-headline-md text-slate-800 mb-2 font-bold">{t('login.formTitle')}</h1>
            <p className="font-body-sm text-body-sm text-slate-500">{t('login.formSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-error/10 border border-error/20 text-error rounded-lg text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}
            
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
              <input 
                className="w-full bg-slate-50/50 border border-outline-variant/80 rounded-lg py-3 pl-12 pr-4 font-body-md text-body-md text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none" 
                placeholder={t('login.emailPlace')} 
                required 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
              <input 
                className="w-full bg-slate-50/50 border border-outline-variant/80 rounded-lg py-3 pl-12 pr-12 font-body-md text-body-md text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none" 
                placeholder={t('login.passwordPlace')} 
                required 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none" 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30 focus:ring-offset-0 bg-slate-50 transition-colors cursor-pointer" type="checkbox" />
                <span className="font-body-sm text-body-sm text-slate-500 group-hover:text-slate-800 transition-colors">{t('login.remember')}</span>
              </label>
              <a className="font-label-md text-label-md text-primary hover:underline transition-colors" href="#">{t('login.forgot')}</a>
            </div>

            <button 
              className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-3 rounded-lg shadow-sm flex justify-center items-center gap-2 mt-2 transition-all active:scale-[0.98]" 
              type="submit"
            >
              {t('login.login')}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          {/* Quick Access Demo */}
          <div className="border-t border-outline-variant/40 mt-6 pt-6">
            <p className="font-bold text-[10px] text-slate-400 text-center mb-3 uppercase tracking-wider">{t('login.quickTitle')}</p>
            <div className="space-y-2">
              <button 
                onClick={() => handleQuickAccess('admin@apscore.com', 'admin123')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 border border-outline-variant/40 rounded-xl hover:bg-slate-100/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm">admin_panel_settings</span>
                  </div>
                  <span className="font-semibold text-xs text-slate-700">{t('login.roleAdmin')}</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-[18px] transition-colors">chevron_right</span>
              </button>

              <button 
                onClick={() => handleQuickAccess('manager@apscore.com', 'manager123')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 border border-outline-variant/40 rounded-xl hover:bg-slate-100/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-600 text-sm">manage_accounts</span>
                  </div>
                  <span className="font-semibold text-xs text-slate-700">{t('login.roleManager')}</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-purple-600 text-[18px] transition-colors">chevron_right</span>
              </button>

              <button 
                onClick={() => handleQuickAccess('staff@apscore.com', 'staff123')}
                className="w-full flex items-center justify-between p-2.5 bg-primary/5 border border-primary/20 border-l-4 border-l-primary rounded-xl hover:bg-primary/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm">badge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-700">{t('login.roleStaff')}</span>
                    <span className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded uppercase tracking-wider">{t('login.mainDemo')}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary/60 group-hover:text-primary text-[18px] transition-colors">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
