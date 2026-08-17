# server/agents/graph.py
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from server.agents.state import ViralBrainState
from server.agents.trend_scout import trend_scout_node
from server.agents.dna_scanner import dna_scanner_node
from server.agents.script_writer import script_writer_node
from server.agents.virality_scorer import virality_scorer_node
from server.agents.title_generator import title_generator_node
from server.agents.platform_adapter import platform_adapter_node
from server.agents.seo_optimizer import seo_optimizer_node
from server.agents.refiner import script_refiner_node

memory_saver = MemorySaver()
workflow = StateGraph(state_schema=ViralBrainState)

workflow.add_node("trend_scout_node", trend_scout_node)
workflow.add_node("dna_scanner_node", dna_scanner_node)
workflow.add_node("script_writer_node", script_writer_node)
workflow.add_node("virality_scorer_node", virality_scorer_node)
workflow.add_node("title_generator_node", title_generator_node)
workflow.add_node("platform_adapter_node", platform_adapter_node)
workflow.add_node("seo_optimizer_node", seo_optimizer_node)
workflow.add_node("script_refiner_node", script_refiner_node)


def route_after_audit(state: ViralBrainState):
    score = state.get("virality_score", 0.0)
    retry_count = state.get("retry_count", 0)

    print(f"\n[ROUTER] Checking script quality gate. Score: {score}, Retries: {retry_count}")
    if score >= 60.0 or retry_count >= 2:
        return "approved"
    return "rejected"


def route_after_hitl(state: ViralBrainState):
    feedback = state.get("human_feedback", "")

    if feedback and feedback.strip().lower() != "approved":
        print(f"[ROUTER] Human modification request detected: '{feedback}'. Routing to Refiner.")
        return "needs_refinement"

    print("[ROUTER] No revision feedback present or explicit approval caught. Finishing pipeline.")
    return "approved"


workflow.add_edge(START, "trend_scout_node")
workflow.add_edge("trend_scout_node", "dna_scanner_node")
workflow.add_edge("dna_scanner_node", "script_writer_node")
workflow.add_edge("script_writer_node", "virality_scorer_node")

workflow.add_conditional_edges(
    "virality_scorer_node",
    route_after_audit,
    {
        "approved": "title_generator_node",
        "rejected": "script_writer_node"
    }
)

workflow.add_edge("title_generator_node", "platform_adapter_node")
workflow.add_edge("platform_adapter_node", "seo_optimizer_node")

workflow.add_conditional_edges(
    "seo_optimizer_node",
    route_after_hitl,
    {
        "approved": END,
        "needs_refinement": "script_refiner_node"
    }
)

workflow.add_edge("script_refiner_node", "script_writer_node")

app = workflow.compile(
    checkpointer=memory_saver,
    interrupt_after=["seo_optimizer_node"]
)

print("\n=== SYSTEM LANGGRAPH ARCHITECTURE MERMAID DIAGRAM ===")
print(app.get_graph().draw_mermaid())
print("=====================================================\n")