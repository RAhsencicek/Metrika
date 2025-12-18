import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Folder, Search } from 'lucide-react';

interface DropdownOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
    color?: string;
    description?: string;
}

interface CustomDropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'priority' | 'project';
    searchable?: boolean;
    className?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Seçiniz...',
    label,
    icon,
    variant = 'default',
    searchable = false,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Filter options based on search
    const filteredOptions = searchable
        ? options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, searchable]);

    // Get priority color dot
    const getPriorityColor = (priorityValue: string) => {
        switch (priorityValue) {
            case 'high':
                return 'bg-red-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    // Get priority emoji
    const getPriorityEmoji = (priorityValue: string) => {
        switch (priorityValue) {
            case 'high':
                return '🔥';
            case 'medium':
                return '⚡';
            case 'low':
                return '✨';
            default:
                return '';
        }
    };

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    {icon && <span className="mr-2 text-gray-400">{icon}</span>}
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between px-4 py-3 text-left
                    bg-dark-900/80 border rounded-xl transition-all duration-200
                    ${isOpen
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-dark-600 hover:border-dark-500'
                    }
                    focus:outline-none
                `}
            >
                <div className="flex items-center gap-3 min-w-0">
                    {/* Priority variant - show color dot */}
                    {variant === 'priority' && value && (
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(value)} ${value === 'high' ? 'animate-pulse' : ''}`} />
                    )}

                    {/* Project variant - show folder icon */}
                    {variant === 'project' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                            <Folder className="w-4 h-4 text-primary" />
                        </div>
                    )}

                    {/* Selected option or placeholder */}
                    <span className={`text-sm truncate ${selectedOption ? 'text-white' : 'text-gray-500'}`}>
                        {selectedOption ? (
                            <span className="flex items-center gap-2">
                                {variant === 'priority' && getPriorityEmoji(value)}
                                {selectedOption.label}
                            </span>
                        ) : placeholder}
                    </span>
                </div>

                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in">
                    {/* Gradient top border */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />

                    {/* Search Input */}
                    {searchable && (
                        <div className="p-3 border-b border-dark-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Ara..."
                                    className="w-full bg-dark-900/50 border border-dark-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                    )}

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto py-2">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                Sonuç bulunamadı
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = option.value === value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150
                                            ${isSelected
                                                ? 'bg-primary/10 text-white'
                                                : 'text-gray-300 hover:bg-dark-700/50 hover:text-white'
                                            }
                                        `}
                                    >
                                        {/* Priority variant - color dot */}
                                        {variant === 'priority' && (
                                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(option.value)} ${option.value === 'high' ? 'animate-pulse' : ''}`} />
                                        )}

                                        {/* Project variant - icon */}
                                        {variant === 'project' && (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${option.value
                                                ? 'bg-gradient-to-br from-primary/20 to-purple-500/20'
                                                : 'bg-dark-700'
                                                }`}
                                            >
                                                <Folder className={`w-4 h-4 ${option.value ? 'text-primary' : 'text-gray-500'}`} />
                                            </div>
                                        )}

                                        {/* Custom icon */}
                                        {option.icon && variant === 'default' && (
                                            <span className="text-gray-400">{option.icon}</span>
                                        )}

                                        {/* Label and description */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {variant === 'priority' && (
                                                    <span className="text-base">{getPriorityEmoji(option.value)}</span>
                                                )}
                                                <span className="text-sm font-medium truncate">{option.label}</span>
                                            </div>
                                            {option.description && (
                                                <p className="text-xs text-gray-500 mt-0.5 truncate">{option.description}</p>
                                            )}
                                        </div>

                                        {/* Check icon for selected */}
                                        {isSelected && (
                                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Preset dropdown for Priority
export const PriorityDropdown: React.FC<{
    value: string;
    onChange: (value: string) => void;
    className?: string;
}> = ({ value, onChange, className }) => {
    const priorityOptions: DropdownOption[] = [
        { value: 'low', label: 'Düşük Öncelik', description: 'Normal akışta yapılabilir' },
        { value: 'medium', label: 'Orta Öncelik', description: 'Yakın zamanda tamamlanmalı' },
        { value: 'high', label: 'Yüksek Öncelik', description: 'Acil dikkat gerektiriyor' },
    ];

    return (
        <CustomDropdown
            options={priorityOptions}
            value={value}
            onChange={onChange}
            variant="priority"
            placeholder="Öncelik seçin"
            className={className}
        />
    );
};

// Preset dropdown for Projects
export const ProjectDropdown: React.FC<{
    projects: Array<{ id: string; title: string }>;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    showOptional?: boolean;
}> = ({ projects, value, onChange, className, showOptional = true }) => {
    const projectOptions: DropdownOption[] = [
        ...(showOptional ? [{ value: '', label: 'Proje Seçmeyin', description: 'Projeye bağlı olmayacak' }] : []),
        ...projects.map(p => ({
            value: p.id,
            label: p.title,
        }))
    ];

    return (
        <CustomDropdown
            options={projectOptions}
            value={value}
            onChange={onChange}
            variant="project"
            placeholder="Proje seçin"
            searchable={projects.length > 5}
            className={className}
        />
    );
};

export default CustomDropdown;
