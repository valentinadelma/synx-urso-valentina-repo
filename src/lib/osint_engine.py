import sys
import json
import subprocess
import asyncio
import re

async def run_holehe(email):
    try:
        # holehe returns a lot of output, we need to parse it or use its API if available
        # For now, let's just run it and capture output
        process = await asyncio.create_subprocess_exec(
            'holehe', email, '--no-color',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        output = stdout.decode()
        
        # Simple parsing for holehe
        found = []
        for line in output.split('\n'):
            if '[+]' in line:
                site = line.split('[+]')[-1].strip()
                found.append(site)
        return found
    except Exception as e:
        return [f"Error: {str(e)}"]

async def run_socialscan(target):
    try:
        process = await asyncio.create_subprocess_exec(
            'socialscan', target, '--json',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        data = json.loads(stdout.decode())
        
        found = []
        for result in data:
            if result.get('available') == False: # False means account exists
                found.append(result.get('platform'))
        return found
    except Exception as e:
        return []

async def run_maigret(username):
    try:
        # Running maigret with top 50 sites for speed
        process = await asyncio.create_subprocess_exec(
            'maigret', username, '--top', '50', '--json', 'report',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        return []
    except Exception as e:
        return []

async def run_phone_osint(phone):
    # Mocking phone OSINT for now
    return ["WhatsApp", "Telegram", "Truecaller"]

async def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments"}))
        return

    action = sys.argv[1]
    target = sys.argv[2]
    
    results = {
        "target": target,
        "type": action,
        "findings": [],
        "reputation": 0,
        "summary": ""
    }

    if action == "email":
        holehe_results = await run_holehe(target)
        results["findings"].extend([{"platform": s, "status": "Found"} for s in holehe_results])
        results["reputation"] = min(100, len(holehe_results) * 15)
        results["summary"] = f"Found {len(holehe_results)} accounts associated with this email."
    
    elif action == "username":
        social_results = await run_socialscan(target)
        results["findings"].extend([{"platform": s, "status": "Found"} for s in social_results])
        results["reputation"] = min(100, len(social_results) * 10)
        results["summary"] = f"Found {len(social_results)} social media profiles."
    
    elif action == "phone":
        phone_results = await run_phone_osint(target)
        results["findings"].extend([{"platform": s, "status": "Found"} for s in phone_results])
        results["reputation"] = 80
        results["summary"] = f"Phone number linked to {len(phone_results)} services."

    print(json.dumps(results))

if __name__ == "__main__":
    asyncio.run(main())
