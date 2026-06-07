import os
from pathlib import Path

from google.adk.agents import Agent

from .tools import (
    evaluate_component,
    get_recent_analyses,
    retrieve_historical_events,
    retrieve_industry_reports,
    retrieve_recent_news,
)


def _read_env_file(path: Path) -> dict[str, str]:
    values = {}

    if not path.exists():
        return values

    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")

    return values


def _build_mongodb_mcp_toolset():
    try:
        from mcp import StdioServerParameters
        from google.adk.tools.mcp_tool import McpToolset
        from google.adk.tools.mcp_tool import StdioConnectionParams
    except ImportError:
        return None

    backend_env = _read_env_file(Path(__file__).resolve().parents[1] / ".env")
    connection_string = (
        os.getenv("MDB_MCP_CONNECTION_STRING")
        or os.getenv("MONGODB_URI")
        or backend_env.get("MONGODB_URI")
    )

    if not connection_string:
        return None

    env = {
        **os.environ,
        "MDB_MCP_CONNECTION_STRING": connection_string,
        "npm_config_cache": os.getenv(
            "npm_config_cache",
            "/Volumes/dedicated/npm-cache-mcp",
        ),
    }

    return McpToolset(
        connection_params=StdioConnectionParams(
            server_params=StdioServerParameters(
                command="npx",
                args=["-y", "mongodb-mcp-server@latest", "--readOnly"],
                env=env,
            ),
            timeout=30.0,
        ),
        tool_name_prefix="mongodb",
    )


mongodb_mcp_toolset = _build_mongodb_mcp_toolset()


CHIPPULSE_INSTRUCTIONS = """
You are ChipPulse AI, a semiconductor demand intelligence agent.

Your responsibilities:
1. Analyze component demand pressure.
2. Retrieve historical semiconductor events from MongoDB memory.
3. Retrieve industry reports from MongoDB memory.
4. Retrieve recent market news from MongoDB memory.
5. Explain risk drivers and supply chain constraints.
6. Provide concise procurement and planning recommendations.
7. Reference recent analyses when useful.
8. Use MongoDB MCP tools for direct memory inspection and aggregation when the
   user asks about saved analyses, collection contents, schemas, counts, or
   trends across memory.

Always use tools when available.
For a component analysis request, call retrieve_historical_events,
retrieve_industry_reports, retrieve_recent_news, and evaluate_component before
making conclusions.
Use get_recent_analyses when the user asks about prior evaluations or history.
Use MongoDB MCP tools for broader database questions such as "highest average
demand score", "show recent DDR5 analyses", "inspect collections", or
"aggregate the last 50 analyses".

Do not fabricate memory, citations, historical events, vector scores, or saved
analyses. Use retrieved backend data before making conclusions. If a backend
tool returns an error, explain the operational issue and the next concrete fix.
"""


root_agent = Agent(
    name="chip_pulse_agent",
    model="gemini-2.5-flash",
    description="ChipPulse semiconductor demand intelligence agent.",
    instruction=CHIPPULSE_INSTRUCTIONS,
    tools=[
        retrieve_historical_events,
        retrieve_industry_reports,
        retrieve_recent_news,
        evaluate_component,
        get_recent_analyses,
    ]
    + ([mongodb_mcp_toolset] if mongodb_mcp_toolset else []),
)
