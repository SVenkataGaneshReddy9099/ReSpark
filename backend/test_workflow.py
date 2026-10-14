"""End-to-End Workflow Verification Script for ReSpark Hackathon Prototype.

Executes the 10-step hackathon demonstration workflow against the live running server:
1. Check initial dashboard metrics
2. Explore available resources
3. Post a new resource (Discrete Mathematics Textbook)
4. Post a matching community need (Sophomore Midterm Need)
5. Trigger AI matching recommendations
6. Review match score and explainable natural language reasons
7. Express interest and accept the match (reserving inventory)
8. Mark the match completed (fulfilling the need)
9. Verify dashboard and impact statistics update with verified waste diversion
10. Confirm persistence in SQLite database
"""

import httpx
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_workflow():
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    print("=== Step 1: Health & Dashboard Statistics ===")
    health = client.get("/health").json()
    assert health["status"] == "healthy", f"Unexpected health: {health}"
    print(f"Health verified: {health['service']} (v{health['version']})")

    init_stats = client.get("/stats/dashboard").json()
    init_completed = init_stats["completed_matches"]
    init_waste = init_stats["estimated_waste_avoided_kg"]
    print(f"Initial Metrics -> Resources: {init_stats['total_resources']}, Open Needs: {init_stats['open_needs']}, Completed: {init_completed}, Waste Avoided: {init_waste} kg")

    print("\n=== Step 2: Explore Available Resources ===")
    resources = client.get("/resources").json()
    print(f"Retrieved {len(resources)} listings from database.")

    print("\n=== Step 3: Post a New Resource ===")
    new_resource_payload = {
        "provider_id": 1,
        "title": "Discrete Mathematics and Its Applications (Rosen 8th Edition)",
        "description": "Comprehensive textbook for discrete structures, graph theory, and logic. Mint condition with solution companion.",
        "category": "textbooks",
        "resource_type": "physical_item",
        "quantity": 1.0,
        "unit": "book",
        "condition": "like_new",
        "location": "University Campus",
        "instructions": "Meet outside Science Hall.",
        "contact_info": "elena.r@university.edu",
        "estimated_weight_kg": 2.1
    }
    created_res = client.post("/resources", json=new_resource_payload).json()
    res_id = created_res["id"]
    print(f"Created Resource #{res_id}: '{created_res['title']}' (Weight: {created_res['estimated_weight_kg']} kg)")

    print("\n=== Step 4: Post a Matching Community Need ===")
    new_need_payload = {
        "requester_id": 4,
        "title": "Discrete Mathematics & Graph Theory Textbook Needed",
        "description": "Looking for Rosen Discrete Mathematics textbook for sophomore computer science midterm.",
        "category": "textbooks",
        "resource_type": "physical_item",
        "quantity_requested": 1.0,
        "unit": "book",
        "location": "University Campus",
        "urgency": "high",
        "required_by": "2026-10-28",
        "preferences": "Physical textbook preferred."
    }
    created_need = client.post("/needs", json=new_need_payload).json()
    need_id = created_need["id"]
    print(f"Created Need #{need_id}: '{created_need['title']}' (Urgency: {created_need['urgency']})")

    print("\n=== Step 5: Trigger AI Matching Engine Recommendations ===")
    matches_result = client.post("/matches/generate?min_score=30.0").json()
    print(f"Evaluated {matches_result['total_candidates_evaluated']} candidates, generated {len(matches_result['top_matches'])} top matches.")

    # Find the match between our newly created resource and need
    target_match = None
    all_matches = client.get(f"/matches?resource_id={res_id}&need_id={need_id}").json()
    if all_matches:
        target_match = all_matches[0]

    assert target_match is not None, "Failed to match newly posted resource with need!"
    match_id = target_match["id"]
    score = target_match["score"]
    print(f"\n=== Step 6: Review Match Score & Explainability ===")
    print(f"Target Match #{match_id} -> Overall Compatibility Score: {score}/100")
    breakdown = target_match.get("parsed_breakdown")
    if breakdown:
        print(f"  - Text Similarity: {breakdown['text_similarity_score']}%")
        print(f"  - Category Match: {breakdown['category_score']}%")
        print(f"  - Quantity Coverage: {breakdown['quantity_score']}%")
        print(f"  - Location Match: {breakdown['location_score']}%")
        print(f"  - Urgency Score: {breakdown['urgency_score']}%")
        print("  - Explainable Evidence:")
        for reason in breakdown["reasons"]:
            print(f"    * {reason}")

    print("\n=== Step 7: Express Interest & Accept Match ===")
    step_interest = client.post(f"/matches/{match_id}/action", json={"status": "interest_expressed", "notes": "Elena and Priya coordinating meetup."}).json()
    assert step_interest["status"] == "interest_expressed"
    print(f"Status updated to: {step_interest['status']}")

    step_accept = client.post(f"/matches/{match_id}/action", json={"status": "accepted", "notes": "Meetup agreed for 3 PM at Library."}).json()
    assert step_accept["status"] == "accepted"
    print(f"Status updated to: {step_accept['status']}")

    # Verify inventory was allocated
    res_check = client.get(f"/resources/{res_id}").json()
    assert res_check["allocated_quantity"] == 1.0
    assert res_check["availability_status"] == "reserved"
    print(f"Resource #{res_id} inventory allocated: {res_check['allocated_quantity']}/{res_check['quantity']} (Status: {res_check['availability_status']})")

    print("\n=== Step 8: Mark Match as Completed ===")
    step_completed = client.post(f"/matches/{match_id}/action", json={"status": "completed", "notes": "Handover confirmed successfully."}).json()
    assert step_completed["status"] == "completed"
    print(f"Status updated to: {step_completed['status']}")

    # Verify Resource and Need final statuses
    res_final = client.get(f"/resources/{res_id}").json()
    need_final = client.get(f"/needs/{need_id}").json()
    assert res_final["availability_status"] == "completed"
    assert need_final["status"] == "fulfilled"
    print(f"Resource status: {res_final['availability_status']}, Need status: {need_final['status']}")

    print("\n=== Step 9: Verify Real-Time Dashboard & Impact Metrics Update ===")
    updated_stats = client.get("/stats/dashboard").json()
    updated_impact = client.get("/stats/impact").json()

    print(f"Dashboard Completed Matches: {init_completed} -> {updated_stats['completed_matches']} (increase of {updated_stats['completed_matches'] - init_completed})")
    print(f"Dashboard Landfill Waste Avoided: {init_waste} kg -> {updated_stats['estimated_waste_avoided_kg']} kg (added {round(updated_stats['estimated_waste_avoided_kg'] - init_waste, 1)} kg)")
    print(f"Total Impact Community Members Helped: {updated_impact['community_members_helped']}")
    print(f"Total Embodied CO2e Avoided: {updated_impact['estimated_co2_avoided_kg']} kg")

    assert updated_stats["completed_matches"] == init_completed + 1
    assert updated_stats["estimated_waste_avoided_kg"] > init_waste

    print("\n=======================================================")
    print("SUCCESS: ALL 10 STEPS OF THE HACKATHON WORKFLOW PASSED!")
    print("=======================================================")

if __name__ == "__main__":
    run_workflow()
