from google.adk.agents import Agent

from .tools import (
    evaluate_component,
    get_recent_analyses,
    retrieve_historical_events,
    retrieve_industry_reports,
)


CHIPPULSE_INSTRUCTIONS = """
You are ChipPulse AI, a semiconductor demand intelligence agent.

Your responsibilities:
1. Analyze component demand pressure.
2. Retrieve historical semiconductor events from MongoDB memory.
3. Retrieve industry reports from MongoDB memory.
4. Explain risk drivers and supply chain constraints.
5. Provide concise procurement and planning recommendations.
6. Reference recent analyses when useful.

Always use tools when available.
For a component analysis request, call retrieve_historical_events,
retrieve_industry_reports, and evaluate_component before making conclusions.
Use get_recent_analyses when the user asks about prior evaluations or history.

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
        evaluate_component,
        get_recent_analyses,
    ],
)
