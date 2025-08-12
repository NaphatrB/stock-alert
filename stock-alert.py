# stock_check.py
import os
import requests
from bs4 import BeautifulSoup
import urllib.parse

TARGET_URL = os.getenv("TARGET_URL", "https://www.voxi.co.uk/phones/google/pixel-9")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", 'http://192.168.1.5:5000/webapi/entry.cgi?api=SYNO.Chat.External&method=incoming&version=2&token=eDEjNzFhZLHggZKIfwk0tzyWzwuBZbrbFfV79ZApvHwbrauZPyObev8yRskIWPcn')

def check_stock():
    response = requests.get(TARGET_URL, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Example: get dropdowns for colour and storage
    colour_select = soup.select_one("#device-colour-select")
    storage_select = soup.select_one("#device-storage-select")

    results = []
    if colour_select and storage_select:
        colours = [opt.text.strip() for opt in colour_select.select("option") if opt.get("value") and not opt.has_attr("disabled")]
        storages = [opt.text.strip() for opt in storage_select.select("option") if opt.get("value") and not opt.has_attr("disabled")]

        for colour in colours:
            for storage in storages:
                if "128GB" in storage:
                    results.append(f"{colour} {storage}")

    if results:
        send_alert(results)
    else:
        print("No 128GB stock found.")

def send_alert(results):
    message = "\n".join(results)
    payload = {
        'payload': f'{{"text": "{message}"}}'
    }   
    try:
        r = requests.post(WEBHOOK_URL, data=urllib.parse.urlencode(payload),
                          headers={'Content-Type': 'application/x-www-form-urlencoded'},
                          timeout=10)
        r.raise_for_status()
        print("✅ Alert sent.")
    except Exception as e:
        print("❌ Failed to send alert:", e)

if __name__ == "__main__":
    check_stock()
