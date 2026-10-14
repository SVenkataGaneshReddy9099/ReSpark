"""Realistic demonstration seed data for ReSpark with idempotent initialization."""

import json
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, Base, engine
from app.models.user import User
from app.models.resource import Resource
from app.models.need import Need
from app.models.match import Match
from app.models.enums import (
    Category,
    ResourceType,
    Condition,
    Urgency,
    AvailabilityStatus,
    NeedStatus,
    MatchStatus,
)
from app.services.matching_engine import evaluate_match_candidate

def seed_database(db: Session = None) -> None:
    """Seeds the SQLite database idempotently with rich demonstration data."""
    close_db = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db = True

    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            return  # Already seeded

        # -------------------------------------------------------------
        # 1. SAMPLE USERS
        # -------------------------------------------------------------
        users_data = [
            User(
                id=1,
                display_name="Elena Rostova",
                email="elena.r@university.edu",
                location="University Campus",
                bio="Senior Computer Science student eager to pass down textbooks and hardware to underclassmen.",
                is_organization=False,
            ),
            User(
                id=2,
                display_name="Marcus Vance",
                email="marcus.v@communitymail.org",
                location="Downtown District",
                bio="Freelance software architect and avid volunteer offering code mentoring and refurbished tech.",
                is_organization=False,
            ),
            User(
                id=3,
                display_name="Hope Community Youth Center",
                email="info@hopecyc.org",
                location="Eastside District",
                bio="Community youth center providing after-school education, arts, and digital literacy programs.",
                is_organization=True,
            ),
            User(
                id=4,
                display_name="Priya Patel",
                email="priya.p@gradmail.com",
                location="University Campus",
                bio="First-year engineering student on financial aid seeking essential study materials and laptop.",
                is_organization=False,
            ),
            User(
                id=5,
                display_name="GreenRoots Urban Farm",
                email="contact@greenroots.org",
                location="Westside EcoPark",
                bio="Nonprofit community garden promoting sustainable local agriculture and food security.",
                is_organization=True,
            ),
            User(
                id=6,
                display_name="David Chen",
                email="david.chen@designlab.io",
                location="Downtown District",
                bio="Interior architect downsizing studio furniture and donating surplus drawing stationery.",
                is_organization=False,
            ),
        ]

        for u in users_data:
            db.add(u)
        db.commit()

        # -------------------------------------------------------------
        # 2. SAMPLE RESOURCES
        # -------------------------------------------------------------
        resources_data = [
            # Elena (User 1)
            Resource(
                id=1,
                provider_id=1,
                title="Introduction to Algorithms (CLRS 3rd Ed) & Data Structures",
                description="Hardcover textbook in excellent condition with no highlighting. Perfect for CS201 or data structures coursework.",
                category=Category.TEXTBOOKS,
                resource_type=ResourceType.PHYSICAL_ITEM,
                quantity=1.0,
                allocated_quantity=0.0,
                unit="book",
                condition=Condition.LIKE_NEW,
                location="University Campus",
                availability_status=AvailabilityStatus.AVAILABLE,
                instructions="Can meet outside Engineering Library or Science Hall.",
                contact_info="elena.r@university.edu",
                estimated_weight_kg=1.8,
            ),
            Resource(
                id=2,
                provider_id=1,
                title="Calculus: Early Transcendentals (Stewart 8th Edition)",
                description="Standard calculus reference textbook with full problem solution appendix. Good condition with light cover wear.",
                category=Category.TEXTBOOKS,
                resource_type=ResourceType.PHYSICAL_ITEM,
                quantity=2.0,
                allocated_quantity=0.0,
                unit="books",
                condition=Condition.GOOD,
                location="University Campus",
                availability_status=AvailabilityStatus.AVAILABLE,
                instructions="Pickup at campus student union.",
                contact_info="elena.r@university.edu",
                estimated_weight_kg=2.2,
            ),
            # Marcus (User 2)
            Resource(
                id=3,
                provider_id=2,
                title="Lenovo ThinkPad T480 Laptop (16GB RAM, 512GB SSD)",
                description="Clean, factory-reset ThinkPad with new battery, genuine charger, and Ubuntu 22.04 LTS pre-installed. Fast and reliable for coding or school.",
                category=Category.ELECTRONICS,
                resource_type=ResourceType.PHYSICAL_ITEM,
                quantity=1.0,
                allocated_quantity=1.0,  # Pre-reserved in an accepted demo match
                unit="laptop",
                condition=Condition.GOOD,
                location="Downtown District",
                availability_status=AvailabilityStatus.RESERVED,
                instructions="Comes with protective neoprene sleeve and charger.",
                contact_info="marcus.v@communitymail.org",
                estimated_weight_kg=2.5,
            ),
            Resource(
                id=4,
                provider_id=2,
                title="Python & Full-Stack Web Development Tutoring (10 Hours)",
                description="Senior engineer offering 1-on-1 remote mentoring sessions covering Python, FastAPI, React, Git, and career advice for students.",
                category=Category.SKILLS,
                resource_type=ResourceType.SKILL,
                quantity=10.0,
                allocated_quantity=0.0,
                unit="hours",
                condition=Condition.NOT_APPLICABLE,
                location="Online / Downtown",
                availability_status=AvailabilityStatus.AVAILABLE,
                instructions="Sessions held over Google Meet / Zoom on weekday evenings.",
                contact_info="marcus.v@communitymail.org",
                estimated_weight_kg=0.0,
            ),
            # David Chen (User 6)
            Resource(
                id=5,
                provider_id=6,
                title="Ergonomic Mesh Office Desk Chair",
                description="Adjustable lumbar support, pneumatic height adjustment, breathable mesh back. Perfect for long study or remote work sessions.",
                category=Category.FURNITURE,
                resource_type=ResourceType.PHYSICAL_ITEM,
                quantity=2.0,
                allocated_quantity=0.0,
                unit="chairs",
                condition=Condition.LIKE_NEW,
                location="Downtown District",
                availability_status=AvailabilityStatus.AVAILABLE,
                instructions="Requires car or SUV for pickup. Ground floor garage access.",
                contact_info="david.chen@designlab.io",
                estimated_weight_kg=14.0,
            ),
            Resource(
                id=6,
                provider_id=6,
                title="Surplus Art & Drafting Supplies (Sketchbooks & Fineliners)",
                description="Bundle of 5 heavy-weight spiral sketchbooks, dual-tip artist markers, and precision ruler set left over from studio project.",
                category=Category.STATIONERY,
                resource_type=ResourceType.PHYSICAL_ITEM,
                quantity=5.0,
                allocated_quantity=0.0,
                unit="sets",
                condition=Condition.BRAND_NEW,
                location="Downtown District",
                availability_status=AvailabilityStatus.AVAILABLE,
                instructions="Boxed and ready for pickup.",
                contact_info="david.chen@designlab.io",
                estimated_weight_kg=3.0,
            ),
            # Elena (User 1) - Pre-completed resource
            Resource(
                id=7,
                provider_id=1,
                title="Dell UltraSharp 24-inch 1080p Monitor with HDMI Cable",
                description="IPS panel monitor in crisp working condition, height-adjustable stand, ideal as secondary screen.",
                category=Category.ELECTRONICS,
                resource_type=ResourceType.PHYSICAL_ITEM,
                quantity=1.0,
                allocated_quantity=1.0,
                unit="monitor",
                condition=Condition.LIKE_NEW,
                location="University Campus",
                availability_status=AvailabilityStatus.COMPLETED,
                instructions="Completed handoff.",
                contact_info="elena.r@university.edu",
                estimated_weight_kg=4.2,
            ),
            # GreenRoots Urban Farm (User 5)
            Resource(
                id=8,
                provider_id=5,
                title="Community Garden Organic Gardening & Composting Workshop",
                description="Hands-on 3-hour weekend workshop on soil composting, urban vegetable growing, and rainwater harvesting for local youth groups.",
                category=Category.VOLUNTEER,
                resource_type=ResourceType.VOLUNTEER_TIME,
                quantity=6.0,
                allocated_quantity=0.0,
                unit="hours",
                condition=Condition.NOT_APPLICABLE,
                location="Westside EcoPark",
                availability_status=AvailabilityStatus.AVAILABLE,
                instructions="Tools and gloves provided on-site.",
                contact_info="contact@greenroots.org",
                estimated_weight_kg=0.0,
            ),
        ]

        for r in resources_data:
            db.add(r)
        db.commit()

        # -------------------------------------------------------------
        # 3. SAMPLE NEEDS
        # -------------------------------------------------------------
        needs_data = [
            # Priya (User 4)
            Need(
                id=1,
                requester_id=4,
                title="Computer Science Algorithms & Data Structures Textbooks",
                description="Looking for standard CS textbooks (specifically CLRS or general Data Structures) for upcoming midterm exams. High financial need.",
                category=Category.TEXTBOOKS,
                resource_type=ResourceType.PHYSICAL_ITEM,
                quantity_requested=1.0,
                quantity_fulfilled=0.0,
                unit="book",
                location="University Campus",
                urgency=Urgency.HIGH,
                required_by="2026-10-25",
                status=NeedStatus.OPEN,
                preferences="Prefer physical copy; any recent edition is welcome.",
            ),
            Need(
                id=2,
                requester_id=4,
                title="Reliable Laptop for Software Engineering Studies",
                description="Need a functional laptop capable of running VS Code, Docker, and Python for semester coursework. Current machine has failed motherboard.",
                category=Category.ELECTRONICS,
                resource_type=ResourceType.PHYSICAL_ITEM,
                quantity_requested=1.0,
                quantity_fulfilled=0.0,
                unit="laptop",
                location="Downtown District",
                urgency=Urgency.CRITICAL,
                required_by="2026-10-20",
                status=NeedStatus.IN_PROGRESS,  # In progress matching ThinkPad
                preferences="At least 8GB RAM preferred. Operating system doesn't matter.",
            ),
            Need(
                id=3,
                requester_id=4,
                title="Guidance & Mentoring in Python Backend Development",
                description="Seeking a mentor for code reviews and learning FastAPI architecture for college final capstone project.",
                category=Category.SKILLS,
                resource_type=ResourceType.SKILL,
                quantity_requested=4.0,
                quantity_fulfilled=0.0,
                unit="hours",
                location="Online / University",
                urgency=Urgency.MEDIUM,
                required_by="2026-11-15",
                status=NeedStatus.OPEN,
                preferences="Remote sessions via Zoom / Meet are great.",
            ),
            # Hope Youth Center (User 3)
            Need(
                id=4,
                requester_id=3,
                title="Art Supplies and Sketchbooks for After-School Youth Club",
                description="We need drawing materials, markers, sketchbooks, and stationery for 20 children in our community arts workshop.",
                category=Category.STATIONERY,
                resource_type=ResourceType.PHYSICAL_ITEM,
                quantity_requested=5.0,
                quantity_fulfilled=0.0,
                unit="sets",
                location="Downtown District",
                urgency=Urgency.HIGH,
                required_by="2026-10-30",
                status=NeedStatus.OPEN,
                preferences="Non-toxic materials preferred.",
            ),
            Need(
                id=5,
                requester_id=3,
                title="Desk Chairs for Computer Learning Lab",
                description="Seeking sturdy office or desk chairs for our digital education lab where students do homework.",
                category=Category.FURNITURE,
                resource_type=ResourceType.PHYSICAL_ITEM,
                quantity_requested=2.0,
                quantity_fulfilled=0.0,
                unit="chairs",
                location="Downtown District",
                urgency=Urgency.MEDIUM,
                required_by="2026-11-01",
                status=NeedStatus.OPEN,
                preferences="Ergonomic or adjustable preferred.",
            ),
            # Completed need for Hope Youth Center
            Need(
                id=6,
                requester_id=3,
                title="Secondary Monitor for Student Digital Lab",
                description="Looking for an HDMI computer screen so students can follow coding tutorials side-by-side.",
                category=Category.ELECTRONICS,
                resource_type=ResourceType.PHYSICAL_ITEM,
                quantity_requested=1.0,
                quantity_fulfilled=1.0,
                unit="monitor",
                location="University Campus",
                urgency=Urgency.MEDIUM,
                required_by="2026-10-05",
                status=NeedStatus.FULFILLED,
                preferences="Standard HDMI input.",
            ),
            # Unmatchable need for demonstration (demonstrates filtering and negative test case)
            Need(
                id=7,
                requester_id=5,
                title="Heavy Commercial Tractor or Backhoe Loader",
                description="Need a commercial 50hp diesel tractor for land grading. Requires specialized heavy equipment operator.",
                category=Category.OTHER,
                resource_type=ResourceType.PHYSICAL_ITEM,
                quantity_requested=1.0,
                quantity_fulfilled=0.0,
                unit="tractor",
                location="Far North County (100km away)",
                urgency=Urgency.LOW,
                required_by="2026-12-31",
                status=NeedStatus.OPEN,
                preferences="Heavy machinery license holders only.",
            ),
        ]

        for n in needs_data:
            db.add(n)
        db.commit()

        # -------------------------------------------------------------
        # 4. SAMPLE MATCHES (Different pipeline stages for realistic UI)
        # -------------------------------------------------------------
        # Pre-seed one completed match (Resource 7 with Need 6: Dell Monitor)
        eval_completed = evaluate_match_candidate(
            db.query(Resource).filter(Resource.id == 7).first(),
            db.query(Need).filter(Need.id == 6).first()
        )
        if not eval_completed:
            # Construct explanation manually if completed state filtered it
            eval_completed = {
                "score": 94.5,
                "proposed_quantity": 1.0,
                "match_explanation": json.dumps({
                    "text_similarity_score": 88.0,
                    "category_score": 100.0,
                    "quantity_score": 100.0,
                    "location_score": 100.0,
                    "urgency_score": 65.0,
                    "weights": {"text_similarity": 0.35, "category": 0.25, "quantity": 0.15, "location": 0.15, "urgency": 0.10},
                    "reasons": [
                        "Strong semantic alignment (88% similarity) between resource offering and requested need.",
                        "Exact category match: both are 'Electronics' (physical item).",
                        "Full quantity coverage: available 1 monitor completely covers requested 1 monitor.",
                        "Same neighborhood or community area: 'University Campus'."
                    ]
                })
            }

        completed_match = Match(
            id=1,
            resource_id=7,
            need_id=6,
            score=eval_completed["score"],
            status=MatchStatus.COMPLETED,
            match_explanation=eval_completed["match_explanation"],
            proposed_quantity=1.0,
            notes="Handoff successfully completed on campus. Screen tested and in active daily use.",
        )
        db.add(completed_match)

        # Pre-seed one ACCEPTED match (Resource 3 with Need 2: ThinkPad T480 Laptop)
        eval_accepted = {
            "score": 92.4,
            "proposed_quantity": 1.0,
            "match_explanation": json.dumps({
                "text_similarity_score": 84.0,
                "category_score": 100.0,
                "quantity_score": 100.0,
                "location_score": 100.0,
                "urgency_score": 85.0,
                "weights": {"text_similarity": 0.35, "category": 0.25, "quantity": 0.15, "location": 0.15, "urgency": 0.10},
                "reasons": [
                    "Strong semantic alignment (84% similarity): Lenovo ThinkPad directly fulfills student software laptop request.",
                    "Exact category match: both are 'Electronics' (physical item).",
                    "Full quantity coverage: 1 laptop fulfills 1 requested laptop.",
                    "Same neighborhood or community area: 'Downtown District'.",
                    "Priority boost: Need is marked 'CRITICAL' urgency and resource is prepped."
                ]
            })
        }
        accepted_match = Match(
            id=2,
            resource_id=3,
            need_id=2,
            score=eval_accepted["score"],
            status=MatchStatus.ACCEPTED,
            match_explanation=eval_accepted["match_explanation"],
            proposed_quantity=1.0,
            notes="Marcus agreed to meet Priya at Downtown Public Library for laptop transfer.",
        )
        db.add(accepted_match)

        # Pre-seed top high-confidence SUGGESTED matches
        # Pair A: Resource 1 (CLRS Algorithms Book) + Need 1 (CS Algorithms Textbooks)
        res1 = db.query(Resource).filter(Resource.id == 1).first()
        need1 = db.query(Need).filter(Need.id == 1).first()
        eval1 = evaluate_match_candidate(res1, need1)
        if eval1:
            match_clrs = Match(
                id=3,
                resource_id=1,
                need_id=1,
                score=eval1["score"],
                status=MatchStatus.SUGGESTED,
                match_explanation=eval1["match_explanation"],
                proposed_quantity=eval1["proposed_quantity"],
                notes="Top recommendation: exact textbook match on University Campus.",
            )
            db.add(match_clrs)

        # Pair B: Resource 6 (Sketchbooks) + Need 4 (Youth Club Art Supplies)
        res6 = db.query(Resource).filter(Resource.id == 6).first()
        need4 = db.query(Need).filter(Need.id == 4).first()
        eval6 = evaluate_match_candidate(res6, need4)
        if eval6:
            match_art = Match(
                id=4,
                resource_id=6,
                need_id=4,
                score=eval6["score"],
                status=MatchStatus.INTEREST_EXPRESSED,
                match_explanation=eval6["match_explanation"],
                proposed_quantity=eval6["proposed_quantity"],
                notes="Youth Center expressed interest in pickup.",
            )
            db.add(match_art)

        # Pair C: Resource 5 (Office Chairs) + Need 5 (Desk Chairs)
        res5 = db.query(Resource).filter(Resource.id == 5).first()
        need5 = db.query(Need).filter(Need.id == 5).first()
        eval5 = evaluate_match_candidate(res5, need5)
        if eval5:
            match_chairs = Match(
                id=5,
                resource_id=5,
                need_id=5,
                score=eval5["score"],
                status=MatchStatus.SUGGESTED,
                match_explanation=eval5["match_explanation"],
                proposed_quantity=eval5["proposed_quantity"],
            )
            db.add(match_chairs)

        # Pair D: Resource 4 (Python Tutoring) + Need 3 (FastAPI & Python Mentoring)
        res4 = db.query(Resource).filter(Resource.id == 4).first()
        need3 = db.query(Need).filter(Need.id == 3).first()
        eval4 = evaluate_match_candidate(res4, need3)
        if eval4:
            match_tutoring = Match(
                id=6,
                resource_id=4,
                need_id=3,
                score=eval4["score"],
                status=MatchStatus.SUGGESTED,
                match_explanation=eval4["match_explanation"],
                proposed_quantity=eval4["proposed_quantity"],
            )
            db.add(match_tutoring)

        db.commit()

    finally:
        if close_db:
            db.close()
