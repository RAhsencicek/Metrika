import React, { useState, useMemo, useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    pointerWithin,
    rectIntersection,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent, CollisionDetection } from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Plus, MoreHorizontal, Clock, User,
    X, Trash2, Edit3, CheckCircle, GripVertical
} from 'lucide-react';
import { useTaskStore, useUserStore, useProjectStore } from '../store';
import type { Task, TaskStatus, TaskPriority } from '../types';

interface KanbanBoardProps {
    projectId: string;
}

// Task Card Component (Sortable)
interface TaskCardProps {
    task: Task;
    onClick: () => void;
    isDragging?: boolean;
}

const SortableTaskCard: React.FC<TaskCardProps & { id: string }> = ({ id, task, onClick, isDragging }) => {
    const { getUserById } = useUserStore();
    const assignee = getUserById(task.assigneeId);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const priorityColors: Record<TaskPriority, string> = {
        Low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        High: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        Urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const priorityLabels: Record<TaskPriority, string> = {
        Low: 'Düşük',
        Medium: 'Orta',
        High: 'Yüksek',
        Urgent: 'Acil',
    };

    const formatDueDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diff < 0) return { text: `${Math.abs(diff)} gün geçti`, color: 'text-red-400' };
        if (diff === 0) return { text: 'Bugün', color: 'text-orange-400' };
        if (diff === 1) return { text: 'Yarın', color: 'text-yellow-400' };
        if (diff <= 7) return { text: `${diff} gün`, color: 'text-gray-400' };
        return { text: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }), color: 'text-gray-400' };
    };

    const dueInfo = formatDueDate(task.dueDate);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-dark-900 p-3 rounded-lg border border-dark-600 hover:border-primary/50 cursor-pointer shadow-sm group transition-all"
        >
            <div className="flex items-start gap-2">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                {/* Card Content */}
                <div className="flex-1 min-w-0" onClick={onClick}>
                    {/* Priority & Menu */}
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                            {priorityLabels[task.priority]}
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Title */}
                    <h5 className="text-sm font-medium text-white mb-2 leading-snug line-clamp-2">
                        {task.title}
                    </h5>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {task.tags.slice(0, 2).map((tag, idx) => (
                                <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-dark-700 text-gray-400 rounded">
                                    {tag}
                                </span>
                            ))}
                            {task.tags.length > 2 && (
                                <span className="text-[10px] text-gray-500">+{task.tags.length - 2}</span>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-dark-700">
                        {/* Assignee */}
                        {assignee ? (
                            <div className="flex items-center">
                                <img
                                    src={`https://picsum.photos/id/${assignee.avatar}/24/24`}
                                    className="w-6 h-6 rounded-full border border-dark-600"
                                    alt={assignee.name}
                                    title={assignee.name}
                                />
                            </div>
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center">
                                <User className="w-3 h-3 text-gray-500" />
                            </div>
                        )}

                        {/* Due Date */}
                        <div className={`flex items-center text-xs ${dueInfo.color}`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {dueInfo.text}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Column Component
interface ColumnProps {
    id: TaskStatus;
    title: string;
    color: string;
    tasks: Task[];
    onAddTask: () => void;
    onTaskClick: (task: Task) => void;
}

const KanbanColumn: React.FC<ColumnProps> = ({ id, title, color, tasks, onAddTask, onTaskClick }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div className={`flex-1 min-w-[300px] max-w-[350px] bg-dark-800 rounded-xl border flex flex-col h-full transition-colors ${isOver ? 'border-primary bg-primary/5' : 'border-dark-700'}`}>
            {/* Column Header */}
            <div className={`p-4 border-b border-${color}-500/30`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full bg-${color}-500 mr-2`}></div>
                        <h4 className="font-semibold text-white text-sm">{title}</h4>
                        <span className="ml-2 bg-dark-700 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                            {tasks.length}
                        </span>
                    </div>
                    <button
                        onClick={onAddTask}
                        className="p-1 text-gray-400 hover:text-white hover:bg-dark-700 rounded transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Tasks - This is the droppable area */}
            <div
                ref={setNodeRef}
                className={`p-3 flex-1 overflow-y-auto min-h-[200px] ${isOver ? 'bg-primary/10' : ''}`}
            >
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {tasks.map(task => (
                            <SortableTaskCard
                                key={task.id}
                                id={task.id}
                                task={task}
                                onClick={() => onTaskClick(task)}
                            />
                        ))}
                    </div>
                </SortableContext>

                {/* Empty State / Drop Zone */}
                {tasks.length === 0 && (
                    <div className={`text-center py-8 border-2 border-dashed rounded-lg transition-colors ${isOver ? 'border-primary bg-primary/10 text-primary' : 'border-dark-600 text-gray-500'}`}>
                        <p className="text-sm">{isOver ? 'Buraya bırak' : 'Görev yok'}</p>
                        {!isOver && (
                            <button
                                onClick={onAddTask}
                                className="mt-2 text-primary hover:underline text-xs"
                            >
                                + Görev Ekle
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Task Detail Modal
interface TaskModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    isNew?: boolean;
    defaultStatus?: TaskStatus;
    projectId: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, isNew = false, defaultStatus = 'Todo', projectId }) => {
    const { addTask, updateTask, deleteTask } = useTaskStore();
    const { users } = useUserStore();
    const { getProjectById } = useProjectStore();

    const project = getProjectById(projectId);

    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || defaultStatus,
        priority: task?.priority || 'Medium' as TaskPriority,
        assigneeId: task?.assigneeId || '',
        dueDate: task?.dueDate || new Date().toISOString().split('T')[0],
        tags: task?.tags?.join(', ') || '',
        estimatedHours: task?.estimatedHours || 8,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        const taskData = {
            title: formData.title,
            description: formData.description,
            status: formData.status as TaskStatus,
            priority: formData.priority as TaskPriority,
            projectId: projectId,
            assigneeId: formData.assigneeId,
            dueDate: formData.dueDate,
            estimatedHours: formData.estimatedHours,
            loggedHours: task?.loggedHours || 0,
            tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        };

        if (isNew) {
            addTask(taskData);
        } else if (task) {
            updateTask(task.id, taskData);
        }

        onClose();
    };

    const handleDelete = () => {
        if (task && window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
            deleteTask(task.id);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-dark-800 rounded-xl border border-dark-700 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-700">
                    <div className="flex items-center gap-2">
                        {isNew ? (
                            <Plus className="w-5 h-5 text-primary" />
                        ) : (
                            <Edit3 className="w-5 h-5 text-primary" />
                        )}
                        <h2 className="text-lg font-bold text-white">
                            {isNew ? 'Yeni Görev' : 'Görevi Düzenle'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isNew && (
                            <button
                                onClick={handleDelete}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Project Info */}
                {project && (
                    <div className="px-4 py-2 bg-dark-900/50 border-b border-dark-700">
                        <p className="text-xs text-gray-500">
                            <span className="text-gray-400">Proje:</span> {project.title}
                        </p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Başlık *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            placeholder="Görev başlığı"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Açıklama</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary resize-none"
                            placeholder="Görev açıklaması..."
                        />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Durum</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            >
                                <option value="Todo">Yapılacak</option>
                                <option value="In Progress">Devam Ediyor</option>
                                <option value="Review">İncelemede</option>
                                <option value="Done">Tamamlandı</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Öncelik</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            >
                                <option value="Low">Düşük</option>
                                <option value="Medium">Orta</option>
                                <option value="High">Yüksek</option>
                                <option value="Urgent">Acil</option>
                            </select>
                        </div>
                    </div>

                    {/* Assignee & Due Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Atanan Kişi</label>
                            <select
                                value={formData.assigneeId}
                                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            >
                                <option value="">Seçiniz</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Bitiş Tarihi</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    {/* Tags & Hours */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Etiketler</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                placeholder="virgülle ayırın"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Tahmini Saat</label>
                            <input
                                type="number"
                                value={formData.estimatedHours}
                                onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                                min="1"
                                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            {isNew ? 'Oluştur' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Kanban Board Component
const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
    const { tasks, updateTaskStatus } = useTaskStore();

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isNewTask, setIsNewTask] = useState(false);
    const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('Todo');

    // Filter tasks for this project
    const projectTasks = useMemo(() => {
        return tasks.filter(t => t.projectId === projectId);
    }, [tasks, projectId]);

    // Group by status
    const columns: { id: TaskStatus; title: string; color: string }[] = [
        { id: 'Todo', title: 'Yapılacak', color: 'gray' },
        { id: 'In Progress', title: 'Devam Ediyor', color: 'blue' },
        { id: 'Review', title: 'İncelemede', color: 'yellow' },
        { id: 'Done', title: 'Tamamlandı', color: 'green' },
    ];

    const tasksByStatus = useMemo(() => {
        const grouped: Record<TaskStatus, Task[]> = {
            'Todo': [],
            'In Progress': [],
            'Review': [],
            'Done': [],
        };
        projectTasks.forEach(task => {
            if (grouped[task.status]) {
                grouped[task.status].push(task);
            }
        });
        return grouped;
    }, [projectTasks]);

    // Custom collision detection that prioritizes columns over tasks
    const customCollisionDetection: CollisionDetection = useCallback((args) => {
        // First, check if we're over a droppable column using pointerWithin
        const pointerCollisions = pointerWithin(args);

        // Filter to find column collisions (column IDs match our column list)
        const columnIds = columns.map(c => c.id);
        const columnCollisions = pointerCollisions.filter(collision =>
            columnIds.includes(collision.id as TaskStatus)
        );

        // If we found a column collision, prioritize it
        if (columnCollisions.length > 0) {
            return columnCollisions;
        }

        // Otherwise fall back to rectIntersection for task-to-task collision
        return rectIntersection(args);
    }, [columns]);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Reduced distance for easier activation
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Find which column a task belongs to
    const findColumn = (taskId: string): TaskStatus | null => {
        for (const status of Object.keys(tasksByStatus) as TaskStatus[]) {
            if (tasksByStatus[status].find(t => t.id === taskId)) {
                return status;
            }
        }
        return null;
    };

    // DnD Event Handlers
    const handleDragStart = (event: DragStartEvent) => {
        const task = projectTasks.find(t => t.id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Check if dropping on a column (empty or not)
        const isOverColumn = columns.some(c => c.id === overId);

        const activeColumn = findColumn(activeId);
        let targetColumn: TaskStatus | null = null;

        if (isOverColumn) {
            // Dropping directly on an empty column
            targetColumn = overId as TaskStatus;
        } else {
            // Dropping on another task, find its column
            targetColumn = findColumn(overId);
        }

        if (activeColumn && targetColumn && activeColumn !== targetColumn) {
            updateTaskStatus(activeId, targetColumn);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Check if dropped on a column
        const isOverColumn = columns.some(c => c.id === overId);

        if (isOverColumn) {
            // Dropped directly on a column (including empty ones)
            updateTaskStatus(activeId, overId as TaskStatus);
        } else {
            // Dropped on another task, find its column
            const targetColumn = findColumn(overId);
            if (targetColumn) {
                updateTaskStatus(activeId, targetColumn);
            }
        }
    };

    // Modal handlers
    const handleAddTask = (status: TaskStatus) => {
        setSelectedTask(null);
        setIsNewTask(true);
        setNewTaskStatus(status);
        setModalOpen(true);
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsNewTask(false);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedTask(null);
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={customCollisionDetection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '500px' }}>
                    {columns.map(column => (
                        <KanbanColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            color={column.color}
                            tasks={tasksByStatus[column.id]}
                            onAddTask={() => handleAddTask(column.id)}
                            onTaskClick={handleTaskClick}
                        />
                    ))}
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeTask ? (
                        <div className="bg-dark-900 p-3 rounded-lg border-2 border-primary shadow-xl opacity-90">
                            <h5 className="text-sm font-medium text-white">{activeTask.title}</h5>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Task Modal */}
            <TaskModal
                task={selectedTask}
                isOpen={modalOpen}
                onClose={handleCloseModal}
                isNew={isNewTask}
                defaultStatus={newTaskStatus}
                projectId={projectId}
            />
        </>
    );
};

export default KanbanBoard;
