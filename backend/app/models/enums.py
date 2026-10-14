import enum

class Category(str, enum.Enum):
    TEXTBOOKS = "textbooks"
    ELECTRONICS = "electronics"
    FURNITURE = "furniture"
    STATIONERY = "stationery"
    SKILLS = "skills"
    VOLUNTEER = "volunteer"
    OTHER = "other"

class ResourceType(str, enum.Enum):
    PHYSICAL_ITEM = "physical_item"
    SKILL = "skill"
    SERVICE = "service"
    VOLUNTEER_TIME = "volunteer_time"

class Condition(str, enum.Enum):
    BRAND_NEW = "brand_new"
    LIKE_NEW = "like_new"
    GOOD = "good"
    FAIR = "fair"
    NOT_APPLICABLE = "not_applicable"

class Urgency(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AvailabilityStatus(str, enum.Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    COMPLETED = "completed"
    INACTIVE = "inactive"

class NeedStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"

class MatchStatus(str, enum.Enum):
    SUGGESTED = "suggested"
    INTEREST_EXPRESSED = "interest_expressed"
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
