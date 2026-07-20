import { useState, useEffect } from 'react'
import { formatCurrentTime } from '../pages/Dashboard/dashboardService'

export function useClock(updateInterval = 1000) {
  const [time, setTime] = useState(formatCurrentTime())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatCurrentTime())
    }, updateInterval)

    return () => clearInterval(timer)
  }, [updateInterval])

  return time
}
