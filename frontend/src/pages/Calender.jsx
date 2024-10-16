import React, { useState } from 'react';

const Calendar = () => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDate = new Date();
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedDay, setSelectedDay] = useState(null); // State for selected day

    // Get the first day of the month and total days in the month
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const today = currentDate.getDate();

    // Create an array to fill the calendar
    const calendarDays = Array.from({ length: firstDay }, (_, i) => (
        <div key={`empty-${i}`} className="w-10 h-10"></div>
    ));

    for (let day = 1; day <= totalDays; day++) {
        const isToday = day === today && selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear();
        const isSelected = selectedDay === day && selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear();

        calendarDays.push(
            <div
                key={day}
                onClick={() => setSelectedDay(day)} // Update selected day on click
                className={`w-10 h-10 flex items-center justify-center border border-gray-300 cursor-pointer 
                    ${isToday ? 'bg-blue-200 font-bold' : ''} 
                    ${isSelected ? 'bg-green-200 font-bold' : ''}`} 
            >
                {day}
            </div>
        );
    }

    // Month and Year options
    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    const handleMonthChange = (event) => {
        setSelectedMonth(parseInt(event.target.value, 10));
    };

    const handleYearChange = (event) => {
        setSelectedYear(parseInt(event.target.value, 10));
    };

    return (
        <div className='bg-white rounded-lg shadow-lg'>
            <div>
                <div className='py-6 px-4'>
                    <h2 className='text-2xl font-bold text-center'>{`${monthNames[selectedMonth]} ${selectedYear}`}</h2>
                </div>
                <hr className='border-gray-300' />

                <div className='flex justify-between mb-4 mt-2 px-4'>
                    <select value={selectedMonth} onChange={handleMonthChange} className='border rounded p-1'>
                        {monthNames.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                        ))}
                    </select>
                    <select value={selectedYear} onChange={handleYearChange} className='border rounded p-1'>
                        {/* Adjust the range of years as needed */}
                        {Array.from({ length: 10 }, (_, i) => (
                            <option key={i} value={currentDate.getFullYear() + i - 5}>
                                {currentDate.getFullYear() + i - 5}
                            </option>
                        ))}
                    </select>
                </div>
                <hr className='border-gray-300' />
            </div>
            <div className='grid grid-cols-7 mb-4 mt-4 px-4'>
                {daysOfWeek.map((day) => (
                    <div key={day} className='text-center font-semibold text-gray-600'>{day}</div>
                ))}
                {calendarDays}
            </div>
            
        </div>
    );
};

export default Calendar;
