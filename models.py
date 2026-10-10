from datetime import datetime, date
from sqlalchemy import String, Integer, Float, Boolean, Text, DateTime, Date, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)  # telegram_id
    first_name: Mapped[str] = mapped_column(String(100), default="")
    username: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    children: Mapped[list["Child"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Child(Base):
    __tablename__ = "children"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(100))
    birth_date: Mapped[date] = mapped_column(Date)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)  # boy/girl
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="children")
    measurements: Mapped[list["Measurement"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    sleeps: Mapped[list["Sleep"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    feedings: Mapped[list["Feeding"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    diapers: Mapped[list["Diaper"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    vaccines: Mapped[list["Vaccine"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    doctor_visits: Mapped[list["DoctorVisit"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    milestones: Mapped[list["Milestone"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    rhymes: Mapped[list["Rhyme"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    illnesses: Mapped[list["Illness"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    teeth: Mapped[list["Tooth"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    toys: Mapped[list["Toy"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    walks: Mapped[list["Walk"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    baths: Mapped[list["Bath"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    complementary_foods: Mapped[list["ComplementaryFood"]] = relationship(back_populates="child", cascade="all, delete-orphan")
    photos: Mapped[list["Photo"]] = relationship(back_populates="child", cascade="all, delete-orphan")


class Measurement(Base):
    __tablename__ = "measurements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    date: Mapped[date] = mapped_column(Date, default=date.today)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    head_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)

    child: Mapped["Child"] = relationship(back_populates="measurements")


class Sleep(Base):
    __tablename__ = "sleeps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    start_time: Mapped[datetime] = mapped_column(DateTime)
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)  # таймер идёт

    child: Mapped["Child"] = relationship(back_populates="sleeps")


class Feeding(Base):
    __tablename__ = "feedings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    type: Mapped[str] = mapped_column(String(50))  # breast, bottle, formula, solid
    amount_ml: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    side: Mapped[str | None] = mapped_column(String(10), nullable=True)  # left/right
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)

    child: Mapped["Child"] = relationship(back_populates="feedings")


class Diaper(Base):
    __tablename__ = "diapers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    type: Mapped[str] = mapped_column(String(20))  # wet, dirty, both
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)

    child: Mapped["Child"] = relationship(back_populates="diapers")


class Vaccine(Base):
    __tablename__ = "vaccines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    name: Mapped[str] = mapped_column(String(150))
    date: Mapped[date] = mapped_column(Date)
    next_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    done: Mapped[bool] = mapped_column(Boolean, default=True)

    child: Mapped["Child"] = relationship(back_populates="vaccines")


class DoctorVisit(Base):
    __tablename__ = "doctor_visits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    date: Mapped[date] = mapped_column(Date)
    doctor_type: Mapped[str] = mapped_column(String(100))  # педиатр, невролог...
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    recommendations: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_visit: Mapped[date | None] = mapped_column(Date, nullable=True)

    child: Mapped["Child"] = relationship(back_populates="doctor_visits")


class Milestone(Base):
    __tablename__ = "milestones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    month: Mapped[int] = mapped_column(Integer)  # 0-36
    skill: Mapped[str] = mapped_column(String(255))
    achieved: Mapped[bool] = mapped_column(Boolean, default=False)
    achieved_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)

    child: Mapped["Child"] = relationship(back_populates="milestones")


class Rhyme(Base):
    __tablename__ = "rhymes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"), nullable=True)  # null = общее
    category: Mapped[str] = mapped_column(String(50))  # sleep, bath, feed, walk, general
    title: Mapped[str] = mapped_column(String(150))
    text: Mapped[str] = mapped_column(Text)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False)

    child: Mapped["Child"] = relationship(back_populates="rhymes")


class Illness(Base):
    __tablename__ = "illnesses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    name: Mapped[str] = mapped_column(String(150))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    symptoms: Mapped[str | None] = mapped_column(Text, nullable=True)
    treatment: Mapped[str | None] = mapped_column(Text, nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    child: Mapped["Child"] = relationship(back_populates="illnesses")


class Tooth(Base):
    __tablename__ = "teeth"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    tooth_name: Mapped[str] = mapped_column(String(100))  # нижний центральный резец и т.д.
    date: Mapped[date] = mapped_column(Date)
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)

    child: Mapped["Child"] = relationship(back_populates="teeth")


class Toy(Base):
    __tablename__ = "toys"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    name: Mapped[str] = mapped_column(String(150))
    age_from_months: Mapped[int] = mapped_column(Integer, default=0)
    age_to_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)
    favorite: Mapped[bool] = mapped_column(Boolean, default=False)

    child: Mapped["Child"] = relationship(back_populates="toys")


class Walk(Base):
    __tablename__ = "walks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    start_time: Mapped[datetime] = mapped_column(DateTime)
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    place: Mapped[str | None] = mapped_column(String(150), nullable=True)
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)

    child: Mapped["Child"] = relationship(back_populates="walks")


class Bath(Base):
    __tablename__ = "baths"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)

    child: Mapped["Child"] = relationship(back_populates="baths")


class ComplementaryFood(Base):
    __tablename__ = "complementary_foods"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    date: Mapped[date] = mapped_column(Date, default=date.today)
    product: Mapped[str] = mapped_column(String(150))
    amount: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reaction: Mapped[str | None] = mapped_column(String(255), nullable=True)
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)

    child: Mapped["Child"] = relationship(back_populates="complementary_foods")


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"))
    month: Mapped[int] = mapped_column(Integer)  # возраст в месяцах
    filename: Mapped[str] = mapped_column(String(255))
    caption: Mapped[str | None] = mapped_column(String(255), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    child: Mapped["Child"] = relationship(back_populates="photos")
