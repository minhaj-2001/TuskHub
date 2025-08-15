import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Check } from "lucide-react";
import { useEmails } from "@/hooks/use-emails";
import { Loader2 } from "lucide-react";
import { type EmailEntry } from "@/lib/schema";

interface EmailShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    _id: string;
    project_name: string;
  };
  onSubmit: (emailIds: string[]) => void;
  isLoading: boolean;
}

export const EmailShareDialog: React.FC<EmailShareDialogProps> = ({
  isOpen,
  onClose,
  project,
  onSubmit,
  isLoading
}) => {
  const { emails } = useEmails();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<EmailEntry[]>([]);

  // Filter emails based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredEmails(emails);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredEmails(
        emails.filter(
          (email) =>
            email.name.toLowerCase().includes(term) ||
            email.email.toLowerCase().includes(term)
        )
      );
    }
  }, [emails, searchTerm]);

  const handleEmailSelect = (emailId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmails([...selectedEmails, emailId]);
    } else {
      setSelectedEmails(selectedEmails.filter((id) => id !== emailId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(filteredEmails.map((email) => email._id));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleSubmit = () => {
    if (selectedEmails.length === 0) {
      alert("Please select at least one email address");
      return;
    }
    onSubmit(selectedEmails);
  };

  const isAllSelected = 
    filteredEmails.length > 0 && 
    selectedEmails.length === filteredEmails.length &&
    filteredEmails.every(email => selectedEmails.includes(email._id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Project Details</DialogTitle>
          <DialogDescription>
            Share the project details for "{project.project_name}" as PDF with selected email recipients.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Select All Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm font-medium">
              Select All ({filteredEmails.length})
            </Label>
          </div>
          
          {/* Email List */}
          <div className="max-h-60 overflow-y-auto border rounded-md p-2">
            {filteredEmails.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {emails.length === 0 
                  ? "No emails available. Add emails to share projects." 
                  : "No emails match your search."
                }
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEmails.map((email) => (
                  <div
                    key={email._id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md"
                  >
                    <Checkbox
                      id={`email-${email._id}`}
                      checked={selectedEmails.includes(email._id)}
                      onCheckedChange={(checked) => handleEmailSelect(email._id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={`email-${email._id}`}
                        className="text-sm font-medium cursor-pointer truncate"
                      >
                        {email.name}
                      </Label>
                      <p className="text-xs text-gray-500 truncate">
                        {email.email}
                      </p>
                    </div>
                    {selectedEmails.includes(email._id) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected Count */}
          {selectedEmails.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedEmails.length} recipient{selectedEmails.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEmails([])}
                className="text-xs"
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || selectedEmails.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              `Share (${selectedEmails.length})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};