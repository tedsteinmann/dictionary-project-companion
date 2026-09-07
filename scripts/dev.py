"""Preview the built site, with the local sponsor editor available under /tools/."""

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"


class DevHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)

    def translate_path(self, path):
        translated = Path(super().translate_path(path))
        relative = translated.relative_to(DIST)
        if relative.parts and relative.parts[0] == "tools":
            return str(ROOT / relative)
        return str(translated)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=4173)
    args = parser.parse_args()
    with ThreadingHTTPServer(("", args.port), DevHandler) as server:
        print(f"Preview: http://localhost:{server.server_port}", flush=True)
        print("After editing source or sponsors.json, run npm run build and refresh.", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
