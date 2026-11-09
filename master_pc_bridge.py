"""
Master PC - Multi-Emulator ADB WebSocket Bridge
================================================
This script runs locally on your PC (where LDPlayer, NoxPlayer, BlueStacks, or MEmu are installed).
It connects to your local ADB daemon (127.0.0.1:5037) and bridges your real Android emulators
to the Master PC Web Automation Panel via WebSockets (ws://127.0.0.1:8765).

Prerequisites:
  pip install websockets asyncio

Usage:
  python master_pc_bridge.py
"""

import asyncio
import json
import subprocess
import sys
import os
import base64
import time

WS_HOST = "127.0.0.1"
WS_PORT = 8765

def run_adb(args):
    """Run an ADB command and return stdout as string."""
    try:
        cmd = ["adb"] + args
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=15,
            shell=False
        )
        return result.stdout.strip()
    except Exception as e:
        return f"Error: {e}"

def get_connected_devices():
    """Detect all online Android emulators via ADB."""
    raw = run_adb(["devices", "-l"])
    lines = raw.split("\n")[1:]
    devices = []
    
    for idx, line in enumerate(lines):
        line = line.strip()
        if not line or "offline" in line:
            continue
        parts = line.split()
        serial = parts[0]
        status = parts[1] if len(parts) > 1 else "unknown"
        
        # Get device model
        model = "Android Emulator"
        for p in parts:
            if p.startswith("model:"):
                model = p.replace("model:", "").replace("_", " ")
        
        # Get battery level
        battery_raw = run_adb(["-s", serial, "shell", "dumpsys", "battery"])
        battery = 95
        for b_line in battery_raw.split("\n"):
            if "level:" in b_line:
                try:
                    battery = int(b_line.split(":")[1].strip())
                except:
                    pass

        devices.append({
            "id": f"emu-{idx+1}",
            "name": f"Emulator-{idx+1} ({serial})",
            "adbSerial": serial,
            "status": "connected" if status == "device" else "disconnected",
            "model": model,
            "battery": battery,
            "port": 5554 + (idx * 2)
        })
    return devices

async def handle_client(websocket):
    print(f"[Master PC Bridge] Web Panel connected from {websocket.remote_address}")
    
    # Send initial device list
    devices = get_connected_devices()
    await websocket.send(json.dumps({
        "type": "DEVICE_LIST",
        "devices": devices,
        "timestamp": time.time()
    }))

    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                action = data.get("action")
                serial = data.get("serial")
                
                print(f"[Master PC Bridge] Received Action: {action} on {serial}")

                if action == "GET_DEVICES":
                    devs = get_connected_devices()
                    await websocket.send(json.dumps({
                        "type": "DEVICE_LIST",
                        "devices": devs
                    }))

                elif action == "TAP":
                    x = data.get("x")
                    y = data.get("y")
                    if serial and x is not None and y is not None:
                        res = run_adb(["-s", serial, "shell", "input", "tap", str(x), str(y)])
                        await websocket.send(json.dumps({
                            "type": "ACTION_RESULT",
                            "action": "TAP",
                            "serial": serial,
                            "result": "OK"
                        }))

                elif action == "INPUT_TEXT":
                    text = data.get("text", "")
                    if serial and text:
                        # Escape special characters
                        escaped = text.replace(" ", "%s").replace("&", "\&")
                        run_adb(["-s", serial, "shell", "input", "text", escaped])
                        await websocket.send(json.dumps({
                            "type": "ACTION_RESULT",
                            "action": "INPUT_TEXT",
                            "serial": serial,
                            "result": "OK"
                        }))

                elif action == "KEYEVENT":
                    key = data.get("key", "3") # 3 = Home, 4 = Back
                    if serial:
                        run_adb(["-s", serial, "shell", "input", "keyevent", str(key)])
                        await websocket.send(json.dumps({
                            "type": "ACTION_RESULT",
                            "action": "KEYEVENT",
                            "serial": serial,
                            "result": "OK"
                        }))

                elif action == "SCREENSHOT":
                    if serial:
                        # Capture PNG screencap
                        proc = subprocess.run(
                            ["adb", "-s", serial, "exec-out", "screencap", "-p"],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE
                        )
                        if proc.returncode == 0:
                            b64 = base64.b64encode(proc.stdout).decode("utf-8")
                            await websocket.send(json.dumps({
                                "type": "SCREEN_FRAME",
                                "serial": serial,
                                "image": f"data:image/png;base64,{b64}"
                            }))

                elif action == "REBOOT":
                    if serial:
                        run_adb(["-s", serial, "reboot"])
                        await websocket.send(json.dumps({
                            "type": "ACTION_RESULT",
                            "action": "REBOOT",
                            "serial": serial,
                            "result": "REBOOTING"
                        }))

            except Exception as err:
                print(f"Error processing message: {err}")

    except Exception as e:
        print(f"Client disconnected: {e}")

async def main():
    print("=" * 60)
    print("MASTER PC - LOCAL ADB WEBSOCKET BRIDGE SERVER")
    print(f"Listening on ws://{WS_HOST}:{WS_PORT}")
    print("Connect this server with the Master PC Web Automation Panel")
    print("=" * 60)

    # Check ADB version
    adb_ver = run_adb(["version"])
    print(f"Local ADB Status:\n{adb_ver}\n")
    
    devices = get_connected_devices()
    print(f"Found {len(devices)} active Android emulator(s) on PC:")
    for d in devices:
        print(f"  -> {d['name']} ({d['adbSerial']})")
    print("\nStarting WebSocket Daemon... Ready for panel commands.")

    async with websockets.serve(handle_client, WS_HOST, WS_PORT):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        import websockets
    except ImportError:
        print("Error: 'websockets' module not found.")
        print("Please run: pip install websockets")
        sys.exit(1)

    asyncio.run(main())
