from pathlib import Path
from django.conf import settings
from django.http import HttpResponse, HttpResponseNotFound


def spa_index(request):
    """
    SPA fallback:
    - zwraca index.html z Vite build (frontend_dist/index.html)
    - dzięki temu React Router działa po odświeżeniu strony /tickets/123 itp.
    """
    dist_dir = getattr(settings, "FRONTEND_DIST_DIR", None)
    if not dist_dir:
        return HttpResponseNotFound("FRONTEND_DIST_DIR is not configured.")

    index_path = Path(dist_dir) / "index.html"
    if not index_path.exists():
        return HttpResponseNotFound(
            "Frontend build not found. Run `npm run build` in /frontend "
            "to generate /frontend_dist/index.html"
        )

    return HttpResponse(index_path.read_text(encoding="utf-8"), content_type="text/html")
