import { getStoredSlots, saveStoredSlots } from '../../mock-data/slots';
import { getStoredRecLogs, saveStoredRecLogs } from '../../mock-data/aiRecommendations';

// Calculate the AI slot recommendation based on the formula:
// Score = VehicleTypeScore (Base 50) + OccupancyBalanceScore (Max 20) + DistanceScore (Max 20) + PriorityScore (Max 10)
export const getAIRecommendation = (vehicleType, ticketType) => {
  const slots = getStoredSlots();
  
  // Filter for matching vehicle type and Available status
  const matchingSlots = slots.filter(
    (slot) => slot.vehicleType === vehicleType && slot.status === 'Available'
  );

  if (matchingSlots.length === 0) {
    return {
      recommendedSlot: null,
      score: 0,
      explanation: 'No available slots found for this vehicle type.',
      alternativeSlots: []
    };
  }

  // Calculate floor capacities for occupancy balance score
  const floorStats = {};
  slots.forEach((s) => {
    if (!floorStats[s.floor]) {
      floorStats[s.floor] = { total: 0, occupied: 0 };
    }
    floorStats[s.floor].total++;
    if (s.status === 'Occupied' || s.status === 'Reserved') {
      floorStats[s.floor].occupied++;
    }
  });

  const scoredSlots = matchingSlots.map((slot) => {
    // 1. Vehicle Type Match (Base score)
    const vehicleTypeScore = 50;

    // 2. Occupancy Balance Score (Max 20 points, prefer less occupied floors)
    const floorInfo = floorStats[slot.floor] || { total: 10, occupied: 0 };
    const floorOccupancyRate = floorInfo.occupied / floorInfo.total;
    const occupancyBalanceScore = Math.round((1 - floorOccupancyRate) * 20);

    // 3. Distance Score (Max 20 points)
    // Monthly pass / pre-booking prefer elevator access (lower distanceToElevator)
    // Daily visitors prefer quick exit (lower distanceToExit)
    let distanceScore = 0;
    if (ticketType === 'Monthly Pass' || ticketType === 'Reservation') {
      distanceScore = Math.max(0, 20 - Math.floor(slot.distanceToElevator / 2));
    } else {
      distanceScore = Math.max(0, 20 - Math.floor(slot.distanceToExit / 2));
    }

    // 4. Priority Score (Max 10 points)
    let priorityScore = 0;
    if (ticketType === 'Reservation') {
      // Pre-assigned or VIP priority
      priorityScore = 10;
    } else if (ticketType === 'Monthly Pass') {
      priorityScore = 5;
    } else {
      // Deterministic slight variations for daily users
      priorityScore = (slot.code.charCodeAt(slot.code.length - 1) % 5);
    }

    const rawScore = vehicleTypeScore + occupancyBalanceScore + distanceScore + priorityScore;
    
    // Normalize to max 98 for realistic view
    const normalizedScore = Math.min(98, Math.max(65, rawScore));

    // Construct detailed explanation
    let explanation = `Slot ${slot.code} on ${slot.floor} (${slot.zone}) is recommended because it matches the vehicle type '${vehicleType}'. `;
    explanation += `The floor utilization is low (${Math.round(floorOccupancyRate * 100)}% occupied). `;
    if (ticketType === 'Monthly Pass' || ticketType === 'Reservation') {
      explanation += `It is very close to the elevator lobby (${slot.distanceToElevator}m), which is highly convenient for your ticket type.`;
    } else {
      explanation += `It has direct access to Exit Gate A (${slot.distanceToExit}m), enabling a faster exit.`;
    }

    return {
      slot,
      score: normalizedScore,
      explanation
    };
  });

  // Sort descending by score
  scoredSlots.sort((a, b) => b.score - a.score);

  const topRec = scoredSlots[0];
  const alternatives = scoredSlots.slice(1, 4).map((item) => item.slot.code);

  return {
    recommendedSlot: topRec.slot,
    score: topRec.score,
    explanation: topRec.explanation,
    alternativeSlots: alternatives,
    allScored: scoredSlots // useful for manual selection comparison
  };
};

export const checkInVehicle = (licensePlate, vehicleType, ticketType, slotCode, aiRecommendedCode, aiScore) => {
  const slots = getStoredSlots();
  
  // Find slot and set it to occupied
  const updatedSlots = slots.map((slot) => {
    if (slot.code === slotCode) {
      return { ...slot, status: 'Occupied' };
    }
    return slot;
  });
  saveStoredSlots(updatedSlots);

  // Generate unique ticket and session details
  const ticketCode = `TCK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const checkInTime = new Date().toISOString();
  
  const checkInRecord = {
    ticketCode,
    licensePlate,
    vehicleType,
    ticketType,
    slotCode,
    checkInTime,
    status: 'Active'
  };

  // Save AI log entry
  const recLogs = getStoredRecLogs();
  const isOverridden = slotCode !== aiRecommendedCode;
  const newRecLog = {
    logId: `REC-${String(recLogs.length + 1).padStart(3, '0')}`,
    vehicleId: `VEH-${String(recLogs.length + 1).padStart(3, '0')}`,
    licensePlate,
    vehicleType,
    ticketType,
    recommendedSlotId: aiRecommendedCode,
    score: aiScore || 85,
    explanation: isOverridden 
      ? `AI suggested ${aiRecommendedCode} but operator manually selected ${slotCode}.`
      : `AI recommended ${slotCode} with ${aiScore}% match score. Confirmed by staff.`,
    alternativeSlots: isOverridden ? [aiRecommendedCode] : [],
    status: isOverridden ? 'Overridden' : 'Confirmed',
    createdAt: checkInTime
  };
  recLogs.unshift(newRecLog);
  saveStoredRecLogs(recLogs);

  // Add system log (store to localStorage log system so that it propagates to the Logs screen)
  const systemLogsKey = 'ai_parking_system_logs';
  let systemLogs = [];
  try {
    const rawLogs = window.localStorage.getItem(systemLogsKey);
    if (rawLogs) {
      systemLogs = JSON.parse(rawLogs);
    } else {
      // Seed from systemLogsData static mock if not set
      // We will handle it safely
    }
  } catch (e) {
    console.error(e);
  }

  // Construct standard log entry
  const newSystemLog = {
    id: Date.now(),
    time: new Date().toLocaleTimeString('en-GB'),
    module: 'Entry',
    activity: 'Vehicle entry processed',
    reference: licensePlate,
    staff: 'Parking Staff',
    status: 'Completed',
    shift: 'Current Shift',
    receiptId: '—',
    ticketCode,
    licensePlate,
    gate: 'Entry Gate A',
    description: `Vehicle [${licensePlate}] entered as ${ticketType} (${vehicleType}). AI recommendation was ${newRecLog.status} for slot ${slotCode}.`
  };

  // Add to localStorage system logs if available
  if (typeof window !== 'undefined') {
    let storedSysLogs = [];
    try {
      const storedData = window.localStorage.getItem('ai_parking_system_logs_list');
      if (storedData) {
        storedSysLogs = JSON.parse(storedData);
      }
    } catch (e) {
      // fail silently
    }
    storedSysLogs.unshift(newSystemLog);
    window.localStorage.setItem('ai_parking_system_logs_list', JSON.stringify(storedSysLogs));
  }

  return checkInRecord;
};
