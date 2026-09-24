import axios from 'axios';

const GATEWAY_HEALTH_URL = `${process.env.GATEWAY_BASE_URL}/health`;
const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const ping = async () => {
  try {
    await axios.get(GATEWAY_HEALTH_URL, { timeout: 10000 });
    console.log('[warmup] Gateway is alive.');
  } catch {
    console.warn('[warmup] Gateway ping failed — it may be cold-starting.');
  }
};

export const startWarmup = () => {
  ping();
  setInterval(ping, INTERVAL_MS);
};