# Day 2 Frontend Wiring Guide

## Status: 70% Complete

Your App.tsx is **already rendering** 70% of the EvaluationResult. Here's what's left:

---

## ✅ Already Wired (No Action Needed)

These sections automatically render from `currentResult`:

```tsx
{currentResult.demand_score}           // ✅ Score gauge
{currentResult.trend}                  // ✅ Trend indicator  
{currentResult.confidence}             // ✅ Confidence bars
{currentResult.summary}                // ✅ Executive Summary
{currentResult.drivers.map(...)}       // ✅ Core Drivers list
{currentResult.recommendations.map()} // ✅ Recommendations
{currentResult.citations.map(...)}     // ✅ Citations/Sources
```

---

## ⏳ Missing: Agent Activity Panel

**Location**: Add as 4th tab in the content section (after Actionable Advisory tab)

**Code to Add** (lines ~850 after recommendations button):

```tsx
{/* Tabs Panel */}
<div className="border-b border-slate-200 flex bg-white">
  <button
    onClick={() => setActiveTab("summary")}
    className={...}
  >
    1. Executive Briefing
  </button>
  <button
    onClick={() => setActiveTab("drivers")}
    className={...}
  >
    2. Core Demand Drivers
  </button>
  <button
    onClick={() => setActiveTab("recommendations")}
    className={...}
  >
    3. Actionable Advisory
  </button>
  
  {/* ADD THIS NEW TAB */}
  <button
    onClick={() => setActiveTab("agent_activity")}
    className={`flex-1 py-3 px-4 text-xs font-semibold text-center uppercase tracking-wider border-b-2 transition-all ${
      activeTab === "agent_activity"
        ? "border-slate-900 text-slate-900 font-bold bg-slate-50/50"
        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/30"
    }`}
  >
    4. Agent Activity
  </button>
</div>
```

---

## Render Agent Activity Content

**Code to Add** (after recommendations block in content section, ~line 920):

```tsx
{activeTab === "agent_activity" && currentResult.agent_activity && (
  <div className="space-y-3">
    <p className="text-xs text-slate-450 font-mono uppercase tracking-wider mb-3">
      Execution Timeline
    </p>
    
    {currentResult.agent_activity.map((activity, index) => (
      <div 
        key={index} 
        className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-200 rounded-xl"
      >
        {/* Status Icon */}
        <div className="shrink-0 mt-0.5">
          {activity.status === "completed" ? (
            <div className="h-5 w-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3px]" />
            </div>
          ) : activity.status === "in_progress" ? (
            <div className="h-5 w-5 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center">
              <RefreshCw className="h-3 w-3 text-blue-600 animate-spin" />
            </div>
          ) : activity.status === "failed" ? (
            <div className="h-5 w-5 rounded-full bg-red-100 border border-red-300 flex items-center justify-center">
              <span className="text-red-600 font-bold text-xs">!</span>
            </div>
          ) : (
            <div className="h-5 w-5 rounded-full bg-slate-200 border border-slate-300"></div>
          )}
        </div>
        
        {/* Step Content */}
        <div className="flex-1">
          <span className="text-sm font-semibold text-slate-900">
            {activity.step}
          </span>
          {activity.timestamp && (
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {new Date(activity.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    ))}
  </div>
)}
```

---

## Optional: Add Empty Placeholders (for future MongoDB)

Add these panels for visual symmetry (they'll be populated on Day 3):

### Market Signals Panel:
```tsx
{activeTab === "market_signals" && (
  <div className="space-y-3">
    <p className="text-xs text-slate-450 font-mono uppercase tracking-wider mb-3">
      Real-time Market Context
    </p>
    {currentResult.market_signals && currentResult.market_signals.length > 0 ? (
      currentResult.market_signals.map((signal, index) => (
        <div key={index} className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <Activity className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-slate-900">{signal.title}</h4>
            <p className="text-sm text-slate-600 mt-1">{signal.signal}</p>
            <span className="text-[10px] font-mono text-slate-500 mt-2 inline-block">
              Relevance: {signal.relevance}
            </span>
          </div>
        </div>
      ))
    ) : (
      <p className="text-xs text-slate-500 italic">
        No market signals available. Enable MongoDB integration on Day 3.
      </p>
    )}
  </div>
)}
```

### Historical Matches Panel:
```tsx
{activeTab === "historical_matches" && (
  <div className="space-y-3">
    <p className="text-xs text-slate-450 font-mono uppercase tracking-wider mb-3">
      Similar Historical Events
    </p>
    {currentResult.historical_matches && currentResult.historical_matches.length > 0 ? (
      currentResult.historical_matches.map((match, index) => (
        <div key={index} className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <History className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-slate-900">
              {match.title} {match.year && `(${match.year})`}
            </h4>
            <p className="text-sm text-slate-600 mt-1">{match.description}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-1 rounded">
                Match: {match.similarity}%
              </span>
              <span className="text-[10px] font-mono bg-red-50 text-red-700 px-2 py-1 rounded">
                {match.impact}
              </span>
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className="text-xs text-slate-500 italic">
        No historical matches available. Enable MongoDB Vector Search on Day 3.
      </p>
    )}
  </div>
)}
```

---

## Tab State Update

Change this line (line ~52):

```tsx
// OLD
const [activeTab, setActiveTab] = useState<"summary" | "drivers" | "recommendations">("summary");

// NEW
const [activeTab, setActiveTab] = useState<"summary" | "drivers" | "recommendations" | "agent_activity" | "market_signals" | "historical_matches">("summary");
```

---

## Testing Checklist

When you restart the app:

- [ ] Click "NVIDIA Blackwell Ultra" preset
- [ ] Click "Run Demand Evaluation"
- [ ] See agent workflow animation in loading state
- [ ] API response returns with full EvaluationResult
- [ ] See "Agent Activity" tab appears with 5 completed steps
- [ ] Click through all tabs:
  - ✅ Executive Briefing renders summary
  - ✅ Core Demand Drivers renders drivers[]
  - ✅ Actionable Advisory renders recommendations[]
  - ✅ Agent Activity renders agent_activity[]
- [ ] Citations show at bottom
- [ ] All data is dynamic from API, nothing hardcoded

---

## Done = You're Ready for Day 3

Once this is wired:
- ✅ Frontend contract is complete
- ✅ API contract is complete
- ✅ Mock data flows end-to-end
- ✅ All UI sections render from API response

**Day 3**: Hook up MongoDB to populate:
- `market_signals` (from industry news/sources)
- `historical_matches` (from vector search on past analyses)
