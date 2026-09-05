export const prerender = false;

// Vercel Cloud Telemetry Store
let cloudTelemetry = {
  totalClicks: 0,
  modeOnClicks: 0,
  modeOffClicks: 0,
  totalPageViews: 1,
  stageTaps: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
  latencies: [],
  eventLogs: [
    { time: new Date().toTimeString().split(' ')[0], text: 'Vercel Cloud Telemetry Engine Running.' }
  ]
};

export async function GET() {
  return new Response(JSON.stringify(cloudTelemetry), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
}

export async function POST({ request }) {
  try {
    const payload = await request.json();
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    if (payload.type === 'page_view') {
      cloudTelemetry.totalPageViews += 1;
    } else if (payload.type === 'toggle_click') {
      cloudTelemetry.totalClicks += 1;
      if (payload.active) {
        cloudTelemetry.modeOnClicks += 1;
      } else {
        cloudTelemetry.modeOffClicks += 1;
      }

      if (payload.latency && typeof payload.latency === 'number') {
        cloudTelemetry.latencies.push(payload.latency);
        if (cloudTelemetry.latencies.length > 50) cloudTelemetry.latencies.shift();
      }

      const eventText = payload.active
        ? `[Vercel Cloud] User on ${payload.page || 'site'} activated toggle (Mode ON)`
        : `[Vercel Cloud] User on ${payload.page || 'site'} deactivated toggle (Mode OFF)`;

      cloudTelemetry.eventLogs.unshift({ time: timeStr, text: eventText });
    } else if (payload.type === 'stage_click') {
      const idx = payload.stageIndex ?? 0;
      cloudTelemetry.stageTaps[idx] = (cloudTelemetry.stageTaps[idx] || 0) + 1;
      cloudTelemetry.eventLogs.unshift({
        time: timeStr,
        text: `[Vercel Cloud] Stage jump: 0${idx + 1} ${payload.stageName || ''} activated.`
      });
    } else if (payload.type === 'reset') {
      cloudTelemetry = {
        totalClicks: 0,
        modeOnClicks: 0,
        modeOffClicks: 0,
        totalPageViews: 1,
        stageTaps: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
        latencies: [],
        eventLogs: [{ time: timeStr, text: 'Vercel Cloud Telemetry Reset.' }]
      };
    }

    if (cloudTelemetry.eventLogs.length > 100) {
      cloudTelemetry.eventLogs.pop();
    }

    return new Response(JSON.stringify({ success: true, telemetry: cloudTelemetry }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
