/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  Clock 
} from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Assuming shadcn/ui
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ViewSubmissionModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
}

const ViewSubmissionModal = ({ open, onClose, data }: ViewSubmissionModalProps) => {
  if (!data) return null;

  const { information, submission, status, createdAt, employee, project } = data;

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex justify-between items-start mt-10">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight">
                Submission Details
              </DialogTitle>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Briefcase className="w-4 h-4" />
                <span>Project: {project?.name}</span>
              </div>
            </div>
            <Badge className={getStatusColor(status)} variant="outline">
              {status}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] px-6 py-4">
          <div className="space-y-8 pb-6">
            
            {/* Employee Profile Section */}
            <div className="flex items-start gap-4">
              {/* <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {employee?.user?.name?.charAt(0) || <User className="w-6 h-6" />}
              </div> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 flex-1">
                <InfoItem icon={<User />} label="Full Name" value={employee?.user?.name} />
                <InfoItem icon={<Mail />} label="Email Address" value={employee?.user?.email} />
                <InfoItem icon={<Phone />} label="Phone Number" value={employee?.user?.phoneNumber} />
                <InfoItem icon={<Calendar />} label="Joined Date" value={new Date(employee?.joinedDate).toLocaleDateString()} />
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Content Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Time Stamp
                    </h4>
                    <p className="text-sm font-medium">{new Date(createdAt).toLocaleString()}</p>
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" /> Skills Mentioned
                    </h4>
                    <div className="flex gap-1.5 flex-wrap">
                        {employee?.skills?.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-[10px] font-semibold py-0">
                            {skill}
                        </Badge>
                        ))}
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border bg-slate-50/50 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" /> General Information
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed italic">
                        "{information}"
                    </p>
                </div>

                <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary/70 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Submission Notes
                    </h4>
                    <p className="text-sm text-slate-800 leading-relaxed font-medium">
                        {submission}
                    </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

/* --- Helper Components --- */

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string; value?: string }) => (
  <div className="flex gap-3">
    <div className="mt-0.5 text-slate-400">
      {React.cloneElement(icon as React.ReactElement, { })}
    </div>
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value || "—"}</p>
    </div>
  </div>
);

export default ViewSubmissionModal;