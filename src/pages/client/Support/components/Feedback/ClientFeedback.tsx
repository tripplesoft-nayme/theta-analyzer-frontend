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
  Send,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCreateProductFeedbackMutation,
  useGetProductFeedbackListQuery,
  useUpdateProductFeedbackMutation,
  useDeleteProductFeedbackMutation,
  ProductFeedbackItem,
} from "@/store/Api/SupportApi/SupportApi";

const ClientFeedback = () => {
  // Form State
  const [message, setMessage] = useState("");

  // Create Form Modal State (when table has data)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Listen to Top Header button click
  useEffect(() => {
    const handleOpenModal = () => setIsCreateModalOpen(true);
    window.addEventListener("open-feedback-modal", handleOpenModal);
    return () => window.removeEventListener("open-feedback-modal", handleOpenModal);
  }, []);

  // Table Query & Filter State
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState("");

  // Modals State for View, Edit, Delete
  const [viewItem, setViewItem] = useState<ProductFeedbackItem | null>(null);
  const [editItem, setEditItem] = useState<ProductFeedbackItem | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // RTK Query Hooks
  const [createProductFeedback, { isLoading: isSubmitting }] =
    useCreateProductFeedbackMutation();
  const { data: feedbackResponse, isLoading: isTableLoading } =
    useGetProductFeedbackListQuery({
      page,
      limit,
      search: searchTerm,
    });
  const [updateProductFeedback, { isLoading: isUpdating }] =
    useUpdateProductFeedbackMutation();
  const [deleteProductFeedback, { isLoading: isDeleting }] =
    useDeleteProductFeedbackMutation();

  const feedbackItems: ProductFeedbackItem[] = Array.isArray(feedbackResponse?.data)
    ? feedbackResponse.data
    : (feedbackResponse?.data as any)?.items || [];

  const meta = feedbackResponse?.meta || (feedbackResponse?.data as any)?.meta;
  const totalCount = meta?.total ?? meta?.totalItems ?? feedbackItems.length;

  const hasData = feedbackItems.length > 0 || totalCount > 0 || Boolean(searchTerm);

  // Form Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter your feedback message");
      return;
    }

    try {
      const res = await createProductFeedback({
        message: message.trim(),
      }).unwrap();

      if (res?.success || res?.data) {
        toast.success(res?.message || "Product feedback submitted successfully!");
        setMessage("");
        setIsCreateModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit feedback");
    }
  };

  // Edit Handlers
  const handleOpenEdit = (item: ProductFeedbackItem) => {
    setEditItem(item);
    setEditMessage(item.message);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    if (!editMessage.trim()) {
      toast.error("Feedback message cannot be empty");
      return;
    }

    try {
      const res = await updateProductFeedback({
        id: editItem.id,
        message: editMessage.trim(),
      }).unwrap();

      if (res?.success) {
        toast.success("Feedback updated successfully!");
        setEditItem(null);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update feedback");
    }
  };

  // Delete Handler
  const ConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await deleteProductFeedback(deleteId).unwrap();
      if (res?.success) {
        toast.success("Feedback deleted successfully!");
        setDeleteId(null);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete feedback");
    }
  };

  // Render Original Feedback Form Layout
  const renderFeedbackFormFields = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
          Product feedback
        </h4>
      </div>

      <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
        Have feedback on how to improve the product? Message our Product team
        directly about it below. If you'd like to report a bug or performance
        issue, please document below, or contact support via this form. We'd
        love to hear from you!
      </p>

      <div className="space-y-4">
        <div className="pb-2">
          <DescriptionTextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts, suggestions, or feature requests..."
          />
        </div>
        <div className="flex justify-end">
          <PrimaryButton
            type="Primary"
            title={isSubmitting ? "Submitting..." : "Send"}
            rightIcon={<Send className="w-4 h-4" />}
            disabled={isSubmitting}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* CASE 1: No Data Exists -> Show Original Form Directly */}
      {!hasData && !isTableLoading && (
        <BoxContainer className="max-w-lg mx-auto">
          {renderFeedbackFormFields()}
        </BoxContainer>
      )}

      {/* CASE 2: Data Exists -> Show Submissions Table + Submit Feedback Button */}
      {(hasData || isTableLoading) && (
        <BoxContainer className="p-0! border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Product Feedback Submissions
            </h3>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search feedback text..."
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
                  <th className="py-3.5 px-6 w-16 font-semibold">#</th>
                  <th className="py-3.5 px-6 font-semibold">Feedback Message</th>
                  <th className="py-3.5 px-6 w-44 font-semibold">Date Submitted</th>
                  <th className="py-3.5 px-6 text-right w-28 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                {isTableLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="h-4 w-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : feedbackItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      No feedback entries found matching your search.
                    </td>
                  </tr>
                ) : (
                  feedbackItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F8FAFC]/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-400 dark:text-slate-500">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="py-4 px-6 text-slate-800 dark:text-slate-200 max-w-md truncate">
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
                label="Feedback Entries"
              />
            </div>
          )}
        </BoxContainer>
      )}

      {/* REUSABLE MODAL 1: Create Product Feedback Modal (When table has data) */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Submit Product Feedback
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            {renderFeedbackFormFields()}
          </div>
        </DialogContent>
      </Dialog>

      {/* REUSABLE MODAL 2: View Details Modal */}
      <Dialog open={Boolean(viewItem)} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Product Feedback Details
            </DialogTitle>
          </DialogHeader>

          {viewItem && (
            <div className="space-y-4 py-2 text-sm text-gray-700 dark:text-slate-300">
              <div className="flex items-center gap-2 px-3 text-sm text-gray-500 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Submitted on: {new Date(viewItem.createdAt).toLocaleString()}</span>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-lg border border-gray-200 dark:border-slate-800 space-y-1">
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Feedback Content
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

      {/* REUSABLE MODAL 3: Edit Feedback Modal */}
      <Dialog open={Boolean(editItem)} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Edit Product Feedback
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="pb-1 block font-medium">Feedback Message</Label>
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
              Delete Product Feedback?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-slate-400">
              Are you sure you want to delete this feedback submission? This action cannot be undone.
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

export default ClientFeedback;
