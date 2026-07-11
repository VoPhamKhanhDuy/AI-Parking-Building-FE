import { getPasses, savePasses } from '../../mock-data/passes';

export const monthlyPassService = {
  getPassesList: () => {
    return getPasses();
  },

  getStats: () => {
    const list = getPasses();
    const active = list.filter((p) => p.status === 'Active').length;
    const expired = list.filter((p) => p.status === 'Expired').length;
    const expiringSoon = 2; // Mock statistic
    const pending = 1; // Mock statistic
    const monthlyRevenue = list.reduce((sum, p) => sum + (p.status === 'Active' ? p.price : 0), 0);

    return { active, expired, expiringSoon, pending, monthlyRevenue };
  },

  createPass: (pass) => {
    const list = getPasses();
    const newPass = {
      ...pass,
      id: `MP-50${list.length + 1}`,
      status: 'Active',
      price: pass.type === 'Car' ? 1500000 : 200000,
    };
    list.push(newPass);
    savePasses(list);
    return newPass;
  },

  extendPass: (passId) => {
    const list = getPasses();
    const updated = list.map((p) => {
      if (p.id === passId) {
        const curDate = new Date(p.expiry);
        curDate.setDate(curDate.getDate() + 30);
        return {
          ...p,
          expiry: curDate.toISOString().split('T')[0],
          status: 'Active',
        };
      }
      return p;
    });
    savePasses(updated);
    return updated.find((p) => p.id === passId);
  },
};
