// frontend/app/component/projects/ProjectFilterControls.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SearchBar } from '@/components/ui/search-bar';

interface ProjectFilterControlsProps {
  sortBy: 'newest' | 'oldest';
  statusFilter: string;
  searchTerm: string;
  dateRange: {
    startDate: Date | undefined;
    endDate: Date | undefined;
  };
  onSortChange: (sortBy: 'newest' | 'oldest') => void;
  onStatusFilterChange: (statusFilter: string) => void;
  onSearchChange: (searchTerm: string) => void;
  onDateRangeChange: (dateRange: { startDate: Date | undefined; endDate: Date | undefined }) => void;
}

export const ProjectFilterControls: React.FC<ProjectFilterControlsProps> = ({
  sortBy,
  statusFilter,
  searchTerm,
  dateRange,
  onSortChange,
  onStatusFilterChange,
  onSearchChange,
  onDateRangeChange
}) => {
  const toggleSort = () => {
    onSortChange(sortBy === 'newest' ? 'oldest' : 'newest');
  };
  
  const clearDateRange = () => {
    onDateRangeChange({ startDate: undefined, endDate: undefined });
  };
  
  // Handle start date selection
  const handleStartDateSelect = (date: Date | undefined) => {
    onDateRangeChange({ ...dateRange, startDate: date });
  };
  
  // Handle end date selection
  const handleEndDateSelect = (date: Date | undefined) => {
    onDateRangeChange({ ...dateRange, endDate: date });
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    console.log("ProjectFilterControls handleStatusFilterChange:", value); // Debug log
    onStatusFilterChange(value);
  };
  
  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      {/* Search Input using the reusable SearchBar component */}
      <div className="flex-1 min-w-[250px]">
        <SearchBar 
          placeholder="Search projects..." 
          value={searchTerm} 
          onChange={onSearchChange} 
        />
      </div>
      
      {/* Sort Button */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Sort:</span>
        <Button variant="outline" size="sm" onClick={toggleSort} className="flex items-center gap-1">
          {sortBy === 'newest' ? 'Newest' : 'Oldest'}
          <CalendarIcon className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Ongoing">Ongoing</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Date Range Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Date Range:</span>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(
                "w-[140px] justify-start text-left font-normal",
                !dateRange.startDate && "text-muted-foreground"
              )}>
                {dateRange.startDate ? (
                  format(dateRange.startDate, "MMM dd, yyyy")
                ) : (
                  <span>Start date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange.startDate}
                onSelect={handleStartDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(
                "w-[140px] justify-start text-left font-normal",
                !dateRange.endDate && "text-muted-foreground"
              )}>
                {dateRange.endDate ? (
                  format(dateRange.endDate, "MMM dd, yyyy")
                ) : (
                  <span>End date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange.endDate}
                onSelect={handleEndDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          {(dateRange.startDate || dateRange.endDate) && (
            <Button variant="ghost" size="sm" onClick={clearDateRange} className="text-gray-500">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};