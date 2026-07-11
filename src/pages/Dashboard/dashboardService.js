import { dashboardData } from '../../mock-data/dashboardData'

export const getDashboardData = () => dashboardData

export const formatCurrentTime = (date = new Date()) => date.toLocaleTimeString('en-GB')
