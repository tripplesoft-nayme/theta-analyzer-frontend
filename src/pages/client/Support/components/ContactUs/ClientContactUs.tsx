import { useState, useEffect } from "react";
import BoxContainer from "@/Common/BoxContainer";
import DescriptionTextArea from "@/Common/DescriptionTextArea";
import PrimaryButton from "@/Common/PrimaryButton";
import Pagination from "@/Common/Pagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Headphones,
  MapPin,
  Phone,
  Send,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCreateContactSupportMutation,
  useGetContactSupportListQuery,
  useUpdateContactSupportMutation,
  useDeleteContactSupportMutation,
  ContactSupportItem,
} from "@/store/Api/SupportApi/SupportApi";

const ClientContactUs = () => {
  const supportHours = {
    time: "8am-5pm",
    timezone: "Central Time, USA",
  };
  const phoneNumbers = ["+1 (555) 0000-000", "+1 (555) 0000-000"];
  const officeLocation = {
    address: "House no, Road no,City name, State name, USA",
  };

  // Form State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  // Create Form Modal State (when table has data)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Listen to Top Header button click
  useEffect(() => {
    const handleOpenModal = () => setIsCreateModalOpen(true);
    window.addEventListener("open-contact-us-modal", handleOpenModal);
    return () => window.removeEventListener("open-contact-us-modal", handleOpenModal);
  }, []);

  // Table Query & Filter State
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState("");

  // Modals State for View, Edit, Delete
  const [viewItem, setViewItem] = useState<ContactSupportItem | null>(null);
  const [editItem, setEditItem] = useState<ContactSupportItem | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editMessage, setEditMessage] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // RTK Query Hooks
  const [createContactSupport, { isLoading: isSubmitting }] =
    useCreateContactSupportMutation();
  const { data: supportResponse, isLoading: isTableLoading } =
    useGetContactSupportListQuery({
      page,
      limit,
      search: searchTerm,
    });
  const [updateContactSupport, { isLoading: isUpdating }] =
    useUpdateContactSupportMutation();
  const [deleteContactSupport, { isLoading: isDeleting }] =
    useDeleteContactSupportMutation();

  const supportItems: ContactSupportItem[] = Array.isArray(supportResponse?.data)
    ? supportResponse.data
    : (supportResponse?.data as any)?.items || [];

  const meta = supportResponse?.meta || (supportResponse?.data as any)?.meta;
  const totalCount = meta?.total ?? meta?.totalItems ?? supportItems.length;

  const hasData = supportItems.length > 0 || totalCount > 0 || Boolean(searchTerm);

  // Handle Form Submit
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error("Phone Number is required");
      return;
    }
    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }

    try {
      const res = await createContactSupport({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        message: message.trim(),
      }).unwrap();

      if (res?.success || res?.data) {
        toast.success(res?.message || "Contact support message sent successfully!");
        setFullName("");
        setPhoneNumber("");
        setMessage("");
        setIsCreateModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send support message");
    }
  };

  // Edit Handlers
  const handleOpenEdit = (item: ContactSupportItem) => {
    setEditItem(item);
    setEditFullName(item.fullName);
    setEditPhoneNumber(item.phoneNumber);
    setEditMessage(item.message);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    if (!editFullName.trim() || !editPhoneNumber.trim() || !editMessage.trim()) {
      toast.error("All fields are required");
      return;
    }

    try {
      const res = await updateContactSupport({
        id: editItem.id,
        fullName: editFullName.trim(),
        phoneNumber: editPhoneNumber.trim(),
        message: editMessage.trim(),
      }).unwrap();

      if (res?.success) {
        toast.success("Support request updated successfully!");
        setEditItem(null);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update support request");
    }
  };

  // Delete Handler
  const ConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await deleteContactSupport(deleteId).unwrap();
      if (res?.success) {
        toast.success("Support request deleted successfully!");
        setDeleteId(null);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete support request");
    }
  };

  // Render Original Form Layout
  const renderContactFormFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 items-center justify-between gap-8 w-full">
      <div className="w-full space-y-6">
        <div>
          <Label htmlFor="fullName" className="pb-2 block font-medium">
            Full Name*
          </Label>
          <Input
            id="fullName"
            placeholder="Enter Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="border border-[#E2E8F0] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <Label htmlFor="phoneNumber" className="pb-2 block font-medium">
            Phone number*
          </Label>
          <Input
            id="phoneNumber"
            placeholder="US +1 (555) 000-0000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="border border-[#E2E8F0] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            required
          />
        </div>
        <div>
          <Label htmlFor="message" className="pb-2 block font-medium">
            Message*
          </Label>
          <DescriptionTextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div>
          <PrimaryButton
            type="Primary"
            title={isSubmitting ? "Sending..." : "Send"}
            rightIcon={<Send className="w-4 h-4" />}
            disabled={isSubmitting}
            className="w-full"
            onClick={handleSubmit}
          />
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-slate-800/60 p-6 rounded-lg space-y-6 w-full">
        {/* Support Hours Section */}
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 p-3 rounded-lg flex-shrink-0">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">
              Support Hour
            </h5>
            <p className="text-gray-600 dark:text-slate-300 text-sm">
              {supportHours.time}
            </p>
            <p className="text-gray-600 dark:text-slate-300 text-sm">
              {supportHours.timezone}
            </p>
          </div>
        </div>

        {/* Call Us Section */}
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 p-3 rounded-lg flex-shrink-0">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">
              Call Us
            </h5>
            {phoneNumbers.map((phone, index) => (
              <p key={index} className="text-gray-600 dark:text-slate-300 text-sm">
                {phone}
              </p>
            ))}
          </div>
        </div>

        {/* Office Location Section */}
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 p-3 rounded-lg flex-shrink-0">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">
              Office Location
            </h5>
            <p className="text-gray-600 dark:text-slate-300 text-sm">
              {officeLocation.address}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* CASE 1: No Data Exists -> Show Original Form Directly */}
      {!hasData && !isTableLoading && (
        <BoxContainer className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <h4 className=" text-2xl font-semibold text-gray-900 dark:text-slate-100">
              Contact Support
            </h4>
            {renderContactFormFields()}
          </div>
        </BoxContainer>
      )}

      {/* CASE 2: Data Exists -> Show Submissions Table + Contact Us Button */}
      {(hasData || isTableLoading) && (
        <BoxContainer className="p-0! border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Contact Support Submissions
            </h3>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 h-10 border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-[#F8FAFC] dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Full Name</th>
                  <th className="py-3.5 px-6 font-semibold">Phone Number</th>
                  <th className="py-3.5 px-6 font-semibold">Message</th>
                  <th className="py-3.5 px-6 font-semibold">Date Submitted</th>
                  <th className="py-3.5 px-6 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                {isTableLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : supportItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      No support inquiries found matching your search.
                    </td>
                  </tr>
                ) : (
                  supportItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F8FAFC]/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100">
                        {item.fullName}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        {item.phoneNumber}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {item.message}
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewItem(item)}
                            title="View Details"
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit"
                            className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(item.id)}
                            title="Delete"
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && (meta.totalPages ?? 1) >= 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <Pagination
                currentPage={meta.page ?? meta.currentPage ?? page}
                totalPages={meta.totalPages ?? 1}
                itemsPerPage={meta.limit ?? meta.itemsPerPage ?? limit}
                total={totalCount}
                onPageChange={(p) => setPage(p)}
                label="Support Messages"
              />
            </div>
          )}
        </BoxContainer>
      )}

      {/* REUSABLE MODAL 1: Create Contact Support Modal (When table has data) */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl! bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Contact Support
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            {renderContactFormFields()}
          </div>
        </DialogContent>
      </Dialog>

      {/* REUSABLE MODAL 2: View Details Modal */}
      <Dialog open={Boolean(viewItem)} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Support Inquiry Details
            </DialogTitle>
          </DialogHeader>

          {viewItem && (
            <div className="space-y-4 py-2 text-sm text-gray-700 dark:text-slate-300">
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-gray-900 dark:text-slate-100">
                  {viewItem.fullName}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{viewItem.phoneNumber}</span>
              </div>

              <div className="flex items-center gap-2 px-3 text-sm text-gray-500 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Submitted on: {new Date(viewItem.createdAt).toLocaleString()}</span>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-lg border border-gray-200 dark:border-slate-800 space-y-1">
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Message Content
                </p>
                <p className="whitespace-pre-wrap text-gray-800 dark:text-slate-200 leading-relaxed">
                  {viewItem.message}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <PrimaryButton
              type="Outline"
              title="Close"
              onClick={() => setViewItem(null)}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REUSABLE MODAL 3: Edit Modal */}
      <Dialog open={Boolean(editItem)} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Edit Support Request
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="pb-1 block font-medium">Full Name</Label>
              <Input
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                placeholder="Full Name"
                className="border-gray-200 dark:border-slate-800"
              />
            </div>

            <div>
              <Label className="pb-1 block font-medium">Phone Number</Label>
              <Input
                value={editPhoneNumber}
                onChange={(e) => setEditPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                className="border-gray-200 dark:border-slate-800"
              />
            </div>

            <div>
              <Label className="pb-1 block font-medium">Message</Label>
              <DescriptionTextArea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <PrimaryButton
              type="Outline"
              title="Cancel"
              onClick={() => setEditItem(null)}
            />
            <PrimaryButton
              type="Primary"
              title={isUpdating ? "Saving..." : "Save Changes"}
              disabled={isUpdating}
              onClick={handleSaveEdit}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REUSABLE MODAL 4: Delete Confirmation Dialog */}
      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-slate-100">
              Delete Support Inquiry?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-slate-400">
              Are you sure you want to delete this contact support inquiry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:border-slate-800 dark:text-slate-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={ConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientContactUs;
