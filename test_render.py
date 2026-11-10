import http.server
import socketserver
import subprocess
import threading
import time
import os
import sys
import urllib.parse

PORT = 8999

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/save-file':
            params = urllib.parse.parse_qs(parsed.query)
            filename = params.get('name', ['exported_file'])[0]
            # Sanitize filename
            filename = os.path.basename(filename)
            content_length = int(self.headers.get('Content-Length', 0))
            data = self.rfile.read(content_length)

            with open(filename, 'wb') as f:
                f.write(data)

            print(f"Server saved: {filename} ({len(data)} bytes)")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

def main():
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)

    output_png = os.path.abspath("render_preview.png")
    if os.path.exists(output_png):
        os.remove(output_png)

    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    url = f"http://localhost:{PORT}/index.html"

    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        f"--screenshot={output_png}",
        "--window-size=1280,800",
        url
    ]

    print("Running headless Edge to render screenshot and trigger export...")
    subprocess.run(cmd, check=True)

    if os.path.exists(output_png):
        print(f"Screenshot saved successfully to {output_png} (size: {os.path.getsize(output_png)} bytes)")
    else:
        print("Failed to save screenshot.")

if __name__ == "__main__":
    main()
