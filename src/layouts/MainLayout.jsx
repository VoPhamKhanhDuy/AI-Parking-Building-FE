import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '../routes/routePaths';
import { useLanguage } from '../utils/LanguageContext';

const MainLayout = () => {
  const location = useLocation();
  const { lang, changeLang, t } = useLanguage();
  const [time, setTime] = useState(new Date());
  const [currentUser] = useState(() => {
    const cached = localStorage.getItem('aps_user');
    return cached ? JSON.parse(cached) : null;
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const menuItems = [
    {
      key: 'dashboard',
      path: ROUTE_PATHS.DASHBOARD,
      icon: (
        <svg style={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      key: 'parkingStructure',
      path: ROUTE_PATHS.PARKING_STRUCTURE,
      icon: (
        <svg style={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      key: 'pricingRules',
      path: ROUTE_PATHS.PRICING,
      icon: (
        <svg style={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      key: 'vehicleEntry',
      path: ROUTE_PATHS.VEHICLE_ENTRY,
      icon: (
        <svg style={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 22h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-6M10 16l-4-4 4-4M4 12h12" />
        </svg>
      ),
    },
    {
      key: 'vehicleExit',
      path: ROUTE_PATHS.VEHICLE_EXIT,
      icon: (
        <svg style={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 22H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h6M14 16l4-4-4-4M20 12H8" />
        </svg>
      ),
    },
    {
      key: 'activeTickets',
      path: ROUTE_PATHS.TICKETS,
      icon: (
        <svg style={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="6" y1="8" x2="10" y2="8" />
          <line x1="6" y1="12" x2="18" y2="12" />
          <line x1="6" y1="16" x2="14" y2="16" />
        </svg>
      ),
    },
    {
      key: 'parkingSessions',
      path: ROUTE_PATHS.SESSIONS,
      icon: (
        <svg style={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      key: 'monthlyPasses',
      path: ROUTE_PATHS.MONTHLY_PASS,
      icon: (
        <svg style={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      key: 'reservations',
      path: ROUTE_PATHS.RESERVATION,
      icon: (
        <svg style={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      key: 'lostTicketForm',
      path: ROUTE_PATHS.LOST_TICKET,
      icon: (
        <svg style={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      key: 'systemLogs',
      path: ROUTE_PATHS.SYSTEM_LOG,
      icon: (
        <svg style={styles.menuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="4 17 10 11 12 13 18 7" />
          <polyline points="13 7 18 7 18 12" />
        </svg>
      ),
    },
  ];

  const getPageTitle = () => {
    const activeItem = menuItems.find((item) => item.path === location.pathname);
    return activeItem ? t(`sidebar.${activeItem.key}`) : t('common.appName');
  };

  return (
    <div style={styles.container}>
      {/* Sidebar Section */}
      <aside style={styles.sidebar} className="bg-surface border-outline-variant">
        <div style={styles.logoContainer}>
          <div style={styles.logoBadge}>
            <svg style={styles.logoSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 17V9h4a3 3 0 0 1 0 6H9" />
            </svg>
          </div>
          <div>
            <h1 style={styles.logoTitle} className="text-on-surface">{t('common.appName')}</h1>
            <p style={styles.logoSubtitle} className="text-on-surface-variant">{t('common.appSubtitle')}</p>
          </div>
        </div>

        <nav style={styles.navigation}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.key}
                to={item.path}
                style={{
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                }}
                className={`animate-slide-left ${isActive ? 'active-nav-link' : ''}`}
              >
                <span style={isActive ? styles.iconActive : styles.iconContainer}>{item.icon}</span>
                <span style={styles.linkText}>{t(`sidebar.${item.key}`)}</span>
                {isActive && <div style={styles.activeIndicator} />}
              </Link>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter} className="border-outline-variant">
          <Link to={ROUTE_PATHS.LOGIN} onClick={() => localStorage.removeItem('aps_user')} style={styles.logoutButton}>
            <svg style={styles.logoutIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span>{t('common.disconnect')}</span>
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <div style={styles.mainWrapper}>
        {/* Header Section */}
        <header style={styles.header} className="bg-surface border-outline-variant">
          <div style={styles.headerTitleSection}>
            <h2 style={styles.pageTitle} className="text-on-surface">{getPageTitle()}</h2>
            <div style={styles.statusPill} className="glass">
              <span style={styles.statusDot}></span>
              <span style={styles.statusText} className="text-success">{t('common.aiActive')}</span>
            </div>
          </div>

          <div style={styles.headerMetaSection}>
            {/* Language Switcher */}
            <div className="flex gap-1 bg-surface-container border border-outline-variant/65 rounded-lg p-0.5 shadow-sm text-xs font-bold">
              <button
                onClick={() => changeLang('en')}
                className={`px-2.5 py-1 rounded transition-all ${
                  lang === 'en' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLang('vi')}
                className={`px-2.5 py-1 rounded transition-all ${
                  lang === 'vi' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                VI
              </button>
            </div>

            {/* Clock Widget */}
            <div style={styles.clockWidget} className="border-outline-variant bg-surface-container">
              <svg style={styles.clockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div style={styles.clockTextContainer}>
                <span style={styles.timeText} className="text-on-surface">{formatTime(time)}</span>
                <span style={styles.dateText} className="text-on-surface-variant">{formatDate(time)}</span>
              </div>
            </div>

            {/* Profile Widget */}
            <div style={styles.profileWidget}>
              <div style={styles.avatarContainer}>
                <span style={styles.avatarText}>{currentUser?.avatar || 'OP'}</span>
              </div>
              <div style={styles.profileTextContainer}>
                <span style={styles.profileName} className="text-on-surface">{currentUser?.name || 'Operator'}</span>
                <span style={styles.profileRole} className="text-on-surface-variant">{currentUser?.role || 'Staff'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <main style={styles.contentContainer} className="animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: 'var(--bg-color)',
    overflow: 'hidden',
  },
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    borderRight: '1px solid var(--outline-variant-color)',
    zIndex: 10,
  },
  logoContainer: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: 'var(--primary-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(99, 102, 241, 0.25)',
  },
  logoSvg: {
    width: '24px',
    height: '24px',
  },
  logoTitle: {
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '1.2',
  },
  logoSubtitle: {
    fontSize: '12px',
  },
  navigation: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    overflowY: 'auto',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'var(--on-surface-variant-color)',
    transition: 'background-color var(--transition-fast), color var(--transition-fast)',
    fontSize: '14.5px',
    fontWeight: '500',
    position: 'relative',
    gap: '12px',
  },
  navLinkActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    color: 'var(--on-surface-color)',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--on-surface-variant-color)',
  },
  iconActive: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary-color)',
  },
  menuIcon: {
    width: '20px',
    height: '20px',
  },
  linkText: {
    flex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    left: '0px',
    width: '3px',
    height: '18px',
    borderRadius: '0 2px 2px 0',
    backgroundColor: 'var(--primary-color)',
  },
  sidebarFooter: {
    padding: '16px',
    borderTop: '1px solid var(--outline-variant-color)',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px',
    width: '100%',
    backgroundColor: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '8px',
    color: '#ef4444',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color var(--transition-fast)',
  },
  logoutIcon: {
    width: '18px',
    height: '18px',
  },
  mainWrapper: {
    marginLeft: 'var(--sidebar-width)',
    flex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    width: 'calc(100vw - var(--sidebar-width))',
  },
  header: {
    height: 'var(--header-height)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    borderBottom: '1px solid var(--outline-variant-color)',
    position: 'sticky',
    top: 0,
    zIndex: 9,
  },
  headerTitleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '20px',
    fontWeight: '600',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--success-color)',
    boxShadow: '0 0 8px var(--success-color)',
  },
  statusText: {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  headerMetaSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  clockWidget: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant-color)',
  },
  clockIcon: {
    width: '16px',
    height: '16px',
    color: 'var(--primary-color)',
  },
  clockTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: '13px',
    fontWeight: '600',
    lineHeight: '1.2',
  },
  dateText: {
    fontSize: '10px',
    lineHeight: '1.2',
  },
  profileWidget: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatarContainer: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '13px',
  },
  profileTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  profileName: {
    fontSize: '13px',
    fontWeight: '600',
    lineHeight: '1.2',
  },
  profileRole: {
    fontSize: '11px',
  },
  contentContainer: {
    padding: '24px',
    flex: 1,
    overflowY: 'auto',
  },
};

export default MainLayout;
