from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from .metrics_store import get_metrics
import json
import asyncio

app = FastAPI(title="Real-time Usage Metrics Dashboard")

# Web UI Dashboard (HTML + JS auto-refresh)
html_page = """
<!DOCTYPE html>
<html>
<head>
<title>Metrics Dashboard</title>
</head>
<body>
<h2>Real-time API Metrics</h2>

<label>Time Range (seconds): </label>
<input id="range" type="number" value="60" />

<label>User Tier: </label>
<select id="tier">
  <option value="">All</option>
  <option value="free">Free</option>
  <option value="paid">Paid</option>
  <option value="premium">Premium</option>
</select>

<pre id="output"></pre>

<script>
let socket = new WebSocket("ws://localhost:8000/ws");

socket.onopen = () => {
  console.log("Connected to metrics feed");
  setInterval(() => {
    const range = document.getElementById("range").value;
    const tier = document.getElementById("tier").value;
    socket.send(JSON.stringify({range: range, tier: tier}));
  }, 5000); // refresh every 5 sec
};

socket.onmessage = (event) => {
  document.getElementById("output").innerText = event.data;
}
</script>

</body>
</html>
"""

@app.get("/")
def dashboard():
    return HTMLResponse(html_page)

@app.websocket("/ws")
async def metrics_socket(ws: WebSocket):
    await ws.accept()
    while True:
        data = await ws.receive_text()    # receive filter data
        filters = json.loads(data)
        range_sec = int(filters["range"])
        tier = filters["tier"] or None

        metrics = get_metrics(range_sec, tier)
        structured = [
            {
                "user": m.user_id,
                "tier": m.tier,
                "ip": m.ip,
                "token": m.token,
                "requests": m.request_count,
                "limit_utilization": round((m.request_count / m.limit) * 100, 2)
            }
            for m in metrics
        ]
        await ws.send_text(json.dumps(structured, indent=2))
        await asyncio.sleep(1)
