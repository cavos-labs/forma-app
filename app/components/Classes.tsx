'use client'

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useTheme } from '@/lib/theme-context';
import { useLanguage } from '@/lib/language-context';
import { useAuth } from '@/lib/auth-context';
import { workoutApi } from '@/lib/api';

interface DailyWorkout {
  id: string;
  gym_id: string;
  workout_date: string;
  workout_text: string;
  created_at: string;
  updated_at: string;
}

interface WorkoutElement {
  id: string;
  type: 'title' | 'text';
  content: string;
}

interface ClassesProps {
  gymId?: string;
}

export interface ClassesRef {
  refresh: () => void;
}

const Classes = forwardRef<ClassesRef, ClassesProps>(({ gymId }, ref) => {
  const { theme, colors } = useTheme();
  const { language } = useLanguage();
  const { gym } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<DailyWorkout[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false);
  const [workoutElements, setWorkoutElements] = useState<WorkoutElement[]>([]);
  const [displayWorkout, setDisplayWorkout] = useState<DailyWorkout | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);

  const currentGymId = gymId || gym?.id;
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = language === 'es' 
    ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = language === 'es' 
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const loadWorkouts = useCallback(async () => {
    if (!currentGymId) return;
    
    setLoading(true);
    try {
      const response = await workoutApi.getWorkouts({
        gymId: currentGymId,
        year: currentYear.toString(),
        month: (currentMonth + 1).toString()
      });
      
      // Check if we have workouts array (response structure might not have success property)
      if (response.workouts && Array.isArray(response.workouts)) {
        setWorkouts(response.workouts);
      } else {
        setWorkouts([]);
      }
    } catch {
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  }, [currentGymId, currentYear, currentMonth]);

  // Load workouts for current month
  useEffect(() => {
    if (currentGymId) {
      loadWorkouts();
    }
  }, [currentGymId, currentYear, currentMonth, loadWorkouts]);

  useImperativeHandle(ref, () => ({
    refresh: loadWorkouts
  }));

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];
    
    // Previous month's days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startDate - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        fullDate: new Date(year, month - 1, prevMonth.getDate() - i)
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        isPrevMonth: false,
        fullDate: new Date(year, month, day)
      });
    }

    // Next month's days to fill the grid
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        isPrevMonth: false,
        fullDate: new Date(year, month + 1, day)
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getWorkoutForDate = (date: Date) => {
    // Use local date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const workout = workouts.find(w => w.workout_date === dateString);
    
    return workout;
  };

  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    
    const existingWorkout = getWorkoutForDate(date);
    
    if (existingWorkout) {
      // Show display modal for existing workout
      setDisplayWorkout(existingWorkout);
      setIsDisplayModalOpen(true);
    } else {
      // Show edit modal for new workout
      setSelectedDate(date);
      setWorkoutElements([{ id: Date.now().toString(), type: 'text', content: '' }]);
      setIsEditing(false);
      setEditingWorkoutId(null);
      setIsModalOpen(true);
    }
  };

  const addWorkoutElement = (type: 'title' | 'text') => {
    const newElement: WorkoutElement = {
      id: Date.now().toString(),
      type,
      content: ''
    };
    setWorkoutElements(prev => [...prev, newElement]);
  };

  const updateWorkoutElement = (id: string, content: string) => {
    setWorkoutElements(prev => 
      prev.map(el => el.id === id ? { ...el, content } : el)
    );
  };

  const removeWorkoutElement = (id: string) => {
    setWorkoutElements(prev => prev.filter(el => el.id !== id));
  };

  const moveWorkoutElement = (dragIndex: number, hoverIndex: number) => {
    setWorkoutElements(prev => {
      const draggedElement = prev[dragIndex];
      const newElements = [...prev];
      newElements.splice(dragIndex, 1);
      newElements.splice(hoverIndex, 0, draggedElement);
      return newElements;
    });
  };


  const handleSaveWorkout = async () => {
    if (!selectedDate || !currentGymId) return;

    const workoutText = workoutElements
      .filter(el => el.content.trim())
      .map(el => el.type === 'title' ? `# ${el.content}` : el.content)
      .join('\n\n');

    if (!workoutText.trim()) {
      alert(language === 'es' ? 'Por favor agrega contenido al entrenamiento' : 'Please add content to the workout');
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (isEditing && editingWorkoutId) {
        // Update existing workout
        response = await workoutApi.updateWorkout({
          id: editingWorkoutId,
          workout_text: workoutText
        });
        
        
        // The update API might not return success property, check if it has workout data
        if (response.workout || response.success !== false) {
          alert(language === 'es' ? '¡Entrenamiento actualizado exitosamente!' : 'Workout updated successfully!');
        } else {
          alert(language === 'es' ? 'Error al actualizar el entrenamiento' : 'Error updating workout');
        }
      } else {
        // Create new workout
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const workoutDate = `${year}-${month}-${day}`;
        
        response = await workoutApi.createWorkout({
          gym_id: currentGymId,
          workout_date: workoutDate,
          workout_text: workoutText
        });

        if (response.success) {
          alert(language === 'es' ? '¡Entrenamiento creado exitosamente!' : 'Workout created successfully!');
        } else {
          alert(language === 'es' ? 'Error al crear el entrenamiento' : 'Error creating workout');
        }
      }

      // Check if operation was successful (either has success:true or has workout data)
      if (response.success !== false && (response.success || response.workout)) {
        // Reload workouts and close modal
        await loadWorkouts();
        setIsModalOpen(false);
        setSelectedDate(null);
        setWorkoutElements([]);
        setIsEditing(false);
        setEditingWorkoutId(null);
      }
    } catch {
      alert(language === 'es' ? 'Error al conectar con el servidor' : 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const parseWorkoutText = (text: string) => {
    const lines = text.split('\n');
    const elements: { type: 'title' | 'text', content: string }[] = [];
    let currentTextBlock = '';

    for (const line of lines) {
      if (line.trim().startsWith('# ')) {
        // Save previous text block if exists
        if (currentTextBlock.trim()) {
          elements.push({ type: 'text', content: currentTextBlock.trim() });
          currentTextBlock = '';
        }
        // Add title
        elements.push({ type: 'title', content: line.replace(/^# /, '').trim() });
      } else if (line.trim()) {
        currentTextBlock += line + '\n';
      } else if (currentTextBlock.trim()) {
        // Empty line ends a text block
        elements.push({ type: 'text', content: currentTextBlock.trim() });
        currentTextBlock = '';
      }
    }

    // Add final text block if exists
    if (currentTextBlock.trim()) {
      elements.push({ type: 'text', content: currentTextBlock.trim() });
    }

    return elements;
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="h-full flex flex-col p-3 sm:p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <h1 
          className="text-xl sm:text-3xl font-bold uppercase tracking-wide"
          style={{ 
            color: colors.text,
            fontFamily: 'Romagothic, sans-serif'
          }}
        >
          {language === 'es' ? 'ENTRENAMIENTOS' : 'WORKOUTS'}
        </h1>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 rounded-lg active:scale-95 transition-transform touch-manipulation"
          style={{ color: colors.text }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 
          className="text-lg sm:text-xl font-semibold"
          style={{ color: colors.text }}
        >
          {monthNames[currentMonth]} {currentYear}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 rounded-lg active:scale-95 transition-transform touch-manipulation"
          style={{ color: colors.text }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar */}
      <div className="flex-1 rounded-lg p-2 sm:p-6" style={{ 
        backgroundColor: colors.cardBackground,
        border: `1px solid ${theme === 'dark' ? '#333' : '#e5e5e5'}`
      }}>
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-4 mb-2 sm:mb-4">
          {dayNames.map((day) => (
            <div 
              key={day} 
              className="text-center text-xs sm:text-sm font-medium py-1 sm:py-2"
              style={{ color: colors.mutedText }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-4 h-full">
          {days.map((day, index) => {
            const workout = getWorkoutForDate(day.fullDate);
            const hasWorkout = workout && workout.workout_text.trim() !== '';
            
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(day.fullDate, day.isCurrentMonth)}
                className={`
                  min-h-[80px] sm:min-h-[120px] p-1 sm:p-3 rounded-lg transition-all duration-200 border relative touch-manipulation
                  ${day.isCurrentMonth 
                    ? 'cursor-pointer active:scale-95 sm:hover:scale-[1.02]' 
                    : 'cursor-default'
                  }
                `}
                style={{
                  backgroundColor: day.isCurrentMonth 
                    ? (theme === 'dark' ? '#2a2a2a' : '#ffffff')
                    : 'transparent',
                  borderColor: day.isCurrentMonth 
                    ? (theme === 'dark' ? '#404040' : '#d1d5db')
                    : 'transparent',
                  opacity: day.isCurrentMonth ? 1 : 0.3
                }}
              >
                {/* Date Number */}
                <div 
                  className="text-xs sm:text-sm font-medium mb-1 sm:mb-2"
                  style={{ 
                    color: day.isCurrentMonth 
                      ? (theme === 'dark' ? colors.text : '#1f2937')
                      : colors.mutedText
                  }}
                >
                  {day.date}
                </div>

                {/* Workout Indicator */}
                {hasWorkout && day.isCurrentMonth && (
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                    <div 
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                      style={{ backgroundColor: '#10b981' }}
                    />
                  </div>
                )}

                {/* Preview for workouts - Hidden on small screens */}
                {hasWorkout && day.isCurrentMonth && (
                  <div className="space-y-1 hidden sm:block">
                    <div 
                      className="text-xs px-2 py-1 rounded truncate"
                      style={{ 
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}
                    >
                      {language === 'es' ? 'Ver entrenamiento' : 'View workout'}
                    </div>
                  </div>
                )}

                {/* Mobile workout indicator */}
                {hasWorkout && day.isCurrentMonth && (
                  <div className="block sm:hidden absolute bottom-1 left-1 right-1">
                    <div 
                      className="h-1 rounded-full"
                      style={{ backgroundColor: '#3b82f6' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit Workout Modal */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div 
            className="rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: colors.cardBackground }}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: colors.text }}
                >
                  {selectedDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <p 
                  className="text-sm mt-1"
                  style={{ color: colors.mutedText }}
                >
                  {isEditing 
                    ? (language === 'es' ? 'Editando entrenamiento' : 'Editing workout')
                    : (language === 'es' ? 'Crear nuevo entrenamiento' : 'Create new workout')
                  }
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:scale-110 transition-transform"
                style={{ color: colors.text }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Add Elements Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <button
                onClick={() => addWorkoutElement('title')}
                className="flex-1 px-3 py-2 rounded-lg text-sm transition-colors border touch-manipulation"
                style={{
                  color: colors.text,
                  borderColor: theme === 'dark' ? '#333' : '#e5e5e5',
                  backgroundColor: 'transparent'
                }}
              >
                + {language === 'es' ? 'Título' : 'Title'}
              </button>
              <button
                onClick={() => addWorkoutElement('text')}
                className="flex-1 px-3 py-2 rounded-lg text-sm transition-colors border touch-manipulation"
                style={{
                  color: colors.text,
                  borderColor: theme === 'dark' ? '#333' : '#e5e5e5',
                  backgroundColor: 'transparent'
                }}
              >
                + {language === 'es' ? 'Texto' : 'Text'}
              </button>
            </div>

            {/* Workout Elements */}
            <div className="space-y-4 mb-6">
              {workoutElements.map((element, index) => (
                <DraggableWorkoutElement
                  key={element.id}
                  element={element}
                  index={index}
                  moveElement={moveWorkoutElement}
                  updateElement={updateWorkoutElement}
                  removeElement={removeWorkoutElement}
                  language={language}
                  colors={colors}
                  theme={theme}
                />
              ))}
              
              {workoutElements.length === 0 && (
                <div 
                  className="text-center py-8 text-sm"
                  style={{ color: colors.mutedText }}
                >
                  {language === 'es' ? 'Agrega títulos y texto para crear el entrenamiento' : 'Add titles and text to create the workout'}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 sm:py-2 px-4 rounded-lg border transition-colors touch-manipulation"
                style={{
                  color: colors.text,
                  borderColor: theme === 'dark' ? '#333' : '#e5e5e5',
                  backgroundColor: 'transparent'
                }}
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveWorkout}
                disabled={loading}
                className="flex-1 py-3 sm:py-2 px-4 rounded-lg text-white transition-colors disabled:opacity-50 touch-manipulation"
                style={{ backgroundColor: '#3b82f6' }}
              >
                {loading ? (language === 'es' ? 'Guardando...' : 'Saving...') : (language === 'es' ? 'Guardar' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display Workout Modal - Fullscreen */}
      {isDisplayModalOpen && displayWorkout && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header with controls */}
          <div className="flex justify-between items-center p-3 sm:p-6 border-b border-gray-800">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <h1 
                className="text-2xl sm:text-4xl font-bold"
                style={{ 
                  color: '#ffffff',
                  fontFamily: 'Romagothic, sans-serif'
                }}
              >
                &quot;FORMA&quot;
              </h1>
              <div className="text-gray-400 text-xs sm:text-sm hidden sm:block">
                {new Date(displayWorkout.workout_date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Edit Button */}
              <button
                onClick={() => {
                  // Parse existing workout for editing
                  const parsed = parseWorkoutText(displayWorkout.workout_text);
                  const elements: WorkoutElement[] = parsed.map((el, index) => ({
                    id: `${Date.now()}_${index}`,
                    type: el.type,
                    content: el.content
                  }));
                  
                  // Switch to edit mode
                  setWorkoutElements(elements);
                  // Parse date properly to avoid timezone issues
                  const dateParts = displayWorkout.workout_date.split('-');
                  const workoutDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
                  setSelectedDate(workoutDate);
                  setIsEditing(true);
                  setEditingWorkoutId(displayWorkout.id);
                  setIsDisplayModalOpen(false);
                  setIsModalOpen(true);
                }}
                className="px-3 sm:px-4 py-2 rounded-lg border border-gray-600 active:bg-gray-800 sm:hover:bg-gray-800 transition-colors touch-manipulation"
                style={{ color: '#ffffff' }}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">{language === 'es' ? 'Editar' : 'Edit'}</span>
                </div>
              </button>
              
              {/* Close Button */}
              <button
                onClick={() => setIsDisplayModalOpen(false)}
                className="p-2 rounded-lg active:bg-gray-800 sm:hover:bg-gray-800 transition-colors touch-manipulation"
                style={{ color: '#ffffff' }}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile date display */}
          <div className="sm:hidden px-3 py-2 border-b border-gray-800">
            <div className="text-gray-400 text-sm text-center">
              {new Date(displayWorkout.workout_date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6 sm:space-y-8" style={{ color: '#ffffff' }}>
                {parseWorkoutText(displayWorkout.workout_text).map((element, index) => (
                  <div key={index}>
                    {element.type === 'title' ? (
                      <h2 
                        className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center uppercase tracking-wider"
                        style={{ fontFamily: 'Romagothic, sans-serif' }}
                      >
                        {element.content}
                      </h2>
                    ) : (
                      <div className="text-base sm:text-xl leading-relaxed whitespace-pre-line text-center max-w-3xl mx-auto px-2">
                        {element.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Draggable Workout Element Component
interface DraggableWorkoutElementProps {
  element: WorkoutElement;
  index: number;
  moveElement: (dragIndex: number, hoverIndex: number) => void;
  updateElement: (id: string, content: string) => void;
  removeElement: (id: string) => void;
  language: string;
  colors: Record<string, string>;
  theme: string;
}

function DraggableWorkoutElement({
  element,
  index,
  moveElement,
  updateElement,
  removeElement,
  language,
  colors,
  theme
}: DraggableWorkoutElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedOver, setDraggedOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(true);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
    
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const hoverIndex = index;
    
    if (dragIndex !== hoverIndex) {
      moveElement(dragIndex, hoverIndex);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border rounded-lg transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      } ${
        draggedOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      style={{
        borderColor: draggedOver 
          ? '#3b82f6' 
          : (theme === 'dark' ? '#333' : '#e5e5e5'),
        backgroundColor: draggedOver 
          ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)')
          : colors.background
      }}
    >
      {/* Drag Handle */}
      <div className="absolute left-2 top-2 cursor-move opacity-50 hover:opacity-100 active:opacity-100 transition-opacity touch-manipulation">
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.mutedText }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      <div className="p-3 sm:p-4 pl-8 sm:pl-10">
        <div className="flex justify-between items-center mb-2">
          <span 
            className="text-xs sm:text-sm font-medium"
            style={{ color: colors.mutedText }}
          >
            {element.type === 'title' ? (language === 'es' ? 'Título' : 'Title') : (language === 'es' ? 'Texto' : 'Text')}
          </span>
          <button
            onClick={() => removeElement(element.id)}
            className="p-1 rounded-lg active:scale-95 sm:hover:scale-110 transition-transform touch-manipulation"
            style={{ color: '#ef4444' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {element.type === 'title' ? (
          <input
            type="text"
            value={element.content}
            onChange={(e) => updateElement(element.id, e.target.value)}
            placeholder={language === 'es' ? 'Título del entrenamiento' : 'Workout title'}
            className="w-full p-3 rounded-lg border outline-none text-lg font-semibold"
            style={{ 
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: theme === 'dark' ? '#333' : '#e5e5e5'
            }}
          />
        ) : (
          <textarea
            value={element.content}
            onChange={(e) => updateElement(element.id, e.target.value)}
            placeholder={language === 'es' ? 'Descripción del entrenamiento...' : 'Workout description...'}
            rows={4}
            className="w-full p-3 rounded-lg border resize-none outline-none text-sm"
            style={{ 
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: theme === 'dark' ? '#333' : '#e5e5e5'
            }}
          />
        )}
      </div>
    </div>
  );
};

Classes.displayName = 'Classes';

export default Classes;