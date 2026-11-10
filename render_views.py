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
            filename = os.path.basename(filename)
            content_length = int(self.headers.get('Content-Length', 0))
            data = self.rfile.read(content_length)

            with open(filename, 'wb') as f:
                f.write(data)

            print(f"Saved: {filename} ({len(data)} bytes)")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

def render(url, output_path, window_size="876,1168", wait_sec=2):
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if os.path.exists(output_path):
        os.remove(output_path)
    
    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        f"--screenshot={output_path}",
        f"--window-size={window_size}",
        url
    ]
    subprocess.run(cmd, check=True)
    time.sleep(wait_sec)
    if os.path.exists(output_path):
        print(f"Rendered: {output_path} ({os.path.getsize(output_path)} bytes)")
    else:
        print(f"Failed to render: {output_path}")

def main():
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)

    print("Rendering 3D views...")
    render(f"http://localhost:{PORT}/preview.html?view=front", os.path.abspath("render_front.png"), "876,1168", wait_sec=3)
    render(f"http://localhost:{PORT}/preview.html?view=34", os.path.abspath("render_34.png"), "876,1168", wait_sec=1)
    render(f"http://localhost:{PORT}/preview.html?view=side", os.path.abspath("render_side.png"), "876,1168", wait_sec=1)
    render(f"http://localhost:{PORT}/preview.html?view=back", os.path.abspath("render_back.png"), "876,1168", wait_sec=1)
    render(f"http://localhost:{PORT}/index.html", os.path.abspath("render_ui.png"), "1280,800", wait_sec=1)
    render(f"http://localhost:{PORT}/comparison.html", os.path.abspath("comparison.png"), "1100,820", wait_sec=1)
    print("All renders completed.")

if __name__ == "__main__":
    main()
