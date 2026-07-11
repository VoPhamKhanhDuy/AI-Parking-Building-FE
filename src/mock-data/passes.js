export const INITIAL_PASSES = [
  { id: 'MP-5001', name: 'Nguyen Van A', phone: '0901234567', plate: '30A-99999', type: 'Car', expiry: '2026-12-31', status: 'Active', price: 1500000 },
  { id: 'MP-5002', name: 'Tran Thi B', phone: '0912345678', plate: '29C-88888', type: 'Car', expiry: '2026-10-30', status: 'Active', price: 1500000 },
  { id: 'MP-5003', name: 'Le Van C', phone: '0923456789', plate: '30F-77777', type: 'Car', expiry: '2026-08-15', status: 'Active', price: 1500000 },
  { id: 'MP-5004', name: 'Pham Van D', phone: '0934567890', plate: '29M-11223', type: 'Bike', expiry: '2026-06-30', status: 'Expired', price: 200000 },
  { id: 'MP-5005', name: 'Hoang Thi E', phone: '0945678901', plate: '30H-22334', type: 'Car', expiry: '2026-09-01', status: 'Active', price: 1500000 },
];

export const getPasses = () => {
  const cached = localStorage.getItem('aps_passes');
  if (cached) return JSON.parse(cached);
  localStorage.setItem('aps_passes', JSON.stringify(INITIAL_PASSES));
  return INITIAL_PASSES;
};

export const savePasses = (passes) => {
  localStorage.setItem('aps_passes', JSON.stringify(passes));
};
