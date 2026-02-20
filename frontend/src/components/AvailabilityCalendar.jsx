import React, { useState } from 'react';
import './AvailabilityCalendar.css';

const AvailabilityCalendar = ({ bookings = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const isDateBooked = (day) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        checkDate.setHours(0, 0, 0, 0);

        return bookings.some(booking => {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            return checkDate >= start && checkDate <= end && (booking.status === 'APPROVED' || booking.status === 'ACTIVE' || booking.status === 'CONFIRMED');
        });
    };

    const isPast = (day) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return checkDate < today;
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const booked = isDateBooked(i);
            const past = isPast(i);

            let className = 'calendar-day';
            if (past) {
                className += ' past';
            } else if (booked) {
                className += ' booked';
            } else {
                className += ' available';
            }

            days.push(
                <div key={i} className={className} title={booked ? 'Booked' : 'Available'}>
                    {i}
                </div>
            );
        }

        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="availability-calendar">
            <div className="calendar-header">
                <button onClick={prevMonth}>&lt;</button>
                <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button onClick={nextMonth}>&gt;</button>
            </div>
            <div className="calendar-grid">
                <div className="calendar-day-header">Sun</div>
                <div className="calendar-day-header">Mon</div>
                <div className="calendar-day-header">Tue</div>
                <div className="calendar-day-header">Wed</div>
                <div className="calendar-day-header">Thu</div>
                <div className="calendar-day-header">Fri</div>
                <div className="calendar-day-header">Sat</div>
                {renderCalendarDays()}
            </div>
            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#f0fdf4', border: '1px solid #ddd' }}></div>
                    <span>Available</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#fef2f2', border: '1px solid #ddd' }}></div>
                    <span>Booked</span>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityCalendar;
