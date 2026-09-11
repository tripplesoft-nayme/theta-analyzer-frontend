import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/ProgressBarCustom"
import { cn } from "@/lib/utils"
import { ClientData } from "@/types/client"
import { Eye, Pencil, Trash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CustomerData {
  customer: ClientData
}

const TableCustomerInsight: React.FC<CustomerData> = ({ customer }) => {
  const navigate = useNavigate()
  const [openModal, setOpenModal] = useState<"view" | "edit" | "delete" | null>(null)

  const statusColors = {
    Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Suspended: "bg-red-100 text-red-700 border-red-200",
    Trial: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Expired: "bg-gray-100 text-gray-600 border-gray-200",
  }

  const alertColors = {
    Critical: "text-red-600",
    Warning: "text-yellow-600",
  }

  return (
    <>
      <tr
        key={customer.id}
        className="hover:bg-gray-50 cursor-pointer"
        onClick={() => navigate(`/admin/clients/${customer.id}`)}
      >
        <td className="px-4 py-3 font-medium text-gray-900">{customer.companyName}</td>
        <td className="px-4 py-3">
          <Badge variant="outline" className="border-blue-600 text-blue-600 rounded-3xl">
            {customer.plan}
          </Badge>
        </td>
        <td className="px-4 py-3 text-center">{customer.dashboardUpdates}</td>
        <td
          className={cn(
            "px-4 py-3 text-center font-medium",
            customer.alertType
              ? alertColors[customer.alertType as keyof typeof alertColors]
              : "text-gray-900",
          )}
        >
          {customer.alerts} {customer.alertType}
        </td>
        <td className="px-4 py-3 text-center">{customer.users}</td>
        <td className="px-4 py-3 w-48">
          <ProgressBar
            value={(customer.storageUsage / customer.storageTotal) * 100}
            className="h-2 mb-1"
          />
          <span className="text-xs text-gray-600">
            {customer.storageUsage}/{customer.storageTotal} Gb
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium w-28 py-1",
              statusColors[customer.status as keyof typeof statusColors],
            )}
          >
            {customer.status}
          </Badge>
        </td>
        <td
          className="px-4 py-3 flex justify-center gap-3"
          onClick={(e) => e.stopPropagation()} // prevent row navigation
        >
          <Eye
            className="w-4 h-4 text-blue-600 cursor-pointer"
            onClick={() => setOpenModal("view")}
          />
          <Pencil
            className="w-4 h-4 text-green-600 cursor-pointer"
            onClick={() => setOpenModal("edit")}
          />
          <Trash
            className="w-4 h-4 text-red-600 cursor-pointer"
            onClick={() => setOpenModal("delete")}
          />
        </td>
      </tr>

      {/* View Modal */}
      <Dialog open={openModal === "view"} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="bg-white border-none">
          <DialogHeader>
            <DialogTitle>View Customer</DialogTitle>
          </DialogHeader>
          <div>
            <p><strong>Company:</strong> {customer.companyName}</p>
            <p><strong>Plan:</strong> {customer.plan}</p>
            <p><strong>Status:</strong> {customer.status}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={openModal === "edit"} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="bg-white border-none">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div>
            {/* Add edit form here */}
            <p>Edit form goes here...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={openModal === "delete"} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="bg-white border-none">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {customer.companyName}?</p>
          <Button className="bg-black text-white cursor-pointer">Delete</Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TableCustomerInsight
