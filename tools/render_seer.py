import http.server
import socketserver
import subprocess
import threading
import time
import os
import sys
import urllib.parse

PORT = 8995
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
            if filename not in ('seer.glb', 'seer.obj'):
                self.send_response(403)
                self.end_headers()
                return

            content_length = int(self.headers.get('Content-Length', 0))
            data = self.rfile.read(content_length)
            out_path = os.path.join(ROOT_DIR, "assets", "models", filename)

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
    if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        raise RuntimeError(f"Failed to render valid image: {output_path}")
    print(f"Rendered: {output_path} ({os.path.getsize(output_path)} bytes)")

def wait_for_file(path, timeout_sec=10):
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        if os.path.exists(path) and os.path.getsize(path) > 0:
            return
        time.sleep(0.25)
    raise RuntimeError(f"Export timed out or empty file: {path}")

def main():
    if not os.path.exists(EDGE_PATH):
        raise FileNotFoundError(f"Microsoft Edge not found at {EDGE_PATH}")

    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)

    renders_dir = os.path.join(ROOT_DIR, "assets", "renders")
    models_dir = os.path.join(ROOT_DIR, "assets", "models")

    print("Rendering Seer 3D views...")
    render(f"http://localhost:{PORT}/pages/preview_seer.html?view=front", os.path.join(renders_dir, "render_seer_front.png"), "900,1100", wait_sec=2)
    render(f"http://localhost:{PORT}/pages/preview_seer.html?view=34", os.path.join(renders_dir, "render_seer_34.png"), "900,1100", wait_sec=1)
    render(f"http://localhost:{PORT}/pages/preview_seer.html?view=side", os.path.join(renders_dir, "render_seer_side.png"), "900,1100", wait_sec=1)
    render(f"http://localhost:{PORT}/pages/preview_seer.html?view=back", os.path.join(renders_dir, "render_seer_back.png"), "900,1100", wait_sec=1)
    render(f"http://localhost:{PORT}/pages/preview_seer.html?view=closeup_front", os.path.join(renders_dir, "render_seer_closeup_front.png"), "900,1170", wait_sec=1)
    render(f"http://localhost:{PORT}/pages/preview_seer.html?view=closeup_34", os.path.join(renders_dir, "render_seer_closeup_34.png"), "900,900", wait_sec=1)

    print("Exporting Seer GLB and OBJ...")
    glb_path = os.path.join(models_dir, "seer.glb")
    if os.path.exists(glb_path):
        os.remove(glb_path)
    p = subprocess.Popen([EDGE_PATH, "--headless=new", "--disable-gpu", f"http://localhost:{PORT}/pages/preview_seer.html?export=glb"])
    try:
        wait_for_file(glb_path, 12)
    finally:
        p.kill()

    obj_path = os.path.join(models_dir, "seer.obj")
    if os.path.exists(obj_path):
        os.remove(obj_path)
    p = subprocess.Popen([EDGE_PATH, "--headless=new", "--disable-gpu", f"http://localhost:{PORT}/pages/preview_seer.html?export=obj"])
    try:
        wait_for_file(obj_path, 12)
    finally:
        p.kill()

    render(f"http://localhost:{PORT}/pages/comparison_seer.html", os.path.join(renders_dir, "comparison_seer.png"), "1080,820", wait_sec=1)
    render(f"http://localhost:{PORT}/pages/comparison_seer.html?mode=closeup", os.path.join(renders_dir, "comparison_seer_closeup.png"), "1080,820", wait_sec=1)
    print("Seer renders and exports completed.")

if __name__ == "__main__":
    main()
