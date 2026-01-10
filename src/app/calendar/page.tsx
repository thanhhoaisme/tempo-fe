'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CalendarEvent } from '@/types';

export default function CalendarPage() {
    const { calendarEvents, addCalendarEvent, deleteCalendarEvent } = useApp();
    const [currentDate, setCurrentDate] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number } | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [eventForm, setEventForm] = useState({ title: '', startTime: '', endTime: '', color: '#3d7a7a' });
    const [draggingEvent, setDraggingEvent] = useState<{ event: CalendarEvent; startX: number; startY: number; originalStart: number } | null>(null);
    const [resizingEvent, setResizingEvent] = useState<{ event: CalendarEvent; startY: number; originalEnd: number } | null>(null);

    // Initialize date after mount to prevent hydration mismatch
    useEffect(() => {
        setCurrentDate(new Date());
        setMounted(true);
    }, []);

    // Get start of week (Sunday)
    const getWeekStart = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const weekStart = useMemo(() => currentDate ? getWeekStart(currentDate) : null, [currentDate]);

    // Generate week days
    const weekDays = useMemo(() => {
        if (!weekStart) return [];
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            days.push(day);
        }
        return days;
    }, [weekStart]);

    // Time slots (24 hours)
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let hour = 0; hour <= 23; hour++) {
            slots.push(hour);
        }
        return slots;
    }, []);

    // Get events for a specific day
    const getEventsForDay = (day: Date): CalendarEvent[] => {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        return calendarEvents.filter((event) => {
            const eventStart = new Date(event.startTime);
            return eventStart >= dayStart && eventStart <= dayEnd;
        });
    };

    // Calculate event position and height
    const getEventStyle = (event: CalendarEvent) => {
        const startDate = new Date(event.startTime);
        const endDate = new Date(event.endTime);

        const startHour = startDate.getHours() + startDate.getMinutes() / 60;
        const endHour = endDate.getHours() + endDate.getMinutes() / 60;

        const top = startHour * 48; // 48px per hour, starting from 0
        const height = Math.max((endHour - startHour) * 48, 24); // minimum 24px

        return { top: `${top}px`, height: `${height}px` };
    };

    // Format time for display
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Navigation
    const goToPrevWeek = () => {
        if (!currentDate) return;
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToNextWeek = () => {
        if (!currentDate) return;
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Check if a day is today
    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Day name abbreviations
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Handle time slot click to create event
    const handleSlotClick = (day: Date, hour: number) => {
        setSelectedSlot({ date: day, hour });
        const startTime = new Date(day);
        startTime.setHours(hour, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(hour + 1, 0, 0, 0);

        // Format as local datetime string (YYYY-MM-DDTHH:mm) for datetime-local input
        const formatLocalDateTime = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setEventForm({
            title: '',
            startTime: formatLocalDateTime(startTime),
            endTime: formatLocalDateTime(endTime),
            color: '#3d7a7a'
        });
        setShowCreateModal(true);
    };

    // Handle event click to edit
    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);

        // Format as local datetime string (YYYY-MM-DDTHH:mm) for datetime-local input
        const formatLocalDateTime = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setEventForm({
            title: event.title,
            startTime: formatLocalDateTime(startTime),
            endTime: formatLocalDateTime(endTime),
            color: event.color || '#3d7a7a'
        });
        setShowEditModal(true);
    };

    // Create new event
    const handleCreateEvent = () => {
        if (!eventForm.title.trim()) return;
        addCalendarEvent({
            id: `event-${Date.now()}`,
            title: eventForm.title,
            startTime: new Date(eventForm.startTime).getTime(),
            endTime: new Date(eventForm.endTime).getTime(),
            color: eventForm.color,
        });
        setShowCreateModal(false);
        setEventForm({ title: '', startTime: '', endTime: '', color: '#3d7a7a' });
    };

    // Update existing event
    const handleUpdateEvent = () => {
        if (!selectedEvent || !eventForm.title.trim()) return;
        // Remove old event and add updated one
        deleteCalendarEvent(selectedEvent.id);
        addCalendarEvent({
            ...selectedEvent,
            title: eventForm.title,
            startTime: new Date(eventForm.startTime).getTime(),
            endTime: new Date(eventForm.endTime).getTime(),
            color: eventForm.color,
        });
        setShowEditModal(false);
        setSelectedEvent(null);
        setEventForm({ title: '', startTime: '', endTime: '', color: '#3d7a7a' });
    };

    // Handle right-click context menu
    const handleContextMenu = (e: React.MouseEvent, day: Date, hour: number) => {
        e.preventDefault();
        handleSlotClick(day, hour);
    };

    // Drag start - for moving the entire event
    const handleDragStart = (e: React.MouseEvent, event: CalendarEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setDraggingEvent({
            event,
            startX: e.clientX,
            startY: e.clientY,
            originalStart: event.startTime
        });
    };

    // Resize start - for changing event duration
    const handleResizeStart = (e: React.MouseEvent, event: CalendarEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setResizingEvent({
            event,
            startY: e.clientY,
            originalEnd: event.endTime
        });
    };

    // Handle mouse move for drag/resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (draggingEvent) {
                // Vertical movement (time)
                const deltaY = e.clientY - draggingEvent.startY;
                const deltaMinutes = Math.round(deltaY / 48 * 60); // 48px = 1 hour
                const deltaTimeMs = deltaMinutes * 60 * 1000;

                // Horizontal movement (days)
                const deltaX = e.clientX - draggingEvent.startX;
                // Column width: (container width - 60px time column) / 7 days
                // Using approximate value, works well for most screen sizes
                const columnWidth = 120;
                const deltaDays = Math.round(deltaX / columnWidth);
                const deltaDaysMs = deltaDays * 24 * 60 * 60 * 1000;

                const duration = draggingEvent.event.endTime - draggingEvent.event.startTime;
                const newStart = draggingEvent.originalStart + deltaTimeMs + deltaDaysMs;

                // Update the event in place
                deleteCalendarEvent(draggingEvent.event.id);
                addCalendarEvent({
                    ...draggingEvent.event,
                    startTime: newStart,
                    endTime: newStart + duration
                });

                // Update dragging state with new event reference
                setDraggingEvent(prev => prev ? {
                    ...prev,
                    event: { ...prev.event, startTime: newStart, endTime: newStart + duration }
                } : null);
            }

            if (resizingEvent) {
                const deltaY = e.clientY - resizingEvent.startY;
                const deltaMinutes = Math.round(deltaY / 48 * 60);
                const deltaMs = deltaMinutes * 60 * 1000;
                const newEnd = resizingEvent.originalEnd + deltaMs;

                // Minimum 15 minutes duration
                if (newEnd > resizingEvent.event.startTime + 15 * 60 * 1000) {
                    deleteCalendarEvent(resizingEvent.event.id);
                    addCalendarEvent({
                        ...resizingEvent.event,
                        endTime: newEnd
                    });

                    setResizingEvent(prev => prev ? {
                        ...prev,
                        event: { ...prev.event, endTime: newEnd }
                    } : null);
                }
            }
        };

        const handleMouseUp = () => {
            setDraggingEvent(null);
            setResizingEvent(null);
        };

        if (draggingEvent || resizingEvent) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = draggingEvent ? 'move' : 'ns-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [draggingEvent, resizingEvent, deleteCalendarEvent, addCalendarEvent]);

    // Loading state - prevent hydration mismatch
    if (!mounted || !currentDate) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-gray-400">Loading calendar...</div>
            </div>
        );
    }

    // Format month/year header
    const monthYear = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-purple-600 dark:text-cyan-400 flex items-center gap-2">
                        <CalendarIcon size={24} />
                        {monthYear}
                    </h1>
                    <div className="text-xs text-gray-500 dark:text-gray-400">GMT+7</div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={goToPrevWeek}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                        onClick={goToNextWeek}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 bg-white dark:bg-[#1a1f2e] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Scrollable container for both headers and time grid */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {/* Day Headers - sticky */}
                    <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-[#1a1f2e] z-10">
                        <div className="p-2 text-xs text-gray-500 border-r border-gray-200 dark:border-gray-700"></div>
                        {weekDays.map((day, index) => (
                            <div
                                key={index}
                                className={`p-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${isToday(day) ? 'bg-purple-100 dark:bg-teal-900/30' : ''
                                    }`}
                            >
                                <div className="text-xs text-gray-500 dark:text-gray-400">{dayNames[index]}</div>
                                <div className={`text-lg font-semibold ${isToday(day) ? 'text-purple-600 dark:text-teal-400' : 'text-gray-800 dark:text-gray-200'
                                    }`}>
                                    {day.getDate()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time Grid */}
                    <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                        {/* Time labels */}
                        <div className="border-r border-gray-200 dark:border-gray-700">
                            {timeSlots.map((hour) => (
                                <div
                                    key={hour}
                                    className="h-12 flex items-start justify-end pr-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-700/50"
                                >
                                    {hour === 0 ? '12AM' : hour === 12 ? '12PM' : hour > 12 ? `${hour - 12}PM` : `${hour}AM`}
                                </div>
                            ))}
                        </div>

                        {/* Day columns with events */}
                        {weekDays.map((day, dayIndex) => {
                            const dayEvents = getEventsForDay(day).filter(e => {
                                const duration = (e.endTime - e.startTime) / (1000 * 60 * 60);
                                return duration < 12; // Regular events (not all-day)
                            });

                            return (
                                <div
                                    key={dayIndex}
                                    className={`relative border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${isToday(day) ? 'bg-purple-50 dark:bg-teal-900/10' : ''
                                        }`}
                                >
                                    {/* Hour grid lines */}
                                    {timeSlots.map((hour) => (
                                        <div
                                            key={hour}
                                            className="h-12 border-b border-gray-100 dark:border-gray-700/50 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            onClick={() => handleSlotClick(day, hour)}
                                            onContextMenu={(e) => handleContextMenu(e, day, hour)}
                                            title="Click or right-click to create event"
                                        />
                                    ))}

                                    {/* Events */}
                                    {dayEvents.map((event) => {
                                        const style = getEventStyle(event);
                                        const eventColor = event.color || '#3d7a7a';
                                        const isDragging = draggingEvent?.event.id === event.id;
                                        const isResizing = resizingEvent?.event.id === event.id;
                                        return (
                                            <div
                                                key={event.id}
                                                className={`absolute left-1 right-1 rounded-md px-2 py-1 overflow-visible cursor-move select-none group ${isDragging || isResizing ? 'opacity-70 z-50' : 'hover:opacity-90'}`}
                                                style={{
                                                    ...style,
                                                    backgroundColor: eventColor,
                                                }}
                                                onMouseDown={(e) => handleDragStart(e, event)}
                                                onDoubleClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEventClick(event);
                                                }}
                                                title={`${event.title}\n${formatTime(event.startTime)} - ${formatTime(event.endTime)}\nDrag to move • Drag bottom to resize • Double-click to edit`}
                                            >
                                                <div className="text-xs font-medium text-white truncate pointer-events-none">
                                                    {event.title}
                                                </div>
                                                <div className="text-xs text-white/80 truncate flex items-center gap-1 pointer-events-none">
                                                    <Clock size={10} />
                                                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                                </div>

                                                {/* Resize handle at bottom */}
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-md"
                                                    onMouseDown={(e) => handleResizeStart(e, event)}
                                                />

                                                {/* Delete button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteCalendarEvent(event.id);
                                                    }}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete event"
                                                >
                                                    <Trash2 size={10} className="text-white" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-teal-600 rounded"></div>
                    <span>Timer Sessions</span>
                </div>
                <div className="text-gray-500">
                    Events are automatically created when you complete a timer session
                </div>
            </div>

            {/* Create Event Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Event</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title *</label>
                                <input
                                    type="text"
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                    placeholder="Enter event title"
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        value={eventForm.startTime}
                                        onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                                    <input
                                        type="datetime-local"
                                        value={eventForm.endTime}
                                        onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                                <div className="flex gap-2">
                                    {['#3d7a7a', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setEventForm({ ...eventForm, color })}
                                            className={`w-8 h-8 flex-shrink-0 rounded-full transition-all ${eventForm.color === color ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110' : ''}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateEvent}
                                    disabled={!eventForm.title.trim()}
                                    className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Event Modal */}
            {showEditModal && selectedEvent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Event</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title *</label>
                                <input
                                    type="text"
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                    placeholder="Enter event title"
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        value={eventForm.startTime}
                                        onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                                    <input
                                        type="datetime-local"
                                        value={eventForm.endTime}
                                        onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                                <div className="flex gap-2">
                                    {['#3d7a7a', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setEventForm({ ...eventForm, color })}
                                            className={`w-8 h-8 flex-shrink-0 rounded-full transition-all ${eventForm.color === color ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110' : ''}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        deleteCalendarEvent(selectedEvent.id);
                                        setShowEditModal(false);
                                        setSelectedEvent(null);
                                    }}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateEvent}
                                    disabled={!eventForm.title.trim()}
                                    className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
