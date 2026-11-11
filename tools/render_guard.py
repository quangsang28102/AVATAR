import http.server
import socketserver
import subprocess
import threading
import time
import os
import sys
import urllib.parse

PORT = 8997
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT_DIR)
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

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

            if filename.endswith(('.glb', '.obj')):
                out_path = os.path.join(ROOT_DIR, "assets", "models", filename)
            else:
                out_path = os.path.join(ROOT_DIR, "assets", "renders", filename)

            with open(out_path, 'wb') as f:
                f.write(data)

            print(f"Saved: {out_path} ({len(data)} bytes)")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

def render(url, output_path, window_size="900,1100", wait_sec=2):
    if os.path.exists(output_path):
        os.remove(output_path)
    
    cmd = [
        EDGE_PATH,
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

    renders_dir = os.path.join(ROOT_DIR, "assets", "renders")
    print("Rendering Guard 3D views...")
    render(f"http://localhost:{PORT}/pages/preview_guard.html?view=front", os.path.join(renders_dir, "render_guard_front.png"), "900,1100", wait_sec=3)
    render(f"http://localhost:{PORT}/pages/preview_guard.html?view=34", os.path.join(renders_dir, "render_guard_34.png"), "900,1100", wait_sec=1)
    render(f"http://localhost:{PORT}/pages/preview_guard.html?view=side", os.path.join(renders_dir, "render_guard_side.png"), "900,1100", wait_sec=1)
    render(f"http://localhost:{PORT}/pages/preview_guard.html?view=back", os.path.join(renders_dir, "render_guard_back.png"), "900,1100", wait_sec=1)

    # Trigger GLB and OBJ export
    print("Exporting GLB and OBJ...")
    cmd_glb = [EDGE_PATH, "--headless=new", "--disable-gpu", f"http://localhost:{PORT}/pages/preview_guard.html?export=glb"]
    p = subprocess.Popen(cmd_glb)
    time.sleep(3)
    p.kill()

    cmd_obj = [EDGE_PATH, "--headless=new", "--disable-gpu", f"http://localhost:{PORT}/pages/preview_guard.html?export=obj"]
    p = subprocess.Popen(cmd_obj)
    time.sleep(3)
    p.kill()

    render(f"http://localhost:{PORT}/pages/comparison_guard.html", os.path.join(renders_dir, "comparison_guard.png"), "1080,820", wait_sec=1)
    print("Guard renders and exports completed.")

if __name__ == "__main__":
    main()
