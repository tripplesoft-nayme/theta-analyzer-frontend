import { useState } from "react";
import { Plus, Send, X, Paperclip } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateSupportMutation } from "@/store/Api/AdminApi/ClientSupportApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ClientCreateTicket = () => {
  const [createSupport] = useCreateSupportMutation();

  const [issueType, setIssueType] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachment(file);
  };

  const removeFile = () => {
    setAttachment(null);
  };

  const handleSubmit = async () => {
    if (!issueType || !message.trim()) {
      toast.error("Please select an issue type and write a message");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("issueType", issueType);
      formData.append("description", message);

      if (attachment) {
        formData.append("attachFile", attachment);
      }

      await createSupport(formData).unwrap();

      toast.success("Support ticket created successfully");

      setIssueType("");
      setMessage("");
      setAttachment(null);
      setOpen(false);
    } catch {
      toast.error("Something went wrong while creating the ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-3! rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">
          <Plus className="w-4 h-4" />
          Create Ticket
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-none">
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Create Support Ticket
          </h4>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Issue Type
            </label>
            <div>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger className="w-full mt-2 h-10 text-sm border-gray-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 focus:ring-1 focus:ring-black dark:focus:ring-blue-500">
                  <SelectValue placeholder="Select an issue" />
                </SelectTrigger>

                <SelectContent className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200">
                  <SelectItem value="LOGINFAILED">Login Failed</SelectItem>
                  <SelectItem value="SYSTEMERROR">System Error</SelectItem>
                  <SelectItem value="OTHERPROBLEM">Other Problem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-1 relative">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue..."
                className="w-full mt-2 border border-gray-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-blue-500"
              />
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer text-gray-600 hover:text-black dark:text-slate-400 dark:hover:text-slate-100 absolute bottom-4 right-2">
                <Paperclip className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Attachment */}
            <div className="space-y-2">
              {attachment && (
                <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm">
                  <span className="truncate max-w-[260px] dark:text-slate-200">
                    {attachment.name}
                  </span>
                  <X
                    className="w-4 h-4 text-gray-500 dark:text-slate-400 cursor-pointer hover:text-red-600 dark:hover:text-rose-400"
                    onClick={removeFile}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-black dark:bg-blue-600 text-white text-sm font-medium hover:bg-gray-900 dark:hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Send
              <Send className="w-4 h-4" />
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientCreateTicket;
