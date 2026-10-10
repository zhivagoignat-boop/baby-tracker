from datetime import datetime, date
from pydantic import BaseModel, Field
from typing import Optional, List


# ---------- Auth ----------
class TelegramUser(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    language_code: Optional[str] = None


# ---------- Child ----------
class ChildCreate(BaseModel):
    name: str
    birth_date: date
    gender: Optional[str] = None
    notes: Optional[str] = None


class ChildUpdate(BaseModel):
    name: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    notes: Optional[str] = None


class ChildOut(BaseModel):
    id: int
    name: str
    birth_date: date
    gender: Optional[str]
    notes: Optional[str]
    age_months: Optional[int] = None

    class Config:
        from_attributes = True


# ---------- Measurement ----------
class MeasurementCreate(BaseModel):
    date: Optional[date] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    head_cm: Optional[float] = None
    note: Optional[str] = None


class MeasurementOut(BaseModel):
    id: int
    date: date
    weight_kg: Optional[float]
    height_cm: Optional[float]
    head_cm: Optional[float]
    note: Optional[str]

    class Config:
        from_attributes = True


# ---------- Sleep ----------
class SleepStart(BaseModel):
    note: Optional[str] = None


class SleepEnd(BaseModel):
    note: Optional[str] = None


class SleepOut(BaseModel):
    id: int
    start_time: datetime
    end_time: Optional[datetime]
    duration_minutes: Optional[int]
    note: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


# ---------- Feeding ----------
class FeedingCreate(BaseModel):
    type: str  # breast, bottle, formula, solid
    amount_ml: Optional[int] = None
    duration_minutes: Optional[int] = None
    side: Optional[str] = None
    note: Optional[str] = None
    time: Optional[datetime] = None


class FeedingOut(BaseModel):
    id: int
    time: datetime
    type: str
    amount_ml: Optional[int]
    duration_minutes: Optional[int]
    side: Optional[str]
    note: Optional[str]

    class Config:
        from_attributes = True


# ---------- Diaper ----------
class DiaperCreate(BaseModel):
    type: str  # wet, dirty, both
    note: Optional[str] = None
    time: Optional[datetime] = None


class DiaperOut(BaseModel):
    id: int
    time: datetime
    type: str
    note: Optional[str]

    class Config:
        from_attributes = True


# ---------- Vaccine ----------
class VaccineCreate(BaseModel):
    name: str
    date: date
    next_date: Optional[date] = None
    note: Optional[str] = None
    done: bool = True


class VaccineOut(BaseModel):
    id: int
    name: str
    date: date
    next_date: Optional[date]
    note: Optional[str]
    done: bool

    class Config:
        from_attributes = True


# ---------- Doctor ----------
class DoctorVisitCreate(BaseModel):
    date: date
    doctor_type: str
    reason: Optional[str] = None
    diagnosis: Optional[str] = None
    recommendations: Optional[str] = None
    next_visit: Optional[date] = None


class DoctorVisitOut(BaseModel):
    id: int
    date: date
    doctor_type: str
    reason: Optional[str]
    diagnosis: Optional[str]
    recommendations: Optional[str]
    next_visit: Optional[date]

    class Config:
        from_attributes = True


# ---------- Milestone ----------
class MilestoneUpdate(BaseModel):
    achieved: bool
    achieved_date: Optional[date] = None
    note: Optional[str] = None


class MilestoneOut(BaseModel):
    id: int
    month: int
    skill: str
    achieved: bool
    achieved_date: Optional[date]
    note: Optional[str]

    class Config:
        from_attributes = True


# ---------- Rhyme ----------
class RhymeCreate(BaseModel):
    category: str
    title: str
    text: str


class RhymeOut(BaseModel):
    id: int
    category: str
    title: str
    text: str
    is_custom: bool

    class Config:
        from_attributes = True


# ---------- Illness ----------
class IllnessCreate(BaseModel):
    name: str
    start_date: date
    end_date: Optional[date] = None
    symptoms: Optional[str] = None
    treatment: Optional[str] = None
    note: Optional[str] = None


class IllnessOut(BaseModel):
    id: int
    name: str
    start_date: date
    end_date: Optional[date]
    symptoms: Optional[str]
    treatment: Optional[str]
    note: Optional[str]

    class Config:
        from_attributes = True


# ---------- Tooth ----------
class ToothCreate(BaseModel):
    tooth_name: str
    date: date
    note: Optional[str] = None


class ToothOut(BaseModel):
    id: int
    tooth_name: str
    date: date
    note: Optional[str]

    class Config:
        from_attributes = True


# ---------- Toy ----------
class ToyCreate(BaseModel):
    name: str
    age_from_months: int = 0
    age_to_months: Optional[int] = None
    note: Optional[str] = None
    favorite: bool = False


class ToyOut(BaseModel):
    id: int
    name: str
    age_from_months: int
    age_to_months: Optional[int]
    note: Optional[str]
    favorite: bool

    class Config:
        from_attributes = True


# ---------- Walk ----------
class WalkCreate(BaseModel):
    start_time: Optional[datetime] = None
    place: Optional[str] = None
    note: Optional[str] = None


class WalkEnd(BaseModel):
    note: Optional[str] = None


class WalkOut(BaseModel):
    id: int
    start_time: datetime
    end_time: Optional[datetime]
    duration_minutes: Optional[int]
    place: Optional[str]
    note: Optional[str]

    class Config:
        from_attributes = True


# ---------- Bath ----------
class BathCreate(BaseModel):
    duration_minutes: Optional[int] = None
    temperature: Optional[float] = None
    note: Optional[str] = None
    time: Optional[datetime] = None


class BathOut(BaseModel):
    id: int
    time: datetime
    duration_minutes: Optional[int]
    temperature: Optional[float]
    note: Optional[str]

    class Config:
        from_attributes = True


# ---------- Complementary Food ----------
class ComplementaryFoodCreate(BaseModel):
    date: Optional[date] = None
    product: str
    amount: Optional[str] = None
    reaction: Optional[str] = None
    note: Optional[str] = None


class ComplementaryFoodOut(BaseModel):
    id: int
    date: date
    product: str
    amount: Optional[str]
    reaction: Optional[str]
    note: Optional[str]

    class Config:
        from_attributes = True


# ---------- Stats ----------
class DayStats(BaseModel):
    date: date
    sleep_total_minutes: int
    sleep_count: int
    feeding_count: int
    feeding_total_ml: Optional[int]
    diaper_count: int
    walk_total_minutes: int
    bath_count: int
    recommendations: List[str]
