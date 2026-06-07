import os
from typing import Any, Dict, Optional

import requests


BACKEND_URL = os.getenv("CHIPPULSE_BACKEND_URL", "http://localhost:3000")
REQUEST_TIMEOUT_SECONDS = 30


def _request_json(method: str, path: str, **kwargs: Any) -> Dict[str, Any]:
    url = f"{BACKEND_URL}{path}"

    try:
        response = requests.request(
            method,
            url,
            timeout=REQUEST_TIMEOUT_SECONDS,
            **kwargs,
        )
        try:
            payload = response.json()
        except ValueError:
            payload = {
                "error": response.text or "Backend returned an empty non-JSON response.",
            }

        if response.ok:
            return payload

        return {
            "error": payload.get("error", f"Backend returned HTTP {response.status_code}"),
            "status_code": response.status_code,
            "backend_url": BACKEND_URL,
            "path": path,
            "hint": payload.get("hint", "Check the backend logs for the exact service failure."),
        }
    except requests.exceptions.RequestException as error:
        return {
            "error": str(error),
            "backend_url": BACKEND_URL,
            "path": path,
            "hint": "Start the Node backend with `cd backend && npm run dev`, then retry the agent tool.",
        }
    except ValueError as error:
        return {
            "error": f"Backend returned non-JSON response: {error}",
            "backend_url": BACKEND_URL,
            "path": path,
        }


def retrieve_historical_events(component: str, custom_signal: Optional[str] = None) -> Dict[str, Any]:
    """Retrieve semantically similar semiconductor events from MongoDB Atlas Vector Search."""

    return _request_json(
        "POST",
        "/api/retrieve-events",
        json={
            "component": component,
            "customSignal": custom_signal or "",
        },
    )


def retrieve_industry_reports(component: str, custom_signal: Optional[str] = None) -> Dict[str, Any]:
    """Retrieve relevant industry reports from MongoDB Atlas Vector Search."""

    return _request_json(
        "POST",
        "/api/retrieve-reports",
        json={
            "component": component,
            "customSignal": custom_signal or "",
        },
    )


def evaluate_component(component: str, custom_signal: Optional[str] = None) -> Dict[str, Any]:
    """Generate and store a semiconductor demand analysis using ChipPulse backend scoring."""

    return _request_json(
        "POST",
        "/api/evaluate",
        json={
            "component": component,
            "customSignal": custom_signal or "",
        },
    )


def get_recent_analyses(limit: int = 5) -> Dict[str, Any]:
    """Retrieve recent demand analyses stored in MongoDB memory."""

    history = _request_json("GET", "/api/history")
    if isinstance(history, list):
        return {
            "analyses_returned": min(limit, len(history)),
            "analyses": history[:limit],
        }

    return history
